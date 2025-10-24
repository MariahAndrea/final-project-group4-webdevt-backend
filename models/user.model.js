const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
     username: {
          type: String,
          required: [true, "Username is required."],
          unique: true
     },
     email: {
          type: String,
          required: [true, "Email is required."]
     },
     password: {
          type: String,
          required: [true, "Password is required."]
     },
     coins: {
          type: Number,
          default: 0
     }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;