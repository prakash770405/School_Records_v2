const jwt = require('jsonwebtoken');
const Owner = require('../models/owner');

const auth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.redirect('/admin/login'); // not logged in
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const owner = await Owner.findById(decoded.id).select("-password");

    if (!owner) {
      return res.redirect('/admin/login');
    }

    req.owner = owner; // attach logged in owner
    req.user = owner; 

    res.locals.user = owner;     
    res.locals.isLoggedIn = true;

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.redirect('/admin/login');
  }
};

module.exports = auth;