const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

function addressToBytes32(address) {
    // Remove the '0x' prefix and pad the address to 32 bytes
    const addressWithoutPrefix = address.toLowerCase().replace(/^0x/, '');
    const paddedAddress = '0x' + addressWithoutPrefix.padStart(64, '0');

    return paddedAddress;
}

describe("OFT: send and sendToken functions", function () {
  let stargatePoolNative, endpointV2, owner, addr1, addr2;
  const eid = 40161;
  const name = "OFT";
  const symbol = "OFT";
  const dstEid = 40232;
  const dstEndpointAddr = "0x0000000000000000000000003e6AFD653D62d7D797C7c2a0a427a17a6457C56D";

  async function deployOFTFixture() {
    // Deploy the contracts
    [owner, addr1, addr2] = await ethers.getSigners();

    endpointV2 = await ethers.deployContract("EndpointV2", [eid, owner.address]);
    await endpointV2.waitForDeployment();
    console.log("Deployed EndpointV2 contract address:", endpointV2.target);

    oft = await ethers.deployContract("MyOFT", [name, symbol, endpointV2.target, owner.address]);
    await oft.waitForDeployment();
    console.log("Deployed oft contract address:", oft.target);

    dstEndpointV2 = await ethers.deployContract("EndpointV2", [dstEid, owner.address]);
    await dstEndpointV2.waitForDeployment();
    console.log("Deployed dstEndpointV2 contract address:", dstEndpointV2.target);

    oft.setPeer(dstEid, addressToBytes32(dstEndpointV2.target));

    return { endpointV2, oft, owner, addr1, addr2 };
  };

  it("test quoteSend", async function () {
    const { oft, owner, addr1 } = await loadFixture(deployOFTFixture);

    const _sendParam = {
        dstEid: dstEid, // Example destination endpoint ID
        to: "0x0000000000000000000000003e6AFD653D62d7D797C7c2a0a427a17a6457C56D",
        amountLD: 1000000000000,
        minAmountLD: 900000000000,
        extraOptions: "0x", // Empty bytes
        composeMsg: "0x", // Empty bytes
        oftCmd: "0x1a", // Example OFT command (taxi mode flag or similar)
    };

    const result = await oft.quoteSend(_sendParam, false);
    console.log(result);
  });

  it("test send", async function () {
    const { oft, owner, addr1 } = await loadFixture(deployOFTFixture);

    const _sendParam = {
        dstEid: dstEid, // Example destination endpoint ID
        to: "0x0000000000000000000000003e6AFD653D62d7D797C7c2a0a427a17a6457C56D",
        amountLD: 1000000000000,
        minAmountLD: 900000000000,
        extraOptions: "0x", // Empty bytes
        composeMsg: "0x", // Empty bytes
        oftCmd: "0x1a", // Example OFT command (taxi mode flag or similar)
    };

    const _messagingFee = {
        nativeFee: 2000000,
        lzTokenFee: 0
    }

    await oft.mint(owner.address, 1000000000000);
    const result = await oft.send(_sendParam, _messagingFee, owner.address);
    console.log(result);
  });
});