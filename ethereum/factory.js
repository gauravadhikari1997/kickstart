import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(
  CampaignFactory.abi,
  "0xd6Dd19bCBEAC27D6b0532DE354f95f426cE76688"
);

export default instance;
