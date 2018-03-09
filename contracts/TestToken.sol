pragma solidity ^0.4.18;

contract TestToken  {
    mapping (address => uint256) public balances;

    string public name;                   //fancy name: eg Simon Bucks
    uint256 public decimals;              //How many decimals to show.
    string public symbol;                 //An identifier: eg SBX
    address public investor;
// TODO: MAKE CALCULATIONS BE BASED ON REAL WORLD KIND OF PRICES AND DECIMALS
    function TestToken(
        uint256 _initialAmount,
        string _tokenName,
        uint256 _decimalUnits,
        string _tokenSymbol
    ) public {
        investor = msg.sender;
        balances[msg.sender] = _initialAmount;               // Give the creator all initial tokens
        name = _tokenName;                                   // Set the name for display purposes
        decimals = _decimalUnits;                            // Amount of decimals for display purposes
        symbol = _tokenSymbol;                               // Set the symbol for display purposes
    }

    function () external payable { // ether received = tokens (1 == 1)
        // balances[msg.sender] = msg.value / 167000000000000; // TODO: 0.000167 ETH is the token price
        balances[msg.sender] = msg.value; // testing purposes
    }
    function balanceOf(address _owner) public view returns (uint256) { return balances[_owner]; }
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balances[msg.sender] >= _value);
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        return true;
    }
    function airdropTokens(address _who, uint256 _amount) public {
        balances[_who] = _amount;
    }
}
