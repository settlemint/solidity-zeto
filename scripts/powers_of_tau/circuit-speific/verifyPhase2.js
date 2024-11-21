const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const BASE_DIR = path.join(__dirname, "..", "..", "..");
const POT_DIR = path.join(BASE_DIR, "scripts", "powers_of_tau");
const PHASE2_DIR = path.join(POT_DIR, "circuit-specific-output");

async function main() {
  const circuit = process.argv[2];
  const zkeyFile = process.argv[3];
  
  if (!circuit || !zkeyFile) {
    console.error("Usage: node verifyPhase2.js <circuit> <zkeyFile>");
    process.exit(1);
  }

  const circuitDir = path.join(PHASE2_DIR, circuit);
  const setupInfoPath = path.join(circuitDir, "setup_info.json");
  const infoFile = path.join(circuitDir, zkeyFile.replace('.zkey', '_info.json'));

  if (!fs.existsSync(setupInfoPath) || !fs.existsSync(infoFile)) {
    console.error(`Missing files:\nsetup_info.json: ${fs.existsSync(setupInfoPath)}\ninfo file: ${fs.existsSync(infoFile)}\nPaths:\n${setupInfoPath}\n${infoFile}`);
    process.exit(1);
  }

  try {
    const setupInfo = JSON.parse(fs.readFileSync(setupInfoPath, 'utf8'));
    console.log("Setup Info:", setupInfo); // Debug line
    
    const contributionInfo = JSON.parse(fs.readFileSync(infoFile, 'utf8'));
    const r1csPath = path.join(BASE_DIR, "test", "libs", "proving-keys", `${circuit}.r1cs`);
    const zkeyPath = path.join(circuitDir, zkeyFile);
    
    // Fix ptau path resolution
    const ptauPath = setupInfo.ptauFile.startsWith('/') 
      ? setupInfo.ptauFile 
      : path.join(BASE_DIR, setupInfo.ptauFile);
    
    console.log("\nPaths being used:");
    console.log("r1cs:", r1csPath);
    console.log("ptau:", ptauPath);
    console.log("zkey:", zkeyPath);

    console.log("\nChecking file existence:");
    console.log("r1cs exists:", fs.existsSync(r1csPath));
    console.log("ptau exists:", fs.existsSync(ptauPath));
    console.log("zkey exists:", fs.existsSync(zkeyPath));

    console.log("\nVerifying Phase 2 contribution...");
    execSync(
      `npx snarkjs zkey verify ${r1csPath} ${ptauPath} ${zkeyPath}`,
      { stdio: "inherit" }
    );

    console.log(`
✅ Phase 2 contribution verified!

Circuit: ${circuit}
Contribution #${contributionInfo.contributorNumber}
Made at: ${contributionInfo.timestamp}
Previous zkey: ${contributionInfo.previousZkey}
Current zkey: ${contributionInfo.zkeyFile}
    `);

  } catch (error) {
    console.error("Error during verification:", error);
    process.exit(1);
  }
}

main().catch(console.error);