// Copyright © 2024 Kaleido, Inc.
//
// SPDX-License-Identifier: Apache-2.0

import { ethers } from "hardhat";
import { BigNumberish } from "ethers";
// @ts-ignore
const { groth16 } = require("snarkjs");
// @ts-ignore
const { loadCircuit, encodeProof, Poseidon } = require("zeto-js");
// @ts-ignore
const { formatPrivKeyForBabyJub, stringifyBigInts } = require("maci-crypto");

import {
  User,
  UTXO,
  newUser,
  newUTXO,
  parseUTXOEvents,
  ZERO_UTXO,
} from "../test/lib/utils";
import {
  loadProvingKeys,
  prepareDepositProof,
  prepareWithdrawProof,
} from "../test/utils";

const poseidonHash = Poseidon.poseidon4;
const ZERO_PUBKEY = [0, 0];

export async function zetoAnonCryptoDemo() {
  console.log("🚀 ZETO ANONYMOUS CRYPTOCURRENCY DEMO");
  console.log("=====================================");
  
  // Connect to deployed contracts on Besu
  const ZETO_ADDRESS = "0x59b1A582582C7dB02e7Ca0cBCefAaB76b715c005";
  const ERC20_ADDRESS = "0x0447c87eCa3440cdf28884b6FE6E829F3CaF7c3a";
  
  const [deployer] = await ethers.getSigners();
  
  // Create additional signers with random private keys
  const alice_wallet = ethers.Wallet.createRandom();
  const bob_wallet = ethers.Wallet.createRandom();
  
  // Connect wallets to the network provider
  const alice_signer = alice_wallet.connect(ethers.provider);
  const bob_signer = bob_wallet.connect(ethers.provider);
  
  console.log("\n📋 ACCOUNT INFORMATION");
  console.log("======================");
  console.log(`Deployer: ${await deployer.getAddress()}`);
  console.log(`Alice: ${alice_signer.address}`);
  console.log(`Bob: ${bob_signer.address}`);
  console.log("✅ Using 0 gas price network - no funding needed");
  
  // Initialize cryptographic identities
  console.log("\n🔐 STEP 1: CRYPTOGRAPHIC IDENTITY GENERATION");
  console.log("==============================================");
  
  const Alice = await newUser(alice_signer);
  const Bob = await newUser(bob_signer);
  
  console.log("👩 Alice's Cryptographic Identity:");
  console.log(`   ETH Address: ${Alice.ethAddress}`);
  console.log(`   BabyJub Private Key: ${Alice.babyJubPrivateKey.toString()}`);
  console.log(`   BabyJub Public Key: [${Alice.babyJubPublicKey[0]}, ${Alice.babyJubPublicKey[1]}]`);
  
  console.log("\n👨 Bob's Cryptographic Identity:");
  console.log(`   ETH Address: ${Bob.ethAddress}`);
  console.log(`   BabyJub Private Key: ${Bob.babyJubPrivateKey.toString()}`);
  console.log(`   BabyJub Public Key: [${Bob.babyJubPublicKey[0]}, ${Bob.babyJubPublicKey[1]}]`);

  // Connect to contracts
  const zeto = await ethers.getContractAt("Zeto_Anon", ZETO_ADDRESS);
  const erc20 = await ethers.getContractAt("SampleERC20", ERC20_ADDRESS);

  console.log("\n💰 STEP 2: ERC20 PREPARATION");
  console.log("=============================");
  
  // Mint ERC20 tokens to Alice
  console.log("Minting 1000 ERC20 tokens to Alice...");
  const mintTx = await erc20.connect(deployer).mint(Alice.ethAddress, 1000);
  await mintTx.wait();
  
  const aliceBalance = await erc20.balanceOf(Alice.ethAddress);
  console.log(`✅ Alice's ERC20 balance: ${aliceBalance}`);

  console.log("\n🔒 STEP 3: UTXO CREATION & POSEIDON HASHING");
  console.log("===========================================");
  
  // Create a UTXO for Alice
  const aliceUTXO = newUTXO(500, Alice as any);
  
  console.log("📦 Creating UTXO for Alice:");
  console.log(`   Value: ${aliceUTXO.value}`);
  console.log(`   Salt: ${aliceUTXO.salt}`);
  console.log(`   Owner Public Key: [${Alice.babyJubPublicKey[0]}, ${Alice.babyJubPublicKey[1]}]`);
  
  // Show Poseidon hash calculation
  console.log("\n🧮 POSEIDON HASH CALCULATION:");
  console.log("==============================");
  const calculatedHash = poseidonHash([
    BigInt(aliceUTXO.value!),
    aliceUTXO.salt!,
    Alice.babyJubPublicKey[0],
    Alice.babyJubPublicKey[1],
  ]);
  console.log(`   Poseidon Hash Input: [${aliceUTXO.value}, ${aliceUTXO.salt}, ${Alice.babyJubPublicKey[0]}, ${Alice.babyJubPublicKey[1]}]`);
  console.log(`   Poseidon Hash Output: ${calculatedHash}`);
  console.log(`   UTXO Hash: ${aliceUTXO.hash}`);
  console.log(`   ✅ Hash Verification: ${calculatedHash === aliceUTXO.hash ? "MATCH" : "MISMATCH"}`);

  console.log("\n🔏 STEP 4: ZERO-KNOWLEDGE DEPOSIT PROOF");
  console.log("========================================");
  
  // Approve and prepare deposit
  console.log("Approving ERC20 transfer...");
  const approveTx = await erc20.connect(Alice.signer).approve(zeto.target, 500);
  await approveTx.wait();
  
  console.log("🧠 Generating zero-knowledge proof for deposit...");
  const depositStart = Date.now();
  const { outputCommitments: depositOutputs, encodedProof } = await prepareDepositProof(Alice as any, aliceUTXO);
  const depositTime = Date.now() - depositStart;
  
  console.log(`   ⏱️  Total Proof Generation Time: ${depositTime}ms`);
  console.log(`   📝 Output Commitment: ${depositOutputs[0]}`);
  
  // Handle the encodedProof being undefined
  if (encodedProof) {
    console.log(`   🔐 Encoded Proof Structure: Valid proof object with pA, pB, pC components`);
    console.log(`   🔐 Encoded Proof Preview: pA[0] = ${encodedProof.pA[0].slice(0, 20)}...`);
    
    // Execute deposit
    console.log("\n📥 Executing deposit transaction...");
    const depositTx = await zeto.connect(Alice.signer).deposit(500, depositOutputs[0], encodedProof, "0x");
    const depositReceipt = await depositTx.wait();
    
    console.log(`   ✅ Deposit completed! Gas used: ${depositReceipt?.gasUsed}`);
    console.log(`   📊 Transaction Hash: ${depositReceipt?.hash}`);
    
    console.log("\n🔄 STEP 5: ANONYMOUS TRANSFER WITH ZK-PROOFS");
    console.log("=============================================");
    
    // Continue with the rest of the demo...
  } else {
    console.log("   ❌ Encoded Proof is undefined - skipping deposit transaction");
    console.log("   📊 This might be an issue with the proof encoding function");
    return; // Exit early if we can't proceed
  }

  // Create transfer UTXOs
  const bobUTXO = newUTXO(300, Bob as any);
  const aliceChangeUTXO = newUTXO(200, Alice as any);
  
  console.log("📦 Creating transfer UTXOs:");
  console.log(`   Bob's UTXO: Value=${bobUTXO.value}, Hash=${bobUTXO.hash}`);
  console.log(`   Alice's Change: Value=${aliceChangeUTXO.value}, Hash=${aliceChangeUTXO.hash}`);
  
  // Generate transfer proof
  console.log("\n🧠 Generating zero-knowledge proof for transfer...");
  const transferStart = Date.now();
  
  // Load circuit for proof generation
  const circuit = await loadCircuit("anon");
  const { provingKeyFile } = loadProvingKeys("anon");
  
  const transferProof = await prepareTransferProof(
    circuit,
    provingKeyFile,
    Alice as any,
    [aliceUTXO, ZERO_UTXO],
    [bobUTXO, aliceChangeUTXO],
    [Bob as any, Alice as any]
  );
  
  const transferTime = Date.now() - transferStart;
  console.log(`   ⏱️  Total Transfer Proof Time: ${transferTime}ms`);
  console.log(`   📝 Input Commitments: [${transferProof.inputCommitments.join(', ')}]`);
  console.log(`   📝 Output Commitments: [${transferProof.outputCommitments.join(', ')}]`);
  console.log(`   🔐 Proof Generated: ${transferProof.encodedProof.length} bytes`);
  
  // Execute transfer
  console.log("\n🔄 Executing anonymous transfer...");
  const inputCommitments = transferProof.inputCommitments.filter((ic: any) => ic !== 0n) as BigNumberish[];
  const outputCommitments = transferProof.outputCommitments.filter((oc: any) => oc !== 0n) as BigNumberish[];
  
  const transferTx = await zeto.connect(Alice.signer).transfer(
    inputCommitments,
    outputCommitments,
    transferProof.encodedProof,
    "0x"
  );
  const transferReceipt = await transferTx.wait();
  
  console.log(`   ✅ Transfer completed! Gas used: ${transferReceipt?.gasUsed}`);
  console.log(`   📊 Transaction Hash: ${transferReceipt?.hash}`);
  
  // Parse transfer events
  const events = parseUTXOEvents(zeto, transferReceipt!);
  console.log("\n📋 TRANSFER EVENT ANALYSIS:");
  console.log("============================");
  console.log(`   🔍 UTXOs Created: ${events[0].outputs.length}`);
  events[0].outputs.forEach((output: any, index: number) => {
    if (output !== 0n) {
      console.log(`   UTXO ${index}: ${output}`);
    }
  });

  console.log("\n🔍 STEP 6: UTXO RECONSTRUCTION (Bob's Perspective)");
  console.log("==================================================");
  
  // Bob reconstructs his UTXO
  console.log("👨 Bob reconstructing his UTXO from public transaction data...");
  const receivedValue = 300;
  const receivedSalt = bobUTXO.salt;
  const reconstructedHash = poseidonHash([
    BigInt(receivedValue),
    receivedSalt!,
    Bob.babyJubPublicKey[0],
    Bob.babyJubPublicKey[1],
  ]);
  
  console.log(`   📦 Expected UTXO Hash: ${bobUTXO.hash}`);
  console.log(`   🧮 Reconstructed Hash: ${reconstructedHash}`);
  console.log(`   ✅ Reconstruction: ${reconstructedHash === bobUTXO.hash ? "SUCCESS" : "FAILED"}`);
  
  // Verify on-chain
  const isSpent = await zeto.spent(bobUTXO.hash as BigNumberish);
  console.log(`   🔍 On-chain UTXO Status: ${isSpent ? "SPENT" : "UNSPENT"}`);

  console.log("\n💸 STEP 7: WITHDRAWAL WITH ZK-PROOF");
  console.log("====================================");
  
  // Alice withdraws her remaining UTXO
  console.log("👩 Alice withdrawing her change UTXO back to ERC20...");
  
  const withdrawStart = Date.now();
  const { inputCommitments: withdrawInputs, outputCommitments: withdrawOutputs, encodedProof: withdrawProof } = 
    await prepareWithdrawProof(Alice as any, [aliceChangeUTXO, ZERO_UTXO], ZERO_UTXO);
  const withdrawTime = Date.now() - withdrawStart;
  
  console.log(`   ⏱️  Withdrawal Proof Time: ${withdrawTime}ms`);
  console.log(`   📝 Input Commitments: [${withdrawInputs.join(', ')}]`);
  console.log(`   🔐 Withdrawal Proof: ${withdrawProof.length} bytes`);
  
  // Execute withdrawal
  const withdrawTx = await zeto.connect(Alice.signer).withdraw(
    200, 
    withdrawInputs, 
    withdrawOutputs[0], 
    withdrawProof
  );
  const withdrawReceipt = await withdrawTx.wait();
  
  console.log(`   ✅ Withdrawal completed! Gas used: ${withdrawReceipt?.gasUsed}`);
  
  // Check final balances
  const finalBalance = await erc20.balanceOf(Alice.ethAddress);
  console.log(`   💰 Alice's final ERC20 balance: ${finalBalance}`);

  console.log("\n📊 DEMO SUMMARY");
  console.log("================");
  console.log(`🔐 Total Cryptographic Operations: 4 (Deposit, Transfer, Reconstruction, Withdrawal)`);
  console.log(`⏱️  Total Proof Generation Time: ${depositTime + transferTime + withdrawTime}ms`);
  console.log(`⛽ Total Gas Used: Depends on successful transaction execution`);
  console.log(`🔒 Privacy Achieved: ✅ Anonymous transfers with zero-knowledge proofs`);
  console.log(`🧮 Hash Function: Poseidon (zkSNARK-friendly)`);
  console.log(`📱 Network: Besu (Zero gas cost)`);
  
  console.log("\n🎉 ZETO DEMO COMPLETED SUCCESSFULLY!");
  console.log("=====================================");
}

// Helper function for transfer proof preparation
async function prepareTransferProof(
  circuit: any,
  provingKey: any,
  signer: any,
  inputs: UTXO[],
  outputs: UTXO[],
  owners: any[],
) {
  const inputCommitments: BigNumberish[] = inputs.map((input) => input.hash) as BigNumberish[];
  const inputValues = inputs.map((input) => BigInt(input.value || 0n));
  const inputSalts = inputs.map((input) => input.salt || 0n);
  const outputCommitments: BigNumberish[] = outputs.map((output) => output.hash) as BigNumberish[];
  const outputValues = outputs.map((output) => BigInt(output.value || 0n));
  const outputSalts = outputs.map((o) => o.salt || 0n);
  const outputOwnerPublicKeys: BigNumberish[][] = owners.map(
    (owner) => owner.babyJubPublicKey || ZERO_PUBKEY,
  ) as BigNumberish[][];
  const otherInputs = stringifyBigInts({
    inputOwnerPrivateKey: formatPrivKeyForBabyJub(signer.babyJubPrivateKey),
  });

  const startWitnessCalculation = Date.now();
  const witness = await circuit.calculateWTNSBin(
    {
      inputCommitments,
      inputValues,
      inputSalts,
      outputCommitments,
      outputValues,
      outputSalts,
      outputOwnerPublicKeys,
      ...otherInputs,
    },
    true,
  );
  const timeWitnessCalculation = Date.now() - startWitnessCalculation;

  const startProofGeneration = Date.now();
  const { proof, publicSignals } = (await groth16.prove(
    provingKey,
    witness,
  )) as { proof: BigNumberish[]; publicSignals: BigNumberish[] };
  const timeProofGeneration = Date.now() - startProofGeneration;
  
  console.log(`   Witness calculation time: ${timeWitnessCalculation}ms, Proof generation time: ${timeProofGeneration}ms`);
  
  const encodedProof = encodeProof(proof);
  return {
    inputCommitments,
    outputCommitments,
    encodedProof,
  };
}

// Export for use
export default zetoAnonCryptoDemo;

// Run if called directly
if (require.main === module) {
  zetoAnonCryptoDemo()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}