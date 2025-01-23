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

Update the `hardhat.config.js` file with the desired network settings or use the default configurations provided.

---

## Running Tests

To execute the test suite, run:

```bash
npx hardhat test test/Stargate.js
```

Note: there would be 1 test case fail due to uncompleted endpoint setup, err: LZ_DefaultSendLibUnavailable

---
