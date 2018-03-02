var TestToken = artifacts.require("./TestToken.sol");

module.exports = function(deployer) {
  deployer.deploy(TestToken, 1234567, 'MyTokens', 'MYT');
};
