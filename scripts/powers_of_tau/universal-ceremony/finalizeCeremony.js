const { execSync } = require("child_process");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const BASE_DIR = path.join(__dirname, "..", "..");
const CEREMONY_DIR = path.join(BASE_DIR, "powers_of_tau", "universal-ceremony-output");
const FINAL_SETUP_DIR = path.join(BASE_DIR, "powers_of_tau", "final_setup");

async function main() {
  const lastContribution = process.argv[2];
  const power = process.argv[3] || 18;

  if (!lastContribution) {
    console.error("Usage: node finalizeCeremony.js <lastContribution.ptau> [power]");
    process.exit(1);
  }

  // Create final setup directory inside powers_of_tau
  if (!fs.existsSync(FINAL_SETUP_DIR)) {
    fs.mkdirSync(FINAL_SETUP_DIR, { recursive: true });
  }

  // Get just the filename if a full path is provided
  const ptauFilename = path.basename(lastContribution);
  const inputPath = path.join(CEREMONY_DIR, ptauFilename);
  const PTAU_FINAL = path.join(FINAL_SETUP_DIR, `powersOfTau${power}_final.ptau`);

  try {
    console.log("1. Finalizing Phase 1 (Powers of Tau)...");
    const beaconHash = crypto.randomBytes(32).toString("hex");
    
    execSync(
      `npx snarkjs powersoftau beacon ${inputPath} ${PTAU_FINAL} ${beaconHash} 10`,
      { stdio: "inherit" }
    );
    
    execSync(
      `npx snarkjs powersoftau prepare phase2 ${PTAU_FINAL} ${PTAU_FINAL}`,
      { stdio: "inherit" }
    );

    console.log(`
✅ Ceremony finalized successfully!

Final PTAU file: ${PTAU_FINAL}

This file can now be used for circuit-specific trusted setup.
    `);

  } catch (error) {
    console.error("Error during finalization:", error);
    process.exit(1);
  }
}

main().catch(console.error);