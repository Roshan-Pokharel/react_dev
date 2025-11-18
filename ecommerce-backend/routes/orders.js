// routes/orders.js
import express from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { DeliveryOption } from '../models/DeliveryOption.js';
import { CartItem } from '../models/CartItem.js';
import { User } from '../models/User.js'; // <--- NEW: Needed for Address info
import { protect } from '../middleware/auth.js';
import { sendOrderNotification } from '../services/telegramService.js'; // <--- NEW: Import Service

const router = express.Router();

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

router.post('/', protect, async (req, res) => {
  const userId = req.userId;
  
  // 1. Get User details (Address/Phone) for the notification
  const user = await User.findByPk(userId); // <--- NEW

  const cartItems = await CartItem.findAll({ where: { UserId: userId } });

  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  let totalCostCents = 0;
  const productsDetailsForBot = []; // <--- NEW: Array to hold names for Telegram

  const products = await Promise.all(cartItems.map(async (item) => {
    const product = await Product.findByPk(item.productId);
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }
    const deliveryOption = await DeliveryOption.findByPk(item.deliveryOptionId);
    if (!deliveryOption) {
      throw new Error(`Invalid delivery option: ${item.deliveryOptionId}`);
    }
    
    // <--- NEW: Save name and quantity for the Telegram Message
    productsDetailsForBot.push({
        name: product.name,
        quantity: item.quantity
    });
    // ---------------------------------------------------------

    const productCost = product.priceCents * item.quantity;
    const shippingCost = deliveryOption.priceCents;
    totalCostCents += productCost + shippingCost;
    const estimatedDeliveryTimeMs = Date.now() + deliveryOption.deliveryDays * 24 * 60 * 60 * 1000;
    
    return {
      productId: item.productId,
      quantity: item.quantity,
      estimatedDeliveryTimeMs
    };
  }));

  totalCostCents = Math.round(totalCostCents * 1.1);

  const order = await Order.create({
    orderTimeMs: Date.now(),
    totalCostCents,
    products,
    UserId: userId 
  });

  await CartItem.destroy({ where: { UserId: userId } });

  // <--- NEW: Send Notification to your Phone
  // We don't await this, so it runs in the background and doesn't slow down the user app
  sendOrderNotification(order, user, productsDetailsForBot); 
  // ------------------------------------------

  res.status(201).json(order);
});

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