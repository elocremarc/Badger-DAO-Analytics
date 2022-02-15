import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
let EtherScanKEY = process.env.YOUR_ETHERSCAN_API_KEY;
/**
 * @dev Find the block number from yesterday, last week and last month
 * @returns {yesterday: blockNumber,lastWeek: blockNumber,lastMonth: blockNumber } blocknumber
 */
const getblockNumbers = async () => {
  let now = new Date();
  let yesterday = new Date();
  let lastWeek = new Date();
  let lastMonth = new Date();
  let sushiPriceBlock = 1611168227;
  yesterday.setDate(yesterday.getDate() - 1);
  lastWeek.setDate(lastWeek.getDate() - 7);
  lastMonth.setDate(lastMonth.getDate() - 30);

  let currentBlock = await axios.get(
    `https://api.etherscan.io//api?module=block&action=getblocknobytime&timestamp=${Math.round(
      now.getTime() / 1000
    )}&closest=before&apikey=${EtherScanKEY}`
  );
  let yesterdayBlock = await axios.get(
    `https://api.etherscan.io//api?module=block&action=getblocknobytime&timestamp=${Math.round(
      yesterday.getTime() / 1000
    )}&closest=before&apikey=${EtherScanKEY}`
  );
  let lastWeekBlock = await axios.get(
    `https://api.etherscan.io//api?module=block&action=getblocknobytime&timestamp=${Math.round(
      lastWeek.getTime() / 1000
    )}&closest=before&apikey=${EtherScanKEY}`
  );
  let lastMonthBlock = await axios.get(
    `https://api.etherscan.io//api?module=block&action=getblocknobytime&timestamp=${Math.round(
      lastMonth.getTime() / 1000
    )}&closest=before&apikey=${EtherScanKEY}`
  );
  let sushiPriceBlockNumber = await axios.get(
    `https://api.etherscan.io//api?module=block&action=getblocknobytime&timestamp=${sushiPriceBlock}&closest=before&apikey=${EtherScanKEY}`
  );
  return {
    currentBlock: currentBlock.data.result,
    yesterday: yesterdayBlock.data.result,
    lastWeek: lastWeekBlock.data.result,
    lastMonth: lastMonthBlock.data.result,
    sushiPriceBlock: sushiPriceBlockNumber.data.result,
  };
};

export default getblockNumbers;
