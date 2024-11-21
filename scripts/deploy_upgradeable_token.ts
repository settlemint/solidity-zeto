import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import fungibilities from "./tokens.json";

async function deployFungible(hre: HardhatRuntimeEnvironment, tokenName: string) {
  const { ethers, ignition, upgrades } = hre;
  const erc20Module = require("../ignition/modules/erc20").default;
  
  const { erc20 } = await ignition.deploy(erc20Module);
  const verifiersDeployer = require(`./tokens/${tokenName}`);
  const { deployer, args, libraries } = await verifiersDeployer.deployDependencies();

  let zetoFactory;
  const opts = {
    kind: "uups",
    initializer: "initialize",
    unsafeAllow: ["delegatecall"],
  };

  if (libraries) {
    const cArtifact = await hre.artifacts.readArtifact(tokenName);
    const linkedBytecode = linkBytecode(cArtifact, libraries);
    zetoFactory = await ethers.getContractFactory(cArtifact.abi, linkedBytecode);
    opts.unsafeAllow.push("external-library-linking");
  } else {
    zetoFactory = await ethers.getContractFactory(tokenName);
  }

  const proxy = await upgrades.deployProxy(zetoFactory, args, opts as any);
  await proxy.waitForDeployment();
  const zetoAddress = await proxy.getAddress();
  const zeto: any = await ethers.getContractAt(tokenName, zetoAddress);

  const tx3 = await zeto.connect(deployer).setERC20(erc20.target);
  await tx3.wait();

  console.log(`ZetoToken deployed: ${zeto.target}`);
  console.log(`ERC20 deployed:     ${erc20.target}`);

  return { deployer, zeto, erc20 };
}

async function deployNonFungible(hre: HardhatRuntimeEnvironment, tokenName: string) {
  const { ethers, upgrades } = hre;
  const verifiersDeployer = require(`./tokens/${tokenName}`);
  const { deployer, args, libraries } = await verifiersDeployer.deployDependencies();

  let zetoFactory;
  const opts = {
    kind: "uups",
    initializer: "initialize",
    unsafeAllow: ["delegatecall"],
  };

  if (libraries) {
    const cArtifact = await hre.artifacts.readArtifact(tokenName);
    const linkedBytecode = linkBytecode(cArtifact, libraries);
    zetoFactory = await ethers.getContractFactory(cArtifact.abi, linkedBytecode);
    opts.unsafeAllow.push("external-library-linking");
  } else {
    zetoFactory = await ethers.getContractFactory(tokenName);
  }

  const proxy = await upgrades.deployProxy(zetoFactory, args, opts as any);
  await proxy.waitForDeployment();
  const zetoAddress = await proxy.getAddress();
  const zeto: any = await ethers.getContractAt(tokenName, zetoAddress);

  console.log(`ZetoToken deployed: ${zeto.target}`);

  return { deployer, zeto };
}

function linkBytecode(artifact: any, libraries: any) {
  let bytecode = artifact.bytecode;
  for (const [, fileReferences] of Object.entries(artifact.linkReferences)) {
    for (const [libName, fixups] of Object.entries(fileReferences as any)) {
      const addr = libraries[libName];
      if (addr === undefined) {
        continue;
      }
      for (const fixup of fixups as any) {
        bytecode =
          bytecode.substr(0, 2 + fixup.start * 2) +
          addr.substr(2) +
          bytecode.substr(2 + (fixup.start + fixup.length) * 2);
      }
    }
  }
  return bytecode;
}

task("deploy-upgradeable", "Deploy upgradeable token contract")
  .addPositionalParam("tokenName", "The name of the token to deploy")
  .setAction(async ({ tokenName }, hre) => {
    if (process.env.TEST_DEPLOY_SCRIPTS === "true") {
      console.log("Skipping the deploy command in test environment");
      return;
    }

    const fungibility = (fungibilities as any)[tokenName];
    if (!fungibility) {
      throw new Error(`Invalid Zeto token contract name: ${tokenName}`);
    }

    if (fungibility === "fungible") {
      console.log(`Deploying fungible Zeto token: ${tokenName}`);
      return await deployFungible(hre, tokenName);
    } else {
      console.log(`Deploying non-fungible Zeto token: ${tokenName}`);
      return await deployNonFungible(hre, tokenName);
    }
  });

  export { deployFungible, deployNonFungible };