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
		it("should allow me to contribute ether", async ()  => {
			await this.instance.sendTransaction({ value: 12345, from: this.investors[0] });
            let balance = await this.instance.contributions.call(this.investors[0]);
			assert.equal(balance.valueOf(), 12345);
		});

		it("and should calculate my contribution and fees apart", async () => {
			let poolContribution = await this.instance.poolContribution.call();
			let poolFees = await this.instance.poolFees.call();
			assert.equal(poolContribution.valueOf(), 11974);
			assert.equal(poolFees.valueOf(), 371);
		});

		it("should allow me to withdraw the ether I contributed", async ()  => {
			investorBalance = web3.eth.getBalance(this.investors[0]).valueOf();
            let res = await this.instance.withdrawContribution({from: this.investors[0]});
            gas = res.receipt.gasUsed * 100000000000;
            newBalance = web3.eth.getBalance(this.investors[0]).valueOf();
            assert.equal(newBalance, investorBalance-gas+12345)
            let balance = await this.instance.contributions.call(this.investors[0]);
            assert.equal(balance.valueOf(), 0);
		});

		it("and should re-calculate pool contribution and fees", async () => {
			let poolContribution = await this.instance.poolContribution.call();
			let poolFees = await this.instance.poolFees.call();
			assert.equal(poolContribution.valueOf(), 0);
			assert.equal(poolFees.valueOf(), 0);
		});

		it("should allow me to contribute again after withdrawal", async ()  => {
			await this.instance.sendTransaction({ value: 12345, from: this.investors[0] });
            let balance = await this.instance.contributions.call(this.investors[0]);
			assert.equal(balance.valueOf(), 12345);
		});

		it("should allow me to contribute many times and keep the right balances", async ()  => {
			await this.instance.sendTransaction({ value: 12345, from: this.investors[0] });
			await this.instance.sendTransaction({ value: 12345, from: this.investors[0] });
            let balance = await this.instance.contributions.call(this.investors[0]);
			assert.equal(balance.valueOf(), 12345*3);
		});

		it("should not allow me to withdraw more than the ether I sent", async ()  => {
            await this.instance.withdrawContribution({from: this.investors[0]});
         	await expectThrow(this.instance.withdrawContribution({from: this.investors[0]}), "Error");
		});

		it("should not allow me to modify admins", async ()  => {
         	await expectThrow(this.instance.setAdmins(this.admins, {from: this.investors[0]}), "Error");
		});

		it("should not allow me to send contribution of pool to X address", async ()  => {
			let icoAddress = '0x123306090abab3a6e1400e9345bc60c78a8bef57';
			await this.instance.sendTransaction({value: 12345, from: this.investors[0]});
         	await expectThrow(this.instance.sendContribution(icoAddress, {from: this.investors[0]}), "Error");
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
			assert.equal(await this.instance.isAdmin.call(this.owner), true);
		});
	});

	context('as admin', async ()  => {
		it("should allow me to send contribution of pool to X address", async ()  => {
			let icoAddress = '0x123306090abab3a6e1400e9345bc60c78a8bef57';
			await this.instance.sendTransaction({value: 12345, from: this.investors[2]});
			let poolContribution = await this.instance.poolContribution.call();
			await this.instance.sendContribution(icoAddress, {from: this.admins[2]});
			assert.equal(web3.eth.getBalance(icoAddress).valueOf(), poolContribution.valueOf());
            poolContribution = await this.instance.poolContribution.call();
            assert.equal(poolContribution.valueOf(), 0);
		});

		it("should allow me to withdraw the pool fees", async () => {
			await this.instance.sendTransaction({value: 12345, from: this.investors[2]});
			adminBalance = web3.eth.getBalance(this.admins[2]).valueOf();
            let res = await this.instance.collectFees({from: this.admins[2]});
            gas = res.receipt.gasUsed * 100000000000;
            newBalance = web3.eth.getBalance(this.admins[2]).valueOf();
            assert.equal(newBalance, adminBalance-gas+371);
            let poolFees = await this.instance.poolFees.call();
            assert.equal(poolFees.valueOf(), 0);
		});
	});

	context('should do the right calculations for spliting fees and contributions', async () => {
		it('when fees is 2.5', async () => {
			let instance = await Manager.new(250);
			let res = await instance.sendTransaction({value: 4500000000000});
			let poolContribution = await instance.poolContribution.call();
			let poolFees = await instance.poolFees.call();
			assert.equal(poolContribution.valueOf(), 4387500000000);
			assert.equal(poolFees.valueOf(), 112500000000);

		});
		it('when fees is 0.2', async () => {
			let instance = await Manager.new(20);
			let res = await instance.sendTransaction({value: 337559310000000});
			let poolContribution = await instance.poolContribution.call();
			let poolFees = await instance.poolFees.call();
			assert.equal(poolContribution.valueOf(), 336884191380000);
			assert.equal(poolFees.valueOf(), 675118620000);
		});
		it('when fees is 0', async () => {
			let instance = await Manager.new(0);
			let res = await instance.sendTransaction({value: 337559310000000});
			let poolContribution = await instance.poolContribution.call();
			let poolFees = await instance.poolFees.call();
			assert.equal(poolContribution.valueOf(), 337559310000000);
			assert.equal(poolFees.valueOf(), 0);
		});
		it('when fees is 0.25', async () => {
			let instance = await Manager.new(25);
			let res = await instance.sendTransaction({value: 337559311234567});
			let poolContribution = await instance.poolContribution.call();
			let poolFees = await instance.poolFees.call();
			assert.equal(poolContribution.valueOf(), 336715412956480);
			assert.equal(poolFees.valueOf(), 843898278087);
		});
		it('when fees is 1.3', async () => {
			let instance = await Manager.new(130);
			let res = await instance.sendTransaction({value: 452551390041100000});
			let poolContribution = await instance.poolContribution.call();
			let poolFees = await instance.poolFees.call();
			assert.equal(poolContribution.valueOf(), 446668221970565700);
			assert.equal(poolFees.valueOf(), 5883168070534300);
		});
		it('when fees is 1.4', async () => {
			let instance = await Manager.new(140);
			let res = await instance.sendTransaction({value: 4525513900411237});
			let poolContribution = await instance.poolContribution.call();
			let poolFees = await instance.poolFees.call();
			assert.equal(poolContribution.valueOf(), 4462156705805479);
			assert.equal(poolFees.valueOf(), 63357194605758);
		});
	});
});
