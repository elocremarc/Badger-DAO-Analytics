import express from "express";
import { createRequire } from "module";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import getEvents from "./getEvents.js";
const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const strategies = require("./strategies.json");
const tokenDictionary = require("./tokenDictionary.json");
const testData = require("./dataTest.json");

const app = express();

//todo
//  native.mstableFpMbtcHbtc
//  native.mstableImBtc
//  native.cvx
//  native.pbtcCrv
//  experimental.sushiIBbtcWbtc
//  native.sushiDiggWbtc
//  native.digg

//todo harvest
//  native.sushiWbtcBtc
//  native.sushiBadgerWbtc

//todo
//  native.uniDiggWbtc

//todo
//  experimental.digg

//todo curve.fi price
//  native.tricrypto
//  native.tricrypto2

// ** MIDDLEWARE ** //
const whitelist = [
  "http://localhost:3000",
  "http://localhost:5000",
  "https://badger-dao-analytics.herokuapp.com/",
];
const corsOptions = {
  origin: function (origin, callback) {
    console.log("** Origin of request " + origin);
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      console.log("Origin acceptable");
      callback(null, true);
    } else {
      console.log("Origin rejected");
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(helmet());
app.use(cors(corsOptions));

app.get("/strategies", (req, res) => {
  res.json(strategies);
});

app.get("/tokenDictionary", (req, res) => {
  res.json(tokenDictionary);
});

app.get("/events", async (req, res) => {
  let request = req.query;
  let fromBlock = req.fromBlock;
  let toBlock = req.toBlock;
  console.log("request", request);
  console.time(`FullEventFetch`);
  let harvestFiltered = await getEvents(request.strategy);

  res.json(harvestFiltered);
  console.timeEnd(`FullEventFetch`);
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
  app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, (req, res) => {
  console.log(`server listening on port: ${PORT}`);
});
