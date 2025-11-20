// routes/adminRoutes.js
import express from 'express';
import { toggleUserBan } from '../controllers/adminController.js';
// import { protect, adminOnly } from '../middleware/auth.js'; // Recommended: add admin check middleware here

const router = express.Router();

// Route: PUT /api/admin/ban/:userId
router.put('/ban/:userId', toggleUserBan);

export default router;