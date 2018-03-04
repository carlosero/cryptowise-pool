pragma solidity ^0.4.17;

import "./SafeMath.sol";

contract Manager {
    address owner;

    // contributors
    address[] public contributors;
    mapping (address => uint256) public contributions;

    // admins
    address[] public admins;
    mapping (address => bool) isAdmin;

    // generals
    uint256 public poolContribution;

    event Contributed(address _address, uint256 _amount);
    event Withdrawed(address _address, uint256 _amount);
    event PoolContributionSent(address _to, uint256 _amount);

    function Manager() public {
        owner = msg.sender;
    }

    function setAdmins(address[] _admins) public onlyOwner {
        admins = _admins;
        admins.push(owner);
        for (uint i = 0; i < _admins.length; i++) {
            isAdmin[_admins[i]] = true;
        }
    }

    modifier onlyAdmin { require(isAdmin[msg.sender]); _; }
    modifier onlyOwner { require(msg.sender == owner); _; }

    // contributes
    function () public payable { // default action is contribute
        contributors.push(msg.sender);
        contributions[msg.sender] += msg.value;
        poolContribution += msg.value;
        Contributed(msg.sender, msg.value);
    }

    // withdraws contribution
    function withdrawContribution() public {
        uint256 amount = contributions[msg.sender];
        assert(amount > 0 && amount <= poolContribution);
        poolContribution -= amount;
        contributions[msg.sender] = 0;
        Withdrawed(msg.sender, amount);
        msg.sender.transfer(amount);
    }

    // contributed amount
    function getContribution() public view returns (uint256) {
        return contributions[msg.sender];
    }

    // sends contribution to ICO/presale address
    function sendContribution(address _to) public onlyAdmin {
        assert(this.balance >= poolContribution);
        _to.transfer(poolContribution);
        PoolContributionSent(_to, poolContribution);
    }
}
