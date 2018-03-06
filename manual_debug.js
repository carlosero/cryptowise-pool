migrate --reset

Manager.deployed().then(function(instance) { this.instance = instance; })
TestToken.deployed().then(function(instance) { this.tokenContract = instance; })

this.tokenContract.sendTransaction({ value: 12340000, from: this.investors[0] })

this.owner = web3.eth.accounts[0];
this.investors = [web3.eth.accounts[1], web3.eth.accounts[2], web3.eth.accounts[3]];
this.admins = [web3.eth.accounts[4], web3.eth.accounts[5], web3.eth.accounts[6]];
this.icoAddress = this.tokenContract.address;
this.instance.sendTransaction({ value: 12340000, from: this.investors[0] })
this.instance.setAdmins(this.admins, {from: this.owner})
this.instance.setState(1, {from: this.admins[2]});
this.instance.sendContribution(this.icoAddress, {from: this.admins[2], gas: 999999})

