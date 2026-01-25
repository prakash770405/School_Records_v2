const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  res.locals.isStudentLoggedIn = false;
  res.locals.student = null;

  const token = req.cookies.studentToken;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "student") {
      res.locals.isStudentLoggedIn = true;
      res.locals.studentId = decoded.id;
    }
  } catch (err) {
    // silent fail (important)
  }

  next();
};
