pragma solidity ^0.4.17;

import "./SafeMath.sol";

contract Manager {
    address owner;

    // contributors
    address[] public contributors;
    mapping (address => bool) public isContributor;
    mapping (address => uint256) public contributions;

    // admins
    address[] public admins;
    mapping (address => bool) public isAdmin;

    // generals
    uint256 public poolFeePercentage; // 0.03 * 1000
    uint256 public poolContribution;
    uint256 public poolFees;

    // constants
    uint256 public PERCENTAGE_MULTIPLIER = 1000;

    event Contributed(address _address, uint256 _amount);
    event Withdrawed(address _address, uint256 _amount);
    event PoolContributionSent(address _to, uint256 _amount);

    function Manager(uint256 _poolFeePercentage) public {
        configurePool(_poolFeePercentage); // to be handled on UI, 0.025 = 25 (x 1000)
        owner = msg.sender;
        isAdmin[msg.sender] = true;
        admins.push(msg.sender);
    }

    function configurePool(uint256 _poolFeePercentage) internal {
        require(_poolFeePercentage >= 0 && _poolFeePercentage <= 1000);
        poolFeePercentage = _poolFeePercentage;
    }

    function setAdmins(address[] _admins) public onlyOwner {
        admins = _admins;
        admins.push(owner);
        for (uint i = 0; i < admins.length; i++) {
            isAdmin[admins[i]] = true;
        }
    }

    modifier onlyAdmin { require(isAdmin[msg.sender]); _; }
    modifier onlyOwner { require(msg.sender == owner); _; }

    // contributes
    function () public payable { // default action is contribute
        if (!isContributor[msg.sender]) {
            contributors.push(msg.sender);
        }
        contributions[msg.sender] += msg.value;
        uint256 contrib = contributionWithoutFees(msg.value);
        poolContribution += contrib;
        poolFees += (msg.value - contrib);
        Contributed(msg.sender, msg.value);
    }

    // withdraws contribution
    function withdrawContribution() public {
        uint256 amount = contributions[msg.sender];
        assert(amount > 0 && amount <= this.balance);
        uint256 contrib = contributionWithoutFees(amount);
        poolContribution -= contrib;
        poolFees -= amount - contrib;
        contributions[msg.sender] = 0;
        Withdrawed(msg.sender, amount);
        msg.sender.transfer(amount);
    }

    // sends contribution to ICO/presale address
    function sendContribution(address _to) public onlyAdmin {
        assert(this.balance >= poolContribution);
        _to.transfer(poolContribution);
        PoolContributionSent(_to, poolContribution);
    }

    // calculations
    function contributionWithoutFees(uint256 amount) internal view returns (uint256) {
        return (PERCENTAGE_MULTIPLIER - poolFeePercentage) * amount / PERCENTAGE_MULTIPLIER;
    }
}
