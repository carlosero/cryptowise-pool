var expectThrow = require('./helpers/expectThrow');
var expectCanInvest = require('./helpers/expectCanInvest');
var expectCanNotInvest = require('./helpers/expectCanNotInvest');
var Manager = artifacts.require("./Manager.sol");

contract('manager whitelist workflow functionality', async (accounts)  => {
	before(async () => {
		this.owner = accounts[0];
		this.investors = [accounts[1], accounts[2], accounts[3], accounts[4]];
		this.admins = [accounts[5], accounts[6]];
		this.instance = await Manager.new(300, 0, 0, 0, true, false, false, false, this.admins);
	});
	it('should allow admin to setup whitelist', async () => {
		await this.instance.setupWhitelist([this.investors[0]]);
		await expectCanInvest(this.instance, this.investors[0]);
		await expectCanNotInvest(this.instance, this.investors[3]);
	});
	it('should allow admin to add individuals to whitelist', async () => {
		await this.instance.addToWhitelist(this.investors[1]);
		await expectCanInvest(this.instance, this.investors[1]);
	});
	it('should allow admin to remove individuals from whitelist', async () => {
		await this.instance.removeFromWhitelist(this.investors[0]);
		await expectCanInvest(this.instance, this.investors[1]);
		await expectCanNotInvest(this.instance, this.investors[0]);
	});
	it('should allow admin to disable whitelist', async () => {
		await this.instance.setWhitelistStatus(false);
		await expectCanInvest(this.instance, this.investors[0]);
		await expectCanInvest(this.instance, this.investors[1]);
		await expectCanInvest(this.instance, this.investors[2]);
	});
});

contract('manager blacklist workflow functionality', async (accounts) => {
	before(async () => {
		this.owner = accounts[0];
		this.investors = [accounts[1], accounts[2], accounts[3], accounts[4]];
		this.admins = [accounts[5], accounts[6]];
		this.instance = await Manager.new(300, 0, 0, 0, false, true, false, false, this.admins);
	});
	it('should allow admin to setup blacklist', async () => {
		await this.instance.setupBlacklist([this.investors[0]]);
		await expectCanNotInvest(this.instance, this.investors[0]);
		await expectCanInvest(this.instance, this.investors[3]);
	});
	it('should allow admin to add individuals to blacklist', async () => {
		await this.instance.addToBlacklist(this.investors[1]);
		await expectCanNotInvest(this.instance, this.investors[1]);
	});
	it('should allow admin to remove individuals from blacklist', async () => {
		await this.instance.removeFromBlacklist(this.investors[0]);
		await expectCanNotInvest(this.instance, this.investors[1]);
		await expectCanInvest(this.instance, this.investors[0]);
	});
	it('should allow admin to disable blacklist', async () => {
		await this.instance.setBlacklistStatus(false);
		await expectCanInvest(this.instance, this.investors[0]);
		await expectCanInvest(this.instance, this.investors[1]);
		await expectCanInvest(this.instance, this.investors[2]);
	});
});

// contract('manager whitelist+blacklist workflow functionality', async (accounts)  => {
// 	it("allows only whitelisted investors not in whitelist to contribute");
// 	it("does not allows blacklisted investors to contribute");
// 	it("does not allows blacklisted investors that are in whitelist to contribute");
// 	it("does not allows normal people to contribute");
// });
