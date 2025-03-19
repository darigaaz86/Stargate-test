const { ethers } = require("hardhat");

async function main() {
    const OWNER_ADDR = "0x3e6AFD653D62d7D797C7c2a0a427a17a6457C56D" // your wallet address
    const PRIVATE_KEY = "xxx"; // Replace with your private key
    const OP_SEPOLIA_RPC = "https://optimism-sepolia.publicnode.com"; // Replace with the Optimism Sepolia RPC URL
    const SEPOLIA_RPC = "https://ethereum-sepolia.publicnode.com"; // Replace with the Sepolia RPC URL

    // Setup providers & wallet
    const opSepoliaProvider = new ethers.JsonRpcProvider(OP_SEPOLIA_RPC);
    const sepoliaProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    const opWallet = new ethers.Wallet(PRIVATE_KEY, opSepoliaProvider);
    const sepoliaWallet = new ethers.Wallet(PRIVATE_KEY, sepoliaProvider);

    // Deploy StargatePoolNative on Optimism Sepolia
    console.log("Deploying StargatePoolNative on Optimism Sepolia...");
    const StargatePoolNative = await ethers.getContractFactory("StargatePoolNative", opWallet);
    const opStargatePoolNative = await StargatePoolNative.deploy(
        "LPT", "LPT", 18, 18,
        "0x6EDCE65403992e310A62460808c4b910D972f10f", 
        OWNER_ADDR
    );
    await opStargatePoolNative.waitForDeployment();
    const opStargatePoolNativeAddress = await opStargatePoolNative.getAddress();
    console.log(`✅ Op Sepolia StargatePoolNative deployed at: ${opStargatePoolNativeAddress}`);

    // Deploy TokenMessaging on Optimism Sepolia
    console.log("Deploying TokenMessaging on Optimism Sepolia...");
    const TokenMessaging = await ethers.getContractFactory("TokenMessaging", opWallet);
    const opTokenMessaging = await TokenMessaging.deploy(
        "0x6EDCE65403992e310A62460808c4b910D972f10f", OWNER_ADDR, 100
    );
    await opTokenMessaging.waitForDeployment();
    const opTokenMessagingAddress = await opTokenMessaging.getAddress();
    const opTokenMessagingAddress32Bytes = ethers.zeroPadValue(opTokenMessagingAddress, 32);
    console.log(`✅ Op Sepolia TokenMessaging deployed at: ${opTokenMessagingAddress}`);

    // Deploy StargatePoolNative on Sepolia
    console.log("Deploying StargatePoolNative on Sepolia...");
    const sepoliaStargatePoolNative = await StargatePoolNative.connect(sepoliaWallet).deploy(
        "LPT", "LPT", 18, 18,
        "0x6EDCE65403992e310A62460808c4b910D972f10f", 
        OWNER_ADDR
    );
    await sepoliaStargatePoolNative.waitForDeployment();
    const sepoliaStargatePoolNativeAddress = await sepoliaStargatePoolNative.getAddress();
    console.log(`✅ Sepolia StargatePoolNative deployed at: ${sepoliaStargatePoolNativeAddress}`);

    // Deploy TokenMessaging on Sepolia
    console.log("Deploying TokenMessaging on Sepolia...");
    const sepoliaTokenMessaging = await TokenMessaging.connect(sepoliaWallet).deploy(
        "0x6EDCE65403992e310A62460808c4b910D972f10f", OWNER_ADDR, 100
    );
    await sepoliaTokenMessaging.waitForDeployment();
    const sepoliaTokenMessagingAddress = await sepoliaTokenMessaging.getAddress();
    const sepoliaTokenMessagingAddress32Bytes = ethers.zeroPadValue(sepoliaTokenMessagingAddress, 32);
    console.log(`✅ Sepolia TokenMessaging deployed at: ${sepoliaTokenMessagingAddress}`);

    // Set address configuration
    const addressConfig = [
        "0x6dB0986F182EBe91b4E7EaA9be2481B6C2cBD061", 
        OWNER_ADDR, 
        OWNER_ADDR, 
        opTokenMessagingAddress, 
        opTokenMessagingAddress, 
        OWNER_ADDR
    ];
    const tx1 = await opStargatePoolNative.setAddressConfig(addressConfig);
    await tx1.wait();
    console.log("✅ Address configuration set on Op Sepolia!");

    // Set OFT path
    const tx2 = await opStargatePoolNative.setOFTPath(40161, true);
    await tx2.wait();
    console.log("✅ OFT path set!");

    // Token Messaging Configuration
    console.log("Configuring token messaging on Op Sepolia...");
    const tx3 = await opTokenMessaging.setAssetId(opStargatePoolNativeAddress, 100);
    await tx3.wait();
    console.log("✅ Asset ID set!");

    const tx4 = await opTokenMessaging.setPlanner(OWNER_ADDR);
    await tx4.wait();
    console.log("✅ Planner set!");

    const tx5 = await opTokenMessaging.setFares(40161, 1000000, 1000000);
    await tx5.wait();
    console.log("✅ Fares set!");

    const tx6 = await opTokenMessaging.setMaxNumPassengers(40161, 50);
    await tx6.wait();
    console.log("✅ Max passengers set!");

    const tx7 = await opTokenMessaging.setGasLimit(40161, 1000000, 1000000);
    await tx7.wait();
    console.log("✅ Gas limit set!");

    const tx8 = await opTokenMessaging.setPeer(40161, sepoliaTokenMessagingAddress32Bytes);
    await tx8.wait();
    console.log("✅ Peer set!");

    // Set address configuration
    const spAddressConfig = [
        "0xadb95cc117eef66782656096e29f193cce59d7dd", 
        OWNER_ADDR, 
        OWNER_ADDR, 
        sepoliaTokenMessagingAddress, 
        sepoliaTokenMessagingAddress, 
        OWNER_ADDR
    ];
    const tx9 = await sepoliaStargatePoolNative.setAddressConfig(spAddressConfig);
    await tx9.wait();
    console.log("✅ Address configuration set on Op Sepolia!");

    // Set OFT path
    const tx10 = await sepoliaStargatePoolNative.setOFTPath(40232, true);
    await tx10.wait();
    console.log("✅ OFT path set!");

    // Token Messaging Configuration
    console.log("Configuring token messaging on Op Sepolia...");
    const tx11 = await sepoliaTokenMessaging.setAssetId(sepoliaStargatePoolNativeAddress, 100);
    await tx11.wait();
    console.log("✅ Asset ID set!");

    const tx12 = await sepoliaTokenMessaging.setPlanner(OWNER_ADDR);
    await tx12.wait();
    console.log("✅ Planner set!");

    const tx13 = await sepoliaTokenMessaging.setFares(40232, 1000000, 1000000);
    await tx13.wait();
    console.log("✅ Fares set!");

    const tx14 = await sepoliaTokenMessaging.setMaxNumPassengers(40232, 50);
    await tx14.wait();
    console.log("✅ Max passengers set!");

    const tx15 = await sepoliaTokenMessaging.setGasLimit(40232, 1000000, 1000000);
    await tx15.wait();
    console.log("✅ Gas limit set!");

    const tx16 = await sepoliaTokenMessaging.setPeer(40232, opTokenMessagingAddress32Bytes);
    await tx16.wait();
    console.log("✅ Peer set!");

    // Deposit eth balance
    const tx17 = await sepoliaStargatePoolNative.deposit(OWNER_ADDR, ethers.parseEther("0.01"));
    await tx17.wait();
    console.log("✅ Deposit!");

    console.log("🚀 Deployment and configuration completed successfully!");
}

// Run the script
main().catch((error) => {
    console.error("❌ Error:", error);
    process.exitCode = 1;
});
