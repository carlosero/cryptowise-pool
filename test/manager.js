var expectThrow = require('./helpers/expectThrow');
var Manager = artifacts.require("./Manager.sol");

contract('manager', async (accounts)  => {
	beforeEach(async () => {
		this.instance = await Manager.deployed();
		this.owner = accounts[0];
		this.investors = [accounts[1], accounts[2], accounts[3]];
		this.admins = [accounts[4], accounts[5], accounts[6]];
	})
	context('as contributor', async ()  => {
		it("should allow me to send ether to it", async ()  => {
			await this.instance.sendTransaction({ value: 12345, from: this.investors[0] });
            let balance = await this.instance.getContribution.call({from: this.investors[0]});
			assert.equal(balance.valueOf(), 12345);
		});

		it("should allow me to withdraw the ether I sent", async ()  => {
			await this.instance.sendTransaction({value: 12345, from: this.investors[1] });
            await this.instance.withdrawContribution({from: this.investors[1]});
            let balance = await this.instance.getContribution.call({from: this.investors[1]});
            assert.equal(balance.valueOf(), 0);
		});

		it("should not allow me to withdraw more than the ether I sent", async ()  => {
			await this.instance.sendTransaction({value: 12345, from: this.investors[1] });
            await this.instance.withdrawContribution({from: this.investors[1]});
         	await expectThrow(this.instance.withdrawContribution({from: this.investors[1]}), "Error");
		});

		it("should not allow me to modify admins", async ()  => {
         	await expectThrow(this.instance.setAdmins(this.admins, {from: this.investors[1]}), "Error");
		});

		it("should not allow me to send contribution of pool to X address", async ()  => {
			let icoAddress = '0x123306090abab3a6e1400e9345bc60c78a8bef57';
			await this.instance.sendTransaction({value: 12345, from: this.investors[2]});
         	await expectThrow(this.instance.sendContribution(icoAddress, {from: this.investors[2]}), "Error");
		});
	});

	context('as the owner', async ()  => {
		it("should set myself as admin when deployed", async () => {
			assert.equal(await this.instance.admins.call(0), this.owner);
			assert.equal(await this.instance.isAdmin.call(this.owner), true);
		});

		it('should allow me to setup admins', async ()  => {
			await this.instance.setAdmins(this.admins, {from: this.owner});
			for (i = 0; i < this.admins.length; i++) {
				assert.equal(await this.instance.admins.call(i), this.admins[i]);
			}
		});

		it('should set myself as admin when I set admins', async ()  => {
			await this.instance.setAdmins(this.admins, {from: this.owner});
			assert.equal(await this.instance.admins.call(this.admins.length), this.owner);
		});
	});

	context('as admin', async ()  => {
		it("should allow me to send contribution of pool to X address", async ()  => {
			let icoAddress = '0x123306090abab3a6e1400e9345bc60c78a8bef57';
			await this.instance.sendTransaction({value: 12345, from: this.owner});
			let poolContribution = await this.instance.poolContribution.call();
			await this.instance.sendContribution(icoAddress, {from: this.owner});
			assert.equal(web3.eth.getBalance(icoAddress).valueOf(), poolContribution.valueOf());
		});
	});
});
