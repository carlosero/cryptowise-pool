var Manager = artifacts.require("./Manager.sol");

module.exports = function(deployer) {
  deployer.deploy(Manager, 300, 0, 0, 0); // 30 = 3.0
};
