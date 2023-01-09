const router = require("express").Router();
var ne = require("node-encrypt");
const dotenv = require("dotenv");
dotenv.config();

router.get("/", async (req, res) => {
  //   ne.encrypt(
  //     { text: process.env.CONTRACT_ADDRESS, key: process.env.ENCRYPTION_KEY },
  //     (err, ciphertext) => {
  //       if (err) return err;
  //       console.log(ciphertext);
  //     }
  //   );

  ne.decrypt(
    { cipher: process.env.VALUE, key: process.env.ENCRYPTION_KEY },
    (err, plaintext) => {
      console.log(plaintext);
    }
  );
});

module.exports = router;
