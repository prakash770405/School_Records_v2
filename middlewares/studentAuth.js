const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.cookies.studentToken;
  if (!token) return res.redirect("/student/login");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "student") {
      return res.status(403).send("Forbidden");
    }

    req.studentAuthId = decoded.id;
    next();
  } catch {
    res.redirect("/student/login");
  }
};
