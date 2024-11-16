// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/UserStatus.sol";
import "../src/WitnessDAO.sol";

contract DeployContracts is Script {
    function run() external {
        // Start broadcasting transactions
        vm.startBroadcast();

        // Step 1: Deploy DataValidatorHook contract (which inherits UserStatus one)
        DataValidatorHook dataValidatorHook = new DataValidatorHook(tx.origin);
        console.log("DataValidatorHook deployed at:", address(dataValidatorHook));

        // Step 2: Deploy the WitnessDAO contract, passing the UserStatus address to the constructor
        WitnessDAO witnessDAO = new WitnessDAO();
        console.log("WitnessDAO deployed at:", address(witnessDAO));

        // Step 3: Transfer ownership of UserStatus to WitnessDAO
        dataValidatorHook.transferOwnership(address(witnessDAO));
        console.log("Ownership of UserStatus transferred to WitnessDAO");

        // Stop broadcasting
        vm.stopBroadcast();
    }
}
