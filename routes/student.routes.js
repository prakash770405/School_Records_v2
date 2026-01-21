const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const auth = require("../middlewares/auth");
const noCache = require("../middlewares/noCache");
const { validateStudent } = require('../middlewares/validatestudent');
const Student = require('../models/student');


router.use(auth, noCache);





router.get("/newdata", auth,noCache, validateStudent, (req, res) => {
  res.render("form.ejs", { isLoggedIn: req.isLoggedIn, showSearch: false });
})

router.post("/form/data", auth, upload.single("img"), validateStudent, async (req, res) => {
  const { name, age, Class, roll_no, phone_no, email } = req.body;
  console.log(req.body);
  console.log(req.file);
  // Handle optional image
  let img = null;
  if (req.file) {
    img = {
      url: req.file.path,
      filename: req.file.filename,
      photosize: req.file.size,
      phototype: req.file.mimetype
    };
  }
  // Create new student
  const student = new Student({
    name,
    age,
    Class,
    roll_no,
    phone_no,
    email,
    img, // can be null if no file uploaded
    owner: req.owner._id
  });
  const data = await student.save();
  console.log(res.locals.user);
  req.flash("success", "Student added successfully");
  res.redirect("/");
});



router.get("/form/edit/:id", auth, validateStudent, async (req, res) => {
  const { id } = req.params;
  const std = await Student.findById(id);
  res.render("editform.ejs", { isLoggedIn: req.isLoggedIn, std, showSearch: false });
})

router.put("/form/:id/edit", auth, upload.single("img"), validateStudent, async (req, res) => {
  const { id } = req.params;
  const { name, Class, roll_no, age, phone_no, email } = req.body;
  const student = await Student.findById(id);                      // Find the student document first
  const updateData = { name, Class, roll_no, age, phone_no, email };
  if (req.file) {
    if (student.img && student.img.filename) {
      await cloudinary.uploader.destroy(student.img.filename);  // Delete old image from Cloudinary
    }
    updateData.img = {      // Add new image
      url: req.file.path,
      filename: req.file.filename,
      photosize: req.file.size,
      phototype: req.file.mimetype
    };
  }
  // ================= CLASS CHANGE LOGIC =================
  if (student.Class !== Number(Class)) {
    // Find any student from the new class who already has subjects
    const classStudent = await Student.findOne({
      Class: Number(Class),
      subjects: { $exists: true, $ne: [] }
    });

    if (classStudent) {
      // Copy subjects from that class
      updateData.subjects = classStudent.subjects;
    } else {
      // No subjects defined yet for this class
      updateData.subjects = [];
    }
  }
  await Student.findByIdAndUpdate(id, updateData);  // Update student
  req.flash("success", "Student Data Updated Successfully");
  res.redirect("/");
});

router.delete("/form/:id/delete", auth, async (req, res) => {
  const { id } = req.params;
  console.log(id);
  await Student.findByIdAndDelete(id)
  req.flash("success", "Student Deleted Successfully");

  res.redirect("/");
})

router.get("/view/:id", auth, validateStudent, async (req, res) => {
  const { id } = req.params;
  const student = await Student.findById(id);
  const formattedDate = student.date.toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  res.render("viewdetail.ejs", { isLoggedIn: req.isLoggedIn, student, showSearch: false, formattedDate });
})


module.exports=router;