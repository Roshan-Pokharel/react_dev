// controllers/adminController.js
import { User } from '../models/User.js';
import { sendBanStatusEmail } from '../services/emailService.js'; 

export const toggleUserBan = async (req, res) => {
  const { userId } = req.params; 
  const { banStatus } = req.body; // Boolean: true = Ban, false = Unban

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update database
    user.isBanned = banStatus;
    await user.save();

    // Send Email Notification
    await sendBanStatusEmail(user.email, user.name, user.isBanned);

    res.json({ 
      message: `User ${banStatus ? 'banned' : 'unbanned'} successfully`, 
      user 
    });

  } catch (error) {
    console.error('Error toggling ban:', error);
    res.status(500).json({ error: 'Server error' });
  }
};