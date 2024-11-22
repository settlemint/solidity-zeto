const path = require("path");
const { readFileSync } = require("fs");

function provingKeysRoot() {
  const provingKeysRoot = path.resolve(__dirname, '../../../../test/libs/proving-keys');
  console.log('provingKeysRoot', provingKeysRoot);
  return provingKeysRoot;
}
function loadProvingKeys(type) {
  const provingKeyFile = path.join(provingKeysRoot(), `${type}.zkey`);
  const verificationKey = JSON.parse(
    readFileSync(path.join(provingKeysRoot(), `${type}-vkey.json`), "utf8")
  );
  return {
    provingKeyFile,
    verificationKey,
  };
}

module.exports = { loadProvingKeys };
