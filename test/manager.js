var expectThrow = require('./helpers/expectThrow');
var Manager = artifacts.require("./Manager.sol");

contract('manager', async (accounts)  => {
	beforeEach(async () => {
		this.instance = await Manager.deployed();
	})
	context('as contributor', async ()  => {
		it("should allow me to send ether to it", async ()  => {
			let account = accounts[0];
			await this.instance.sendTransaction({
               value: 12345,
               from: account,
               gas: 150000
            });
            let balance = await this.instance.getContribution.call({from: account});
			assert.equal(balance.valueOf(), 12345);
		});
		it("should allow me to withdraw the ether I sent", async ()  => {
			let account = accounts[1];
			await this.instance.sendTransaction({
               value: 12345,
               from: account,
               gas: 150000
            });
            await this.instance.withdrawContribution({from: account});
            let balance = await this.instance.getContribution({from: account});
            assert.equal(balance.valueOf(), 0);
		});
		it("should not allow me to withdraw more than the ether I sent", async ()  => {
			let account = accounts[1];
			await this.instance.sendTransaction({
               value: 12345,
               from: account,
               gas: 150000
            });
            await this.instance.withdrawContribution({from: account});
         	await expectThrow(this.instance.withdrawContribution({from: account}), "Error");
		});
	});
	context('as the owner', async ()  => {
		it('should allow me to setup admins', async ()  => {

		});
	});
	context('as admin', async ()  => {
		it("should allow me to send contribution of pool to X address", async ()  => {

		});
	});
});
