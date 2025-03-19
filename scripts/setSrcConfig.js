const { ethers } = require("hardhat");

// Replace with actual values
const YOUR_OAPP_ADDRESS = "0xCCB585857cCEa030dA9E2e0c93B5DD64B30Fdef2";
const YOUR_SEND_LIB_ADDRESS = "0xB31D2cb502E25B30C651842C7C3293c51Fe6d16f";
// const YOUR_RECEIVE_LIB_ADDRESS = "0xdAf00F5eE2158dD58E0d3857851c432E34A3A851";
const YOUR_ENDPOINT_CONTRACT_ADDRESS = "0x6EDCE65403992e310A62460808c4b910D972f10f";

// Configuration
const remoteEid = 40161;
const ulnConfig = {
  confirmations: 1,
  requiredDVNCount: 1,
  optionalDVNCount: 0,
  optionalDVNThreshold: 0,
  requiredDVNs: ["0x2d15d4e61558480A9300632772E68d8b5e7Cc7e5"],
  optionalDVNs: [],
};
const executorConfig = {
  maxMessageSize: 10000,
  executorAddress: "0x5A1B44c6F3b0021A0afA2E6F8E57C18ABeBc2a28",
};

// ABI for the endpoint contract
const endpointAbi = [
  "function setSendLibrary(address oapp, uint32 eid, address sendLib) external",
  "function setReceiveLibrary(address oapp, uint32 eid, address receiveLib, uint256 gracePeriod) external",
  "function setConfig(address oappAddress, address sendLibAddress, tuple(uint32 eid, uint32 configType, bytes config)[] setConfigParams) external",
];

async function configureLibraries() {
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Connect to the endpoint contract
  const endpointContract = await ethers.getContractAt(endpointAbi, YOUR_ENDPOINT_CONTRACT_ADDRESS);

  try {
    // Set send library
    const sendTx = await endpointContract.setSendLibrary(YOUR_OAPP_ADDRESS, remoteEid, YOUR_SEND_LIB_ADDRESS);
    console.log("Send library transaction sent:", sendTx.hash);
    await sendTx.wait();
    console.log("Send library set successfully.");

    // Set receive library
    // const receiveTx = await endpointContract.setReceiveLibrary(YOUR_OAPP_ADDRESS, remoteEid, YOUR_RECEIVE_LIB_ADDRESS);
    // console.log("Receive library transaction sent:", receiveTx.hash);
    // await receiveTx.wait();
    // console.log("Receive library set successfully.");
  } catch (error) {
    console.error("Library configuration failed:", error);
  }
}

async function configureSettings() {
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Connect to the endpoint contract
  const endpointContract = await ethers.getContractAt(endpointAbi, YOUR_ENDPOINT_CONTRACT_ADDRESS);

  try {
    // Encode configurations
    const abiCoder = new ethers.AbiCoder();
    const configTypeUlnStruct =
      "tuple(uint64 confirmations, uint8 requiredDVNCount, uint8 optionalDVNCount, uint8 optionalDVNThreshold, address[] requiredDVNs, address[] optionalDVNs)";
    const encodedUlnConfig = abiCoder.encode([configTypeUlnStruct], [ulnConfig]);

    const configTypeExecutorStruct = "tuple(uint32 maxMessageSize, address executorAddress)";
    const encodedExecutorConfig = abiCoder.encode([configTypeExecutorStruct], [executorConfig]);

    // Define the SetConfigParam structs
    const setConfigParamUln = { eid: remoteEid, configType: 2, config: encodedUlnConfig };
    const setConfigParamExecutor = { eid: remoteEid, configType: 1, config: encodedExecutorConfig };

    // Send config transaction
    const configTx = await endpointContract.setConfig(YOUR_OAPP_ADDRESS, YOUR_SEND_LIB_ADDRESS, [
      setConfigParamUln,
      setConfigParamExecutor,
    ]);
    console.log("Config transaction sent:", configTx.hash);
    await configTx.wait();
    console.log("Configuration set successfully.");
  } catch (error) {
    console.error("Configuration failed:", error);
  }
}

async function main() {
  await configureLibraries();
  await configureSettings();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
