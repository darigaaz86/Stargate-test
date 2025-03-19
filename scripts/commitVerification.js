const { ethers } = require("hardhat");

async function commitVerification() {
    // Define function parameters (replace with actual values)
    const _packetHeader = "0x01000000000000000200009D28000000000000000000000000CCB585857CCEA030DA9E2E0C93B5DD64B30FDEF200009CE1000000000000000000000000D203738E1710BFD1FF57012A8C7B3558DD3E8507";  // Replace with real bytes data
    const _payloadHash = "0xC7FAA8D5AD1D27248F5BD9E03F4055C0D1782583AFD73552C68F07570522D8CC";   // Replace with actual bytes32 hash

    const ULN_ADDRESS = "0xdAf00F5eE2158dD58E0d3857851c432E34A3A851";

    // ABI for commitVerification function
    const CONTRACT_ABI = [
        {
            "inputs": [
                {
                    "internalType": "bytes",
                    "name": "_packetHeader",
                    "type": "bytes"
                },
                {
                    "internalType": "bytes32",
                    "name": "_payloadHash",
                    "type": "bytes32"
                }
            ],
            "name": "commitVerification",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    // Get signer (deployer or first available account)
    const [signer] = await ethers.getSigners();
    console.log("Using account:", signer.address);

    // Connect to the contract
    const contract = await ethers.getContractAt(CONTRACT_ABI, ULN_ADDRESS);

    console.log("Sending transaction to commitVerification...");

    try {
        // Send the transaction
        const tx = await contract.commitVerification(_packetHeader, _payloadHash);
        console.log("Transaction sent! Hash:", tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
    } catch (error) {
        console.error("Transaction failed:", error.reason || error);
    }
}

// Run the script
commitVerification().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
