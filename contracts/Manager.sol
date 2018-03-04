pragma solidity ^0.4.17;

import "SafeMath.sol";

contract Manager {
    address owner;

    // contributors
    address[] contributors;
    mapping (address => uint256) contributions;

    // admins
    address[] admins;
    mapping (address => bool) isAdminOfPool;

    // generals
    uint256 poolContribution;

    event Contributed(address _address, uint256 _amount);
    event Withdrawed(address _address, uint256 _amount);

    function Manager(address[] _admins) public {
        owner = msg.sender;
        admins = _admins;
        for (uint i = 0; i < _admins.length; i++) {
            isAdminOfPool[_admins[i]] = true
        }
    }

    modifier isAdmin { require(isAdminOfPool[msg.sender]); _; }

    function () public payable { // default action is contribute
        contributors.push(msg.sender);
        contributions[msg.sender] += msg.value;
        poolContribution += msg.value;
        emit Contributed(msg.sender, msg.value);
    }

    function withdraw(uint256 _amount) {
        assert(contributions[msg.sender] > _amount);
        contributions[msg.sender] = SafeMath.sub(contributions[msg.sender], _amount);
        poolContribution -= msg.value
        emit Withdrawed(msg.sender, _amount);
    }
}
