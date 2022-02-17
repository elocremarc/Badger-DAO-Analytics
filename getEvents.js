import axios from "axios";
import ethers from "ethers";
import getblockNumbers from "./utils/getBlockNumbers.js";
import commaNumber from "comma-number";
import getSingleEvents from "./getSingleEvents.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const strategies = require("./strategies.json");

const getEvents = async (strategy) => {
  let blockNumbers = await getblockNumbers();
  let blockLastMonth = blockNumbers.lastMonth;
  let blockSushiPrice = blockNumbers.sushiPrice;
  let events = [];
  if (
    strategy === "native.sushiWbtcEth" ||
    strategy === "experimental.sushiIBbtcWbtc" ||
    strategy === "native.sushiDiggWbtc" ||
    strategy === "native.sushiBadgerWbtc"
  ) {
    events = await getSingleEvents(
      strategies[strategy],
      "HarvestState",
      blockSushiPrice
    );
    if (events.status === "0") {
      return events;
    } else {
      events = events.result;
    }
  } else {
    let eventTreeDistribution = await getSingleEvents(
      strategies[strategy],
      "TreeDistribution",
      blockLastMonth
    );
    if (eventTreeDistribution.status === "0") {
      return events;
    } else {
      eventTreeDistribution = eventTreeDistribution.result;
    }
    let eventPerformanceFeeGovernance = await getSingleEvents(
      strategies[strategy],
      "PerformanceFeeGovernance",
      blockLastMonth
    );
    if (eventPerformanceFeeGovernance.status === "0") {
      return events;
    } else {
      eventPerformanceFeeGovernance = eventPerformanceFeeGovernance.result;
    }

    events = eventTreeDistribution.concat(eventPerformanceFeeGovernance);
  }
  return events;
};

export default getEvents;
