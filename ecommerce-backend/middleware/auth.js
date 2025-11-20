// middleware/auth.js
import 'dotenv/config';
import { User } from '../models/User.js';

const protect = async (req, res, next) => {
  // 1. Check if session exists
  if (req.session && req.session.userId) {
    try {
      const user = await User.findByPk(req.session.userId);

      // 2. CASE: User was deleted from Database completely
      if (!user) {
        req.session.destroy((err) => {
           if (err) console.error("Destroy error:", err);
        });
        return res.status(401).json({ error: 'User account no longer exists.' });
      }

      // 3. CASE: User is Banned
      if (user.isBanned) {
        // CRITICAL: Prevent browser from caching this 403 response
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        // Return 403 but KEEP SESSION ALIVE
        return res.status(403).json({ 
          error: 'BANNED', 
          message: 'Your account is temporarily suspended. Contact support.' 
        });
      }

      // 4. User is OK
      req.userId = req.session.userId; 
      next();

    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return res.status(500).json({ error: 'Server error during authentication' });
    }
  } else {
    return res.status(401).json({ error: 'Not authorized, no active session found.' });
  }
};

export { protect };