const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;

const Ownerschema = new Schema({
  name: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  phone_no: { type: Number },
  email: { type: String, required: true, trim: true, unique: true },
  date: { type: Date, default: Date.now },
  
  otp: String,
  otpExpires: Date,

  isVerified: {
    type: Boolean,
    default: false
  }
});

// Hash password before saving
Ownerschema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

// Compare password method
Ownerschema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT method
Ownerschema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const Owner = mongoose.model('Owner', Ownerschema);
module.exports = Owner;
