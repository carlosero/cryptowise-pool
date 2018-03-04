var expectThrow = require('./helpers/expectThrow');
var Manager = artifacts.require("./Manager.sol");

contract('manager', async (accounts)  => {
	context('as contributor', async ()  => {
		it("should allow me to send ether to it", async ()  => {
			let instance = await Manager.deployed();
			let account = accounts[0];
			await instance.sendTransaction({
               value: 12345,
               from: account,
               gas: 150000
            });
            let balance = await instance.getContribution.call({from: account});
			assert.equal(balance.valueOf(), 12345);
		});
		it("should allow me to withdraw the ether I sent", async ()  => {
			let instance = await Manager.deployed();
			let account = accounts[1];
			await instance.sendTransaction({
               value: 12345,
               from: account,
               gas: 150000
            });
            await instance.withdrawContribution({from: account});
            let balance = await instance.getContribution({from: account});
            assert.equal(balance.valueOf(), 0);
		});
		it("should not allow me to withdraw more than the ether I sent", async ()  => {
			let instance = await Manager.deployed();
			let account = accounts[1];
			await instance.sendTransaction({
               value: 12345,
               from: account,
               gas: 150000
            });
            await instance.withdrawContribution({from: account});
         	await expectThrow(instance.withdrawContribution({from: account}), "Error");
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
