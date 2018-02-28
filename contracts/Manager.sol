pragma solidity ^0.4.17;

contract Manager {
    address owner;
    address[] addresses;
    uint[] amounts;
    uint tokensReceived;
    mapping (address => uint) contributions;


    function Manager() public {
        owner = msg.sender;
    }

    function setTokens(uint _tokensAmount) public { tokensReceived = _tokensAmount; }

    function setContributions(address[] _addresses, uint[] _amounts) public {
        assert(msg.sender == owner); // only owner can set contributions
        assert(_addresses.length == _amounts.length);
        for (uint i = 0; i <= _addresses.length-1; i++) {
            setContribution(_addresses[i], _amounts[i]);
        }
    }

    function setContribution(address _address, uint _amount) internal {
        contributions[_address] = _amount;
    }

    function getContribution(address contributor) public view returns (uint) {
        return contributions[contributor];
    }

    function getTokens(address contributor) public view returns (uint) {
        return (contributions[contributor] * tokensReceived);
    }

    function getTokensAmount() public view returns (uint) {
        return tokensReceived;
    }
}
