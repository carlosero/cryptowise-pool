pragma solidity ^0.4.17;

import "./SafeMath.sol";
import "./ERC20.sol";

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
    uint256 public state = 0; // initialized on "open"
        // 0 = open = contribution stage, people can send and withdraw
        // 1 = closed = waiting stage, we send to ico and wait for tokens; cant withdraw/contribute
        // 2 = distribution = we got tokens, we are distributing and we can collect fees
    uint256 public poolFeePercentage; // 0.03 * 10000
    uint256 public poolContribution;
    uint256 public poolFees;
    uint256 public individualMinContribution;
    uint256 public individualMaxContribution;
    uint256 public poolMaxContribution;
    bool public poolContributionSent = false;
    bool public poolFeesSent = false;
    mapping (address => bool) public tokensCollected;
    ERC20Interface public tokenContract;
    uint256 public tokenBalance;

    // constants
    uint256 public PERCENTAGE_MULTIPLIER = 10000;

    event Contributed(address _address, uint256 _amount);
    event Withdrawed(address _address, uint256 _amount);
    event PoolContributionSent(address _to, uint256 _amount);
    event PoolFeesSent(address _to, uint256 _amount);
    event StateChanged(uint256 _to);
    event TokensCollected(address _who, uint256 _amount);

    function Manager(uint256 _poolFeePercentage, uint256 _individualMinContribution, uint256 _individualMaxContribution, uint256 _poolMaxContribution) public {
        configurePool(_poolFeePercentage, _individualMinContribution, _individualMaxContribution, _poolMaxContribution); // to be handled on UI, 0.025 = 25 (x 1000)
        owner = msg.sender;
        isAdmin[msg.sender] = true;
        admins.push(msg.sender);
    }

    function configurePool(uint256 _poolFeePercentage, uint256 _individualMinContribution, uint256 _individualMaxContribution, uint256 _poolMaxContribution) internal {
        require(_poolFeePercentage >= 0 && _poolFeePercentage <= PERCENTAGE_MULTIPLIER);
        require(_individualMinContribution >= 0);
        require(_poolMaxContribution == 0 || _individualMinContribution <= _poolMaxContribution);
        require(_individualMaxContribution >= 0);
        require(_poolMaxContribution == 0 || _individualMaxContribution <= _poolMaxContribution);
        poolFeePercentage = _poolFeePercentage;
        individualMinContribution = _individualMinContribution;
        individualMaxContribution = _individualMaxContribution;
        poolMaxContribution = _poolMaxContribution;
    }

    function setAdmins(address[] _admins) public whileOpened onlyOwner {
        admins = _admins;
        admins.push(owner);
        for (uint i = 0; i < admins.length; i++) {
            isAdmin[admins[i]] = true;
        }
    }

    // role modifiers
    modifier onlyAdmin { require(isAdmin[msg.sender]); _; }
    modifier onlyOwner { require(msg.sender == owner); _; }

    // state modifiers
    modifier whileOpened { require(state == 0); _; }
    modifier whileClosed { require(state == 1); _; }
    modifier whileDistribution { require(state == 2); _; }

    // contributes
    function () public payable whileOpened { // default action is contribute
        require(individualMinContribution == 0 || msg.value >= individualMinContribution);
        require(individualMaxContribution == 0 || msg.value <= individualMaxContribution);
        uint256 contrib = contributionWithoutFees(msg.value);
        require(poolMaxContribution == 0 || (poolContribution + contrib) <= poolMaxContribution);
        if (!isContributor[msg.sender]) {
            contributors.push(msg.sender);
        }
        contributions[msg.sender] += msg.value;
        poolContribution += contrib;
        poolFees += (msg.value - contrib);
        Contributed(msg.sender, msg.value);
    }

    // withdraws contribution
    function withdrawContribution() public whileOpened {
        uint256 amount = contributions[msg.sender];
        assert(amount > 0 && amount <= this.balance && this.balance - amount >= 0);
        uint256 contrib = contributionWithoutFees(amount);
        poolContribution -= contrib;
        poolFees -= amount - contrib;
        contributions[msg.sender] = 0;
        Withdrawed(msg.sender, amount);
        msg.sender.transfer(amount);
    }

    // sends contribution to ICO/presale address
    function sendContribution(address _to) public whileClosed onlyAdmin {
        assert(poolContributionSent == false);
        assert(this.balance >= poolContribution);
        _to.transfer(poolContribution);
        PoolContributionSent(_to, poolContribution);
        poolContributionSent = true;
    }

    // sets token address
    // instantiates token contract address
    // enables withdrawal of tokens
    function tokensReceived(address _tokenAddress) public whileClosed onlyAdmin {
        tokenContract = ERC20Interface(_tokenAddress);
        tokenBalance = tokenContract.balanceOf(this);
        setState(2);
    }

    // each contributor can call this for receiving their tokens
    function collectTokens() public whileDistribution {
        assert(tokensCollected[msg.sender] == false);
        assert(contributions[msg.sender] > 0);
        uint256 amount = shareOf(msg.sender);
        tokensCollected[msg.sender] = true;
        tokenContract.transferFrom(this, msg.sender, amount);
        TokensCollected(msg.sender, amount);
    }

    // for admins to collect fees; version 1: one admin gets all fees and shares it manually
    function collectFees() public whileDistribution onlyAdmin {
        assert(poolFeesSent == false);
        assert(poolFees > 0 && this.balance >= poolFees);
        msg.sender.transfer(poolFees);
        PoolFeesSent(msg.sender, poolFees);
        poolFeesSent = true;
    }

    function setState(uint256 _to) public onlyAdmin {
        require(_to != state);
        require(_to == 0 || _to == 1 || _to == 2); // only supported states by now
        state = _to;
        StateChanged(_to);
    }

    // moves balance to _to address (as contributor)
    function transferTo(address _from, address _to, uint256 _amount) public onlyAdmin {
        require(contributions[_from] > _amount); // we don't need to change any kind of calculation
        contributions[_from] -= _amount;
        contributions[_to] += _amount;
    }

    // calculations
    function contributionWithoutFees(uint256 amount) internal view returns (uint256) {
        return (PERCENTAGE_MULTIPLIER - poolFeePercentage) * amount / PERCENTAGE_MULTIPLIER;
    }

    function shareOf(address _contributor) internal view returns (uint256) {
        contributionWithoutFees(contributions[_contributor]) * tokenBalance / poolContribution;
    }
}
