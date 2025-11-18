// middleware/auth.js
import jwt from 'jsonwebtoken';
import 'dotenv/config';

// Ensure this matches the secret used in authRoutes.js
const JWT_SECRET = process.env.JWT_SECRET; 

const protect = (req, res, next) => {
  let token;

  // Check if the token is present in the Authorization header (e.g., 'Bearer <token>')
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach the user's ID to the request object
      req.userId = decoded.id; 

      next(); // Proceed to the route handler
    } catch (error) {
      console.error('JWT Verification Error:', error);
      return res.status(401).json({ error: 'Not authorized, token is invalid or expired.' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided.' });
  }
};

export { protect };