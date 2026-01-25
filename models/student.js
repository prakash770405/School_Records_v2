const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Studentschema = new Schema({
  name: { type: String, default: 'hahaha', trim: true, },
  img: {
    url: String,
    filename: String,
    photosize: Number,
    phototype: String,
  },
  subjects: [{
    name: { type: String, trim: true },
    marks: { type: Number, min: 0, max: 100 }
  }],
  age: { type: Number, min: 4, max: 100 },
  roll_no: { type: Number },
  phone_no: { type: Number },
  email: { type: String, trim: true },
  Class: { type: Number },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'Owner',
  },
  date: { type: Date, default: Date.now },
});

const Student = mongoose.model('Student', Studentschema);
module.exports = Student;
