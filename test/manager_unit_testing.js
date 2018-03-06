var expectThrow = require('./helpers/expectThrow');
var transactTo = require('./helpers/transactTo');
var Manager = artifacts.require("./Manager.sol");

contract('manager unit testing', async (accounts)  => {
	beforeEach(async () => {
		this.instance = await Manager.deployed();
		this.owner = accounts[0];
		this.investors = [accounts[1], accounts[2], accounts[3]];
		this.admins = [accounts[4], accounts[5], accounts[6]];
	});
	context('as investor', async ()  => {
		it('should not allow me to contribute less than min contribution', async () => {
			let instance = await Manager.new(0, 1000, 0, 0);
			await instance.sendTransaction({ value: 1000, from: this.investors[1] });
         	await expectThrow(instance.sendTransaction({ value: 999, from: this.investors[1] }), "Error");
		});

		it('should not allow me to contribute more than max contribution', async () => {
			let instance = await Manager.new(0, 0, 1000, 0);
			await instance.sendTransaction({ value: 1000, from: this.investors[1] });
         	await expectThrow(instance.sendTransaction({ value: 1001, from: this.investors[1] }), "Error");
		});

		it('should not allow me to contribute more than poolMaxContribution', async () => {
			let instance = await Manager.new(1000, 0, 0, 9000); // contract balance would be 10000
			await instance.sendTransaction({ value: 8000, from: this.investors[1] });
			await instance.sendTransaction({ value: 2000, from: this.investors[2] });
         	await expectThrow(instance.sendTransaction({ value: 10, from: this.investors[2] }), "Error");
		});
	});
	context('as the owner', async ()  => {
		it("should set myself as admin when deployed", async () => {
			assert.equal(await this.instance.admins.call(0), this.owner);
			assert.equal(await this.instance.isAdmin.call(this.owner), true);
		});
	});
});
