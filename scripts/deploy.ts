const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Deploying contracts with the account: ${deployer.address}`);

    // Deploy Mock ERC-20 Token
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const token = await MockERC20.deploy("TestToken", "TTK", 1000000);
    await token.waitForDeployment(); // Fix: Use waitForDeployment() instead of .deployed()
    console.log(`MockERC20 deployed at: ${await token.getAddress()}`);

    // Deploy Crowdfunding Contract
    const Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding");
    const crowdfunding = await Crowdfunding.deploy();
    await crowdfunding.waitForDeployment();
    console.log(`Crowdfunding contract deployed at: ${await crowdfunding.getAddress()}`);

    // Automated Test Contribution on Sepolia
    console.log("Creating a test campaign...");
    const tx = await crowdfunding.createCampaign("Test Campaign", "A sample project", 100, await token.getAddress());
    await tx.wait();
    console.log("Test campaign created!");

    console.log("Funding the campaign...");
    await token.approve(await crowdfunding.getAddress(), 100);
    await crowdfunding.contribute(0, 100);
    console.log("Campaign funded successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
