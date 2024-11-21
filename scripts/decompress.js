const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const filesToDecompress = [
  'test/libs/proving-keys/check_nullifier_value_batch.zkey.gz',
  'test/libs/proving-keys/anon_nullifier_batch.zkey.gz',
  'test/libs/proving-keys/anon_enc_nullifier_kyc_batch.zkey.gz',
  'test/libs/proving-keys/anon_enc_nullifier_kyc_batch.r1cs.gz',
  'test/libs/proving-keys/anon_enc_nullifier_batch.zkey.gz',
  'test/libs/proving-keys/anon_nullifier_kyc_batch.zkey.gz',
  'test/libs/proving-keys/anon_enc_nullifier_non_repudiation_batch.zkey.gz'
];

filesToDecompress.forEach(file => {
  const filePath = path.resolve(__dirname, '..', file);
  const decompressedFilePath = filePath.replace('.gz', '');

  const readStream = fs.createReadStream(filePath);
  const writeStream = fs.createWriteStream(decompressedFilePath);
  const gunzip = zlib.createGunzip();

  readStream.pipe(gunzip).pipe(writeStream).on('finish', () => {
    console.log(`Decompressed: ${file}`);
  });
});