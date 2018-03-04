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
            let balance = await this.instance.getContribution.call({from: account});
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
		it("should not allow me to modify admins", async ()  => {
         	await expectThrow(this.instance.setAdmins([accounts[2]], {from: accounts[1]}), "Error");
		});
		it("should not allow me to send contribution of pool to X address", async ()  => {
			let icoAddress = '0x123306090abab3a6e1400e9345bc60c78a8bef57';
			await this.instance.sendTransaction({value: 12345, from: accounts[0]});
         	await expectThrow(this.instance.sendContribution(icoAddress, {from: accounts[6]}), "Error");
		});
	});
	context('as the owner', async ()  => {
		it('should allow me to setup admins', async ()  => {
			admins = [accounts[1], accounts[3], accounts[5]];
			await this.instance.setAdmins(admins, {from: accounts[0]});
			for (i = 0; i < 3; i++) {
				assert.equal(await this.instance.admins.call(i), admins[i]);
			}
		});
		it('should set myself as admin when I set admins', async ()  => {
			await this.instance.setAdmins([accounts[1]], {from: accounts[0]});
			assert.equal(await this.instance.admins.call(1), accounts[0]);
		});
	});
	context('as admin', async ()  => {
		it("should allow me to send contribution of pool to X address", async ()  => {
			let icoAddress = '0x123306090abab3a6e1400e9345bc60c78a8bef57';
			await this.instance.sendTransaction({value: 12345, from: accounts[0]});
			let poolContribution = await this.instance.poolContribution.call();
			await this.instance.sendContribution(icoAddress, {from: accounts[0]});
			assert.equal(web3.eth.getBalance(icoAddress).valueOf(), poolContribution.valueOf());
		});
	});
});
