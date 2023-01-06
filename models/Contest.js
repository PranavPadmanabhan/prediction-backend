const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema({
  contestId: { type: String },
  title: {
    type: {
      from: String,
      to: String,
    },
  },
  predictions: {
    type: [
      {
        predictedValue: Number,
        predictedAt: Number,
        user: String,
        difference: Number,
      },
    ],
  },
});

module.exports = mongoose.model("Contest", contestSchema);
