// middleware/auth.js
import 'dotenv/config';

const protect = (req, res, next) => {
  // Check if a session exists and if a userId is attached to it
  if (req.session && req.session.userId) {
    // Assign the session's userId to req.userId so downstream routes (Cart, Order) work unchanged
    req.userId = req.session.userId; 
    next();
  } else {
    return res.status(401).json({ error: 'Not authorized, no active session found.' });
  }
};

export { protect };