var expectThrow = require('./helpers/expectThrow');
var transactTo = require('./helpers/transactTo');
var Manager = artifacts.require("./Manager.sol");
var TestToken = artifacts.require("./TestToken.sol");

contract('manager with admins dont pay fees workflow', async (accounts)  => {
  before(async () => {
    this.owner = accounts[0];
    this.investors = [accounts[1], accounts[2], accounts[3]];
    this.admins = [accounts[4], accounts[5], accounts[6]];
    this.instance = await Manager.new(300, 0, 0, 0, false,[this.admins[0], this.admins[1], this.admins[2]]);
    this.tokenContract = await TestToken.new(100000000, 'SomeEthereumToken', 3, 'SET');
    this.icoAddress = this.tokenContract.address;
  })

  context('as the owner', async ()  => {
    it('should set myself as admin when I set admins', async ()  => {
      assert.equal(await this.instance.admins.call(this.admins.length), this.owner);
      assert.equal(await this.instance.isAdmin.call(this.owner), true);
    });
  });

  context('as investor', async ()  => {
    it("should allow me to contribute ether", async ()  => {
      let res = await this.instance.sendTransaction({ value: 12340000, from: this.investors[0] });
      let balance = await this.instance.contributions.call(this.investors[0]);
      assert.equal(balance.valueOf(), 12340000);
    });

    it("should calculate my contribution and fees apart", async () => {
      let poolContribution = await this.instance.poolContribution.call();
      let poolFees = await this.instance.poolFees.call();
      assert.equal(poolContribution.valueOf(), 11969800);
      assert.equal(poolFees.valueOf(), 370200);
    });

    it("should allow me to withdraw the ether I contributed", async ()  => {
      investorBalance = web3.eth.getBalance(this.investors[0]).valueOf();
      let res = await this.instance.withdrawContribution({from: this.investors[0]});
      gas = res.receipt.gasUsed * 100000000000;
      newBalance = parseInt(web3.eth.getBalance(this.investors[0]).valueOf());
      assert.approximately(newBalance, investorBalance-gas+12340000, 100000);
      let balance = await this.instance.contributions.call(this.investors[0]);
      assert.equal(balance.valueOf(), 0);
    });
  });

  context("as admin", async () => {
    it("should allow me to contribute ether", async ()  => {
      let res = await this.instance.sendTransaction({ value: 12340000, from: this.admins[0] });
      let balance = await this.instance.contributions.call(this.admins[0]);
      assert.equal(balance.valueOf(), 12340000);
    });

    it("should calculate my contribution and fees apart", async () => {
      let poolContribution = await this.instance.poolContribution.call();
      let poolFees = await this.instance.poolFees.call();
      assert.equal(poolContribution.valueOf(), 12340000);
      assert.equal(poolFees.valueOf(), 0);
    });

    it("should allow me to withdraw the ether I contributed", async ()  => {
      investorBalance = web3.eth.getBalance(this.admins[0]).valueOf();
      let res = await this.instance.withdrawContribution({from: this.admins[0]});
      gas = res.receipt.gasUsed * 100000000000;
      newBalance = parseInt(web3.eth.getBalance(this.admins[0]).valueOf());
      assert.approximately(newBalance, investorBalance-gas+12340000, 100000);
      let balance = await this.instance.contributions.call(this.admins[0]);
      assert.equal(balance.valueOf(), 0);
    });
  });
});
contract('manager with fees are paid in ether workflow', async (accounts)  => {
});
contract('manager with fees are paid in tokens workflow', async (accounts)  => {
});
