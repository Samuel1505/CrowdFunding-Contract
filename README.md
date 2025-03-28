# Crowdfunding Smart Contract

## Overview
This project is a decentralized crowdfunding smart contract built on Ethereum using Solidity. It allows users to create fundraising campaigns, contribute funds using ERC-20 tokens, complete successfully funded campaigns, and refund contributors if the funding goal is not met.

## Features
- **Campaign Creation**: Users can create campaigns with a funding goal and description.
- **Contributions**: Users can contribute ERC-20 tokens to active campaigns.
- **Campaign Completion**: Campaign owners can claim the funds if the funding goal is reached.
- **Refunds**: Contributors can get a refund if the goal is not met before completion.
- **Mock ERC-20 Token**: A test ERC-20 token contract is included for testing contributions.

## Smart Contracts

### 1. Crowdfunding.sol
Manages campaign creation, contributions, completion, and refunds.

#### State Variables:
- `platformOwner`: Address of the contract deployer.
- `campaignCounter`: Tracks the number of campaigns.
- `campaigns`: Mapping of campaign ID to `Campaign` struct.
- `contributions`: Tracks contributions per campaign.

#### Events:
- `CampaignCreated` - When a new campaign is created.
- `Funded` - When a user contributes to a campaign.
- `CampaignCompleted` - When a campaign reaches its funding goal.
- `Refunded` - When a contributor gets a refund.

#### Functions:
- `createCampaign()` - Creates a new campaign.
- `contribute()` - Allows users to contribute to a campaign.
- `completeCampaign()` - Allows campaign owners to withdraw funds if the goal is met.
- `refund()` - Allows contributors to get refunds if the goal is not met.

### 2. MockERC20.sol
A simple ERC-20 token for testing purposes.

#### Functions:
- `constructor()` - Mints an initial supply of tokens to the deployer.

## Deployment
1. Deploy the `MockERC20` contract to mint test tokens.
2. Deploy the `Crowdfunding` contract.
3. Use the `createCampaign` function to start a campaign.
4. Contributors can call `contribute` to support a campaign.
5. If the goal is met, the owner calls `completeCampaign` to receive funds.
6. If the goal is not met, contributors can call `refund` to retrieve their tokens.

## Requirements
- Solidity ^0.8.20
- OpenZeppelin ERC-20 library
- Ethereum-compatible wallet (e.g., MetaMask)

