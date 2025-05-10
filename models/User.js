const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  college: { type: String, required: true },
  degree: { type: String, required: true },
  stream: { type: String, required: true },
  year: { type: Number, required: true },
  birthDate: { type: Date, required: true },
  password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
