import { DataTypes } from 'sequelize';
import { sequelize } from './index.js'; 

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // --- BAN STATUS (ADD THIS) ---
  isBanned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Everyone starts as NOT banned
    allowNull: false
  },
  // -----------------------------
  phone: { type: DataTypes.STRING, allowNull: true },
  addressLine1: { type: DataTypes.STRING, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  state: { type: DataTypes.STRING, allowNull: true },
  postalCode: { type: DataTypes.STRING, allowNull: true },
  country: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'Users',
});