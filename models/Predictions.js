const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema({
  contestId: { type: Number },
  predictedValue: { type: Number },
  predictedAt: { type: Number },
  difference: { type: Number },
  user: { type: String },
});

module.exports = mongoose.model("Prediction", PredictionSchema);
