const router = require("express").Router();
const { getResult } = require("../utils/helper-functions");

router.get("/", async (req, res) => {
  await getResult();
  res.status(200).json({ message: "Done" });
});

module.exports = router;
