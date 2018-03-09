var expectThrow = require('./helpers/expectThrow');
var Manager = artifacts.require("./Manager.sol");

contract('manager whitelist workflow functionality', async (accounts)  => {
	before(async () => {
		this.owner = accounts[0];
		this.investors = [accounts[1], accounts[2], accounts[3]];
		this.admins = [accounts[4], accounts[5], accounts[6]];
		this.instance = await Manager.new(300, 0, 0, 0, false, false, [this.admins[0], this.admins[1], this.admins[2]]);
		this.tokenContract = await TestToken.new(100000000, 'SomeEthereumToken', 3, 'SET');
		this.icoAddress = this.tokenContract.address;
	});

	it("allows only whitelist investors to contribute");
	it("does not allows normal people to contribute");
});

contract('manager blacklist workflow functionality', async (accounts) => {
	it("allows any investor not in whitelist to contribute");
	it("does not allows blacklisted investors to contribute");
});

contract('manager whitelist+blacklist workflow functionality', async (accounts)  => {
	it("allows only whitelisted investors not in whitelist to contribute");
	it("does not allows blacklisted investors to contribute");
	it("does not allows blacklisted investors that are in whitelist to contribute");
	it("does not allows normal people to contribute");
});
