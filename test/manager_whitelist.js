var expectThrow = require('./helpers/expectThrow');
var Manager = artifacts.require("./Manager.sol");

contract('manager whitelist workflow functionality', async (accounts)  => {
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
