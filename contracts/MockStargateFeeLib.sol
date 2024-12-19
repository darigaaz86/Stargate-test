// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.22;

import { IStargateFeeLib, FeeParams } from "./interfaces/IStargateFeeLib.sol";

contract MockStargateFeeLib is IStargateFeeLib {
    // Mock implementation for applyFee
    function applyFee(FeeParams calldata _params) external pure override returns (uint64 amountOutSD) {
        // Example logic: Deduct a flat 1% fee from the amountInSD
        uint64 fee = _params.amountInSD / 100; // 1% fee
        amountOutSD = _params.amountInSD - fee;
        return amountOutSD;
    }

    // Mock implementation for applyFeeView
    function applyFeeView(FeeParams calldata _params) external pure override returns (uint64 amountOutSD) {
        // Same logic as applyFee for testing purposes
        uint64 fee = _params.amountInSD / 100; // 1% fee
        amountOutSD = _params.amountInSD - fee;
    }
}