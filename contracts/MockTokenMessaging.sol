// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.22;

import { TokenMessaging } from "./messaging/TokenMessaging.sol";

contract MockTokenMessaging is TokenMessaging {
    constructor(address _endpoint, address _owner, uint16 _queueCapacity) TokenMessaging(_endpoint, _owner, _queueCapacity) {
    }
}