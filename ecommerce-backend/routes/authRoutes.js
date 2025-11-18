// routes/authRoutes.js
import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import 'dotenv/config';
import { User } from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'postmessage'; 

const oAuth2Client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI 
);

/**
 * Finds a user by email or creates a new user if one doesn't exist.
 */
const findOrCreateUser = async (googlePayload) => {
  const { email, name, picture } = googlePayload;

  // 1. Check if a user with this email already exists
  let user = await User.findOne({
    where: { email: email },
  });

  let created = false;
  if (!user) {
    // If not found, create the user explicitly
    user = await User.create({ 
      email: email,
      name: name,
      picture: picture,
    });
    created = true;
  }

  if (created) {
    console.log(`New user created: ${user.email}`);
  } else {
    // Update user details if they changed on Google
    if (user.name !== name || user.picture !== picture) {
        user.name = name;
        user.picture = picture;
        await user.save();
    }
    console.log(`Existing user logged in: ${user.email}`);
  }

  return user;
};

// LOGIN ROUTE
router.post('/google', async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Auth code not provided.' });
    }

    const { tokens } = await oAuth2Client.getToken(code);
    const { id_token } = tokens;

    const ticket = await oAuth2Client.verifyIdToken({
      idToken: id_token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const user = await findOrCreateUser(payload);
    
    // --- SESSION LOGIC START ---
    // Store the database ID in the session
    req.session.userId = user.id;

    // Force save the session to the database before replying to the client
    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return next(err);
      }
      
      // Respond with user info (No JWT token needed)
      res.json({
        message: "Login successful!",
        user: { 
          id: user.id,
          email: user.email, 
          name: user.name, 
          picture: user.picture 
        }
      });
    });
    // --- SESSION LOGIC END ---

  } catch (error) {
    console.error('Error in Google auth route:', error);
    next(error);
  }
});

// LOGOUT ROUTE
router.post('/logout', (req, res) => {
  // Destroy the session in the database
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    
    // Clear the cookie from the browser
    res.clearCookie('connect.sid'); 
    res.json({ message: 'Logged out successfully' });
  });
});

// --- NEW ROUTE: Update Profile (Address) ---
router.put('/profile', protect, async (req, res) => {
  try {
    const { phone, addressLine1, city, state, postalCode, country, name } = req.body;
    
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields if provided, otherwise keep existing
    user.phone = phone || user.phone;
    user.addressLine1 = addressLine1 || user.addressLine1;
    user.city = city || user.city;
    user.state = state || user.state;
    user.postalCode = postalCode || user.postalCode;
    user.country = country || user.country;
    user.name = name || user.name;

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// CHECK STATUS ROUTE (Updated to return address info)
router.get('/me', protect, async (req, res) => {
  const user = await User.findByPk(req.userId);
  if (user) {
    res.json({
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        // Return address info so frontend can pre-fill
        phone: user.phone,
        addressLine1: user.addressLine1,
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        country: user.country
      }
    });
  } else {
    res.status(404).json({ isAuthenticated: false });
  }
});

export default router;