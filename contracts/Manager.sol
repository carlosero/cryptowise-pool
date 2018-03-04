pragma solidity ^0.4.17;

contract Manager {
    address owner;

    // contributors
    address[] contributors;
    mapping (address => uint256) contributions;

    event Contributed(address _address, uint256 amount)

    function Manager() public {
        owner = msg.sender;
    }

    function () public payable { // default action is contribute
        contributors.push(msg.sender)
        contributions[msg.sender] += msg.value
        emit Contributed(msg.sender, msg.value)
    }
}
