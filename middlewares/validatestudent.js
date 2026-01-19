const { stdschema } = require("../schema.js"); 
// path depends on your project structure

module.exports.validateStudent = (req, res, next) => {
  const { error } = stdschema.validate(req.body, {
    abortEarly: false
  });

  if (error) {
    const message = error.details.map(el => el.message).join(", ");
    const status = error.isJoi ? 400 : 500; // Bad Request
    res.status(status); // set HTTP status code
    return res.render("../views/error.ejs", { message, showSearch: false, status });
  }

  next();
};
