const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel'); // Using Sequelize User model

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user ID from token to request object.
      // The actual user object can be fetched by the route handler if needed.
      req.user = { id: decoded.id }; // decoded.id should be the user's primary key (integer for Sequelize)

      // Optional: You could fetch the user here to ensure they still exist,
      // but it adds a DB query to every protected route.
      // const userExists = await User.findByPk(decoded.id);
      // if (!userExists) {
      //   res.status(401);
      //   throw new Error('Not authorized, user for token no longer exists');
      // }
      // req.user = userExists; // If you fetch the full user

      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        res.status(401);
        throw new Error('Not authorized, token invalid or expired');
      }
      res.status(401);
      throw new Error('Not authorized, token processing failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

module.exports = { protect };