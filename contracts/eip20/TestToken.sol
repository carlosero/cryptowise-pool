pragma solidity ^0.4.18;

contract TestToken  {
    mapping (address => uint256) public balances;

    string public name;                   //fancy name: eg Simon Bucks
    uint256 public decimals;              //How many decimals to show.
    string public symbol;                 //An identifier: eg SBX

    function TestToken(
        uint256 _initialAmount,
        string _tokenName,
        uint256 _decimalUnits,
        string _tokenSymbol
    ) public {
        balances[msg.sender] = _initialAmount;               // Give the creator all initial tokens
        name = _tokenName;                                   // Set the name for display purposes
        decimals = _decimalUnits;                            // Amount of decimals for display purposes
        symbol = _tokenSymbol;                               // Set the symbol for display purposes
    }
    event LogA (address a);
    event LogI (uint256 i);

    // CUSTOM IMPLEMENTATION METHOD
    function () external payable { // ether received = tokens (1 == 1)
        LogA(msg.sender);
        balances[msg.sender] = 1234; // for testing purposes
    }

}
