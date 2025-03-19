const { ethers } = require("hardhat");

async function main() {
    const [owner] = await ethers.getSigners(); // Get your wallet

    // USDC Sepolia contract address
    const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
    const SPENDER = "0x9115dA012F457916F5DC454273e61267a86C275f"; // Replace with OFT Adapter or target contract

    // Attach to USDC contract using ERC20 ABI
    const usdc = await ethers.getContractAt("IERC20", USDC_ADDRESS);

    // Approve 10 USDC (USDC has 6 decimals, so 100 USDC = 10 * 10^6)
    const amount = ethers.parseUnits("10", 6);
    const tx = await usdc.approve(SPENDER, amount);
    await tx.wait();

    console.log(`Approved ${amount} USDC for ${SPENDER} on Sepolia`);
}

main().catch(console.error);
