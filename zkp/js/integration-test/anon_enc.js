// Copyright © 2024 Kaleido, Inc.
//
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const { expect } = require("chai");
const { groth16 } = require("snarkjs");
const {
  genRandomSalt,
  genKeypair,
  formatPrivKeyForBabyJub,
  stringifyBigInts,
} = require("maci-crypto");
const {
  Poseidon,
  newSalt,
  loadCircuit,
  newEncryptionNonce,
} = require("../index.js");
const { loadProvingKeys } = require("./utils.js");

const ZERO_PUBKEY = [0, 0];
const poseidonHash = Poseidon.poseidon4;

describe("main circuit tests for Zeto fungible tokens with anonymity with encryption", () => {
  let circuit, provingKeyFile, verificationKey;

  const sender = {};
  const receiver = {};

  before(async () => {
    circuit = await loadCircuit("anon_enc");
    ({ provingKeyFile, verificationKey } = loadProvingKeys("anon_enc"));

    let keypair = genKeypair();
    sender.privKey = keypair.privKey;
    sender.pubKey = keypair.pubKey;

    keypair = genKeypair();
    receiver.privKey = keypair.privKey;
    receiver.pubKey = keypair.pubKey;
  });

  it("should generate a valid proof that can be verified successfully and fail when public signals are tampered", async () => {
    const inputValues = [115, 0];
    const outputValues = [115, 0];
    // create two input UTXOs, each has their own salt, but same owner
    const salt1 = newSalt();
    const input1 = poseidonHash([
      BigInt(inputValues[0]),
      salt1,
      ...sender.pubKey,
    ]);
    const inputCommitments = [input1, 0];

    // create two output UTXOs, they share the same salt, and different owner
    const salt3 = newSalt();
    const output1 = poseidonHash([
      BigInt(outputValues[0]),
      salt3,
      ...receiver.pubKey,
    ]);
    const outputCommitments = [output1, 0];

    const encryptionNonce = newEncryptionNonce();
    const ephemeralKeypair = genKeypair();
    const encryptInputs = stringifyBigInts({
      encryptionNonce,
      ecdhPrivateKey: formatPrivKeyForBabyJub(ephemeralKeypair.privKey),
    });

    const startTime = Date.now();
    const witness = await circuit.calculateWTNSBin(
      {
        inputCommitments,
        inputValues,
        inputSalts: [salt1, 0],
        inputOwnerPrivateKey: formatPrivKeyForBabyJub(sender.privKey),
        outputCommitments,
        outputValues,
        outputSalts: [salt3, 0],
        outputOwnerPublicKeys: [receiver.pubKey, ZERO_PUBKEY],
        ...encryptInputs,
      },
      true,
    );

    const { proof, publicSignals } = await groth16.prove(
      provingKeyFile,
      witness,
    );
    console.log("Proving time: ", (Date.now() - startTime) / 1000, "s");

    let verifyResult = await groth16.verify(
      verificationKey,
      publicSignals,
      proof,
    );
    expect(verifyResult).to.be.true;
    // console.log('inputCommitments', inputCommitments);
    // console.log('outputCommitments', outputCommitments);
    // console.log('senderPublicKey', sender.pubKey);
    // console.log('receiverPublicKey', receiver.pubKey);
    // console.log('encryptionNonce', encryptionNonce);
    // console.log("publicSignals", publicSignals);
    const tamperedOutputHash = poseidonHash([
      BigInt(100),
      salt3,
      ...receiver.pubKey,
    ]);
    let tamperedPublicSignals = publicSignals.map((ps) =>
      ps.toString() === outputCommitments[0].toString()
        ? tamperedOutputHash
        : ps,
    );
    // console.log("tampered public signals", tamperedPublicSignals);

    verifyResult = await groth16.verify(
      verificationKey,
      tamperedPublicSignals,
      proof,
    );
    expect(verifyResult).to.be.false;
  }).timeout(60000);
});
