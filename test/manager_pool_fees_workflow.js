var expectThrow = require('./helpers/expectThrow');
var transactTo = require('./helpers/transactTo');
var Manager = artifacts.require("./Manager.sol");
var TestToken = artifacts.require("./TestToken.sol");

contract('manager with admins dont pay fees workflow', async (accounts)  => {
  before(async () => {
    this.owner = accounts[0];
    this.investors = [accounts[1], accounts[2], accounts[3]];
    this.admins = [accounts[4], accounts[5], accounts[6]];
    this.instance = await Manager.new(300, 0, 0, 0, false, false, [this.admins[0], this.admins[1], this.admins[2]]);
    this.tokenContract = await TestToken.new(100000000, 'SomeEthereumToken', 3, 'SET');
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
      await this.instance.sendTransaction({ value: 12340000, from: this.investors[0] });
      let balance = await this.instance.contributions.call(this.investors[0]);
      assert.equal(balance.valueOf(), 12340000);
    });

    it("should calculate my contribution and fees apart", async () => {
      let poolContribution = await this.instance.poolContribution.call();
      let poolFees = await this.instance.poolFees.call();
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
  });

  context("as admin", async () => {
    after(async () => { // after testing each scenario actually make the investments
      await this.instance.sendTransaction({ value: 12340000, from: this.investors[0] });
      await this.instance.sendTransaction({ value: 12340000, from: this.admins[1] });
    })
    it("should allow me to contribute ether", async ()  => {
      await this.instance.sendTransaction({ value: 12340000, from: this.admins[0] });
      let balance = await this.instance.contributions.call(this.admins[0]);
      assert.equal(balance.valueOf(), 12340000);
    });

    it("should calculate my contribution and fees apart", async () => {
      let poolContribution = await this.instance.poolContribution.call();
      let poolFees = await this.instance.poolFees.call();
      assert.equal(poolContribution.valueOf(), 12340000);
      assert.equal(poolFees.valueOf(), 0);
    });

    it("should allow me to withdraw the ether I contributed", async ()  => {
      investorBalance = web3.eth.getBalance(this.admins[0]).valueOf();
      let res = await this.instance.withdrawContribution({from: this.admins[0]});
      gas = res.receipt.gasUsed * 100000000000;
      newBalance = parseInt(web3.eth.getBalance(this.admins[0]).valueOf());
      assert.approximately(newBalance, investorBalance-gas+12340000, 100000);
      let balance = await this.instance.contributions.call(this.admins[0]);
      assert.equal(balance.valueOf(), 0);
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

    it("should allow me to configure token contract", async () => {
      await this.instance.tokensReceived(this.icoAddress, {from: this.admins[1]});
    });
  });

  context("after configuring token", async () => {
    after(async () => {
      // ater withdrawing all, token balance should be 0
      assert.equal((await this.tokenContract.balanceOf.call(this.instance.address)).valueOf(), 0);
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

      it("should allow me to withdraw my tokens", async () => {
        let initialTokenBalance = await this.tokenContract.balanceOf.call(this.instance.address);
        await this.instance.sendTransaction({ value: 0, from: this.admins[1] });
        let balance0 = await this.tokenContract.balanceOf.call(this.admins[1]);
        let contractTokenBalance = await this.tokenContract.balanceOf.call(this.instance.address);
        assert.equal(balance0.valueOf(), 12340000); // see tests from above
        assert.equal(contractTokenBalance.valueOf(), initialTokenBalance - (12340000));
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
        assert.equal(contractTokenBalance.valueOf(), 0); // after sending all contribution this should be 0
      });
    });
  });
});
contract('manager with fees are paid in tokens and admins pay fees workflow', async (accounts)  => {
  before(async () => {
    this.owner = accounts[0];
    this.investors = [accounts[1], accounts[2], accounts[3]];
    this.admins = [accounts[4], accounts[5], accounts[6]];
    this.instance = await Manager.new(300, 0, 0, 0, true, true, [this.admins[0], this.admins[1], this.admins[2]]);
    this.tokenContract = await TestToken.new(100000000, 'SomeEthereumToken', 3, 'SET');
    this.icoAddress = this.tokenContract.address;
  });

  context('as the owner', async ()  => {
    it('should set myself as admin when I set admins', async ()  => {
      assert.equal(await this.instance.admins.call(this.admins.length), this.owner);
      assert.equal(await this.instance.isAdmin.call(this.owner), true);
    });
  });

  context('as investor', async ()  => {
    it("should allow me to contribute ether", async ()  => {
      await this.instance.sendTransaction({ value: 12340000, from: this.investors[0] });
      let balance = await this.instance.contributions.call(this.investors[0]);
      assert.equal(balance.valueOf(), 12340000);
    });

    it("should calculate my contribution and fees apart", async () => {
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
  });

  context("as admin", async () => {
    after(async () => { // after testing each scenario actually make the investments
      await this.instance.sendTransaction({ value: 12340000, from: this.investors[0] });
      await this.instance.sendTransaction({ value: 12340000, from: this.admins[1] });
    })
    it("should allow me to contribute ether", async ()  => {
      await this.instance.sendTransaction({ value: 12340000, from: this.admins[0] });
      let balance = await this.instance.contributions.call(this.admins[0]);
      assert.equal(balance.valueOf(), 12340000);
    });

    it("should calculate my contribution and fees apart", async () => {
      let entireContribution = await this.instance.entireContribution.call();
      let poolContribution = await this.instance.poolContribution.call();
      let poolFees = await this.instance.poolFees.call();
      assert.equal(entireContribution.valueOf(), 12340000);
      assert.equal(poolContribution.valueOf(), 11969800);
      assert.equal(poolFees.valueOf(), 370200);
    });

    it("should allow me to withdraw the ether I contributed", async ()  => {
      investorBalance = web3.eth.getBalance(this.admins[0]).valueOf();
      let res = await this.instance.withdrawContribution({from: this.admins[0]});
      gas = res.receipt.gasUsed * 100000000000;
      newBalance = parseInt(web3.eth.getBalance(this.admins[0]).valueOf());
      assert.approximately(newBalance, investorBalance-gas+12340000, 100000);
      let balance = await this.instance.contributions.call(this.admins[0]);
      assert.equal(balance.valueOf(), 0);
    });
  });

  context('as admin', async ()  => {
    it("should allow me to send entireContribution of pool to X address", async ()  => {
      let entireContribution = await this.instance.entireContribution.call();
      await transactTo(this.instance, 1, this.admins[2]);
      await this.instance.sendContribution(this.icoAddress, {from: this.admins[2] });
      assert.equal(web3.eth.getBalance(this.icoAddress).valueOf(), entireContribution.valueOf());
      poolContributionSent = await this.instance.poolContributionSent.call();
      assert.equal(poolContributionSent.valueOf(), true);
    });

    it("should allow me to configure token contract", async () => {
      await this.instance.tokensReceived(this.icoAddress, {from: this.admins[1]});
    });
  });

  context("after configuring token", async () => {
    after(async () => {
      // ater withdrawing all, token balance should be 0
      assert.equal((await this.tokenContract.balanceOf.call(this.instance.address)).valueOf(), 0);
    });
    context("as admin", async () => {
      it("should allow me to withdraw the pool fees as tokens", async () => {
        let adminBalance = await this.tokenContract.balanceOf.call(this.admins[1]).valueOf();
        assert.equal(adminBalance.valueOf(), 0);
        let poolFees = await this.instance.poolFees.call();
        poolFessInTokens = parseInt(poolFees.valueOf());
        await this.instance.collectFees({from: this.admins[1]});
        let newBalance = await this.tokenContract.balanceOf.call(this.admins[1]).valueOf();
        assert.equal(newBalance.valueOf(), poolFessInTokens);
        let poolFeesSent = await this.instance.poolFeesSent.call();
        assert.equal(poolFeesSent.valueOf(), true);
      });

      it("should allow me to withdraw my tokens so I end up with poolFees+mytokens", async () => {
        let initialAdminTokens = (await this.tokenContract.balanceOf.call(this.admins[1])).valueOf();
        let initialContractTokenBalance = await this.tokenContract.balanceOf.call(this.instance.address);
        initialContractTokenBalance = parseInt(initialContractTokenBalance.valueOf());
        initialAdminTokens = parseInt(initialAdminTokens);
        await this.instance.sendTransaction({ value: 0, from: this.admins[1] });
        let newAdminTokens = await this.tokenContract.balanceOf.call(this.admins[1]);
        let contractTokenBalance = await this.tokenContract.balanceOf.call(this.instance.address);
        let poolFees = (await this.instance.poolFees.call()).valueOf();
        poolFees = parseInt(poolFees);
        assert.equal(newAdminTokens.valueOf(), (12340000*0.97) + poolFees); // admins[1] also withdrew poolFees
        assert.equal(contractTokenBalance.valueOf(), initialContractTokenBalance - (12340000*0.97));
      });
    });
    context("as investor", async () => {
      it("should allow me to withdraw my tokens", async () => {
        let initialTokenBalance = (await this.tokenContract.balanceOf.call(this.instance.address)).valueOf();
        initialTokenBalance = parseInt(initialTokenBalance);
        await this.instance.sendTransaction({ value: 0, from: this.investors[0] });
        let balanceWithTokens = await this.tokenContract.balanceOf.call(this.investors[0]);
        let contractTokenBalance = await this.tokenContract.balanceOf.call(this.instance.address);
        assert.equal(balanceWithTokens.valueOf(), 12340000*0.97); // see tests from above
        assert.equal(contractTokenBalance.valueOf(), initialTokenBalance - (12340000*0.97)); // after sending all contribution this should be 0
        assert.equal(contractTokenBalance.valueOf(), 0); // after sending all contribution this should be 0
      });
    });
  });
});
contract('manager with fees are paid in tokens and admins dont pay fees workflow', async (accounts)  => {
  before(async () => {
    this.owner = accounts[0];
    this.investors = [accounts[1], accounts[2], accounts[3]];
    this.admins = [accounts[4], accounts[5], accounts[6]];
    this.instance = await Manager.new(300, 0, 0, 0, true, false, [this.admins[0], this.admins[1], this.admins[2]]);
    this.tokenContract = await TestToken.new(100000000, 'SomeEthereumToken', 3, 'SET');
    this.icoAddress = this.tokenContract.address;
  });

  context('as the owner', async ()  => {
    it('should set myself as admin when I set admins', async ()  => {
      assert.equal(await this.instance.admins.call(this.admins.length), this.owner);
      assert.equal(await this.instance.isAdmin.call(this.owner), true);
    });
  });

  context('as investor', async ()  => {
    it("should allow me to contribute ether", async ()  => {
      await this.instance.sendTransaction({ value: 12340000, from: this.investors[0] });
      let balance = await this.instance.contributions.call(this.investors[0]);
      assert.equal(balance.valueOf(), 12340000);
    });

    it("should calculate my contribution and fees apart", async () => {
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
  });

  context("as admin", async () => {
    after(async () => { // after testing each scenario actually make the investments
      await this.instance.sendTransaction({ value: 12340000, from: this.investors[0] });
      await this.instance.sendTransaction({ value: 12340000, from: this.admins[1] });
    })
    it("should allow me to contribute ether", async ()  => {
      await this.instance.sendTransaction({ value: 12340000, from: this.admins[0] });
      let balance = await this.instance.contributions.call(this.admins[0]);
      assert.equal(balance.valueOf(), 12340000);
    });

    it("should calculate my contribution and fees apart", async () => {
      let entireContribution = await this.instance.entireContribution.call();
      let poolContribution = await this.instance.poolContribution.call();
      let poolFees = await this.instance.poolFees.call();
      assert.equal(entireContribution.valueOf(), 12340000);
      assert.equal(poolContribution.valueOf(), 12340000);
      assert.equal(poolFees.valueOf(), 0);
    });

    it("should allow me to withdraw the ether I contributed", async ()  => {
      investorBalance = web3.eth.getBalance(this.admins[0]).valueOf();
      let res = await this.instance.withdrawContribution({from: this.admins[0]});
      gas = res.receipt.gasUsed * 100000000000;
      newBalance = parseInt(web3.eth.getBalance(this.admins[0]).valueOf());
      assert.approximately(newBalance, investorBalance-gas+12340000, 100000);
      let balance = await this.instance.contributions.call(this.admins[0]);
      assert.equal(balance.valueOf(), 0);
    });
  });

  context('as admin', async ()  => {
    it("should allow me to send entireContribution of pool to X address", async ()  => {
      let entireContribution = await this.instance.entireContribution.call();
      await transactTo(this.instance, 1, this.admins[2]);
      await this.instance.sendContribution(this.icoAddress, {from: this.admins[2] });
      assert.equal(web3.eth.getBalance(this.icoAddress).valueOf(), entireContribution.valueOf());
      poolContributionSent = await this.instance.poolContributionSent.call();
      assert.equal(poolContributionSent.valueOf(), true);
    });

    it("should allow me to configure token contract", async () => {
      await this.instance.tokensReceived(this.icoAddress, {from: this.admins[1]});
    });
  });

  context("after configuring token", async () => {
    after(async () => {
      // ater withdrawing all, token balance should be 0
      assert.equal((await this.tokenContract.balanceOf.call(this.instance.address)).valueOf(), 0);
    });
    context("as admin", async () => {
      it("should allow me to withdraw the pool fees as tokens", async () => {
        let adminBalance = await this.tokenContract.balanceOf.call(this.admins[1]).valueOf();
        assert.equal(adminBalance.valueOf(), 0);
        let poolFees = await this.instance.poolFees.call();
        poolFessInTokens = parseInt(poolFees.valueOf());
        console.log("poolFessInTokens is ", poolFessInTokens)
        await this.instance.collectFees({from: this.admins[1]});
        let newBalance = await this.tokenContract.balanceOf.call(this.admins[1]).valueOf();
        console.log("newBalance is ", newBalance)
        assert.equal(newBalance.valueOf(), poolFessInTokens);
        let poolFeesSent = await this.instance.poolFeesSent.call();
        assert.equal(poolFeesSent.valueOf(), true);
      });

      it("should allow me to withdraw my tokens so I end up with poolFees+mytokens", async () => {
        let initialAdminTokens = (await this.tokenContract.balanceOf.call(this.admins[1])).valueOf();
        let initialContractTokenBalance = await this.tokenContract.balanceOf.call(this.instance.address);
        initialContractTokenBalance = parseInt(initialContractTokenBalance.valueOf());
        initialAdminTokens = parseInt(initialAdminTokens);
        await this.instance.sendTransaction({ value: 0, from: this.admins[1] });
        let newAdminTokens = await this.tokenContract.balanceOf.call(this.admins[1]);
        let contractTokenBalance = await this.tokenContract.balanceOf.call(this.instance.address);
        let poolFees = (await this.instance.poolFees.call()).valueOf();
        poolFees = parseInt(poolFees);
        assert.equal(newAdminTokens.valueOf(), (12340000) + poolFees); // admins[1] also withdrew poolFees
        assert.equal(contractTokenBalance.valueOf(), initialContractTokenBalance - (12340000));
      });
    });
    context("as investor", async () => {
      it("should allow me to withdraw my tokens", async () => {
        let initialTokenBalance = (await this.tokenContract.balanceOf.call(this.instance.address)).valueOf();
        initialTokenBalance = parseInt(initialTokenBalance);
        await this.instance.sendTransaction({ value: 0, from: this.investors[0] });
        let balanceWithTokens = await this.tokenContract.balanceOf.call(this.investors[0]);
        let contractTokenBalance = await this.tokenContract.balanceOf.call(this.instance.address);
        assert.equal(balanceWithTokens.valueOf(), 12340000*0.97); // see tests from above
        assert.equal(contractTokenBalance.valueOf(), initialTokenBalance - (12340000*0.97)); // after sending all contribution this should be 0
        assert.equal(contractTokenBalance.valueOf(), 0); // after sending all contribution this should be 0
      });
    });
  });
});
