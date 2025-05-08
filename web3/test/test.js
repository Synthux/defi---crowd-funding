const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFunding Contract", function () {
    let CrowdFunding, crowdFunding, owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        CrowdFunding = await ethers.getContractFactory("CrowdFunding");
        crowdFunding = await CrowdFunding.deploy();
        await crowdFunding.waitForDeployment(); // Ожидание развертывания
    });

    it("Should create a campaign", async function () {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const deadline = currentTimestamp + 3600; // 1 час от текущего времени

        const tx = await crowdFunding.createCampaign(
            owner.address,
            "Test Campaign",
            "This is a test campaign",
            ethers.parseEther("10"),
            deadline,
            "https://test-image-url.com"
        );

        const campaign = await crowdFunding.campaigns(0);
        expect(campaign.owner).to.equal(owner.address);
        expect(campaign.title).to.equal("Test Campaign");
        expect(campaign.target.toString()).to.equal(ethers.parseEther("10").toString());
    });

    it("Should donate to a campaign", async function () {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const deadline = currentTimestamp + 3600;

        await crowdFunding.createCampaign(
            owner.address,
            "Test Campaign",
            "This is a test campaign",
            ethers.parseEther("10"),
            deadline,
            "https://test-image-url.com"
        );

        await crowdFunding.connect(addr1).donateToCampaign(0, { value: ethers.parseEther("1") });

        const campaign = await crowdFunding.campaigns(0);
        expect(campaign.amountCollected.toString()).to.equal(ethers.parseEther("1").toString());
    });

    it("Should return the correct donators and donations", async function () {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const deadline = currentTimestamp + 3600;

        await crowdFunding.createCampaign(
            owner.address,
            "Test Campaign",
            "This is a test campaign",
            ethers.parseEther("10"),
            deadline,
            "https://test-image-url.com"
        );

        await crowdFunding.connect(addr1).donateToCampaign(0, { value: ethers.parseEther("1") });
        await crowdFunding.connect(addr2).donateToCampaign(0, { value: ethers.parseEther("2") });

        const [donators, donations] = await crowdFunding.getDonators(0);

        expect(donators.length).to.equal(2);
        expect(donators[0]).to.equal(addr1.address);
        expect(donators[1]).to.equal(addr2.address);
        expect(donations[0].toString()).to.equal(ethers.parseEther("1").toString());
        expect(donations[1].toString()).to.equal(ethers.parseEther("2").toString());
    });

    it("Should return all campaigns", async function () {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const deadline1 = currentTimestamp + 3600;
        const deadline2 = currentTimestamp + 7200;

        await crowdFunding.createCampaign(
            owner.address,
            "Campaign 1",
            "First campaign",
            ethers.parseEther("5"),
            deadline1,
            "https://image1.com"
        );

        await crowdFunding.createCampaign(
            owner.address,
            "Campaign 2",
            "Second campaign",
            ethers.parseEther("10"),
            deadline2,
            "https://image2.com"
        );

        const campaigns = await crowdFunding.getCampaigns();

        expect(campaigns.length).to.equal(2);
        expect(campaigns[0].title).to.equal("Campaign 1");
        expect(campaigns[1].title).to.equal("Campaign 2");
    });

    it("Should fail to create a campaign with a past deadline", async function () {
        const pastDeadline = Math.floor(Date.now() / 1000) - 3600;

        await expect(
            crowdFunding.createCampaign(
                owner.address,
                "Invalid Campaign",
                "This campaign has a past deadline",
                ethers.parseEther("5"),
                pastDeadline,
                "https://image.com"
            )
        ).to.be.revertedWith("The deadline should be a date in the future.");
    });
});
