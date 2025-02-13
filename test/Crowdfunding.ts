import { expect } from "chai";
import { ContractRunner, ContractTransactionResponse } from "ethers";
import { ethers } from "hardhat";
import { Crowdfunding, MockERC20 } from "../typechain-types";

describe("Crowdfunding", function () {
    let Crowdfunding, crowdfunding: Crowdfunding & { deploymentTransaction(): ContractTransactionResponse; }, owner, addr1: ContractRunner | null | undefined, addr2, token: MockERC20 & { deploymentTransaction(): ContractTransactionResponse; };

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy ERC20 Token
        const Token = await ethers.getContractFactory("MockERC20");
        token = await Token.deploy("TestToken", "TTK", ethers.parseUnits("1000000", 18)); // Ensure proper decimals
        await token.waitForDeployment();

        // Deploy Crowdfunding Contract
        Crowdfunding = await ethers.getContractFactory("Crowdfunding");
        crowdfunding = await Crowdfunding.deploy();
        await crowdfunding.waitForDeployment();

        // Distribute tokens to addr1 & addr2 for testing
        await token.transfer(addr1.address, ethers.parseUnits("1000", 18)); 
        await token.transfer(addr2.address, ethers.parseUnits("1000", 18));
    });

    it("Should create a campaign", async function () {
        await expect(crowdfunding.createCampaign("Test Campaign", "A sample", 100, token.target)) // ✅ Use token.target
        .to.emit(crowdfunding, "CampaignCreated");
  })

    it("Should allow contributions", async function () {
        await crowdfunding.createCampaign("Test Campaign", "A sample", ethers.parseUnits("100", 18), token.target);

        // addr1 must approve the contract to spend tokens on their behalf
        await token.connect(addr1).approve(crowdfunding.target, ethers.parseUnits("50", 18));

        // addr1 contributes to the campaign
        await expect(crowdfunding.connect(addr1).contribute(0, ethers.parseUnits("50", 18)))
            .to.emit(crowdfunding, "Funded")
            .withArgs(0, addr1.address, ethers.parseUnits("50", 18));
    });

    it("Should complete a campaign when the goal is met", async function () {
        await crowdfunding.createCampaign("Test Campaign", "A sample", ethers.parseUnits("100", 18), token.target);

        // addr1 approves and contributes the full amount needed
        await token.connect(addr1).approve(crowdfunding.target, ethers.parseUnits("100", 18));
        await crowdfunding.connect(addr1).contribute(0, ethers.parseUnits("100", 18));

        // Campaign owner (msg.sender) completes the campaign
        await expect(crowdfunding.completeCampaign(0))
            .to.emit(crowdfunding, "CampaignCompleted")
            .withArgs(0, ethers.parseUnits("100", 18));
    });

    it("Should refund contributors if the goal is not met", async function () {
        await crowdfunding.createCampaign("Test Campaign", "A sample", ethers.parseUnits("100", 18), token.target);

        // addr1 contributes only 50 (less than goal)
        await token.connect(addr1).approve(crowdfunding.target, ethers.parseUnits("50", 18));
        await crowdfunding.connect(addr1).contribute(0, ethers.parseUnits("50", 18));

        // addr1 requests a refund
        await expect(crowdfunding.connect(addr1).refund(0))
            .to.emit(crowdfunding, "Refunded")
            .withArgs(0, addr1.address, ethers.parseUnits("50", 18));
    });
});
