import express from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { DeliveryOption } from '../models/DeliveryOption.js';
import { CartItem } from '../models/CartItem.js';
import { User } from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { sendOrderNotification, sendCancellationNotification } from '../services/telegramService.js'; // Updated import

const router = express.Router();

// --- GET ALL ORDERS ---
router.get('/', protect, async (req, res) => { 
  const expand = req.query.expand;
  const userId = req.userId;

  let orders = await Order.unscoped().findAll({ 
    where: { UserId: userId }, 
    order: [['orderTimeMs', 'DESC']] 
  }); 

  if (expand === 'products') {
    orders = await Promise.all(orders.map(async (order) => {
      const products = await Promise.all(order.products.map(async (product) => {
        const productDetails = await Product.findByPk(product.productId);
        return {
          ...product,
          product: productDetails
        };
      }));
      return {
        ...order.toJSON(),
        products
      };
    }));
  }

  res.json(orders);
});

// --- CREATE ORDER (POST) ---
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.userId;
    
    // 1. Fetch User Details (for Address/Phone in notification)
    const user = await User.findByPk(userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // 2. Fetch Cart Items
    const cartItems = await CartItem.findAll({ where: { UserId: userId } });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let totalCostCents = 0;
    
    // This array will store detailed info specifically for the Telegram bot
    const productsDetailsForBot = []; 

    // 3. Process Items (Calculate costs and delivery dates)
    const products = await Promise.all(cartItems.map(async (item) => {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      const deliveryOption = await DeliveryOption.findByPk(item.deliveryOptionId);
      if (!deliveryOption) {
        throw new Error(`Invalid delivery option: ${item.deliveryOptionId}`);
      }

      // Calculate Delivery Date
      const estimatedDeliveryTimeMs = Date.now() + deliveryOption.deliveryDays * 24 * 60 * 60 * 1000;

      // Add to Bot List (Name + Quantity + Date)
      productsDetailsForBot.push({
          name: product.name,
          quantity: item.quantity,
          deliveryDate: estimatedDeliveryTimeMs
      });

      // Calculate Costs
      const productCost = product.priceCents * item.quantity;
      const shippingCost = deliveryOption.priceCents;
      totalCostCents += productCost + shippingCost;
      
      // Return data structure for Database
      return {
        productId: item.productId,
        quantity: item.quantity,
        estimatedDeliveryTimeMs
      };
    }));

    // Apply Tax (if applicable) or rounding
    totalCostCents = Math.round(totalCostCents);

    // 4. Create Order in Database
    const order = await Order.create({
      orderTimeMs: Date.now(),
      totalCostCents,
      products,
      UserId: userId,
      status: 'placed' // explicitly set initial status
    });

    // 5. Clear User's Cart
    await CartItem.destroy({ where: { UserId: userId } });

    // 6. Send Telegram Notification (Running in background)
    sendOrderNotification(order, user, productsDetailsForBot); 

    res.status(201).json(order);

  } catch (error) {
    console.error('Order creation failed:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// --- NEW CANCEL ROUTE ---
router.put('/:orderId/cancel', protect, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.userId;

    // 1. Find the order belonging to this user
    const order = await Order.findOne({ 
      where: { id: orderId, UserId: userId } 
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // 2. Check if already cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Order is already cancelled' });
    }

    // 3. Update Status
    order.status = 'cancelled';
    order.cancellationReason = reason;
    await order.save();

    // 4. Get User info for the notification
    const user = await User.findByPk(userId);

    // 5. Send Telegram Notification
    await sendCancellationNotification(order, user, reason);

    res.json({ message: 'Order cancelled successfully', order });

  } catch (error) {
    console.error('Cancel order failed:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// --- GET SINGLE ORDER ---
router.get('/:orderId', protect, async (req, res) => { 
  const { orderId } = req.params;
  const expand = req.query.expand;
  const userId = req.userId; 

  let order = await Order.findOne({ where: { id: orderId, UserId: userId } }); 
  if (!order) {
    return res.status(404).json({ error: 'Order not found or unauthorized' });
  }

  if (expand === 'products') {
    const products = await Promise.all(order.products.map(async (product) => {
      const productDetails = await Product.findByPk(product.productId);
      return {
        ...product,
        product: productDetails
      };
    }));
    order = {
      ...order.toJSON(),
      products
    };
  }

  res.json(order);
});

export default router;