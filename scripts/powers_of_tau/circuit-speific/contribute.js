const circuitsMap = require('../../circuitsMap');
const { execSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const BASE_DIR = path.join(__dirname, "..", "..", "..");
const POT_DIR = path.join(BASE_DIR, "scripts", "powers_of_tau");
const PHASE2_DIR = path.join(POT_DIR, "circuit-specific-output");

async function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    console.log("Have you run initPhase2.js first?");
    process.exit(1);
  }
}

async function contributeToCircuit(circuit) {
  const circuitDir = path.join(PHASE2_DIR, circuit);
  await ensureDirectoryExists(circuitDir);

  const zkeyFiles = fs.readdirSync(circuitDir).filter(f => f.endsWith('.zkey'));
  if (zkeyFiles.length === 0) {
    console.error(`No zkey files found for ${circuit}`);
    console.log("Have you run initPhase2.js first?");
    return;
  }

  const latestZkey = zkeyFiles.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numB - numA;
  })[0];

  const currentNum = parseInt(latestZkey.match(/\d+/)[0]);
  const nextNum = (currentNum + 1).toString().padStart(4, '0');
  const outputZkey = `${circuit}_${nextNum}.zkey`;

  const inputPath = path.join(circuitDir, latestZkey);
  const outputPath = path.join(circuitDir, outputZkey);
  
  try {
    const entropy = crypto.randomBytes(32).toString("hex");
    
    console.log(`\n📝 Contributing to ${circuit}`);
    console.log(`Input: ${latestZkey}`);
    console.log(`Output: ${outputZkey}\n`);

    execSync(
      `npx snarkjs zkey contribute ${inputPath} ${outputPath} -e="${entropy}"`,
      { stdio: "inherit" }
    );

    const contributionInfo = {
      circuit,
      contributorNumber: nextNum,
      previousZkey: inputPath,
      zkeyFile: outputPath,
      timestamp: new Date().toISOString()
    };

    const infoFile = outputPath.replace('.zkey', '_info.json');
    fs.writeFileSync(infoFile, JSON.stringify(contributionInfo, null, 2));

    // Verify contribution
    console.log("\n🔍 Verifying contribution...");
    execSync(
      `node verifyPhase2.js ${circuit} ${outputZkey}`,
      { stdio: "inherit" }
    );

  } catch (error) {
    console.error(`\n❌ Error contributing to ${circuit}:`, error.message);
    process.exit(1);
  }
}

async function main() {
  const featureName = process.argv[2];

  if (!featureName) {
    console.log("\n🔍 Available features:");
    Object.keys(circuitsMap).forEach(feature => {
      console.log(`  - ${feature}`);
    });
    console.error("\n📋 Usage: node contribute.js <feature_name>");
    process.exit(1);
  }

  const circuits = circuitsMap[featureName];
  if (!circuits) {
    console.error(`\n❌ Unknown feature: ${featureName}`);
    console.log("\n🔍 Available features:");
    Object.keys(circuitsMap).forEach(feature => {
      console.log(`  - ${feature}`);
    });
    process.exit(1);
  }

  await ensureDirectoryExists(PHASE2_DIR);

  console.log(`\n🔄 Contributing to all circuits for ${featureName}`);
  for (const circuit of circuits) {
    await contributeToCircuit(circuit);
  }

  console.log("\n✅ All contributions completed successfully!");
}

main().catch(console.error);