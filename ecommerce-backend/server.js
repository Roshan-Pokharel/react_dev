import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './models/index.js';
import session from 'express-session'; 
import SequelizeStore from 'connect-session-sequelize';
import productRoutes from './routes/products.js';
import deliveryOptionRoutes from './routes/deliveryOptions.js';
import cartItemRoutes from './routes/cartItems.js';
import orderRoutes from './routes/orders.js';
import resetRoutes from './routes/reset.js';
import paymentSummaryRoutes from './routes/paymentSummary.js';
import { Product } from './models/Product.js';
import { DeliveryOption } from './models/DeliveryOption.js';
import { CartItem } from './models/CartItem.js';
import { Order } from './models/Order.js';
import { defaultProducts } from './defaultData/defaultProducts.js';
import { defaultDeliveryOptions } from './defaultData/defaultDeliveryOptions.js';
import { defaultCart } from './defaultData/defaultCart.js';
import { defaultOrders } from './defaultData/defaultOrders.js';
import adminRoutes from './routes/adminRoutes.js';
import fs from 'fs';
import authRoutes from './routes/authRoutes.js';
import { User } from './models/User.js'; 

User.hasMany(CartItem, { foreignKey: 'UserId', onDelete: 'CASCADE' });
User.hasMany(Order, { foreignKey: 'UserId', onDelete: 'CASCADE' });

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SessionStore = SequelizeStore(session.Store);
const mySessionStore = new SessionStore({
  db: sequelize,
  tableName: 'Sessions', // Optional: Defines the table name
});
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET || 'keyboard_cat_secret', // Use your .env secret
  store: mySessionStore, // Tells express to save to Database, not RAM
  resave: false, 
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 Week (in milliseconds)
    httpOnly: true, // Prevents JavaScript from reading the cookie (Security)
    secure: false, // Set to true if using HTTPS
    sameSite: 'lax' // standardized cookie protection
  }
}));

// Serve images from the images folder
app.use('/images', express.static(path.join(__dirname, 'images')));

// Use routes
app.use('/api/products', productRoutes);
app.use('/api/delivery-options', deliveryOptionRoutes);
app.use('/api/cart-items', cartItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reset', resetRoutes);
app.use('/api/payment-summary', paymentSummaryRoutes);
// FIX 1: Corrected authentication route path
app.use('/api/auth', authRoutes); 
app.use('/api/admin', adminRoutes);

// Serve static files from the dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route to serve index.html for any unmatched routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html not found');
  }
});

// Error handling middleware
/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
/* eslint-enable no-unused-vars */

// Sync database and load default data if none exist
await sequelize.sync();

const productCount = await Product.count();
if (productCount === 0) {
  
  let defaultUser = await User.findOne({
    where: { email: 'initial@example.com' },
  });

  if (!defaultUser) {
    // If the user doesn't exist, create it without any transaction arguments
    defaultUser = await User.create({
      email: 'initial@example.com',
      name: 'Initial User',
      picture: 'https://via.placeholder.com/150',
    });
  }

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
    updatedAt: new Date(timestamp + index),
    
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
  await sequelize.sync();
  mySessionStore.sync(); 
  await sequelize.sync();
  console.log('Default data added to the database.');
}

CartItem.belongsTo(User, { foreignKey: 'UserId' });
Order.belongsTo(User, { foreignKey: 'UserId' });


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});