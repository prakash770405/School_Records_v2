const express = require("express");
const router = express.Router();
const studentAuth = require("../middlewares/studentAuth");
const StudentAuth = require("../models/studentAuth");
const Student = require("../models/student");
const noCache = require("../middlewares/noCache");


router.get("/login", (req, res) => {
  res.render("student/login.ejs", { showSearch: false });
});

router.post("/login", noCache, async (req, res) => {
  const { email, password } = req.body;

  const auth = await StudentAuth
    .findOne({ email })
    .populate("student");

  if (!auth || !auth.isActive) {
    req.flash("error", "Account not found");
    return res.redirect("/student/login");
  }

  const ok = await auth.comparePassword(password);
  if (!ok) {
    req.flash("error", "Wrong password");
    return res.redirect("/student/login");
  }

  auth.lastLogin = new Date();
  await auth.save();

  const token = auth.generateToken();
  res.cookie("studentToken", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  const name=auth.student.name;
  req.flash("success",`Welcome to your profile ${name}`)
  res.redirect("/student/dashboard");
});

router.get("/create-password", noCache, (req, res) => {
  res.render("student/createPassword.ejs",{showSearch:false});
});

router.post("/create-password",noCache, async (req, res) => {
  const { email, password } = req.body;

  const student = await Student.findOne({ email });
  if (!student) {
    req.flash("error", "Student not found with this email");
    return res.redirect("/student/create-password");
  }

  const exists = await StudentAuth.findOne({ student: student._id });
  if (exists) {
    req.flash("error", "Password already created");
    return res.redirect("/student/login");
  }

  await StudentAuth.create({
    student: student._id,
    email: student.email,
    password
  });

  req.flash("success", "Password created. Please login");
  res.redirect("/student/login");
});

router.get("/dashboard", studentAuth,noCache, async (req, res) => {
  const auth = await StudentAuth
    .findById(req.studentAuthId)
    .populate("student");

  res.render("student/dashboard.ejs", {
    student: auth.student
    ,showSearch:false
  });
});


router.get("/logout",noCache, (req, res) => {
  res.clearCookie("studentToken");

  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    "Pragma": "no-cache",
    "Expires": "0"
  });
  req.flash("error","You logout successfully")
  res.redirect("/student/login");
});


module.exports = router;