const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const transporter = require("../config/email");
const Owner = require('../models/owner');

// ADMIN SIGNUP (one-time)
router.get('/signup', (req, res) => {
  res.render("signupform.ejs", { isLoggedIn: req.isLoggedIn, showSearch: false, error: null });
});

router.post('/signup', async (req, res) => {
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

router.post('/verify-otp', async (req, res) => {
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
router.get("/login", (req, res) => {
  res.render("Loginform.ejs", { isLoggedIn: req.isLoggedIn, showSearch: false, error: null });
});

router.post('/login', async (req, res) => {
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
router.get("/logout", auth, (req, res) => {
  res.clearCookie("token"); // Remove the JWT cookie

  // Set headers to prevent caching
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.redirect("/admin/login");    // Redirect to login page
});

router.delete("/:adminId/delete", auth, async (req, res) => {
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

    res.redirect("admin/login");

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to delete admin");
  }
});

  module.exports=router;