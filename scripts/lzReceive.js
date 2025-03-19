const { ethers } = require("hardhat");

// receive token from op sepolia to sepolia
// check all the contract addresses before run the script
// check if the message already committed before run the script
// pay attention to the input data like guid and message
// even if you are reusing the contract and send the same transaction, nonce and guid are the min you need to update
async function lzReceive() {
    const ENDPOINT_ADDRESS = "0x6EDCE65403992e310A62460808c4b910D972f10f"; // endpoint contract address
    const contractABI = [
        "function lzReceive((uint32,bytes32,uint64), address, bytes32, bytes, bytes) external payable"
    ];
    
    const [signer] = await ethers.getSigners();
    console.log("Using account:", signer.address);
    const contract = await ethers.getContractAt(contractABI, ENDPOINT_ADDRESS);
    
    // op sepolia eid is 40232
    // sender is the op sepolia tokenMessaging contract address
    // nonce from src data, refer to PacketSent event
    const _origin = [40232, "0x000000000000000000000000CCB585857cCEa030dA9E2e0c93B5DD64B30Fdef2", 2];
    
    // receiver is sepolia tokenMessaging contract address
    // guid from src data, refer to PacketSent
    // message from src data, refer to PacketSent
    const receiver = "0xD203738e1710bFD1ff57012a8c7b3558dd3e8507";
    const guid = "0x69316BCDC753BA6E602040AC6E0A300D63679ED98E2136308A4401DCA6D4A18E";
    const message = "0x02000000000000000000000000000000000000000000000000000000000000000000640000000000000000000000003e6afd653d62d7d797c7c2a0a427a17a6457c56d0000090105fbb80000";
    const extraData = "0x";
    
    try {
        const tx = await contract.lzReceive(_origin, receiver, guid, message, extraData);
        console.log("Transaction sent: ", tx.hash);
        await tx.wait();
        console.log("Transaction confirmed");
    } catch (error) {
        console.error("Error executing lzReceive: ", error);
    }
}

lzReceive().catch((error) => {
    console.error("Script failed: ", error);
    process.exitCode = 1;
});
