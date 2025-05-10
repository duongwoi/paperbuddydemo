const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel'); // Using the Sequelize User model

// Generate JWT
const generateToken = (id) => { // id here will be the user's primary key from DB
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please add all fields (name, email, password)');
  }

  const userExists = await User.findOne({ where: { email: email } });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    passwordHash: hashedPassword,
    subjects: [] // Initialize with empty subjects array (will be stringified by setter)
  });

  if (user) {
    console.log("Registered user to SQLite DB:", user.email);
    res.status(201).json({
      id: user.id, // Sequelize's auto-generated primary key
      name: user.name,
      email: user.email,
      subjects: user.subjects, // Getter will parse JSON string to array
      token: generateToken(user.id),
    });
  } else {
    res.status(400); // Should not happen if create is successful
    throw new Error('Invalid user data, user not created');
  }
});

// @desc    Authenticate a user (Login)
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ where: { email: email } });

  if (user && (await user.matchPassword(password))) { // user.matchPassword is the instance method
    console.log("Logged in user from SQLite DB:", user.email);
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      subjects: user.subjects,
      token: generateToken(user.id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get current user data (protected route)
const getMe = asyncHandler(async (req, res) => {
  // req.user is attached by the 'protect' middleware, containing the user's id from token
  const user = await User.findByPk(req.user.id, { // findByPk is Sequelize's method for finding by primary key
    attributes: { exclude: ['passwordHash'] } // Don't send the password hash back
  });

  if (user) {
    res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        subjects: user.subjects || [] // Ensure subjects is an array (getter handles this)
    });
  } else {
    res.status(404);
    throw new Error('User not found (from /me route)');
  }
});

module.exports = {
  registerUser,
  loginUser,
  getMe
};