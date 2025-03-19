const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("DVN: assign job functions", function () {
  const vid = 10232;
  const srcEid = 40232;
  const dstEid = 40161;
  const priceFeedDstEid = 10161;

  async function deployDVNFixture() {
    // DVN only can be call by endpoint
    [owner, addr1] = await ethers.getSigners();

    priceFeed = await ethers.deployContract("PriceFeed",);
    await priceFeed.waitForDeployment();
    console.log("Deployed priceFeed contract address:", priceFeed.target);
    await priceFeed.initialize(owner.address);
    await priceFeed.setNativeTokenPriceUSD(3000);
    const priceData = [
      { eid: priceFeedDstEid, price: {priceRatio: 12500000000000000n, gasPriceInUnit: 20000000, gasPerByte: 100}},
    ];
    await priceFeed.setPrice(priceData);

    endpointV2 = await ethers.deployContract("EndpointV2", [dstEid, owner.address]);
    await endpointV2.waitForDeployment();
    console.log("Deployed EndpointV2 contract address:", endpointV2.target);

    sendUln302 = await ethers.deployContract("SendUln302", [endpointV2.target, 1000000, 1000000]);
    await sendUln302.waitForDeployment();
    console.log("Deployed sendUln302 contract address:", sendUln302.target);

    executor = await ethers.deployContract("Executor",);
    await executor.waitForDeployment();
    console.log("Deployed executor contract address:", executor.target);

    receiveUln301 = await ethers.deployContract("ReceiveUln301", [endpointV2.target,srcEid]);
    await receiveUln301.waitForDeployment();
    await executor.initialize(endpointV2.target, receiveUln301.target, [sendUln302.target], priceFeed.target, owner.address, [owner.address]);
    
    executorFeeLib = await ethers.deployContract("ExecutorFeeLib", [srcEid, 18]);
    await executorFeeLib.waitForDeployment();
    console.log("Deployed executorFeeLib contract address:", executorFeeLib.target);

    dvnFeeLib = await ethers.deployContract("contracts/DVNFeeLib.sol:DVNFeeLib", [srcEid, 18]);
    await dvnFeeLib.waitForDeployment();
    console.log("Deployed dvnFeeLib contract address:", dvnFeeLib.target);

    dvn = await ethers.deployContract("contracts/DVN.sol:DVN", [vid, [sendUln302.target], priceFeed.target, [owner.address], 1, [owner.address]]);
    await dvn.waitForDeployment();
    console.log("Deployed DVN contract address:", dvn.target);

    // config
    await executor.setWorkerFeeLib(executorFeeLib.target);
    ExecutorDstConfig = [{
      dstEid: dstEid,
      lzReceiveBaseGas: 1000,
      multiplierBps: 100,
      floorMarginUSD: 100,
      nativeCap: 100,
      lzComposeBaseGas: 1000,
    }];
    await executor.setDstConfig(ExecutorDstConfig);
    UlnDefaultExecutorConfigParam = [{
      eid: dstEid,
      config: {
        executor: executor.target,
        maxMessageSize: 1000,
      }
    }];
    await sendUln302.setDefaultExecutorConfigs(UlnDefaultExecutorConfigParam);
    UlnDefaultUlnConfigParam = [{
      eid: dstEid,
      config: {
        confirmations: 0,
        requiredDVNCount: 1,
        optionalDVNCount: 0,
        optionalDVNThreshold: 0,
        requiredDVNs: [dvn.target],
        optionalDVNs: [],
      }
    }];
    await sendUln302.setDefaultUlnConfigs(UlnDefaultUlnConfigParam);
    await dvn.setWorkerFeeLib(dvnFeeLib.target);
    DVNDstConfig = [{
      dstEid: dstEid,
      multiplierBps: 100,
      floorMarginUSD: 100,
      gas: 1000000,
    }];
    await dvn.setDstConfig(DVNDstConfig);

    return { endpointV2, priceFeed, sendUln302, dvn, owner, addr1 };
  }

  it("test sendUln302 send", async function () {
    const { endpointV2, priceFeed, sendUln302, dvn, owner, addr1 } = await loadFixture(deployDVNFixture);

    const nonce = 1; // A unique nonce for the packet
    const sender = owner.address; // Sender address
    const receiver = ethers.zeroPadValue(addr1.address, 32);
    const guid = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const message = "0x"

    // Prepare the Packet struct data
    const packet = {
      nonce: nonce,
      srcEid: srcEid,
      sender: sender,
      dstEid: dstEid,
      receiver: receiver,
      guid: guid,
      message: message,
    };
    const options = "0x0003010011010000000000000000000000000000ea60";

    executorConfig = {
      executor: addr1.address, // valid address
      maxMessageSize: 1000, // valid size
    };

    console.log("start test send func");
    const result = await sendUln302.send(packet, options, true);
    // to do, try to mock the endpoint address as signer
    // const result = await sendUln302.connect(endpointV2).send(packet, options, true);
    console.log(result);
  });
});