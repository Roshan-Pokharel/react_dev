import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  // 1. Check if session exists (Is user logged in?)
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // 2. Fetch the user from Database to check current status
    const user = await User.findByPk(req.session.userId);

    if (!user) {
      // User ID exists in session but not in DB (rare edge case)
      req.session.destroy();
      return res.status(401).json({ error: 'User no longer exists' });
    }

    // 3. Check if User is Banned
    if (user.isBanned) {
      // Destroy the session so they are forced to log out
      req.session.destroy(); 
      return res.status(403).json({ 
        error: 'BANNED',
        message: "You are banned. Action denied." 
      });
    }

    // 4. Attach user ID to request for controllers to use
    req.userId = user.id;
    next();
    
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ error: 'Server error during auth' });
  }
};