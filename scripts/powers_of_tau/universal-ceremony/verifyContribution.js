const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const BASE_DIR = path.join(__dirname, "..", "..");
const CEREMONY_DIR = path.join(BASE_DIR, "powers_of_tau", "universal-ceremony-output");

async function main() {
  const ptauFile = process.argv[2];

  if (!ptauFile) {
    console.error("Usage: node verifyContribution.js <ptauFile>");
    process.exit(1);
  }

  try {
    const ptauPath = path.join(CEREMONY_DIR, ptauFile);
    const infoFile = ptauPath.replace('.ptau', '_info.json');

    if (!fs.existsSync(ptauPath) || !fs.existsSync(infoFile)) {
      console.error("Missing ptau or info file");
      process.exit(1);
    }

    // Read contribution info
    const info = JSON.parse(fs.readFileSync(infoFile, 'utf8'));
    
    // Verify the contribution
    const verification = execSync(
      `npx snarkjs powersoftau verify ${ptauPath}`,
      { stdio: 'pipe', encoding: 'utf8' }
    );

    // Extract full Response Hash (all lines)
    const responseHashRegex = /Response Hash:[\s\S]*?((?:[a-f0-9]{8}\s+){16})/m;
    const match = verification.match(responseHashRegex);
    const actualHash = match ? match[1].trim() : null;

    console.log(`
Verifying Contribution #${info.contributorNumber}
Made at: ${info.timestamp}

Expected Hash:
${info.responseHash}

Actual Hash:
${actualHash}

${actualHash === info.responseHash ? '✅ Valid contribution!' : '❌ Invalid contribution!'}
    `);

  } catch (error) {
    console.error("Error during verification:", error);
    process.exit(1);
  }
}

main().catch(console.error);