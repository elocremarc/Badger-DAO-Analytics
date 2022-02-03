import ethers from "ethers";

const decodeLogs = (event, data, topics, abi) => {
  const iface = new ethers.utils.Interface(abi);
  let decoded = iface.decodeEventLog(event, data, topics);
  return decoded;
};
export default decodeLogs;
