require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28", // Your Solidity version
    settings: {
      optimizer: {
        enabled: true,
        runs: 200 // or an appropriate number
      }
    }
  }
};
