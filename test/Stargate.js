const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("StargatePoolNative: send and sendToken functions", function () {
  let stargatePoolNative, endpointV2, owner, addr1, addr2;
  const eid = 123;

  async function deployTokenFixture() {
    // Deploy the contracts
    [owner, addr1, addr2] = await ethers.getSigners();

    endpointV2 = await ethers.deployContract("EndpointV2", [eid, owner.address]);
    await endpointV2.waitForDeployment();
    console.log("Deployed EndpointV2 contract address:", endpointV2.target);

    stargatePoolNative = await ethers.deployContract("StargatePoolNative", [
      "LPT", // Token name
      "LPT", // Token symbol
      18,     // Decimals
      6,      // Fee decimals
      endpointV2.target, // Endpoint address
      owner.address // Owner address
    ]);
    await stargatePoolNative.waitForDeployment();
    console.log("Deployed StargatePoolNative contract address:", stargatePoolNative.target);

    feeLib = await ethers.deployContract("MockStargateFeeLib");
    await feeLib.waitForDeployment();
    tokenMessaging = await ethers.deployContract("TokenMessaging", [
      endpointV2.target,
      owner.address,
      100
    ]);
    await tokenMessaging.waitForDeployment();
    const assetId = 100;
    console.log("tokenMessaging setAssetId, impl:", owner.address, "assetId:", assetId);
    await tokenMessaging.setAssetId(stargatePoolNative.target, assetId);
    await tokenMessaging.setPlanner(owner.address);
    const _dstEid = 1;
    await tokenMessaging.setFares(_dstEid, 10, 10);

    const config = {
      feeLib: feeLib.target,
      planner: owner.address,
      treasurer: owner.address,
      tokenMessaging: tokenMessaging.target,
      creditMessaging: addr1.address,
      lzToken: addr1.address,
    };
    await stargatePoolNative.setAddressConfig(config)
    await stargatePoolNative.setOFTPath(_dstEid, true);

    return { endpointV2, stargatePoolNative, owner, addr1, addr2 };
  }

  async function deployMessagingFixture() {
    // Deploy the contracts
    [owner, addr1, addr2] = await ethers.getSigners();

    endpointV2 = await ethers.deployContract("EndpointV2", [eid, owner.address]);
    await endpointV2.waitForDeployment();
    console.log("Deployed EndpointV2 contract address:", endpointV2.target);

    tokenMessaging = await ethers.deployContract("TokenMessaging", [
      endpointV2.target,
      owner.address,
      100
    ]);
    await tokenMessaging.waitForDeployment();
    const assetId = 100;
    await tokenMessaging.setAssetId(owner.address, assetId);
    await tokenMessaging.setPlanner(owner.address);
    const _dstEid = 1;
    await tokenMessaging.setFares(_dstEid, 10, 10);

    return { endpointV2, tokenMessaging, owner, addr1, addr2 };
  }

  it("test _isTaxiMode", async function () {
    const { stargatePoolNative, owner, addr1 } = await loadFixture(deployTokenFixture);

    const isTaxi = await stargatePoolNative._isTaxiMode("0x");
    expect(isTaxi).to.be.true;
  });

  it("test _inflow", async function () {
    const { stargatePoolNative, owner, addr1 } = await loadFixture(deployTokenFixture);

    const amountInSD = await stargatePoolNative._inflow(owner.address, ethers.parseEther("10"));
    expect(amountInSD).to.equal(10000000n);
  });

  it("test _buildFeeParams", async function () {
    const { stargatePoolNative, owner, addr1 } = await loadFixture(deployTokenFixture);

    const amountInSD = await stargatePoolNative._inflow(owner.address, ethers.parseEther("10"));
    const feeParams = await stargatePoolNative._buildFeeParams(1, amountInSD, false);
    expect(feeParams[0]).to.equal(owner.address);
    expect(feeParams[1]).to.equal(1n);
    expect(feeParams[2]).to.equal(10000000n);
    expect(feeParams[3]).to.equal(0n);
    expect(feeParams[4]).to.equal(true);
    expect(feeParams[5]).to.equal(false);
  });

  it("test _chargeFee", async function () {
    const { stargatePoolNative, owner, addr1 } = await loadFixture(deployTokenFixture);

    const amountInSD = await stargatePoolNative._inflow(owner.address, ethers.parseEther("10"));
    const feeParams = await stargatePoolNative._buildFeeParams(1, amountInSD, false);

    const feeParams0 = {
      sender: feeParams[0],
      dstEid: feeParams[1],
      amountInSD: feeParams[2],
      deficitSD: feeParams[3],
      toOFT: feeParams[4],
      isTaxi: feeParams[5]
    };
    const sdAmount = await stargatePoolNative._ld2sd(ethers.parseEther("9"));
    const tx = await stargatePoolNative._chargeFee(feeParams0, sdAmount);
    const receipt = await tx.wait();
    const [amountOutSD] = receipt.logs[0].args;
    expect(amountOutSD).to.equal(9900000n);
  });

  it("test _inflowAndCharge", async function () {
    const { stargatePoolNative, owner, addr1 } = await loadFixture(deployTokenFixture);

    const toBytes32 = ethers.zeroPadValue(addr1.address, 32);
    const _sendParam = {
      dstEid: 1, // Example destination endpoint ID
      to: toBytes32, // User's address
      amountLD: ethers.parseEther("10"), // 1000 tokens in LD
      minAmountLD: ethers.parseEther("9"), // Min amount in LD
      extraOptions: "0x", // Empty bytes
      composeMsg: "0x", // Empty bytes
      oftCmd: "0x", // Example OFT command (taxi mode flag or similar)
    };

    const tx = await stargatePoolNative._inflowAndCharge(_sendParam);
    const receipt = await tx.wait();
    const [isTaxi, amountInSD, amountOutSD] = receipt.logs[1].args;
    expect(isTaxi).to.equal(true);
    expect(amountInSD).to.equal(10000000n);
    expect(amountOutSD).to.equal(9900000n);
  });

  it("test _assertMessagingFee", async function () {
    const { stargatePoolNative, owner, addr1 } = await loadFixture(deployTokenFixture);

    const toBytes32 = ethers.zeroPadValue(addr1.address, 32);
    const _sendParam = {
      dstEid: 1, // Example destination endpoint ID
      to: toBytes32, // User's address
      amountLD: ethers.parseEther("10"), // 1000 tokens in LD
      minAmountLD: ethers.parseEther("9"), // Min amount in LD
      extraOptions: "0x", // Empty bytes
      composeMsg: "0x", // Empty bytes
      oftCmd: "0x", // Example OFT command (taxi mode flag or similar)
    };

    const tx1 = await stargatePoolNative._inflowAndCharge(_sendParam);
    const receipt1 = await tx1.wait();
    const [isTaxi, amountInSD, amountOutSD] = receipt1.logs[1].args;

    const _messagingFee = {
      nativeFee: 0,
      lzTokenFee: 0
    }
    // result is a ContractTransactionResponse
    const result = await stargatePoolNative._assertMessagingFee(_messagingFee, 0n);
  });

  it("test ITokenMessaging rideBus", async function () {
    const { tokenMessaging, owner, addr1 } = await loadFixture(deployMessagingFixture);

    const _params = {
      sender: owner.address,
      dstEid: 1,
      receiver: ethers.zeroPadValue(addr1.address, 32),
      amountSD: 9900000n,
      nativeDrop: false
    }
    // result is a ContractTransactionResponse
    const result = await tokenMessaging.rideBus(_params);
  });

  it("test _rideBus", async function () {
    const { stargatePoolNative, owner, addr1 } = await loadFixture(deployTokenFixture);

    const _sendParam = {
      dstEid: 1, // Example destination endpoint ID
      to: ethers.zeroPadValue(addr1.address, 32), // User's address
      amountLD: ethers.parseEther("10"), // 1000 tokens in LD
      minAmountLD: ethers.parseEther("9"), // Min amount in LD
      extraOptions: "0x", // Empty bytes
      composeMsg: "0x", // Empty bytes
      oftCmd: "0x", // Example OFT command (taxi mode flag or similar)
    };
    const _messagingFee = {
      nativeFee: 10,
      lzTokenFee: 0
    }

    // result is a ContractTransactionResponse
    const result = await stargatePoolNative._rideBus(_sendParam, _messagingFee, 9900000n, owner.address);
  });

  it("test send", async function () {
    const { stargatePoolNative, owner, addr1 } = await loadFixture(deployTokenFixture);

    const _sendParam = {
      dstEid: 1, // Example destination endpoint ID
      to: ethers.zeroPadValue(addr1.address, 32), // User's address
      amountLD: ethers.parseEther("10"), // 1000 tokens in LD
      minAmountLD: ethers.parseEther("9"), // Min amount in LD
      extraOptions: "0x", // Empty bytes
      composeMsg: "0x", // Empty bytes
      oftCmd: "0x1a", // Example OFT command (taxi mode flag or similar)
    };
    const _messagingFee = {
      nativeFee: 10000000000000000000n,
      lzTokenFee: 0
    }

    // result is a ContractTransactionResponse
    const result = await stargatePoolNative.send(_sendParam, _messagingFee, owner.address, { value: ethers.parseEther("20") });
    console.log(result);
  });
});
