import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import zkDvPModule from "../ignition/modules/zkDvP";
import { deployFungible, deployNonFungible } from "./deploy_upgradeable_token";

async function deployZkDvp(hre: HardhatRuntimeEnvironment) {
  const { ethers, ignition } = hre;
  const [deployer] = await ethers.getSigners();

  console.log("Starting payment token (Zeto_Anon) deployment...");
  const { zeto: paymentToken } = await deployFungible(hre, "Zeto_Anon");
  const paymentTokenAddress = paymentToken.target;
  console.log("Waiting 90 seconds for payment token confirmations...");
  await new Promise((resolve) => setTimeout(resolve, 90000));

  console.log("Starting asset token (Zeto_NfAnon) deployment...");
  const { zeto: assetToken } = await deployNonFungible(hre, "Zeto_NfAnon");
  const assetTokenAddress = assetToken.target;
  console.log("Waiting 90 seconds for asset token confirmations...");
  await new Promise((resolve) => setTimeout(resolve, 90000));

  console.log("Zeto_Anon (Payment Token) deployed to:", paymentTokenAddress);
  console.log("Zeto_NfAnon (Asset Token) deployed to:", assetTokenAddress);

  if (!paymentTokenAddress || !assetTokenAddress) {
    throw new Error("Token addresses not properly initialized");
  }

  console.log("Waiting 90 seconds before zkDvP deployment...");
  await new Promise((resolve) => setTimeout(resolve, 90000));

  try {
    console.log("Starting zkDvP deployment...");
    const deploymentResult = await ignition.deploy(zkDvPModule, {
      parameters: {
        ZkDvPModule: {
          paymentToken: paymentTokenAddress,
          assetToken: assetTokenAddress,
        },
      },
    });

    const { zkDvP } = deploymentResult;
    console.log("zkDvP deployed to:", zkDvP.target);
    return { zkDvP, paymentToken, assetToken };
  } catch (error) {
    console.error("Deployment parameters:", {
      paymentToken: paymentTokenAddress,
      assetToken: assetTokenAddress,
    });
    console.error("Full error:", error);
    throw error;
  }
}

task("deploy-zkdvp", "Deploy ZkDvP contract with its tokens").setAction(
  async (_, hre) => {
    return await deployZkDvp(hre);
  }
);

export default deployZkDvp;
