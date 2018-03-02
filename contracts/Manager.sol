pragma solidity ^0.4.17;

contract TestToken {
    function balanceOf(address tokenOwner) public view returns (uint256 balance);
}

contract Manager {
    address owner;
    TestToken tokenContractAddress; // token address of received tokens
    uint256 tokenDecimals; // decimals of smart contract
    uint256 totalTokens;
    uint256 pledgedAmount;
    mapping (address => uint256) contributions;

    event Log(uint256 n);

    function Manager() public {
        owner = msg.sender;
    }

    function setContributions(address[] addresses, uint256[] amounts) public {
        assert(msg.sender == owner); // only owner can set contributions
        assert(addresses.length == amounts.length);
        for (uint256 i = 0; i <= addresses.length-1; i++) {
            pledgedAmount += amounts[i] * 1 ether ;
            setContribution(addresses[i], amounts[i] * 1 ether);
        }
        Log(pledgedAmount);
    }

    function setContribution(address _address, uint256 _amount) internal {
        contributions[_address] = _amount;
    }

    function getContribution(address contributor) public view returns (uint256) {
        return contributions[contributor];
    }

    function configureTokens(address _address, uint256 decimals) public {
        tokenContractAddress = TestToken(_address);
        tokenDecimals = decimals;
        totalTokens = tokenContractAddress.balanceOf(address(this));
        Log(totalTokens);
    }
    function getTokensAmount() public view returns (uint256) { return totalTokens; }

    function getPledgedAmount() public view returns (uint256) { return pledgedAmount; }

    function getTokens(address contributor) public view returns (uint256) {
        return ((getContribution(contributor) * totalTokens) / pledgedAmount);
    }
}
