const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const BASE_DIR = path.join(__dirname, "..", "..");
const CEREMONY_DIR = path.join(BASE_DIR, "powers_of_tau", "universal-ceremony-output");

async function main() {
  const power = process.argv[2] || 18;
  
  if (!fs.existsSync(CEREMONY_DIR)) {
    fs.mkdirSync(CEREMONY_DIR, { recursive: true });
  }

  const initialPtau = path.join(CEREMONY_DIR, "ceremony_0.ptau");
  
  console.log("Starting Powers of Tau ceremony...");
  execSync(`npx snarkjs powersoftau new bn128 ${power} ${initialPtau} -v`);
  
  console.log(`
Ceremony initialized!
Initial file: ${initialPtau}

Next steps:
1. Share ceremony_0.ptau with first contributor
2. They should run: node contribute.js ceremony_0.ptau ceremony_1.ptau
3. Each contributor repeats with incrementing numbers
  `);
}

main().catch(console.error);