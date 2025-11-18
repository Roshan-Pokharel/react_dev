// routes/orders.js
import express from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { DeliveryOption } from '../models/DeliveryOption.js';
import { CartItem } from '../models/CartItem.js';
import { protect } from '../middleware/auth.js'; // <-- NEW

const router = express.Router();

router.get('/', protect, async (req, res) => { // <-- PROTECT ROUTE
  const expand = req.query.expand;
  const userId = req.userId; // <-- GET USER ID

  let orders = await Order.unscoped().findAll({ 
    where: { UserId: userId }, // <-- FILTER BY USER ID
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

router.post('/', protect, async (req, res) => { // <-- PROTECT ROUTE
  const userId = req.userId; // <-- GET USER ID
  
  // Find cart items specific to the user
  const cartItems = await CartItem.findAll({ where: { UserId: userId } }); // <-- FILTER BY USER ID

  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  let totalCostCents = 0;
  const products = await Promise.all(cartItems.map(async (item) => {

    const product = await Product.findByPk(item.productId);
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }
    const deliveryOption = await DeliveryOption.findByPk(item.deliveryOptionId);
    if (!deliveryOption) {
      throw new Error(`Invalid delivery option: ${item.deliveryOptionId}`);
    }
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
    UserId: userId // <-- SAVE USER ID
  });

  // Clear ONLY the user's cart
  await CartItem.destroy({ where: { UserId: userId } }); // <-- FILTER

  res.status(201).json(order);
});

router.get('/:orderId', protect, async (req, res) => { // <-- PROTECT ROUTE
  const { orderId } = req.params;
  const expand = req.query.expand;
  const userId = req.userId; // <-- GET USER ID

  // Find order by ID AND ensure it belongs to the user
  let order = await Order.findOne({ where: { id: orderId, UserId: userId } }); // <-- FILTER
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