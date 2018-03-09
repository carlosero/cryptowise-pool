var Manager = artifacts.require("./Manager.sol");
var TestToken = artifacts.require('./TestToken.sol');

module.exports = function(deployer) {
  deployer.deploy(Manager, 300, 0, 0, 0, false, false, false, true, [web3.eth.accounts[4], web3.eth.accounts[5], web3.eth.accounts[6]]); // 30 = 3.0
  deployer.deploy(TestToken, 100000000, 'SomeEthereumToken', 3, 'SET');
};
