import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { User } from '../models/User.js';

const router = express.Router();
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'postmessage'; 
const JWT_SECRET = process.env.JWT_SECRET;

const oAuth2Client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI 
);

/**
 * Finds a user by email or creates a new user if one doesn't exist.
 * This function has been updated to use findOne/create explicitly to avoid a Sequelize transaction crash.
 * @param {object} googlePayload - The verified data from Google's ID token.
 * @returns {object} The found or created User instance.
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
    // Optional: Update the user's name or picture if Google provides newer data
    if (user.name !== name || user.picture !== picture) {
        user.name = name;
        user.picture = picture;
        await user.save();
    }
    console.log(`Existing user logged in: ${user.email}`);
  }

  // 2. Return the Sequelize User object
  return user;
};

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
    const user = await findOrCreateUser(payload); // This now calls the fixed function
    
    // Use the real user.id from the database
    const token = jwt.sign(
      { id: user.id, email: user.email }, // user.id is now the actual database ID
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: "Login successful!",
      token: token,
      user: { 
        id: user.id, // Include the real database ID for the frontend if needed
        email: user.email, 
        name: user.name, 
        picture: user.picture 
      }
    });

  } catch (error) {
    console.error('Error in Google auth route:', error);
    next(error);
  }
});

export default router;