const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
// const transporter = require("../config/email");
const Owner = require("../models/owner");
const noCache = require("../middlewares/noCache");
const emailApi = require("../config/email");
/* =========================
   ADMIN SIGNUP
========================= */
router.get("/signup", (req, res) => {
  res.render("signupform.ejs", {
    isLoggedIn: req.isLoggedIn,
    showSearch: false
  });
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone_no, password } = req.body;

    if (!name || !email || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/admin/signup");
    }

    const existing = await Owner.findOne({ email });

    if (existing && existing.isVerified) {
      req.flash("error", "Admin already exists");
      return res.redirect("/admin/signup");
    }

    if (existing && !existing.isVerified) {
      await Owner.deleteOne({ email });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const owner = new Owner({
      name,
      email,
      phone_no,
      password,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
      isVerified: false
    });

    await owner.save();

    const requestTime = new Date().toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });


    await emailApi.sendTransacEmail({
  sender: {
    email: process.env.BREVO_EMAIL,
    name: "School Records"
  },
  to: [{ email }],
  subject: "OTP Verification",
  htmlContent:  `
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

      <p style="font-size: 13px; color: #444242;">
        This is an automated message from the School Records system.
      </p>
    </div>
  `
});





  //   await transporter.sendMail({
  //     from: `"School Records" <${process.env.BREVO_EMAIL}>`,
  //     to: email,
  //     subject: "Verify Your Admin Email – School Records",
  //     html: `
  //     <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  //     <h2 style="color: #198754;">Email Verification</h2>

  //      <p>
  //       Hello <strong>${name}</strong>,
  //     </p>

  //     <p>
  //       We received a request to create or verify an <strong>Admin account</strong>
  //       for the <strong>School Records</strong> system using this email address.
  //     </p>

  //      <p style="font-size: 14px; color: #555;">
  //       <strong>Request time:</strong> ${requestTime}
  //     </p>

  //     <p>
  //       Your 4-digit verification code is:
  //     </p>

  //     <h1 style="letter-spacing: 4px; color: #000;">
  //       ${otp}
  //     </h1>

  //     <p>
  //       This code is valid for <strong>5 minutes</strong>.
  //     </p>

  //     <p>
  //       <strong>If you did not request this verification,</strong>
  //       you can safely ignore this email. No changes will be made to your account.
  //     </p>

  //     <p style="margin-top: 24px; font-size: 14px; color: #666;">
  //       For your security, please do not share this code with anyone.
  //     </p>

  //     <hr style="margin: 24px 0;">

  //     <p style="font-size: 13px; color: #444242;">
  //       This is an automated message from the School Records system.
  //     </p>
  //   </div>
  // `
  //   });

    // 🔑 redirect instead of render
    return res.redirect(`/admin/verify?email=${email}`);

  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    return res.redirect("/admin/signup");
  }
});

/* =========================
   VERIFY PAGE
========================= */
router.get("/verify",noCache, (req, res) => {
  res.render("verify.ejs", {
    email: req.query.email,
    showSearch: false
  });
});

/* =========================
   VERIFY OTP
========================= */
router.post("/verify-otp",noCache, async (req, res) => {
  const { email, otp } = req.body;

  const owner = await Owner.findOne({ email });

  if (!owner) {
    req.flash("error", "Invalid request");
    return res.redirect(`/admin/verify?email=${email}`);
  }

  if (owner.otp !== otp || owner.otpExpires < Date.now()) {
    req.flash("error", "OTP invalid or expired");
    return res.redirect(`/admin/verify?email=${email}`);
  }

  owner.isVerified = true;
  owner.otp = undefined;
  owner.otpExpires = undefined;
  await owner.save();

  const token = owner.generateToken();
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: true,
    sameSite: 'strict'
  });

  req.flash("success", "Welcome to School Records");
  return res.redirect("/");
});

/* =========================
   RESEND OTP
========================= */
router.post("/resend-otp",noCache, async (req, res) => {
  const { email } = req.body;

  const owner = await Owner.findOne({ email });

  if (!owner) {
    req.flash("error", "Invalid request");
    return res.redirect("/admin/signup");
  }

  if (owner.isVerified) {
    req.flash("success", "Account already verified");
    return res.redirect("/admin/login");
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  owner.otp = otp;
  owner.otpExpires = Date.now() + 5 * 60 * 1000;
  await owner.save();




  await emailApi.sendTransacEmail({
  sender: {
    email: process.env.BREVO_EMAIL,
    name: "School Records"
  },
  to: [{ email }],
  subject: "New OTP for SChool Verification",
  htmlContent: `<h1>${otp}</h1><p>Valid for 5 minutes</p>`
});





  // await transporter.sendMail({
  //   from: `"School Records" <${process.env.BREVO_EMAIL}>`,
  //   to: email,
  //   subject: "New OTP – School Records",
  //   html: `<h1>${otp}</h1><p>Valid for 5 minutes</p>`
  // });

  req.flash("success", "New OTP sent to your email");
  return res.redirect(`/admin/verify?email=${email}`);
});

/* =========================
   LOGIN / LOGOUT
========================= */
router.get("/login", (req, res) => {
  res.render("Loginform.ejs", {
    isLoggedIn: req.isLoggedIn,
    showSearch: false
  });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const owner = await Owner.findOne({ email });

    if (!owner || !(await owner.comparePassword(password)) || !owner.isVerified) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/admin/login");
    }

    const token = owner.generateToken();
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: 'strict'
    });

    req.flash("success", "Welcome to School Records");
    return res.redirect("/");
  } catch (err) {
    req.flash("error", "Invalid email or password");
    return res.redirect("/admin/login");
  }
});

router.get("/logout", auth,noCache, (req, res) => {
  res.clearCookie("token");
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    "Pragma": "no-cache",
    "Expires": "0"
  });
  req.flash("success", "Logged out successfully");
  res.redirect("/admin/login");
});

/* =========================
   DELETE ADMIN
========================= */
router.delete("/:adminId/delete", auth, noCache, async (req, res) => {
  if (req.owner._id.toString() !== req.params.adminId) {
    return res.status(403).send("Unauthorized");
  }

  await Owner.findByIdAndDelete(req.params.adminId);
  
  res.clearCookie("token");
  res.set({
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  "Pragma": "no-cache",
  "Expires": "0"
});
  req.flash("success", "Admin deleted successfully");
  res.redirect("/admin/login");
});

module.exports = router;
