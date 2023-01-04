const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: { type: String },
  address: { type: String },
  walletBalance: { type: Number },
  predictions: { type: Array },
});

module.exports = mongoose.model("User", userSchema);
