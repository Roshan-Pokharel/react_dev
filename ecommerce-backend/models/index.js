// models/index.js
import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isUsingRDS = process.env.RDS_HOSTNAME && process.env.RDS_USERNAME && process.env.RDS_PASSWORD;
const dbType = process.env.DB_TYPE || 'mysql';

export let sequelize;

if (isUsingRDS) {
  // Remote Database Configuration (e.g., for production)
  sequelize = new Sequelize({
    database: process.env.RDS_DB_NAME,
    username: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    host: process.env.RDS_HOSTNAME,
    port: process.env.RDS_PORT || 3306,
    dialect: dbType,
    logging: false
  });
} else {
  // Local Database Configuration (SQLite)
  // This defines the physical path to your database file
  const dbPath = path.join(__dirname, '../database.sqlite');

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath, // <--- CRITICAL: This ensures data persists to this file
    logging: false 
  });
}