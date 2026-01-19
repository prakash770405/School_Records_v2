const jwt = require('jsonwebtoken');
const Owner = require('../models/owner');


const checkLogin = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    req.isLoggedIn = false; // not logged in
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const owner = await Owner.findById(decoded.id).select("-password");
    if (!owner) {
      req.isLoggedIn = false;
    } else {
      req.owner = owner;
      req.isLoggedIn = true;
    }
    next();
  } catch (err) {
    req.isLoggedIn = false;
    next();
  }
};

module.exports = checkLogin;
