var Manager = artifacts.require("./Manager.sol");

contract('manager', function(accounts) {
	context('as contributor', function() {
		it("should allow me to send ether to it", function() {

		});
		it("should allow me to withdraw the ether I sent", function() {

		});
		it("should know how much I contributed in total", function() {

		});
		it("should know the contribution of pool", function() {

		});
	});
	context('as the owner', function() {
		it('should allow me to setup admins', function() {

		});
	});
	context('as admin', function() {
		it("should allow me to send contribution of pool to X address", function() {

		});
	});
});
