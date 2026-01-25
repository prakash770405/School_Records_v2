require('dotenv').config();
const express = require('express');
const session = require("express-session");
const flash = require("connect-flash");
const checkLogin = require("./middlewares/checkLogin");
const app = express();
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "refresh_secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

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
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
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
app.use("/subjects",require("./routes/subject.routes"));
app.use("/admin", require("./routes/admin.routes"));
app.use("/student", require("./routes/studentAuth.routes"));
app.use("/students", require("./routes/student.routes"));

// 404 handler for unknown routes
app.use((req, res ) => {
 
  res.status(404).render("error.ejs", { 
    isLoggedIn: req.isLoggedIn,
     message:"Page Not Found", 
     showSearch: false, 
     status:404
    });
});