const router = require("express").Router();
const { getPredictionContract } = require("../utils/helper-functions");

router.get("/", async (req, res) => {
  const contract = await getPredictionContract(true);
  console.log("Starting..");
  for (let i = 0; i < 100; i++) {
    const tx1 = await contract.predict(1, 1100 + i);
    await tx1.wait(1);
    const tx2 = await contract.predict(2, 16100 + i);
    await tx2.wait(1);
    const tx3 = await contract.predict(3, 1 + i);
    await tx3.wait(1);
    const tx4 = await contract.predict(4, 4 + i);
    await tx4.wait(1);
    const tx5 = await contract.predict(5, 1 + i);
    await tx5.wait(1);
    const tx6 = await contract.predict(6, 1 + i);
    await tx6.wait(1);
    const tx7 = await contract.predict(7, 1 + i);
    await tx7.wait(1);
    const tx = await contract.predict(8, 1 + i);
    console.log(`transaction ${i + 1} confirmed`);

    await tx.wait(1);
  }
  res.status(200).json("Done");
});

module.exports = router;
