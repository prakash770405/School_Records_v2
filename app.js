require('dotenv').config();
const express = require('express');
const auth = require('./middlewares/auth');
const checkLogin = require("./middlewares/checkLogin");
const app = express();
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

app.use(cookieParser());
app.use(express.json());
app.use(checkLogin);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// sets req.user
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.isLoggedIn = !!req.user;
  next();
});

async function main() {
  await mongoose.connect(process.env.MONGO_URL)
}
main().then(() => {
  console.log("database Connected to 'Refresh'");
}).catch((err) => {
  console.log(err);
})

app.listen(8080, (req, res) => {
  console.log(`App is listening at http://localhost:8080`);
})

//-------------------------Routers-----------------------
app.use("/", require("./routes/index.routes"));
app.use("/students", require("./routes/student.routes"));
app.use("/subjects",require("./routes/subject.routes"));
app.use("/admin", require("./routes/admin.routes"));


// 404 handler for unknown routes
app.use(auth, (req, res, next) => {
  const message = "Page Not Found";
  const status = 404;
  res.status(status).render("../views/error.ejs", { isLoggedIn: req.isLoggedIn, message, showSearch: false, status });
});