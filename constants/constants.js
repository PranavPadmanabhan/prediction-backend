const contractAddress = require("./contractAddresses.json");
const ABI = require("./abi.json");
const array = [
  0.0008, 0.0005, 0.0002, 0.00005333333, 0.00004, 0.000032, 0.00001066666,
  0.0000064, 0.00000333333,
];

const contestTitles = [
  {
    from: "ETH",
    to: "USD",
  },
  {
    from: "BTC",
    to: "USD",
  },
  {
    from: "DAI",
    to: "USD",
  },
  {
    from: "LINK",
    to: "USD",
  },
  {
    from: "FORTH",
    to: "USD",
  },
  {
    from: "SNX",
    to: "USD",
  },
  {
    from: "JPY",
    to: "USD",
  },
  {
    from: "CZK",
    to: "USD",
  },
  {
    from: "USDC",
    to: "USD",
  },
  {
    from: "XAU",
    to: "USD",
  },
  {
    from: "BTC",
    to: "ETH",
  },
  {
    from: "LINK",
    to: "ETH",
  },
];

module.exports = { contractAddress, ABI, array, contestTitles };
