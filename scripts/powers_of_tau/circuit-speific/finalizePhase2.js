const { execSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const BASE_DIR = path.join(__dirname, "..", "..", "..");
const POT_DIR = path.join(BASE_DIR, "scripts", "powers_of_tau");
const PHASE2_DIR = path.join(POT_DIR, "circuit-specific-output");
const CONTRACTS_DIR = path.join(BASE_DIR, "contracts", "lib");

async function main() {
  const circuit = process.argv[2];
  const lastZkey = process.argv[3];

  if (!circuit || !lastZkey) {
    console.error("Usage: node finalizePhase2.js <circuit> <lastZkey>");
    process.exit(1);
  }

  const circuitDir = path.join(PHASE2_DIR, circuit);
  const setupInfoPath = path.join(circuitDir, "setup_info.json");

  if (!fs.existsSync(setupInfoPath)) {
    console.error(`Circuit ${circuit} not initialized`);
    process.exit(1);
  }

  try {
    const setupInfo = JSON.parse(fs.readFileSync(setupInfoPath, 'utf8'));
    const r1csPath = path.join(BASE_DIR, "test", "libs", "proving-keys", `${circuit}.r1cs`);
    const finalDir = path.join(circuitDir, "final");
    const lastZkeyPath = path.join(circuitDir, lastZkey);

    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }

    const zkeyFinal = path.join(finalDir, `${circuit}_final.zkey`);
    const verificationKey = path.join(finalDir, `${circuit}_verification_key.json`);
    const verifierContract = path.join(CONTRACTS_DIR, `verifier_${circuit}.sol`);

    console.log("\n1. Adding random beacon...");
    const beaconHash = crypto.randomBytes(32).toString("hex");
    execSync(
      `npx snarkjs zkey beacon ${lastZkeyPath} ${zkeyFinal} ${beaconHash} 10`,
      { stdio: "inherit" }
    );

    console.log("\n2. Exporting verification key...");
    execSync(
      `npx snarkjs zkey export verificationkey ${zkeyFinal} ${verificationKey}`,
      { stdio: "inherit" }
    );

    console.log("\n3. Generating verifier contract...");
    execSync(
      `npx snarkjs zkey export solidityverifier ${zkeyFinal} ${verifierContract}`,
      { stdio: "inherit" }
    );

    console.log(`
✅ Phase 2 ceremony finalized!

Files generated:
1. Final zkey: ${zkeyFinal}
2. Verification key: ${verificationKey}
3. Verifier contract: ${verifierContract}
    `);

  } catch (error) {
    console.error("Error during finalization:", error);
    process.exit(1);
  }
}

main().catch(console.error);