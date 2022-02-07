import axios from "axios";
import ethers from "ethers";
import decodeLogs from "./utils/decodeLogs.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const abi = require("./abi.json");
export let BN = ethers.BigNumber.from;
const EtherScanKEY = process.env.YOUR_ETHERSCAN_API_KEY;

export const EVENTS = {
  Harvest: "0x6c8433a8e155f0af04dba058d4e4695f7da554578963d876bdf4a6d8d6399d9c",
  TreeDistribution:
    "0x17cc18c044bdfa5f365fb0f6140ffbaa76843012681aedb2015580693fa49b94",
  PerformanceFeeGovernance:
    "0x7d9c11b977b58d20949545f69e59d50e907cf4ad8fdc98cab1eaabd76574f7cd",
};

/**
 * @param {string} address address of the contract
 * @param {string} event  event
 * @param {string} fromBlock from block
 * @param {string} toBlock to block default latest
 * @returns {Promise <Array>} array of events
 */
const getSingleEvents = async (
  address,
  event,
  fromBlock,
  toBlock = "latest"
) => {
  console.log(`Getting ${event} events from block ${fromBlock} to ${toBlock}`);
  console.time(`eventFetch`);

  let eventData = [];
  let url = `https://api.etherscan.io/api?module=logs&action=getLogs`;
  url +=
    // `&fromBlock=${fromBlock}` +
    // `&toBlock=${toBlock}` +
    `&address=${address}` +
    `&topic0=${EVENTS[event]}` +
    `&apikey=${EtherScanKEY}`;

  const events = await axios({
    method: "get",
    url: url,
  })
    .catch((err) => {
      console.log(err);
    })
    .then((response) => {
      console.log(response.data);
      {
        response.data.result.forEach((response) => {
          let eventDecoded = decodeLogs(
            event,
            response.data,
            response.topics,
            abi
          );
          let amount = eventDecoded.amount;
          let token = eventDecoded.token;
          let blockNumber = parseInt(response.blockNumber, 16);
          let gasPrice = parseInt(response.gasPrice, 16);
          let gasUsed = parseInt(response.gasUsed, 16);
          let timeStamp = parseInt(response.timeStamp, 16);
          let gasSpent = BN(gasPrice).mul(BN(gasUsed));

          eventData.push({
            event: event,
            token: token,
            amount: amount,
            transactionHash: response.transactionHash,
            blockNumber: blockNumber,
            gasSpent: ethers.utils.formatEther(gasSpent.toString()),
            timeStamp: timeStamp,
          });
        });
        console.log(`${event} events fetched`);
        //console.log(eventData);
        return eventData;
      }
    });

  console.timeEnd(`eventFetch`);
  //  console.log(events[0]);
  return events;
};
export default getSingleEvents;
