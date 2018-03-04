var Manager = artifacts.require("./Manager.sol");

module.exports = function(deployer) {
  deployer.deploy(Manager, 30); // 30 = 3.0
};
