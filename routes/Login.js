const router = require("express").Router();
const User = require("../models/User");

router.post("/", async (req, res) => {
  if (req.body.address) {
    const user = await User.findOne({ address: req.body.address });
    if (user) {
      res.status(200).json(user);
    } else {
      const newUser = new User({
        userId: Math.floor(100000 + Math.random() * 900000),
        address: req.body.address,
        walletBalance: 0,
        predictions: [],
      });
      const user = await newUser.save();
      res.status(201).json(user);
    }
  }
});

router.get("/user/balance", async (req, res) => {
  if (req.query.address) {
    const user = await User.findOne({
      address: req.query.address,
    });
    if (user) {
      res.status(200).json(user.walletBalance);
    }
  }
});

module.exports = router;
