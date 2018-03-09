var expectThrow = require('./helpers/expectThrow');
var Manager = artifacts.require("./Manager.sol");

async function expectCanInvest(instance, investor) {
	await instance.sendTransaction({ value: 12340000, from: investor });
	assert.equal((await instance.contributions.call(investor)).valueOf(), 12340000);
}

async function expectCanNotInvest(instance, investor) {
	await expectThrow(instance.sendTransaction({ value: 12340000, from: investor }));
	assert.equal((await instance.contributions.call(investor)).valueOf(), 0);
}

contract('manager whitelist workflow functionality', async (accounts)  => {
	before(async () => {
		this.owner = accounts[0];
		this.investors = [accounts[1], accounts[2], accounts[3], accounts[4]];
		this.admins = [accounts[5], accounts[6]];
		this.instance = await Manager.new(300, 0, 0, 0, false, false, this.admins);
	});
	it('should allow admin to setup whitelist', async () => {
		await this.instance.setupWhitelist(true, [this.investors[0]]);
		expectCanInvest(this.instance, this.investors[0]);
		expectCanNotInvest(this.instance, this.investors[3]);
	});
	it('should allow admin to add individuals to whitelist', async () => {
		await this.instance.addToWhitelist(this.investors[1]);
		expectCanInvest(this.instance, this.investors[1]);
	});
	it('should allow admin to remove individuals from whitelist', async () => {
		await this.instance.removeFromWhitelist(this.investors[0]);
		expectCanInvest(this.instance, this.investors[1]);
		expectCanNotInvest(this.instance, this.investors[0]);
	});
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
