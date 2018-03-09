var expectThrow = require('./helpers/expectThrow');
var transactTo = require('./helpers/transactTo');
var Manager = artifacts.require("./Manager.sol");
var TestToken = artifacts.require("./TestToken.sol");

contract('manager unit testing', async (accounts)  => {
	beforeEach(async () => {
		this.investors = [accounts[1], accounts[2], accounts[3]];
	});
	context('as investor', async ()  => {
		it('should not allow me to contribute less than min contribution', async () => {
			let instance = await Manager.new(0, 1000, 0, 0, false, false, false, true, []);
			await instance.sendTransaction({ value: 1000, from: this.investors[1] });
         	await expectThrow(instance.sendTransaction({ value: 999, from: this.investors[1] }), "Error");
		});

		it('should not allow me to contribute more than max contribution', async () => {
			let instance = await Manager.new(0, 0, 1000, 0, false, false, false, true, []);
			await instance.sendTransaction({ value: 1000, from: this.investors[1] });
         	await expectThrow(instance.sendTransaction({ value: 1001, from: this.investors[1] }), "Error");
		});

		it('should not allow me to contribute more than poolMaxContribution', async () => {
			let instance = await Manager.new(1000, 0, 0, 9000, false, false, false, true, []); // contract balance would be 10000
			await instance.sendTransaction({ value: 8000, from: this.investors[1] });
			await instance.sendTransaction({ value: 2000, from: this.investors[2] });
         	await expectThrow(instance.sendTransaction({ value: 10, from: this.investors[2] }), "Error");
		});
	});

	it('should allow admin to move funds and tokens between accounts', async () => {
		let instance = await Manager.new(0, 0, 0, 0, false, false, false, false, []);
		tokenContract = await TestToken.deployed();
		icoAddress = tokenContract.address;

		// invest
		await instance.sendTransaction({ value: 100000, from: this.investors[0] });
		await instance.sendTransaction({ value: 100000, from: this.investors[1] });
		await instance.transferTo(this.investors[1], this.investors[2], 100000);
		// expect balance to be xx
		// setup token address
		await transactTo(instance, 1, accounts[0]);
		await instance.sendContribution(icoAddress, {from: accounts[0]});
		await instance.tokensReceived(icoAddress, {from: accounts[0]});
		await instance.transferTo(this.investors[0], this.investors[2], 100000);
		// expect to be xx
		await instance.sendTransaction({ value: 0, from: this.investors[2] });
		assert.equal((await tokenContract.balanceOf.call(this.investors[2])).valueOf(), 200000);
	});
});
