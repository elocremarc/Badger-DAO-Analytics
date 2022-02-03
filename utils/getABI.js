import axios from "axios";
const getABIetherscan = async (address) => {
  const etherScanGetAbi = `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}`;
  let res = await axios.get(etherScanGetAbi);
  let ABI = res.data.result;
  ABI = JSON.parse(ABI);
  ABI = [...ABI];
  return ABI;
};
export default getABIetherscan;
