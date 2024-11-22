const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const circuitsMap = require("../../circuitsMap");

const BASE_DIR = path.join(__dirname, "..", "..", "..");
const POT_DIR = path.join(BASE_DIR, "scripts", "powers_of_tau");
const PHASE2_DIR = path.join(POT_DIR, "circuit-specific-output");

async function main() {
  const ptauFile = process.argv[2];
  const tokenName = process.argv[3];
  
  if (!ptauFile || !tokenName) {
    console.error("Usage: node initPhase2.js <ptauFile> <tokenName>");
    process.exit(1);
  }

  // Create circuit-specific-output directory if it doesn't exist
  if (!fs.existsSync(PHASE2_DIR)) {
    fs.mkdirSync(PHASE2_DIR, { recursive: true });
  }

  const circuits = circuitsMap[tokenName];
  
  for (const circuit of circuits) {
    const circuitDir = path.join(PHASE2_DIR, circuit);
    if (!fs.existsSync(circuitDir)) {
      fs.mkdirSync(circuitDir, { recursive: true });
    }

    console.log(`\nInitializing Phase 2 for circuit: ${circuit}`);
    
    const r1csPath = path.join(BASE_DIR, "test", "libs", "proving-keys", `${circuit}.r1cs`);
    const zkey0Path = path.join(circuitDir, `${circuit}_0000.zkey`);
    
    execSync(`npx snarkjs groth16 setup ${r1csPath} ${ptauFile} ${zkey0Path}`, { stdio: "inherit" });
    
    const setupInfo = {
      circuit,
      initialZkey: zkey0Path,
      ptauFile,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(circuitDir, "setup_info.json"), 
      JSON.stringify(setupInfo, null, 2)
    );
    
    console.log(`
✅ Phase 2 initialized for ${circuit}!

Files generated:
1. Initial zkey: ${zkey0Path}
2. Setup info: ${path.join(circuitDir, "setup_info.json")}

Next steps:
1. Share ${circuit}_0000.zkey with first contributor
2. They should run: node phase2/contribute.js ${circuit} ${circuit}_0000.zkey ${circuit}_0001.zkey
3. Each contributor repeats with incrementing numbers
    `);
  }
}

main().catch(console.error);