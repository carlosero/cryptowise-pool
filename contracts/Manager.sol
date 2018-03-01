pragma solidity ^0.4.17;

contract Manager {
    address owner;
    uint totalTokens;
    uint pledgedAmount;
    mapping (address => uint) contributions;

    event Log(uint n);

    function Manager() public {
        owner = msg.sender;
    }

    function setContributions(address[] addresses, uint[] amounts) public {
        assert(msg.sender == owner); // only owner can set contributions
        assert(addresses.length == amounts.length);
        for (uint i = 0; i <= addresses.length-1; i++) {
            pledgedAmount += amounts[i] * 1 ether ;
            setContribution(addresses[i], amounts[i] * 1 ether);
        }
        Log(pledgedAmount);
    }

    function setContribution(address _address, uint _amount) internal {
        contributions[_address] = _amount;
    }

    function getContribution(address contributor) public view returns (uint) {
        return contributions[contributor];
    }

    function contributionPercentage(address contributor) public view returns (uint) {
        return getContribution(contributor) / pledgedAmount;
    }

    function setTokensReceived(uint amount, uint decimals) public { totalTokens = amount * 10**decimals; }
    function getTokensAmount() public view returns (uint) { return totalTokens; }

    function getPledgedAmount() public view returns (uint) { return pledgedAmount; }

    function getTokens(address contributor) public view returns (uint) {
        return ((getContribution(contributor) * totalTokens) / pledgedAmount);
    }
}
