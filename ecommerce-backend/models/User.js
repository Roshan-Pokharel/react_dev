// models/User.js

import { DataTypes } from 'sequelize';
import { sequelize } from './index.js'; // Assuming you export sequelize from models/index.js

export const User = sequelize.define('User', {
  // Primary Key (Sequelize automatically adds `id` if not specified, 
  // but it's good practice to be explicit).
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // The unique identifier from Google
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Crucial: Ensures only one account per email
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // We don't store passwords here since we use Google OAuth
}, {
  // Sequelize options
  tableName: 'Users',
});