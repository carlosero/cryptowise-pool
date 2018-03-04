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
    address[] addresses;
    mapping (address => uint256) contributions;
    mapping (address => uint256) tokenBalances;

    event Log(uint256 n);

    function Manager() public {
        owner = msg.sender;
    }

    function setContributions(address[] _addresses, uint256[] amounts) public {
        assert(msg.sender == owner); // only owner can set contributions
        assert(_addresses.length == amounts.length);
        addresses = _addresses
        for (uint256 i = 0; i <= _addresses.length-1; i++) {
            pledgedAmount += amounts[i] * 1 ether ;
            setContribution(_addresses[i], amounts[i] * 1 ether);
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

    // divides tokens between all holders by contribution amount
    function setDistribution() public {
        for (uint256 i = 0; i <= addresses.length-1; i++) {
            tokenBalances[addresses[i]] = getTokens(addresses[i])
        }
    }

    function getTokensAmount() public view returns (uint256) { return totalTokens; }

    function getPledgedAmount() public view returns (uint256) { return pledgedAmount; }

    function getTokens(address contributor) public view returns (uint256) {
        return ((getContribution(contributor) * totalTokens) / pledgedAmount);
    }
}
