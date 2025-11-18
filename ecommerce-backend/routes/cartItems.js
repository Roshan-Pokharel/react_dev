// routes/cartItems.js
import express from 'express';
import { CartItem } from '../models/CartItem.js';
import { Product } from '../models/Product.js';
import { DeliveryOption } from '../models/DeliveryOption.js';
import { protect } from '../middleware/auth.js'; // <-- NEW

const router = express.Router();

router.get('/', protect, async (req, res) => { // <-- PROTECT ROUTE
  const expand = req.query.expand;
  const userId = req.userId; // <-- GET USER ID

  let cartItems = await CartItem.findAll({ where: { UserId: userId } }); // <-- FILTER BY USER ID

  if (expand === 'product') {
    cartItems = await Promise.all(cartItems.map(async (item) => {

      const product = await Product.findByPk(item.productId);
      return {
        ...item.toJSON(),
        product
      };
    }));
  }

  res.json(cartItems);
});

router.post('/', protect, async (req, res) => { // <-- PROTECT ROUTE
  const { productId, quantity } = req.body;
  const userId = req.userId; // <-- GET USER ID


  const product = await Product.findByPk(productId);
  if (!product) {
    return res.status(400).json({ error: 'Product not found' });
  }

  if (typeof quantity !== 'number' || quantity < 1 || quantity > 10) {
    return res.status(400).json({ error: 'Quantity must be a number between 1 and 10' });
  }

  // Find item belonging to this product AND user
  let cartItem = await CartItem.findOne({ where: { productId, UserId: userId } }); // <-- FILTER
  if (cartItem) {
    cartItem.quantity += quantity;
    await cartItem.save();
  } else {
    // Create item with the UserId
    cartItem = await CartItem.create({ productId, quantity, deliveryOptionId: "1", UserId: userId }); // <-- SAVE USER ID
  }

  res.status(201).json(cartItem);
});

router.put('/:productId', protect, async (req, res) => { // <-- PROTECT ROUTE
  const { productId } = req.params;
  const { quantity, deliveryOptionId } = req.body;
  const userId = req.userId; // <-- GET USER ID

  // Find item belonging to this product AND user
  const cartItem = await CartItem.findOne({ where: { productId, UserId: userId } }); // <-- FILTER
  if (!cartItem) {
    return res.status(404).json({ error: 'Cart item not found or unauthorized' });
  }

  if (quantity !== undefined) {
    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be a number greater than 0' });
    }
    cartItem.quantity = quantity;
  }

  if (deliveryOptionId !== undefined) {
    const deliveryOption = await DeliveryOption.findByPk(deliveryOptionId);
    if (!deliveryOption) {
      return res.status(400).json({ error: 'Invalid delivery option' });
    }
    cartItem.deliveryOptionId = deliveryOptionId;
  }

  await cartItem.save();
  res.json(cartItem);
});

router.delete('/:productId', protect, async (req, res) => { // <-- PROTECT ROUTE
  const { productId } = req.params;
  const userId = req.userId; // <-- GET USER ID

  // Find item belonging to this product AND user
  const cartItem = await CartItem.findOne({ where: { productId, UserId: userId } }); // <-- FILTER
  if (!cartItem) {
    return res.status(404).json({ error: 'Cart item not found or unauthorized' });
  }

  await cartItem.destroy();
  res.status(204).send();
});

export default router;