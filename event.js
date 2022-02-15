import getSingleEvents from "./getSingleEvents.js";
import { createRequire } from "module";
import decodeLogs from "./utils/decodeLogs.js";
const require = createRequire(import.meta.url);

const strategies = require("./strategies.json");
const strategy = "native.sbtcCrv";
const abi = require("./abi.json");

let eventPerformanceFeeGovernance = await getSingleEvents(
  strategies[strategy],
  "TreeDistribution"
);

console.log("TreeDistribution", eventPerformanceFeeGovernance[0]);
