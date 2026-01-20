const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const Student = require('../models/student');


router.get("/new", auth, (req, res) => {
  res.render("addsubject.ejs", { isLoggedIn: req.isLoggedIn, showSearch: false });
})

router.post("/add", auth, async (req, res) => {
  const { subjects, Class } = req.body;
  // Make sure subjects is an array
  let subjectList = subjects;
  if (!Array.isArray(subjectList)) {
    subjectList = [subjectList];
  }
  // Loop over each subject and add it
  for (let i = 0; i < subjectList.length; i++) {
    const subjectName = subjectList[i].trim();

    // Skip empty inputs
    if (!subjectName) continue;

    await Student.updateMany(
      { Class: Class },
      {
        $push: {
          subjects: {
            name: subjectName,
            marks: 0
          }
        }
      }
    );
  }

  console.log("Subjects added:", subjectList);
  res.redirect("/");
});

router.post("/update/:studentId/:subjectId", auth, async (req, res) => {
  const { studentId, subjectId } = req.params;
  const { marks } = req.body;
  await Student.updateOne(
    {
      _id: studentId,
      "subjects._id": subjectId
    },
    {
      $set: {
        "subjects.$.marks": Number(marks) //.$ point to the exact subject in array of object
      }
    }
  );
  res.redirect(`/students/view/${studentId}`);
})

module.exports=router;