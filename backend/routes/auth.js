const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// Google OAuth login/signup - handles both new and existing users
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'ID token is required' });
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Validate required fields
    if (!email || !name) {
      return res.status(400).json({ message: 'Invalid Google account: missing email or name' });
    }

    // Find or create user - handles both login and signup automatically
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with same email (for accounts that were created before Google OAuth)
      user = await User.findOne({ email });
      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        if (picture) user.picture = picture;
        await user.save();
      } else {
        // Create new user (signup)
        user = new User({
          googleId,
          email,
          name,
          picture: picture || '',
        });
        await user.save();
        console.log(`New user created: ${email}`);
      }
    } else {
      // Update user info if changed (login)
      if (picture && user.picture !== picture) {
        user.picture = picture;
      }
      if (user.name !== name) {
        user.name = name;
      }
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    
    // More specific error handling
    if (error.message?.includes('Token used too early')) {
      return res.status(400).json({ message: 'Token not yet valid. Please try again.' });
    }
    if (error.message?.includes('Token expired')) {
      return res.status(400).json({ message: 'Token expired. Please sign in again.' });
    }
    if (error.message?.includes('Invalid token')) {
      return res.status(400).json({ message: 'Invalid Google token. Please try again.' });
    }
    
    res.status(500).json({ message: 'Authentication failed', error: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;

