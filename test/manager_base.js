var expectThrow = require('./helpers/expectThrow');
var transactTo = require('./helpers/transactTo');
var expectBalanceEqual = require('./helpers/expectBalanceEqual');
var balanceOf = require('./helpers/balanceOf');
var tokenBalanceOf = require('./helpers/tokenBalanceOf');
var Manager = artifacts.require("./Manager.sol");
var TestToken = artifacts.require("./TestToken.sol");

contract('manager base workflow functionality', async (accounts)  => {
	beforeEach(async () => {
		this.instance = await Manager.deployed();
		this.tokenContract = await TestToken.deployed();
		this.owner = accounts[0];
		this.investors = [accounts[1], accounts[2], accounts[3]];
		this.admins = [accounts[4], accounts[5], accounts[6]];
		this.icoAddress = this.tokenContract.address;
	})

	context('as the owner', async ()  => {
		it('should set myself as admin when I set admins', async ()  => {
			assert.equal(await this.instance.admins.call(this.admins.length), this.owner);
			assert.equal(await this.instance.isAdmin.call(this.owner), true);
		});
	});

	context('as investor', async ()  => {
		it("should allow me to contribute ether", async ()  => {
			let res = await this.instance.sendTransaction({ value: 12340000, from: this.investors[0] });
      await expectBalanceEqual(this.instance, this.investors[0], 12340000);
		});

		it("and should calculate my contribution and fees apart", async () => {
			let entireContribution = await this.instance.entireContribution.call();
			let poolContribution = await this.instance.poolContribution.call();
			let poolFees = await this.instance.poolFees.call();
			assert.equal(entireContribution.valueOf(), 12340000);
			assert.equal(poolContribution.valueOf(), 11969800);
			assert.equal(poolFees.valueOf(), 370200);
		});

		it("should allow me to withdraw the ether I contributed", async ()  => {
			investorBalance = web3.eth.getBalance(this.investors[0]).valueOf();
      let res = await this.instance.withdrawContribution({from: this.investors[0]});
      gas = res.receipt.gasUsed * 100000000000;
      newBalance = parseInt(web3.eth.getBalance(this.investors[0]).valueOf());
      assert.approximately(newBalance, investorBalance-gas+12340000, 100000);
      let balance = await this.instance.contributions.call(this.investors[0]);
      assert.equal(balance.valueOf(), 0);
		});

		it("and should re-calculate pool contribution and fees", async () => {
			let entireContribution = await this.instance.entireContribution.call();
			let poolContribution = await this.instance.poolContribution.call();
			let poolFees = await this.instance.poolFees.call();
			assert.equal(entireContribution.valueOf(), 0);
			assert.equal(poolContribution.valueOf(), 0);
			assert.equal(poolFees.valueOf(), 0);
		});

		it("should allow me to contribute again after withdrawal", async ()  => {
			await this.instance.sendTransaction({ value: 12340000, from: this.investors[0] });
            let balance = await this.instance.contributions.call(this.investors[0]);
			assert.equal(balance.valueOf(), 12340000);
		});

		it("should allow me and others to contribute many times and keep the right balances", async ()  => {
			await this.instance.sendTransaction({ value: 12340000, from: this.investors[0] });
			await this.instance.sendTransaction({ value: 12340000, from: this.investors[2] });
            let balance_one = await this.instance.contributions.call(this.investors[0]);
            let balance_two = await this.instance.contributions.call(this.investors[2]);
			let entireContribution = await this.instance.entireContribution.call();
			let poolContribution = await this.instance.poolContribution.call();
			let poolFees = await this.instance.poolFees.call();
			assert.equal(balance_one.valueOf(), 12340000*2);
			assert.equal(balance_two.valueOf(), 12340000);
			assert.equal(entireContribution.valueOf(), 12340000*3);
			assert.equal(poolContribution.valueOf(), 11969800*3);
			assert.equal(poolFees.valueOf(), 370200*3);
		});
	});

	context("as admin", async () => {
		it("should allow admin to move funds between accounts", async () => {
			let initialBalanceInvestorTwo = await this.instance.contributions.call(this.investors[2]);
			await this.instance.transferTo(this.investors[2], this.investors[1], 500);
			let balanceInvestorOne = await this.instance.contributions.call(this.investors[1]);
			let balanceInvestorTwo = await this.instance.contributions.call(this.investors[2]);
			assert.equal(balanceInvestorTwo.valueOf(), initialBalanceInvestorTwo.valueOf()-500);
			assert.equal(balanceInvestorOne.valueOf(), 500);
		});
	});

	context("as investor", async () => {
		it("should not allow me to withdraw more than the ether I sent", async ()  => {
            await this.instance.withdrawContribution({from: this.investors[0]});
         	await expectThrow(this.instance.withdrawContribution({from: this.investors[0]}), "Error");
		});

		it("should allow others to withdraw their contribution", async () => {
            await this.instance.withdrawContribution({from: this.investors[2]});
		});

		it("should not allow me to send contribution of pool to X address", async ()  => {
			await this.instance.sendTransaction({value: 12340000, from: this.investors[0]});
         	await expectThrow(this.instance.sendContribution(this.icoAddress, {from: this.investors[0]}), "Error");
		});

		it("should not allow me to change pool state", async ()  => {
         	await expectThrow(transactTo(this.instance, 1, this.investors[0]), "Error");
		});
	});

	context('as admin', async ()  => {
		it("should allow me to send contribution of pool to X address", async ()  => {
			let poolContribution = await this.instance.poolContribution.call();
			await transactTo(this.instance, 1, this.admins[2]);
			await this.instance.sendContribution(this.icoAddress, {from: this.admins[2] });
			assert.equal(web3.eth.getBalance(this.icoAddress).valueOf(), poolContribution.valueOf());
            poolContributionSent = await this.instance.poolContributionSent.call();
            assert.equal(poolContributionSent.valueOf(), true);
		});

		it("should not allow me to send contribution of pool twice", async () => {
         	await expectThrow(this.instance.sendContribution(this.icoAddress, {from: this.admins[2]}), "Error");
		});

		it("should not allow me to collect fees without configuring token contract", async () => {
         	await expectThrow(this.instance.collectFees({from: this.admins[1]}), "Error");
		});

		it("should allow me to configure token contract", async () => {
			await this.instance.tokensReceived(this.icoAddress, {from: this.admins[1]});
		});
	});

	context("after configuring token", async () => {
		it("state should be distribution", async () => {
			let state = await this.instance.state.call();
			assert.equal(state.valueOf(), 2);
		});

		it("should know its tokens balance", async () => {
			// for this test, token gives balance in a ratio 1 wei == 1 token
			let poolContribution = await this.instance.poolContribution.call();
			let tokenBalance = await this.instance.tokenBalance.call();
			let contractBalance = await this.tokenContract.balanceOf.call(this.instance.address);
			assert.equal(poolContribution.valueOf(), tokenBalance.valueOf());
			assert.equal(poolContribution.valueOf(), contractBalance.valueOf());
		});

		context("as admin", async () => {
			it("should allow me to withdraw the pool fees", async () => {
				let adminBalance = web3.eth.getBalance(this.admins[1]).valueOf();
				let poolFees = await this.instance.poolFees.call();
	            let res = await this.instance.collectFees({from: this.admins[1]});
	            gas = res.receipt.gasUsed * 100000000000;
	            newBalance = parseInt(web3.eth.getBalance(this.admins[1]).valueOf());
	            assert.approximately(newBalance, adminBalance-gas+parseInt(poolFees.valueOf()), 100000);
	            let poolFeesSent = await this.instance.poolFeesSent.call();
	            assert.equal(poolFeesSent.valueOf(), true);
			});

			it("should not allow me to withdraw pool fees twice", async () => {
	         	await expectThrow(this.instance.collectFees({from: this.admins[1]}), "Error");
			});
		});

		context("as investor", async () => {
			it("should allow me to withdraw my tokens", async () => {
				let initialTokenBalance = await this.tokenContract.balanceOf.call(this.instance.address);
				await this.instance.sendTransaction({ value: 0, from: this.investors[0] });
				let balance0 = await this.tokenContract.balanceOf.call(this.investors[0]);
				let contractTokenBalance = await this.tokenContract.balanceOf.call(this.instance.address);
				assert.equal(balance0.valueOf(), 12340000*0.97); // see tests from above
				assert.equal(contractTokenBalance.valueOf(), initialTokenBalance - (12340000*0.97)); // after sending all contribution this should be 0
			});

			it("should allow an admin to send me my tokens", async () => {
				await this.instance.collectTokens(this.investors[1], { value: 0, from: this.admins[1] });
				let balance1 = await this.tokenContract.balanceOf.call(this.investors[1]);
				let contractTokenBalance = await this.tokenContract.balanceOf.call(this.instance.address);
				assert.equal(balance1.valueOf(), 500*0.97);
				assert.equal(contractTokenBalance.valueOf(), 0);
			});

			it("should not allow me to withdraw after I already did withdraw", async () => {
	         	await expectThrow(this.instance.sendTransaction({ value: 0, from: this.investors[0] }), "Error");
			});

			it("should not allow me withdraw after I withdrew my contribution before", async () => {
	         	await expectThrow(this.instance.sendTransaction({ value: 0, from: this.investors[2] }), "Error");
			});

			it("should allow withdrawal only from real investors", async () => {
	         	await expectThrow(this.instance.sendTransaction({ value: 0, from: this.admins[1] }), "Error");
			});
		});

		context('as admin', async () => {
			it("should allow me to trigger a second airdrop of tokens", async () => {
				await this.tokenContract.airdropTokens(this.instance.address, 12340500);
				await this.instance.checkTokenAirdrop({from: this.admins[0]});
			});
		});

		context("as investor", async () => {
			it("should allow me to claim my share of the second airdrop", async () => {
				await this.instance.sendTransaction({ value: 0, from: this.investors[0] });
				await this.instance.sendTransaction({ value: 0, from: this.investors[1] });
				let balance0 = await this.tokenContract.balanceOf.call(this.investors[0]);
				let balance1 = await this.tokenContract.balanceOf.call(this.investors[1]);
				assert.equal(balance0.valueOf(), parseInt(12340000*0.97 + (12340000/(500+12340000)) * 12340500));
				assert.equal(balance1.valueOf(), parseInt(500*0.97 + (500/(500+12340000)) * 12340500));
				let contractTokenBalance = await this.tokenContract.balanceOf.call(this.instance.address);
				assert.equal(contractTokenBalance.valueOf(), 0);
			});
		});

		context('as admin', async () => {
			it("should allow me to trigger a third airdrop of tokens", async () => {
				await this.tokenContract.airdropTokens(this.instance.address, 12340500);
				await this.instance.checkTokenAirdrop({from: this.admins[0]});
			});
		});

		context("as investor", async () => {
			it("should allow me to claim my share of the third airdrop", async () => {
				await this.instance.sendTransaction({ value: 0, from: this.investors[0] });
				await this.instance.sendTransaction({ value: 0, from: this.investors[1] });
				let balance0 = await this.tokenContract.balanceOf.call(this.investors[0]);
				let balance1 = await this.tokenContract.balanceOf.call(this.investors[1]);
				assert.equal(balance0.valueOf(), parseInt(12340000*0.97 + ((12340000/(500+12340000)) * 12340500) + ((12340000/(500+12340000)) * 12340500)));
				assert.equal(balance1.valueOf(), parseInt(500*0.97 + ((500/(500+12340000)) * 12340500) + ((500/(500+12340000)) * 12340500)));
				let contractTokenBalance = await this.tokenContract.balanceOf.call(this.instance.address);
				assert.equal(contractTokenBalance.valueOf(), 0);
			});
		});

		it('should work no matter the decimals of the tokens')
	});
});
