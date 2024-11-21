const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const circuitsMap = require("../circuitsMap");

const BASE_DIR = path.join(__dirname, "..", "..");
const TRUSTED_SETUP_DIR = path.join(BASE_DIR, "trusted_setup");

const DIRS = {
  verifierContracts: path.join(BASE_DIR, "contracts", "lib"),
  zkAppProver: path.join(BASE_DIR, "zk_app", "prover"),
  zkAppVerifier: path.join(BASE_DIR, "zk_app", "verifier"),
  compiledCircuits: path.join(BASE_DIR, "test", "libs", "proving-keys"),
  trustedSetup: TRUSTED_SETUP_DIR
};

function exec(command) {
  console.log(`Executing: ${command}`);
  execSync(command, { stdio: "inherit" });
}

function createDirectories() {
  Object.values(DIRS).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function copyFile(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} to ${dest}`);
  } else {
    console.warn(`Source file ${src} does not exist`);
  }
}

function backupVerifierContracts() {
  const backupDir = path.join(DIRS.verifierContracts, "backup", new Date().toISOString().replace(/[:.]/g, '-'));
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const files = fs.readdirSync(DIRS.verifierContracts);
  let backupCount = 0;
  
  files.forEach(file => {
    if (file.startsWith('verifier_')) {
      const sourcePath = path.join(DIRS.verifierContracts, file);
      const destPath = path.join(backupDir, file);
      copyFile(sourcePath, destPath);
      backupCount++;
    }
  });
  
  console.log(`Backed up ${backupCount} verifier contracts to ${backupDir}`);
  return backupDir;
}

function getContractName(circuit) {
  return circuit.split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function adjustVerifier(verifierPath, contractName) {
  let content = fs.readFileSync(verifierPath, 'utf8');
  
  content = content.replace(
    /contract (Verifier|Groth16Verifier)\s*{/,
    `contract Groth16Verifier_${contractName} {`
  );
  
  content = content.replace(
    /pragma solidity \^\d+\.\d+\.\d+;/,
    'pragma solidity ^0.8.0;'
  );
  
  fs.writeFileSync(verifierPath, content, 'utf8');
  console.log(`Adjusted verifier contract name to Groth16Verifier_${contractName}`);
}

async function processCircuits(tokenName, ptauFile) {
  const circuits = circuitsMap[tokenName];
  
  for (const circuit of circuits) {
    console.log(`\nProcessing circuit: ${circuit}`);
    
    const circuitDir = DIRS.compiledCircuits;
    const r1csPath = path.join(circuitDir, `${circuit}.r1cs`);
    const wasmPath = path.join(circuitDir, `${circuit}.wasm`);
    const witnessCalculatorPath = path.join(circuitDir, `${circuit}_witness_calculator.js`);

    const zkey0Path = path.join(DIRS.trustedSetup, `${circuit}_0000.zkey`);
    const zkey1Path = path.join(DIRS.trustedSetup, `${circuit}_0001.zkey`);
    const zkeyFinalPath = path.join(DIRS.trustedSetup, `${circuit}_final.zkey`);
    const verifierPath = path.join(DIRS.verifierContracts, `verifier_${circuit}.sol`);

    try {
      // Phase 2: Circuit-specific setup
      exec(`npx snarkjs groth16 setup ${r1csPath} ${ptauFile} ${zkey0Path}`);
      exec(
        `npx snarkjs zkey contribute ${zkey0Path} ${zkey1Path} --name="Contributor 1" -e="${crypto
          .randomBytes(32)
          .toString("hex")}"`
      );

      const beaconHash = crypto.randomBytes(32).toString("hex");
      exec(
        `npx snarkjs zkey beacon ${zkey1Path} ${zkeyFinalPath} ${beaconHash} 10`
      );

      // Export verification key and Solidity verifier
      exec(
        `npx snarkjs zkey export verificationkey ${zkeyFinalPath} ${path.join(
          DIRS.zkAppVerifier,
          `${circuit}_verification_key.json`
        )}`
      );
      exec(
        `npx snarkjs zkey export solidityverifier ${zkeyFinalPath} ${verifierPath}`
      );

      // Adjust the verifier contract name
      const contractName = getContractName(circuit);
      adjustVerifier(verifierPath, contractName);

      // Copy necessary files to prover directory
      copyFile(wasmPath, path.join(DIRS.zkAppProver, `${circuit}.wasm`));
      copyFile(zkeyFinalPath, path.join(DIRS.zkAppProver, `${circuit}.zkey`));
      copyFile(witnessCalculatorPath, path.join(DIRS.zkAppProver, `${circuit}_witness_calculator.js`));

      console.log(`Successfully processed circuit ${circuit}`);
    } catch (error) {
      console.error(`Error processing circuit ${circuit}:`, error);
      continue;
    }
  }
}

function generateHelperScripts() {
  const generateProofContent = `
const snarkjs = require("snarkjs");
const fs = require("fs");

async function generateProof(circuitName, input) {
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    \`${DIRS.zkAppProver}/\${circuitName}.wasm\`,
    \`${DIRS.zkAppProver}/\${circuitName}.zkey\`
  );
  return { proof, publicSignals };
}

module.exports = { generateProof };
`;
  fs.writeFileSync(path.join(DIRS.zkAppProver, "generateProof.js"), generateProofContent);

  const verifyProofContent = `
const snarkjs = require("snarkjs");
const fs = require("fs");

async function verifyProof(circuitName, proof, publicSignals) {
  const vKey = JSON.parse(fs.readFileSync(
    \`${DIRS.zkAppVerifier}/\${circuitName}_verification_key.json\`
  ));
  return await snarkjs.groth16.verify(vKey, publicSignals, proof);
}

module.exports = { verifyProof };
`;
  fs.writeFileSync(path.join(DIRS.zkAppVerifier, "verifyProof.js"), verifyProofContent);
}

module.exports = {
  DIRS,
  exec,
  createDirectories,
  copyFile,
  backupVerifierContracts,
  getContractName,
  adjustVerifier,
  processCircuits,
  generateHelperScripts
};