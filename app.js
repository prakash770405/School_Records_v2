require('dotenv').config();
const express = require('express');
const transporter = require("./config/email");
const auth = require('./middlewares/auth');
const checkLogin = require("./middlewares/checkLogin");
const Owner = require('./models/owner');
const app = express();
const cookieParser = require('cookie-parser');
const cloudinary = require("cloudinary").v2;
const upload = require("./config/multer");
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Student = require('./models/student');
const { validateStudent } = require('./middlewares/validatestudent');


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

app.get("/", auth, async (req, res) => {
  const { classFilter } = req.query;

  let query = {};
  if (classFilter) {
    query.Class = parseInt(classFilter);
  }

  let count = await Student.countDocuments();
  let load = await Student.find(query).sort({ Class: 1, roll_no: 1 });
  res.render("index.ejs", { load, showSearch: true, classFilter, isLoggedIn: req.isLoggedIn, count });
});

app.get("/Newdata", auth, validateStudent, (req, res) => {
  res.render("form.ejs", { isLoggedIn: req.isLoggedIn, showSearch: false });
})

app.post("/form/data", auth, upload.single("img"), validateStudent, async (req, res) => {
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
  res.redirect("/");
});

app.get("/form/edit/:id", auth, validateStudent, async (req, res) => {
  const { id } = req.params;
  const std = await Student.findById(id);
  res.render("editform.ejs", { isLoggedIn: req.isLoggedIn, std, showSearch: false });
})

app.put("/form/:id/edit", auth, upload.single("img"), validateStudent, async (req, res) => {
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
  res.redirect("/");
});

app.delete("/form/:id/delete", auth, async (req, res) => {
  const { id } = req.params;
  console.log(id);
  await Student.findByIdAndDelete(id)
  res.redirect("/");
})

app.get("/view/:id", auth, validateStudent, async (req, res) => {
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

app.get("/subjects/new", auth, (req, res) => {
  res.render("addsubject.ejs", { isLoggedIn: req.isLoggedIn, showSearch: false });
})

app.post("/subject/add", auth, async (req, res) => {
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

app.post("/subject/update/:studentId/:subjectId", auth, async (req, res) => {
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
  res.redirect(`/view/${studentId}`);
})

// ADMIN SIGNUP (one-time)
app.get('/admin/signup', (req, res) => {
  res.render("signupform.ejs", { isLoggedIn: req.isLoggedIn, showSearch: false, error: null });
});

app.post('/admin/signup', async (req, res) => {
  try {
    const { name, email, phone_no, password } = req.body;

    if (!name || !email || !password) {
      return res.render('signupform.ejs', {
        error: 'Name, Email, and Password are required!',
        showSearch: false
      });
    }

    const existing = await Owner.findOne({ email });

    if (existing && existing.isVerified) {
      return res.render('signupform.ejs', {
        error: 'Admin already exists!',
        showSearch: false
      });
    }

    if (existing && !existing.isVerified) {
      await Owner.deleteOne({ email }); // cleanup unverified admin
    }

    // 🔐 Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const owner = new Owner({
      name,
      email,
      phone_no, 
      password,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000, // 5 minutes
      isVerified: false
    });

    await owner.save(); // password hashes automatically ✔

const date = new Date(Date.now()); // force IST

const requestTime = date.toLocaleString("en-IN", {
  year: "numeric",
  month: "long",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true
});


   console.log(requestTime); // 18 January 2026, 01:30:45 PM


    await transporter.sendMail({  // 📧 Send OTP email
      to: email,
      subject: "Verify Your Admin Email – School Records",
      html: `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2 style="color: #198754;">Email Verification</h2>

       <p>
        Hello <strong>${name}</strong>,
      </p>

      <p>
        We received a request to create or verify an <strong>Admin account</strong>
        for the <strong>School Records</strong> system using this email address.
      </p>

       <p style="font-size: 14px; color: #555;">
        <strong>Request time:</strong> ${requestTime}
      </p>

      <p>
        Your 4-digit verification code is:
      </p>

      <h1 style="letter-spacing: 4px; color: #000;">
        ${otp}
      </h1>

      <p>
        This code is valid for <strong>5 minutes</strong>.
      </p>

      <p>
        <strong>If you did not request this verification,</strong>
        you can safely ignore this email. No changes will be made to your account.
      </p>

      <p style="margin-top: 24px; font-size: 14px; color: #666;">
        For your security, please do not share this code with anyone.
      </p>

      <hr style="margin: 24px 0;">

      <p style="font-size: 13px; color: #e42222;">
        This is an automated message from the School Records system.
      </p>
    </div>
  `
    });

    res.render("verify.ejs", {
      email,
      error: null,
      showSearch: false
    });

  } catch (err) {
    console.error(err);
    res.render('signupform.ejs', {
      error: 'Something went wrong.',
      showSearch: false
    });
  }
});

app.post('/admin/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  const owner = await Owner.findOne({ email });

  if (!owner) {
    return res.render("verify.ejs", {
      email,
      error: "Invalid request",
      showSearch: false
    });
  }

  if (
    owner.otp !== otp ||
    owner.otpExpires < Date.now()
  ) {
    return res.render("verify.ejs", {
      email,
      error: "OTP invalid or expired",
      showSearch: false
    });
  }

  owner.isVerified = true;
  owner.otp = undefined;
  owner.otpExpires = undefined;
  await owner.save();

  // 🔐 Auto-login after verification
  const token = owner.generateToken();
  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.redirect("/");
});

// ADMIN LOGIN
app.get("/admin/login", (req, res) => {
  res.render("Loginform.ejs", { isLoggedIn: req.isLoggedIn, showSearch: false, error: null });
});

app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const owner = await Owner.findOne({ email });

    // ❌ Email not found
    if (!owner) {
      return res.render('Loginform.ejs', {
        error: 'Invalid email or password',
        showSearch: false
      });
    }

    const isMatch = await owner.comparePassword(password);

    // ❌ Password mismatch
    if (!isMatch) {
      return res.render('Loginform.ejs', {
        error: 'Invalid email or password',
        showSearch: false
      });
    }

    if (!owner.isVerified) {
      return res.render('Loginform.ejs', {
        error: 'Please verify your email before login',
        showSearch: false
      });
    }


    // ✅ Login success
    const token = owner.generateToken();

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.redirect('/');

  } catch (err) {
    console.error(err);
    return res.render('Loginform.ejs', {
      error: 'Something went wrong. Please try again.',
      showSearch: false
    });
  }
});

// Logout route
app.get("/logout", auth, (req, res) => {
  res.clearCookie("token"); // Remove the JWT cookie

  // Set headers to prevent caching
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.redirect("/admin/login");    // Redirect to login page
});

app.delete("/admin/:adminId/delete", auth, async (req, res) => {
  try {
    const { adminId } = req.params;
    if (req.owner._id.toString() !== adminId) {
      return res.status(403).send("Unauthorized action");
    }
    const deletedAdmin = await Owner.findByIdAndDelete(adminId);
    console.log("Deleted admin:", deletedAdmin);
    // logout after delete
    res.clearCookie("token");

    // Prevent cached auth pages
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.redirect("/admin/login");

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to delete admin");
  }
});

// 404 handler for unknown routes
app.use(auth, (req, res, next) => {
  const message = "Page Not Found";
  const status = 404;
  res.status(status).render("../views/error.ejs", { isLoggedIn: req.isLoggedIn, message, showSearch: false, status });
});
