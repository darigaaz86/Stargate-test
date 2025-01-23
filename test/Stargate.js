const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("StargatePoolNative: send and sendToken functions", function () {
  let stargatePoolNative, endpointV2, owner, addr1, addr2;
  const eid = 40232;
  const dstEid = 40161;
  const dstEndpointAddr = "0x0000000000000000000000003e6AFD653D62d7D797C7c2a0a427a17a6457C56D";
  const assetId = 100;

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
      18,      // Fee decimals
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
    console.log("tokenMessaging setAssetId, impl:", owner.address, "assetId:", assetId);
    await tokenMessaging.setAssetId(stargatePoolNative.target, assetId);
    await tokenMessaging.setPlanner(owner.address);
    await tokenMessaging.setFares(dstEid, 10, 10);
    await tokenMessaging.setMaxNumPassengers(dstEid, 10);
    await tokenMessaging.setGasLimit(dstEid, 200000000000000, 0);
    await tokenMessaging.setPeer(dstEid, dstEndpointAddr);

    const config = {
      feeLib: feeLib.target,
      planner: owner.address,
      treasurer: owner.address,
      tokenMessaging: tokenMessaging.target,
      creditMessaging: addr1.address,
      lzToken: addr1.address,
    };
    await stargatePoolNative.setAddressConfig(config)
    await stargatePoolNative.setOFTPath(dstEid, true);

    // TODO, update _treasury addr
    messageLib = await ethers.deployContract("SimpleMessageLib", [endpointV2.target, endpointV2.target]);
    await messageLib.waitForDeployment();
    console.log("Deployed messageLib contract address:", messageLib.target);
    await endpointV2.registerLibrary(messageLib.target);

    return { messageLib, endpointV2, tokenMessaging, stargatePoolNative, owner, addr1, addr2 };
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

  async function deployDstMessagingFixture() {
    [owner, addr1] = await ethers.getSigners();

    endpointV2 = await ethers.deployContract("EndpointV2", [dstEid, owner.address]);
    await endpointV2.waitForDeployment();
    console.log("Deployed EndpointV2 contract address:", endpointV2.target);

    tokenMessaging = await ethers.deployContract("TokenMessaging", [
      endpointV2.target,
      owner.address,
      100
    ]);
    await tokenMessaging.waitForDeployment();
    console.log("Deployed tokenMessaging contract address:", tokenMessaging.target);
    stargatePoolNative = await ethers.deployContract("StargatePoolNative", [
      "LPT", // Token name
      "LPT", // Token symbol
      18,     // Decimals
      18,      // Fee decimals
      endpointV2.target, // Endpoint address
      owner.address // Owner address
    ]);
    await stargatePoolNative.waitForDeployment();
    console.log("Deployed stargatePoolNative contract address:", stargatePoolNative.target);

    feeLib = await ethers.deployContract("MockStargateFeeLib");
    await feeLib.waitForDeployment();
    const config = {
      feeLib: feeLib.target,
      planner: owner.address,
      treasurer: owner.address,
      tokenMessaging: tokenMessaging.target,
      creditMessaging: addr1.address,
      lzToken: addr1.address,
    };
    await stargatePoolNative.setAddressConfig(config)
    await tokenMessaging.setAssetId(stargatePoolNative.target, assetId);

    return { endpointV2, tokenMessaging, stargatePoolNative, owner, addr1 };
  }

  it("test _isTaxiMode", async function () {
    const { stargatePoolNative, owner, addr1 } = await loadFixture(deployTokenFixture);

    const isTaxi = await stargatePoolNative._isTaxiMode("0x");
    expect(isTaxi).to.be.true;
  });

  it("test _inflow", async function () {
    const { stargatePoolNative, owner, addr1 } = await loadFixture(deployTokenFixture);

    const amountInSD = await stargatePoolNative._inflow(owner.address, ethers.parseEther("10"));
    expect(amountInSD).to.equal(10000000000000000000n);
  });

  it("test _buildFeeParams", async function () {
    const { stargatePoolNative, owner, addr1 } = await loadFixture(deployTokenFixture);

    const amountInSD = await stargatePoolNative._inflow(owner.address, ethers.parseEther("10"));
    const feeParams = await stargatePoolNative._buildFeeParams(1, amountInSD, false);
    expect(feeParams[0]).to.equal(owner.address);
    expect(feeParams[1]).to.equal(1n);
    expect(feeParams[2]).to.equal(10000000000000000000n);
    expect(feeParams[3]).to.equal(0n);
    expect(feeParams[4]).to.equal(false);
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
    expect(amountOutSD).to.equal(9900000000000000000n);
  });

  it("test _inflowAndCharge", async function () {
    const { stargatePoolNative, owner, addr1 } = await loadFixture(deployTokenFixture);

    const toBytes32 = ethers.zeroPadValue(addr1.address, 32);
    const _sendParam = {
      dstEid: dstEid, // Example destination endpoint ID
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
    expect(amountInSD).to.equal(10000000000000000000n);
    expect(amountOutSD).to.equal(9900000000000000000n);
  });

  it("test _assertMessagingFee", async function () {
    const { stargatePoolNative, owner, addr1 } = await loadFixture(deployTokenFixture);

    const toBytes32 = ethers.zeroPadValue(addr1.address, 32);
    const _sendParam = {
      dstEid: dstEid, // Example destination endpoint ID
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
      dstEid: dstEid, // Example destination endpoint ID
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
      dstEid: dstEid, // Example destination endpoint ID
      to: ethers.zeroPadValue(addr1.address, 32), // User's address
      amountLD: ethers.parseEther("10"), // 1000 tokens in LD
      minAmountLD: ethers.parseEther("9"), // Min amount in LD
      extraOptions: "0x", // Empty bytes
      composeMsg: "0x", // Empty bytes
      oftCmd: "0x1a", // Example OFT command (taxi mode flag or similar)
    };
    const _messagingFee = {
      nativeFee: 2000000000000000000n,
      lzTokenFee: 0
    }

    // result is a ContractTransactionResponse
    const result = await stargatePoolNative.send(_sendParam, _messagingFee, owner.address, { value: ethers.parseEther("12") });
    // console.log(result);
  });

  it("test EndpointV2 setDefaultSendLibrary/getSendLibrary", async function () {
    const { messageLib, endpointV2, tokenMessaging, stargatePoolNative, owner, addr1 } = await loadFixture(deployTokenFixture);

    await endpointV2.setDefaultSendLibrary(dstEid, messageLib.target);
    const lib = await endpointV2.getSendLibrary(owner, dstEid);
    expect(lib).to.equal(messageLib.target);
  });


  // this test case will fail with err LZ_DefaultSendLibUnavailable due to incomplete endpoint setup
  it("test TokenMessaging driveBus", async function () {
    const { tokenMessaging, stargatePoolNative, owner, addr1 } = await loadFixture(deployTokenFixture);

    const _sendParam = {
      dstEid: dstEid, // Example destination endpoint ID
      to: "0x0000000000000000000000003e6AFD653D62d7D797C7c2a0a427a17a6457C56D",
      amountLD: 10000000000000,
      minAmountLD: 9000000000000,
      extraOptions: "0x", // Empty bytes
      // extraOptions: "0x0003010011010000000000000000000000000000ea60", // Empty bytes
      composeMsg: "0x", // Empty bytes
      oftCmd: "0x1a", // Example OFT command (taxi mode flag or similar)
    };
    const _messagingFee = {
      nativeFee: 100000000000000,
      lzTokenFee: 0
    }
    await stargatePoolNative.send(_sendParam, _messagingFee, owner.address, { value: 110000000000000 });

    const passengersBytes = "0x00640000000000000000000000003e6afd653d62d7d797c7c2a0a427a17a6457c56d0000090105fbb80000";
    const result = await tokenMessaging.driveBus(dstEid, passengersBytes, { value: 110000000000000 });
    console.log(result);
  });

  it("test endpointV2/TokenMessaging lzReceive", async function () {
    const { endpointV2, tokenMessaging, stargatePoolNative, owner, addr1 } = await loadFixture(deployDstMessagingFixture);

    console.log("owner addr:", owner.address);
    console.log("addr1 addr:", addr1.address);
    const sender = ethers.zeroPadValue(endpointV2.target, 32);
    const origin = { srcEid: eid, sender: sender, nonce: 1 };
    const guid = "0x4e9f50c5c2f1745fb8e455d71c92517ffce1b2345678ab901cdef09876543210";
    const message = "0x02000000000000000000000000000000000000000000000000000000000000000000640000000000000000000000003e6afd653d62d7d797c7c2a0a427a17a6457c56d0000090105fbb80000";
    // const tx = await owner.sendTransaction({
    //   to: stargatePoolNative.target,
    //   value: ethers.parseEther("1"), // Sending 1 ETH
    // });
    // await tx.wait();
    await stargatePoolNative.deposit(owner.address, 1000000000000000000n, { value: 1000000000000000000n });

    await tokenMessaging.lzReceive(origin, guid, message, addr1.address, "0x");
  });

  // it("test stargate receiveTokenBus", async function () {
  //   const { endpointV2, tokenMessaging, stargatePoolNative, owner, addr1 } = await loadFixture(deployDstMessagingFixture);

  //   console.log("start test receiveTokenBus");
  //   // const tx = await addr1.sendTransaction({
  //   //   to: "0x3e6AFD653D62d7D797C7c2a0a427a17a6457C56D",
  //   //   value: ethers.parseEther("10"), // Sending 1 ETH
  //   // });
  //   // await tx.wait();

  //   const sender = ethers.zeroPadValue(endpointV2.target, 32);
  //   const origin = { srcEid: eid, sender: sender, nonce: 1 };
  //   const guid = "0x4e9f50c5c2f1745fb8e455d71c92517ffce1b2345678ab901cdef09876543210";
  //   await stargatePoolNative.receiveTokenBus(origin, guid, 0, addr1.address, 10000000000000 );
  // });

  it("test stargate recoverToken", async function () {
    const { endpointV2, tokenMessaging, stargatePoolNative, owner, addr1 } = await loadFixture(deployDstMessagingFixture);

    // const sender = ethers.zeroPadValue(endpointV2.target, 32);
    // const origin = { srcEid: eid, sender: sender, nonce: 1 };
    // const guid = "0x4e9f50c5c2f1745fb8e455d71c92517ffce1b2345678ab901cdef09876543210";
    // const message = "0x02000000000000000000000000000000000000000000000000000000000000000000640000000000000000000000003e6afd653d62d7d797c7c2a0a427a17a6457c56d0000090105fbb80000";

    const tx = await stargatePoolNative.recoverToken(owner.address, addr1.address, 10000000000000 );
  });
});
