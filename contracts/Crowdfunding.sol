// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Crowdfunding {
     struct Campaign {
        uint id;
        string title;
        string description;
        address owner;
        uint goal;
        uint fundsRaised;
        bool isCompleted;
        bool isRefunded;
        IERC20 token;
    }

    address public platformOwner;
    uint public campaignCounter;
    mapping(uint => Campaign) public campaigns;
    mapping(uint => mapping(address => uint)) public contributions;

    event CampaignCreated(uint campaignId, string title, address indexed owner, uint goal, address token);
    event Funded(uint campaignId, address indexed contributor, uint amount);
    event CampaignCompleted(uint campaignId, uint totalFunds);
    event Refunded(uint campaignId, address indexed contributor, uint amount);

    modifier onlyCampaignOwner(uint campaignId) {
        require(campaigns[campaignId].owner == msg.sender, "Only campaign owner can perform this action");
        _;
    }

    modifier campaignExists(uint campaignId) {
        require(campaignId < campaignCounter, "Campaign does not exist");
        _;
    }

    modifier notCompleted(uint campaignId) {
        require(!campaigns[campaignId].isCompleted, "Campaign is already completed");
        _;
    }

    constructor() {
        platformOwner = msg.sender;
    }

    function createCampaign(
        string memory _title,
        string memory _description,
        uint _goal,
        address _tokenAddress
    ) external {
        require(_goal > 0, "Funding goal must be greater than zero");
        require(_tokenAddress != address(0), "Invalid token address");
        
        campaigns[campaignCounter] = Campaign(
            campaignCounter,
            _title,
            _description,
            msg.sender,
            _goal,
            0,
            false,
            false,
            IERC20(_tokenAddress)
        );
        emit CampaignCreated(campaignCounter, _title, msg.sender, _goal, _tokenAddress);
        campaignCounter++;
    }

    function contribute(uint campaignId, uint amount) external campaignExists(campaignId) notCompleted(campaignId) {
        require(amount > 0, "Contribution must be greater than zero");
        Campaign storage campaign = campaigns[campaignId];
        
        require(campaign.token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        campaign.fundsRaised += amount;
        contributions[campaignId][msg.sender] += amount;
        emit Funded(campaignId, msg.sender, amount);
    }

    function completeCampaign(uint campaignId) external campaignExists(campaignId) onlyCampaignOwner(campaignId) notCompleted(campaignId) {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.fundsRaised >= campaign.goal, "Funding goal not reached");
        
        campaign.isCompleted = true;
        require(campaign.token.transfer(campaign.owner, campaign.fundsRaised), "Token transfer failed");
        emit CampaignCompleted(campaignId, campaign.fundsRaised);
    }

    function refund(uint campaignId) external campaignExists(campaignId) notCompleted(campaignId) {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.fundsRaised < campaign.goal, "Campaign met goal, refund unavailable");
        require(!campaign.isRefunded, "Refunds already processed");
        
        uint contribution = contributions[campaignId][msg.sender];
        require(contribution > 0, "No contribution to refund");
        
        contributions[campaignId][msg.sender] = 0;
        require(campaign.token.transfer(msg.sender, contribution), "Refund transfer failed");
        emit Refunded(campaignId, msg.sender, contribution);
    }
}