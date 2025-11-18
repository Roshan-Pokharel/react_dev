import express from 'express';
import { sequelize } from '../models/index.js';
import { Product } from '../models/Product.js';
import { DeliveryOption } from '../models/DeliveryOption.js';
import { CartItem } from '../models/CartItem.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { defaultProducts } from '../defaultData/defaultProducts.js';
import { defaultDeliveryOptions } from '../defaultData/defaultDeliveryOptions.js';
import { defaultCart } from '../defaultData/defaultCart.js';
import { defaultOrders } from '../defaultData/defaultOrders.js';

const router = express.Router();

router.post('/', async (req, res) => {
  await sequelize.sync({ force: true });

  // --- Start of Fix ---
  // Replaced User.findOne/create with User.findOrCreate for consistency
  // and added transaction: null to prevent crash
  const [defaultUser] = await User.findOrCreate({
    where: { email: 'initial@example.com' }, // <-- Use consistent user
    defaults: {
      name: 'Initial User',
      picture: 'https://via.placeholder.com/150',
    },
    transaction: null, // <-- Add this line
  });
  console.log('Established initial user for reset.');
  // --- End of Fix ---
  
  const defaultUserId = defaultUser.id;
  const timestamp = Date.now();

  const productsWithTimestamps = defaultProducts.map((product, index) => ({
    ...product,
    createdAt: new Date(timestamp + index),
    updatedAt: new Date(timestamp + index)
  }));

  const deliveryOptionsWithTimestamps = defaultDeliveryOptions.map((option, index) => ({
    ...option,
    createdAt: new Date(timestamp + index),
    updatedAt: new Date(timestamp + index)
  }));

  const cartItemsWithTimestamps = defaultCart.map((item, index) => ({
    ...item,
    createdAt: new Date(timestamp + index),
    updatedAt: new Date(timestamp + index),
    UserId: defaultUserId,
  }));

  const ordersWithTimestamps = defaultOrders.map((order, index) => ({
    ...order,
    createdAt: new Date(timestamp + index),
    updatedAt: new Date(timestamp + index),
    UserId: defaultUserId,
  }));

  await Product.bulkCreate(productsWithTimestamps);
  await DeliveryOption.bulkCreate(deliveryOptionsWithTimestamps);
  await CartItem.bulkCreate(cartItemsWithTimestamps);
  await Order.bulkCreate(ordersWithTimestamps);

  res.status(204).send();
});

export default router;