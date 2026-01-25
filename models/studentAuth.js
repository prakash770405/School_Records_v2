const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Schema = mongoose.Schema;

const studentAuthSchema = new Schema(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            unique: true // one login per student
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        },

        lastLogin: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

studentAuthSchema.pre("save", async function () {
    if (!this.isModified("password"))
        return;
    this.password = await bcrypt.hash(this.password, 10);
})

studentAuthSchema.methods.comparePassword = function (pw) {
    return bcrypt.compare(pw, this.password);
};

studentAuthSchema.methods.generateToken = function () {
    return jwt.sign(
        { id: this._id, role: "student" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

module.exports = mongoose.model("StudentAuth", studentAuthSchema);