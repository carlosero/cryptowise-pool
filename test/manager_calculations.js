var Manager = artifacts.require("./Manager.sol");

contract('manager calculations', async (accounts)  => {
	context('should do the right calculations for spliting fees and contributions', async () => {
		it('when fees is 2.5', async () => {
			let instance = await Manager.new(250, 0, 0, 0);
			let res = await instance.sendTransaction({value: 4500000000000});
			let poolContribution = await instance.poolContribution.call();
			let poolFees = await instance.poolFees.call();
			assert.equal(poolContribution.valueOf(), 4387500000000);
			assert.equal(poolFees.valueOf(), 112500000000);

		});
		it('when fees is 0.2', async () => {
			let instance = await Manager.new(20, 0, 0, 0);
			let res = await instance.sendTransaction({value: 337559310000000});
			let poolContribution = await instance.poolContribution.call();
			let poolFees = await instance.poolFees.call();
			assert.equal(poolContribution.valueOf(), 336884191380000);
			assert.equal(poolFees.valueOf(), 675118620000);
		});
		it('when fees is 0', async () => {
			let instance = await Manager.new(0, 0, 0, 0);
			let res = await instance.sendTransaction({value: 337559310000000});
			let poolContribution = await instance.poolContribution.call();
			let poolFees = await instance.poolFees.call();
			assert.equal(poolContribution.valueOf(), 337559310000000);
			assert.equal(poolFees.valueOf(), 0);
		});
		it('when fees is 0.25', async () => {
			let instance = await Manager.new(25, 0, 0, 0);
			let res = await instance.sendTransaction({value: 337559311234567});
			let poolContribution = await instance.poolContribution.call();
			let poolFees = await instance.poolFees.call();
			assert.equal(poolContribution.valueOf(), 336715412956480);
			assert.equal(poolFees.valueOf(), 843898278087);
		});
		it('when fees is 1.3', async () => {
			let instance = await Manager.new(130, 0, 0, 0);
			let res = await instance.sendTransaction({value: 452551390041100000});
			let poolContribution = await instance.poolContribution.call();
			let poolFees = await instance.poolFees.call();
			assert.equal(poolContribution.valueOf(), 446668221970565700);
			assert.equal(poolFees.valueOf(), 5883168070534300);
		});
		it('when fees is 1.4', async () => {
			let instance = await Manager.new(140, 0, 0, 0);
			let res = await instance.sendTransaction({value: 4525513900411237});
			let poolContribution = await instance.poolContribution.call();
			let poolFees = await instance.poolFees.call();
			assert.equal(poolContribution.valueOf(), 4462156705805479);
			assert.equal(poolFees.valueOf(), 63357194605758);
		});
	});
});
