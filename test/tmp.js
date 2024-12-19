const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token contract", function () {
    let Token, token, owner, addr1;

    it("should emit Transfer event on successful transfer", async function () {
        [owner, addr1] = await ethers.getSigners();
        const token = await ethers.deployContract("Token");
        await token.waitForDeployment();

        const transferAmount = 50;
        const tx = await token.transfer(addr1.address, transferAmount);
        const receipt = await tx.wait();
        const [from, to, amount] = receipt.logs[0].args;
        console.log(from, to, amount)
    });
});