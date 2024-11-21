const { execSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const BASE_DIR = path.join(__dirname, "..", "..", "..");
const CEREMONY_DIR = path.join(BASE_DIR, "powers_of_tau", "universal-ceremony-output");

async function main() {
  const latestPtau = fs.readdirSync(CEREMONY_DIR)
    .filter(f => f.endsWith('.ptau'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numB - numA;
    })[0];

  const currentNum = parseInt(latestPtau.match(/\d+/)[0]);
  const nextNum = (currentNum + 1).toString().padStart(4, '0');
  const outputPtau = `ceremony_${nextNum}.ptau`;

  const inputPath = path.join(CEREMONY_DIR, latestPtau);
  const outputPath = path.join(CEREMONY_DIR, outputPtau);
  const entropy = crypto.randomBytes(32).toString("hex");

  console.log("\n📝 Phase 1 Contribution");
  console.log(`Input: ${latestPtau}`);
  console.log(`Output: ${outputPtau}\n`);

  // Make contribution
  console.log("1. Contributing to ceremony...");
  execSync(
    `npx snarkjs powersoftau contribute ${inputPath} ${outputPath} --name="Contributor" -e="${entropy}"`,
    { stdio: "inherit" }
  );

  // Verify
  console.log("\n2. Verifying contribution...");
  const verification = execSync(
    `npx snarkjs powersoftau verify ${outputPath}`,
    { stdio: "pipe", encoding: "utf8" }
  );

  // Extract hash
  const responseHashRegex = /Response Hash:[\s\S]*?((?:[a-f0-9]{8}\s+){16})/m;
  const match = verification.match(responseHashRegex);
  const responseHash = match ? match[1].trim() : null;

  // Save info
  const contributionInfo = {
    contributorNumber: nextNum,
    ptauFile: outputPath,
    responseHash: responseHash,
    timestamp: new Date().toISOString()
  };

  const infoFile = outputPath.replace('.ptau', '_info.json');
  fs.writeFileSync(infoFile, JSON.stringify(contributionInfo, null, 2));

  console.log(`
✅ Phase 1 contribution successful!

Files generated:
1. Contribution file: ${outputPath}
2. Contribution info: ${infoFile}

Response Hash:
${responseHash}

Share BOTH files with the coordinator.
  `);
}

main().catch(console.error);