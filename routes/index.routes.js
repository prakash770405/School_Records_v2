const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const Student = require("../models/student");


router.get("/", auth, async (req, res) => {
  const { classFilter } = req.query;

  let query = {};
  if (classFilter) {
    query.Class = parseInt(classFilter);
  }

  let count = await Student.countDocuments();
  let load = await Student.find(query).sort({ Class: 1, roll_no: 1 });
  res.render("index.ejs", { load, showSearch: true, classFilter, isLoggedIn: req.isLoggedIn, count });
});

  module.exports=router;