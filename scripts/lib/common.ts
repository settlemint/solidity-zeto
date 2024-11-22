import { artifacts, ethers } from "hardhat";
import fungibilities from "../tokens.json";

export async function getLinkedContractFactory(
  contractName: string,
  libraries: any,
) {
  const cArtifact = await artifacts.readArtifact(contractName);
  const linkedBytecode = linkBytecode(cArtifact, libraries);
  const ContractFactory = await ethers.getContractFactory(
    cArtifact.abi,
    linkedBytecode,
  );
  return ContractFactory;
}

export function deploy(deployFungible: Function, deployNonFungible: Function, tokenName?: string) {
  if (process.env.TEST_DEPLOY_SCRIPTS == "true") {
    console.log("Skipping the deploy command in test environment");
    return Promise.resolve();
  }

  // Use provided tokenName or fall back to env var
  const zeto = tokenName ?? process.env.ZETO_NAME;
  if (!zeto) {
    throw new Error(
      "Please provide a token name as argument or set ZETO_NAME environment variable"
    );
  }
  
  const fungibility = (fungibilities as any)[zeto];
  if (!fungibility) {
    throw new Error(`Invalid Zeto token contract name: ${zeto}`);
  }
  
  if (fungibility === "fungible") {
    console.log(`Deploying fungible Zeto token: ${zeto}`);
    return deployFungible(zeto);
  } else {
    console.log(`Deploying non-fungible Zeto token: ${zeto}`);
    return deployNonFungible(zeto);
  }
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