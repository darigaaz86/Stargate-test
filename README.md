# Stargate Test Suite

This repository contains the test suite for the Stargate protocol. The tests validate core functionalities, including token transfers, native token handling, and edge case scenarios. This README provides a quick guide on how to set up and use the project.

---

## Features

- Test cases for **native token transfers**
- Validation of **token bus mechanisms**
- Simulation of **Stargate protocol behaviors**

---

## Prerequisites

Before running the tests, ensure you have the following installed:

1. **Node.js** (>= 16.x)
2. **Hardhat**
3. **Git**

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/darigaaz86/Stargate-test.git
   cd Stargate-test
   ```
2. Install dependencies:

   ```bash
   npm install
   ```

---

## Configuration

### **Set Up Your Private Key**

Before running scripts, update your `hardhat.config.js` file to include your private key. Open `hardhat.config.js` and modify the network configuration as follows:

```javascript
module.exports = {
  networks: {
    sepolia: {
      url: "https://rpc.sepolia.org", // Replace with the actual RPC URL
      accounts: ["YOUR_PRIVATE_KEY"] // Replace with your private key
    },
    opSepolia: {
      url: "https://optimism-sepolia-rpc-url", // Replace with the actual RPC URL
      accounts: ["YOUR_PRIVATE_KEY"]
    }
  },
};
```

🚨 **Warning:** Never expose your private key publicly. Use environment variables or `.env` files for security.

---

## Running Tests

To execute the test suite, run:

```bash
npx hardhat test test/Stargate.js
```

⚠️ **Note:** One test case may fail due to an uncompleted endpoint setup with the error: `LZ_DefaultSendLibUnavailable`.

---

## Running Scripts

### **Flow 1: Using Default DVN and Executor**

🚀 **This flow uses the default DVN and automatically executes the transactions.**

1. **Deploy and configure all Stargate contracts**

   ```bash
   npx hardhat run scripts/deployStargate.js
   ```
2. **Call LP send function**

   ```bash
   npx hardhat run scripts/sendToken.js --network opSepolia
   ```
3. **Call tokenMsg `driveBus` function**

   ```bash
   npx hardhat run scripts/driveBus.js --network opSepolia
   ```

   ✅ **Expected Outcome:** The destination address should receive ETH.

---

### **Flow 2: Using Nethermind's DVN with Manual Execution**

🚀 **This flow uses Nethermind's DVN, but execution must be manually triggered.**

1. **Deploy and configure all Stargate contracts**
   ```bash
   npx hardhat run scripts/deployStargate.js
   ```
2. **Set up both source and destination configurations**
   ```bash
   npx hardhat run scripts/setSrcConfig.js --network opSepolia
   npx hardhat run scripts/setDstConfig.js --network sepolia
   ```
3. **Call LP send function**
   ```bash
   npx hardhat run scripts/sendToken.js --network opSepolia
   ```
4. **Call tokenMsg `driveBus` function**
   ```bash
   npx hardhat run scripts/driveBus.js --network opSepolia
   ```
5. **Call ULN `commitVerification` function**
   ```bash
   npx hardhat run scripts/commitVerification.js --network sepolia
   ```
6. **Call endpoint `lzReceive` function**
   ```bash
   npx hardhat run scripts/lzReceive.js --network sepolia
   ```

✅ **Expected Outcome:** Once manually executed, the destination should receive the assets.

---

## DVN and Executor Off-Chain Flow

This section details the **off-chain execution flow** for the **DVN (Decentralized Verification Node)** and **Executor**.

### 1. DVN Execution Flow

- The **DVN** should call the **DVN `execute` function**, which **verifies the payload**.
- Inside this function, it uses **low-level calldata** to call the **ULN `verify` function**.

### 2. Executor Flow

- The **Executor** should call the **`receiveUln commitVerification` function**, which **commits the payload**.
- This function will internally call the **endpoint `verify` function** and bind the `inboundPayloadHash`.

### 3. Executor Builder Flow

- The **Executor Builder** should call the **Executor `execute302` function**, which serves as the **trigger point** for the **endpoint's `lzReceive` function**.

---

### **Troubleshooting**

- **If transactions fail**, ensure that `_packetHeader` and `_payloadHash` are correctly formatted.
- **For gas estimation failures**, try setting a manual gas limit:
  ```javascript
  const tx = await contract.commitVerification(_packetHeader, _payloadHash, { gasLimit: 500000 });
  ```
- **Check contract logs** if execution is not behaving as expected.

Let me know if you need further improvements! 🚀
