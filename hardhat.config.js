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
  },
  networks: {
    sepolia: {
      url: "https://ethereum-sepolia.publicnode.com",
      accounts: ["yourPrivateKey"], // Uses private key for signing transactions
    },
    opSepolia: { // Optimism Sepolia
      url: "https://optimism-sepolia.publicnode.com", // OP Sepolia RPC
      accounts: ["yourPrivateKey"], 
    }
  }
};
