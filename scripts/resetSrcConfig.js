const { ethers } = require("hardhat");

// Replace with actual values
const oappAddress = "0x27E685fD1B57aC4795eEAB72d6569f27317E8543";
const DEST_CHAIN_ENDPOINT_ID = 40161; // Replace with the target chain's endpoint ID
const sendLibAddress = '0xcc1ae8Cf5D3904Cef3360A9532B477529b177cCE'; // Replace with actual send library address

// ULN Configuration Reset Params
const confirmations = 0;
const optionalDVNCount = 0;
const requiredDVNCount = 0;
const optionalDVNThreshold = 0;
const requiredDVNs = [];
const optionalDVNs = [];

const ulnConfigData = {
  confirmations,
  requiredDVNCount,
  optionalDVNCount,
  optionalDVNThreshold,
  requiredDVNs,
  optionalDVNs,
};

// ULN config struct type for encoding
const configTypeUlnStruct = "tuple(uint64 confirmations, uint8 requiredDVNCount, uint8 optionalDVNCount, uint8 optionalDVNThreshold, address[] requiredDVNs, address[] optionalDVNs)";

// Encode the ULN configuration
const abiCoder = new ethers.AbiCoder();
const ulnConfigEncoded = abiCoder.encode(
  [configTypeUlnStruct],
  [ulnConfigData],
);

const endpointAbi = [
  "function setSendLibrary(address oapp, uint32 eid, address sendLib) external",
  "function setReceiveLibrary(address oapp, uint32 eid, address receiveLib) external",
  "function setConfig(address oappAddress, address sendLibAddress, tuple(uint32 eid, uint32 configType, bytes config)[] setConfigParams) external",
];

const resetConfigParamUln = {
  eid: DEST_CHAIN_ENDPOINT_ID,
  configType: 2, // ULN configuration type
  config: ulnConfigEncoded,
};

// Executor Configuration Reset Params
const maxMessageSize = 0; // Representing no limit on message size
const executorAddress = '0x0000000000000000000000000000000000000000'; // Representing no specific executor address

const configTypeExecutorStruct = "tuple(uint32 maxMessageSize, address executorAddress)";
const executorConfigData = {
  maxMessageSize,
  executorAddress,
};

// Encode the Executor configuration
const executorConfigEncoded = abiCoder.encode(
  [configTypeExecutorStruct],
  [executorConfigData],
);

const resetConfigParamExecutor = {
  eid: DEST_CHAIN_ENDPOINT_ID,
  configType: 1, // Executor configuration type
  config: executorConfigEncoded,
};

async function resetSendLibConfig() {
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Connect to the endpoint contract
  const endpointContract = await ethers.getContractAt(endpointAbi, "0x6EDCE65403992e310A62460808c4b910D972f10f");

  try {
    console.log(`Resetting send library configuration for sendLibAddress: ${sendLibAddress}`);

    // Reset the configuration for send library only
    const resetTx = await endpointContract.setConfig(
      oappAddress, 
      sendLibAddress, 
      [resetConfigParamUln, resetConfigParamExecutor]
    );
    console.log("Reset transaction sent:", resetTx.hash);

    await resetTx.wait();
    console.log("Send library configuration reset successfully.");
  } catch (error) {
    console.error("Error resetting send library config:", error);
  }
}

resetSendLibConfig()
  .then(() => console.log("Send library configuration reset successfully."))
  .catch((error) => {
    console.error("Error during send library configuration reset:", error);
    process.exit(1);
  });
