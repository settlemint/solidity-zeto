// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/factory.sol";
import "../contracts/erc20.sol";
import "../contracts/zeto_anon.sol"; // Add this import

contract ZetoFactoryTest is Test {
    ZetoTokenFactory public factory;
    address public deployer;
    
    function setUp() public {
        deployer = makeAddr("deployer");
        vm.startPrank(deployer);
        factory = new ZetoTokenFactory();
        vm.stopPrank();
    }

    function test_DeployAndRegisterImplementation() public {
        vm.startPrank(deployer);
        
        Zeto_Anon zetoImpl = new Zeto_Anon();
        
        ZetoTokenFactory.ImplementationInfo memory implInfo = ZetoTokenFactory.ImplementationInfo({
            implementation: address(zetoImpl),
            verifier: makeAddr("verifier"),
            batchVerifier: makeAddr("batchVerifier"),
            depositVerifier: makeAddr("depositVerifier"),
            withdrawVerifier: makeAddr("withdrawVerifier"),
            batchWithdrawVerifier: makeAddr("batchWithdrawVerifier")
        });

        factory.registerImplementation("test", implInfo);
        
        address newToken = factory.deployZetoFungibleToken("test", deployer);
        
        assertTrue(newToken != address(0), "Token deployment failed");
        
        vm.stopPrank();
    }
}