pragma solidity ^0.4.17;

import "SafeMath.sol";

contract Manager {
    address owner;

    // contributors
    address[] contributors;
    mapping (address => uint256) contributions;

    event Contributed(address _address, uint256 _amount)
    event Withdrawed(address _address, uint256 _amount)

    function Manager() public {
        owner = msg.sender;
    }

    function () public payable { // default action is contribute
        contributors.push(msg.sender)
        contributions[msg.sender] += msg.value
        emit Contributed(msg.sender, msg.value)
    }

    function withdraw(uint256 _amount) {
        assert(contributions[msg.sender] > _amount)
        contributions[msg.sender] = SafeMath.sub(contributions[msg.sender], _amount)
        emit Withdrawed(msg.sender, _amount)
    }
}
