var Manager = artifacts.require("./Manager.sol");
var expectEqualAttribute = require('./helpers/expectEqualAttribute');

contract('manager calculations', async (accounts)  => {
	context('should do the right calculations for spliting fees and contributions', async () => {
		it('when fees is 2.5', async () => {
			let instance = await Manager.new(250, 0, 0, 0, false, false, false, true, []);
			await instance.sendTransaction({value: 4500000000000});
			await expectEqualAttribute(instance.poolContribution.call(), 4387500000000);
			await expectEqualAttribute(instance.poolFees.call(), 112500000000);
		});
		it('when fees is 0.2', async () => {
			let instance = await Manager.new(20, 0, 0, 0, false, false, false, true, []);
			await instance.sendTransaction({value: 337559310000000});
			await expectEqualAttribute(instance.poolContribution.call(), 336884191380000);
			await expectEqualAttribute(instance.poolFees.call(), 675118620000);
		});
		it('when fees is 0', async () => {
			let instance = await Manager.new(0, 0, 0, 0, false, false, false, true, []);
			await instance.sendTransaction({value: 337559310000000});
			await expectEqualAttribute(instance.poolContribution.call(), 337559310000000);
			await expectEqualAttribute(instance.poolFees.call(), 0);
		});
		it('when fees is 0.25', async () => {
			let instance = await Manager.new(25, 0, 0, 0, false, false, false, true, []);
			await instance.sendTransaction({value: 337559311234567});
			await expectEqualAttribute(instance.poolContribution.call(), 336715412956480);
			await expectEqualAttribute(instance.poolFees.call(), 843898278087);
		});
		it('when fees is 1.3', async () => {
			let instance = await Manager.new(130, 0, 0, 0, false, false, false, true, []);
			await instance.sendTransaction({value: 452551390041100000});
			await expectEqualAttribute(instance.poolContribution.call(), 446668221970565700);
			await expectEqualAttribute(instance.poolFees.call(), 5883168070534300);
		});
		it('when fees is 1.4', async () => {
			let instance = await Manager.new(140, 0, 0, 0, false, false, false, true, []);
			await instance.sendTransaction({value: 4525513900411237});
			await expectEqualAttribute(instance.poolContribution.call(), 4462156705805479);
			await expectEqualAttribute(instance.poolFees.call(), 63357194605758);
		});
	});
});
