const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const compiledFactory = require("../ethereum/build/CampaignFactory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");

let accounts;
let factory;
let campaign;
let campaignAddress;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({ data: compiledFactory.evm.bytecode.object })
    .send({ from: accounts[0], gas: "1000000" });

  await factory.methods.createCampaign("100").send({
    from: accounts[0],
    gas: "1000000"
  });

  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

  campaign = await new web3.eth.Contract(compiledCampaign.abi, campaignAddress);
});

describe("Campaigns", () => {
  it("Factory and Campaign are deployed", () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });
  it("factory calling address is same as manager", async () => {
    const manager = await campaign.methods.manager().call();
    assert.equal(accounts[0], manager);
  });
  it("allows people to contribute and mark them as approvers", async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: 200
    });
    const isContributer = await campaign.methods.approvers(accounts[1]).call();
    assert(isContributer);
  });
  it("requires a minimum contribution", async () => {
    try {
      await campaign.methods
        .contribute()
        .send({ from: accounts[1], value: 20 });
      assert(false);
    } catch (e) {
      assert(e);
    }
  });
  it("allows manager to make payment requests", async () => {
    await campaign.methods.createRequest("Samosa", 100, accounts[1]).send({
      from: accounts[0],
      gas: 1000000
    });
    const request = await campaign.methods.requests(0).call();
    assert.equal("Samosa", request.description);
  });
  it("allows to finalizeRequest", async () => {
    await campaign.methods.contribute().send({
      from: accounts[0],
      value: 2000
    });
    await campaign.methods.createRequest("Samosa", 100, accounts[1]).send({
      from: accounts[0],
      gas: 1000000
    });
    await campaign.methods.approveRequest(0).send({
      from: accounts[0],
      gas: 1000000
    });
    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: 1000000
    });
    let request = await campaign.methods.requests(0).call();
    assert.ok(request.complete);
  });
});
