const { urlencoded } = require("express");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const predictionRoute = require("./routes/Predictions");
const Sort = require("./routes/Sort");
const AuthRouter = require("./routes/Login");
const ContestRouter = require("./routes/Contests");
const Price = require("./routes/LatestPrice");
const http = require("http");

const {
  listenWalletTopUps,
  listenWithdraw,
  listenToPredictions,
  listenForResult,
} = require("./utils/helper-functions");

const app = express();
const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

dotenv.config();

app.use(
  session({
    secret: "prediction-backend",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(express.json());

app.use(urlencoded({ extended: false }));

///  Routes
app.use("/predictions", predictionRoute);
app.use("/sort", Sort);
app.use("/auth", AuthRouter);
app.use("/contests", ContestRouter);
app.use("/latestPrice", Price);

/// listening to changes

server.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  mongoose
    .connect(process.env.MONGO_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("MongoDb connection successfull");
      listenForResult();
    })
    .catch((err) => console.log(err));
});
