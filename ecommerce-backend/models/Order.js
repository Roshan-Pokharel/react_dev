import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

export const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // --- NEW FIELDS START ---
  status: {
    type: DataTypes.STRING,
    defaultValue: 'placed', // Values: 'placed', 'cancelled', 'delivered'
    allowNull: false
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // --- NEW FIELDS END ---
  orderTimeMs: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  totalCostCents: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  products: {
    type: DataTypes.JSON,
    allowNull: false
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false, 
    references: {
      model: 'Users',
      key: 'id',
    }
  },
  createdAt: {
    type: DataTypes.DATE(3)
  },
  updatedAt: {
    type: DataTypes.DATE(3)
  },
}, {
  defaultScope: {
    order: [['createdAt', 'ASC']]
  }
});