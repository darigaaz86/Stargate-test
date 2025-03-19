const { ethers } = require("hardhat");

// after run the deployStargate.js, put the op sepolia tokenMsg address to the CONTRACT_ADDRESS
// run this script after sendToken
async function driveBus() {
    const YOUR_OAPP_ADDRESS = "0xCCB585857cCEa030dA9E2e0c93B5DD64B30Fdef2"; // Replace with your deployed contract address
    const CONTRACT_ABI = [
        {
          "inputs": [
            {
              "internalType": "uint32",
              "name": "_dstEid",
              "type": "uint32"
            },
            {
              "internalType": "bytes",
              "name": "_passengers",
              "type": "bytes"
            }
          ],
          "name": "driveBus",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "guid",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint64",
                  "name": "nonce",
                  "type": "uint64"
                },
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "nativeFee",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "lzTokenFee",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct MessagingFee",
                  "name": "fee",
                  "type": "tuple"
                }
              ],
              "internalType": "struct MessagingReceipt",
              "name": "receipt",
              "type": "tuple"
            }
          ],
          "stateMutability": "payable",
          "type": "function"
        }
    ];

    // Get signer (deployer or connected wallet)
    const [signer] = await ethers.getSigners();
    console.log("Using account:", signer.address);

    // Connect to the contract
    const contract = await ethers.getContractAt(CONTRACT_ABI, YOUR_OAPP_ADDRESS);

    // Define inputs
    const _dstEid = 40161;
    const _passengers = "0x00640000000000000000000000003e6afd653d62d7d797c7c2a0a427a17a6457c56d0000090105fbb80000";
    const value = ethers.parseEther("0.05"); // 50000000000000000 wei (0.05 ETH)

    console.log("Sending transaction...");

    try {
        const tx = await contract.driveBus(_dstEid, _passengers, { value });
        console.log("Transaction sent! Hash:", tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
    } catch (error) {
        console.error("Transaction failed:", error.reason || error);
    }
}

// Run script
driveBus().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
