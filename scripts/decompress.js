const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');

const gunzip = promisify(zlib.gunzip);

const filesToDecompress = [
  'test/libs/proving-keys/check_nullifier_value_batch.zkey.gz',
  'test/libs/proving-keys/anon_nullifier_batch.zkey.gz',
  'test/libs/proving-keys/anon_enc_nullifier_kyc_batch.zkey.gz',
  'test/libs/proving-keys/anon_enc_nullifier_kyc_batch.r1cs.gz',
  'test/libs/proving-keys/anon_enc_nullifier_batch.zkey.gz',
  'test/libs/proving-keys/anon_nullifier_kyc_batch.zkey.gz',
  'test/libs/proving-keys/anon_enc_nullifier_non_repudiation_batch.zkey.gz'
];

async function decompressFiles() {
  for (const file of filesToDecompress) {
    const filePath = path.resolve(__dirname, '..', file);
    const decompressedFilePath = filePath.replace('.gz', '');

    // Skip if already decompressed
    if (fs.existsSync(decompressedFilePath)) {
      console.log(`Already decompressed: ${file}`);
      continue;
    }

    try {
      const compressedData = await fs.promises.readFile(filePath);
      const decompressedData = await gunzip(compressedData);
      await fs.promises.writeFile(decompressedFilePath, decompressedData);
      console.log(`Decompressed: ${file}`);
    } catch (error) {
      console.error(`Error decompressing ${file}:`, error);
      throw error;
    }
  }
}

module.exports = { decompressFiles };