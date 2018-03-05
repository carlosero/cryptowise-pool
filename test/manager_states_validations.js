var expectThrow = require('./helpers/expectThrow');
var transactTo = require('./helpers/transactTo');
var Manager = artifacts.require("./Manager.sol");

contract('manager states validations', async (accounts)  => {
	beforeEach(async () => {
		this.instance = await Manager.deployed();
		this.owner = accounts[0];
		this.investors = [accounts[1], accounts[2], accounts[3]];
		this.admins = [accounts[4], accounts[5], accounts[6]];
	});

	context('while open', async ()  => {
		beforeEach( async () => { await transactTo(this.instance, 0, this.owner); });

		context('as contributor', async () => {
			it("should allow me to contribute ether", async ()  => {
				await this.instance.sendTransaction({ value: 12345, from: this.investors[0] });
			});
			it("should allow me to withdraw contributions", async ()  => {
				await this.instance.sendTransaction({ value: 12345, from: this.investors[0] });
			});
		});

		context('as admin', async => {
			it("should not allow me to send contribution of pool to X address", async ()  => {
				await this.instance.sendTransaction({value: 12345, from: this.investors[2]});
	         	await expectThrow(this.instance.sendContribution(accounts[7], {from: this.owner}), "Error");
			});
			it("should not allow me to withdraw the pool fees", async ()  => {
	         	await expectThrow(this.instance.collectFees({from: this.owner}), "Error");
			});
		});
	});

	context('while closed', async () => {
		beforeEach( async () => { await transactTo(this.instance, 1, this.owner); });

		context("as contributor", async () => {
			it("should not allow me to contribute ether", async ()  => {
	         	await expectThrow(this.instance.sendTransaction({ value: 12345, from: this.investors[0] }), "Error");
	         });
			it("should not allow me to withdraw contributions", async ()  => {
	         	await expectThrow(this.instance.sendTransaction({ value: 12345, from: this.investors[0] }), "Error");
			});
		});

		context('as admin', async => {
			it("should allow me to send contribution of pool to X address", async ()  => {
	         	await this.instance.sendContribution(this.investors[2], {from: this.owner});
			});
			it("should not allow me to withdraw the pool fees", async ()  => {
	         	await expectThrow(this.instance.collectFees({from: this.owner}), "Error");
			});
		});
	});

	context('while distribution', async () => {
		beforeEach( async () => { await transactTo(this.instance, 2, this.owner); });

		context("as contributor", async () => {
			it("should not allow me to contribute ether", async ()  => {
	         	await expectThrow(this.instance.sendTransaction({ value: 12345, from: this.investors[0] }), "Error");
	         });
			it("should not allow me to withdraw contributions", async ()  => {
	         	await expectThrow(this.instance.sendTransaction({ value: 12345, from: this.investors[0] }), "Error");
			});
		});

		context('as admin', async => {
			it("should allow me to withdraw the pool fees", async ()  => {
	         	await this.instance.collectFees({from: this.owner});
			});
		});
	});
});
