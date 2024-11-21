// import { HardhatRuntimeEnvironment } from "hardhat/config";
// import { getLinkedContractFactory } from "./lib/common";

// export async function deployFungible(hre: HardhatRuntimeEnvironment, tokenName: string) {
//   const { ethers, ignition, upgrades } = hre;
//   const erc20Module = require("../ignition/modules/erc20").default;
  
//   const { erc20 } = await ignition.deploy(erc20Module);
//   const verifiersDeployer = require(`./tokens/${tokenName}`);
//   const { deployer, args, libraries } =
//     await verifiersDeployer.deployDependencies();

//   let zetoFactory;
//   const opts = {
//     kind: "uups",
//     initializer: "initialize",
//     unsafeAllow: ["delegatecall"],
//   };
//   if (libraries) {
//     zetoFactory = await getLinkedContractFactory(tokenName, libraries);
//     opts.unsafeAllow.push("external-library-linking");
//   } else {
//     zetoFactory = await ethers.getContractFactory(tokenName);
//   }

//   const proxy = await upgrades.deployProxy(zetoFactory, args, opts as any);
//   await proxy.waitForDeployment();
//   const zetoAddress = await proxy.getAddress();
//   const zeto: any = await ethers.getContractAt(tokenName, zetoAddress);

//   const tx3 = await zeto.connect(deployer).setERC20(erc20.target);
//   await tx3.wait();

//   console.log(`ZetoToken deployed: ${zeto.target}`);
//   console.log(`ERC20 deployed:     ${erc20.target}`);

//   return { deployer, zeto, erc20 };
// }

// export async function deployNonFungible(hre: HardhatRuntimeEnvironment, tokenName: string) {
//   const { ethers, upgrades } = hre;
//   const verifiersDeployer = require(`./tokens/${tokenName}`);
//   const { deployer, args, libraries } =
//     await verifiersDeployer.deployDependencies();

//   let zetoFactory;
//   const opts = {
//     kind: "uups",
//     initializer: "initialize",
//     unsafeAllow: ["delegatecall"],
//   };
//   if (libraries) {
//     zetoFactory = await getLinkedContractFactory(tokenName, libraries);
//     opts.unsafeAllow.push("external-library-linking");
//   } else {
//     zetoFactory = await ethers.getContractFactory(tokenName);
//   }

//   const proxy = await upgrades.deployProxy(zetoFactory, args, opts as any);
//   await proxy.waitForDeployment();
//   const zetoAddress = await proxy.getAddress();
//   const zeto: any = await ethers.getContractAt(tokenName, zetoAddress);

//   console.log(`ZetoToken deployed: ${zeto.target}`);

//   return { deployer, zeto };
// }