const { ethers } = require("hardhat");

async function main() {
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    const crowdFunding = await CrowdFunding.deploy();

    console.log("CrowdFunding deployed to:", crowdFunding.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
