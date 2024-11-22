const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const filesToCompress = [
  'test/libs/proving-keys/check_nullifier_value_batch.zkey',
  'test/libs/proving-keys/anon_nullifier_batch.zkey',
  'test/libs/proving-keys/anon_enc_nullifier_kyc_batch.zkey',
  'test/libs/proving-keys/anon_enc_nullifier_kyc_batch.r1cs',
  'test/libs/proving-keys/anon_enc_nullifier_batch.zkey',
  'test/libs/proving-keys/anon_nullifier_kyc_batch.zkey',
  'test/libs/proving-keys/anon_enc_nullifier_non_repudiation_batch.zkey'
];

filesToCompress.forEach(file => {
  const filePath = path.resolve(__dirname, '..', file);
  const compressedFilePath = `${filePath}.gz`;

  if (fs.existsSync(filePath)) {
    const readStream = fs.createReadStream(filePath);
    const writeStream = fs.createWriteStream(compressedFilePath);
    const gzip = zlib.createGzip();

    readStream.pipe(gzip).pipe(writeStream).on('finish', () => {
      console.log(`Compressed: ${file}`);
    });
  } else {
    console.error(`File not found: ${filePath}`);
  }
});