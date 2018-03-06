var Manager = artifacts.require("./Manager.sol");
var TestToken = artifacts.require('./eip20/TestToken.sol');

module.exports = function(deployer) {
  deployer.deploy(Manager, 300, 0, 0, 0); // 30 = 3.0
  deployer.deploy(TestToken, 100000000, 'Facecucks', 3, 'FCK');
};
