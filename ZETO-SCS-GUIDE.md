# Guide to Deploying Zeto Tokens, ZkDvP and Verifiers

This guide will help you deploy Zeto tokens and their corresponding verifiers in both **TEST** and **PRODUCTION** modes. We'll walk you through the steps required, explain what each script does, and provide a simple overview of the zkSNARK components involved.

---

## Introduction

Zeto is a set of smart contracts that enable anonymous transactions using zero-knowledge proofs (zkSNARKs). Depending on your environment (TEST or PRODUCTION), the deployment process varies slightly. This guide will help you navigate both scenarios.

---

## Available Tokens

Below is a list of available Zeto tokens, their types, circuit powers, and descriptions:

| Token Name               | Type         | Power | Description                            |
|--------------------------|--------------|-------|----------------------------------------|
| **Zeto_Anon**            | Fungible     | 12    | Basic anonymous transfers              |
| **Zeto_AnonEnc**         | Fungible     | 14    | Encrypted anonymous transfers          |
| **Zeto_AnonNullifier**   | Fungible     | 16    | Anonymous with nullifiers              |
| **Zeto_AnonNullifierKyc**| Fungible     | 16    | KYC-enabled anonymous transfers        |
| **Zeto_AnonEncNullifier**| Fungible     | 16    | Encrypted transfers with nullifiers    |
| **Zeto_AnonEncNullifierKyc**| Fungible | 16    | KYC-enabled encrypted transfers        |
| **Zeto_NfAnon**          | Non-Fungible | 11    | Anonymous NFTs                         |
| **Zeto_NfAnonNullifier** | Non-Fungible | 15    | NFTs with nullifiers                   |

---

## TEST Mode Deployment

In TEST mode, all necessary zkSNARK components (Powers of Tau, zKeys, etc.) are pre-generated. This allows for quick deployment without running the trusted setup.

### Deploying Tokens

To deploy a token in TEST mode, use the following Hardhat task:

```bash
npx hardhat deploy-upgradeable <TokenName>
```

**Example:**

```bash
npx hardhat deploy-upgradeable Zeto_Anon
```

This command will:
- Deploy the specified Zeto token contract.
- Deploy the corresponding verifiers.
- Set up the necessary configurations.

### Deploying ZKDVP Contract

To deploy the ZKDVP (Zero-Knowledge Decentralized Value Protocol) contract, run:

```bash
npx hardhat deploy-zkdvp
```

Before running this command, ensure that the deployment script `deploy-zkdvp.ts` includes the tokens you wish to deploy. Edit the script to include the following lines or adjust as needed:

```javascript
const [deployer] = await ethers.getSigners();

const { zeto: paymentToken } = await deployFungible(hre, "Zeto_Anon");
const { zeto: assetToken } = await deployNonFungible(hre, "Zeto_NfAnon");
```

---

## PRODUCTION Mode Setup

In PRODUCTION mode, you need to perform a trusted setup using the scripts provided in the `scripts/powers_of_tau` directory. This ensures maximum security for real-world deployments.

### Trusted Setup

The trusted setup is now managed through the `powers_of_tau` directory, which contains scripts for both the coordinator and contributors. Follow the guide within this directory to conduct the setup.

### Local Setup with `generateLocalSetup.js`

For local testing and development, you can generate a new setup using:

```bash
node scripts/generateLocalSetup.js <TokenName> [power]
```

**Example:**

```bash
node scripts/generateLocalSetup.js Zeto_Anon 12
```

This script will:
- Generate Powers of Tau parameters locally.
- Create circuit-specific setups.
- Produce verifier contracts.
- Set up prover and verifier files.

### Deploying Tokens in PRODUCTION Mode

After completing the trusted setup, deploy the tokens using the same Hardhat task:

```bash
npx hardhat deploy-upgradeable <TokenName>
```

**Example:**

```bash
npx hardhat deploy-upgradeable Zeto_Anon
```

This will deploy the token contract along with the newly generated verifiers.

---

## Understanding zkSNARK Components

### Powers of Tau (PoT)

The Powers of Tau ceremony is a multi-party computation protocol that generates initial zkSNARK parameters in a trustless manner. It produces a `*.ptau` file, which serves as a starting point for circuit-specific setups.

### Zero-Knowledge Keys (zKeys)

- **Proving Key (`proving_key.zkey`)**: Used by the prover to generate zkSNARK proofs.
- **Verification Key (`verification_key.json`)**: Used by the verifier (smart contract) to verify proofs.

### Verifiers

Verifier contracts (`verifier_*.sol`) are Solidity contracts that contain the logic to verify zkSNARK proofs on-chain. Each circuit has its own verifier contract.

### Prover Libraries

JavaScript libraries (`generateProof.js`, `verifyProof.js`) are generated to facilitate proof generation and verification off-chain. These are useful for interacting with the zkSNARK circuits programmatically.

---

# Zeto zkDVP Subgraph: Contract Events & Schema Documentation

## 1. Zeto_Anon
**Contract**: `zeto_anon.sol`
**Datasource**: `zetoanon.yaml`
**Handler**: `zetoanon.ts`
**Schema**: `zetoanon.gql.json`
**Events**:
- UTXOTransfer(uint256[],uint256[],indexed address,bytes)
- UTXOMint(uint256[],indexed address,bytes)
- OwnershipTransferred(indexed address,indexed address)

## 2. Zeto_AnonEnc
**Contract**: `zeto_anon_enc.sol`
**Datasource**: `zetoanonenc.yaml`
**Handler**: `zetoanonenc.ts`
**Schema**: `zetoanonenc.gql.json`
**Events**:
- UTXOTransferWithEncryptedValues(uint256[],uint256[],uint256,uint256[2],uint256[],indexed address,bytes)
- UTXOMint(uint256[],indexed address,bytes)
- Upgraded(indexed address)
- Initialized(uint64)
- OwnershipTransferred(indexed address,indexed address)

## 3. Zeto_AnonEncNullifierNonRepudiation
**Contract**: `zeto_anon_enc_nullifier_non_repudiation.sol`
**Datasource**: `zetoAnonEncNonRepudiation.yaml`
**Handler**: `zetoAnonEncNonRepudiation.ts`
**Schema**: `zetoAnonEncNonRepudiation.gql.json`
**Events**:
- UTXOTransferNonRepudiation(uint256[],uint256[],uint256,uint256[2],uint256[],uint256[],indexed address,bytes)
- UTXOMint(uint256[],indexed address,bytes)
- Upgraded(indexed address)
- Initialized(uint64)
- OwnershipTransferred(indexed address,indexed address)

## 4. Zeto_AnonEncNullifier
**Contract**: `zeto_anon_enc_nullifier.sol`
**Uses**: `zetoanonenc.yaml` schema and handlers
**Events**: Same as Zeto_AnonEnc
- UTXOTransferWithEncryptedValues
- UTXOMint
- Upgraded
- Initialized
- OwnershipTransferred

## 5. Zeto_AnonEncNullifierKyc
**Contract**: `zeto_anon_enc_nullifier_kyc.sol`
**Uses**: `zetoanonenc.yaml` schema and handlers
**Events**: Same as Zeto_AnonEnc
- UTXOTransferWithEncryptedValues
- UTXOMint
- Upgraded
- Initialized
- OwnershipTransferred

## 6. Zeto_AnonNullifier
**Contract**: `zeto_anon_nullifier.sol`
**Uses**: `zetoanon.yaml` schema and handlers
**Events**: Same as Zeto_Anon
- UTXOTransfer
- UTXOMint
- OwnershipTransferred

## 7. Zeto_AnonNullifierKyc
**Contract**: `zeto_anon_nullifier_kyc.sol`
**Uses**: `zetoanon.yaml` schema and handlers
**Events**: Same as Zeto_Anon
- UTXOTransfer
- UTXOMint
- OwnershipTransferred

## 8. Zeto_NfAnon
**Contract**: `zeto_nf_anon.sol`
**Uses**: `zetoanon.yaml` schema and handlers
**Events**: Same as Zeto_Anon
- UTXOTransfer
- UTXOMint
- OwnershipTransferred

## 9. Zeto_NfAnonNullifier
**Contract**: `zeto_nf_anon_nullifier.sol`
**Uses**: `zetoanon.yaml` schema and handlers
**Events**: Same as Zeto_Anon
- UTXOTransfer
- UTXOMint
- OwnershipTransferred
```

This updated guide reflects the changes in your setup process, emphasizing the use of the `powers_of_tau` directory for the trusted setup and the role of `generateLocalSetup.js` for local testing.