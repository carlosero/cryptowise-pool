var Manager = artifacts.require("./Manager.sol");

module.exports = function(deployer) {
  deployer.deploy(Manager, 300); // 30 = 3.0
};
