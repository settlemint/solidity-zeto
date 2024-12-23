# Zero-Knowledge Trusted Setup Ceremony Guide

## Overview

This guide covers both local development setup and production-grade trusted setup ceremonies for zk-SNARK parameter generation.

## Quick Start

### Local Development Setup

For local testing and development, use the automated setup script:

```bash
node scripts/generateLocalSetup.js <TokenName> [power]

# Example:
node scripts/generateLocalSetup.js Zeto_Anon 18
```

### Production Ceremony

For production deployments, follow the multi-participant ceremony process below.

## Directory Structure

```bash
scripts/
├── powers_of_tau/
│   ├── universal-ceremony/        # Phase 1 scripts
│   │   ├── initCeremony.js
│   │   ├── contribute.js
│   │   ├── verifyContribution.js
│   │   └── finalizeCeremony.js
│   ├── circuit-specific/          # Phase 2 scripts
│   │   ├── initPhase2.js
│   │   ├── contribute.js
│   │   ├── verifyPhase2.js
│   │   └── finalizePhase2.js
│   ├── universal-ceremony-output/ # Phase 1 generated files
│   ├── circuit-specific-output/   # Phase 2 generated files
│   └── final_setup/              # Final PTAU files
└── circuitsMap.js                # Circuit configuration
```

## Circuit Configuration

Before starting the ceremony, ensure your circuits are properly configured in `scripts/circuitsMap.js`:

```javascript
{
  "Zeto_Anon": [
    "anon",
    "anon_batch",
    "check_hashes_value",
    "check_inputs_outputs_value",
    "check_inputs_outputs_value_batch"
  ]
}
```
 
## Phase 1: Powers of Tau

### 1. Coordinator Initialization

```bash
cd scripts/powers_of_tau/universal-ceremony
node initCeremony.js 18
```

This creates `universal-ceremony-output/ceremony_0.ptau`.

### 2. Participant Contributions

Each participant:

1. Receives: `ceremony_N.ptau`
2. Runs:
```bash
node contribute.js
```
3. Returns:
   - `ceremony_N+1.ptau`
   - `ceremony_N+1_info.json`

The script automatically:
- Detects the latest .ptau file
- Generates secure entropy
- Creates contribution info file
- Performs local verification

### 3. Coordinator Verification

After each contribution:

```bash
node verifyContribution.js ceremony_N+1.ptau
```

### 4. Phase 1 Finalization

```bash
node finalizeCeremony.js ceremony_final.ptau 18
```

Generates: `final_setup/powersOfTau18_final.ptau`

## Phase 2: Circuit-Specific Setup

### 1. Initialize Circuits

```bash
cd scripts/powers_of_tau/circuit-specific
node initPhase2.js ../final_setup/powersOfTau18_final.ptau Zeto_Anon
```

This initializes all circuits defined in circuitsMap.js for the specified token.

### 2. Circuit Contributions

Each participant:

```bash
node contribute.js Zeto_Anon
```

This automatically:
- Contributes to all circuits for the token
- Generates contribution info
- Performs verification

### 3. Finalize Circuits

For each circuit:

```bash
node finalizePhase2.js <circuit> <latestZkeyFile>
```

Generates:
- Final .zkey file
- Verification key
- Solidity verifier contract

## Security Requirements

### Phase 1
- Power of Tau: 18 for production
- Minimum Contributors: 3-5 independent participants
- Machine Requirements: Different machines for each contribution
- Entropy: Secure, independent entropy sources
- Verification: All contribution hashes must be verified
- Random Beacon: Applied during finalization

### Phase 2
- Contributors: Minimum 3 per circuit
- Entropy: Independent entropy per contribution
- Verification: Required between transfers
- File Security: Secure methods for file transfers
- Audit Trail: Complete log of all actions

## Production Checklist

- [ ] Phase 1: Minimum 3-5 contributors completed
- [ ] Phase 2: Minimum 3 contributors per circuit completed
- [ ] All contributions verified
- [ ] Random beacon applied during finalization
- [ ] Verifier contracts generated
- [ ] All hashes and steps documented
- [ ] All artifacts securely backed up
- [ ] Ceremony logs secured

## File Transfer Security

### Secure Transfer Methods
1. SFTP/SCP for direct file transfers
2. End-to-end encrypted messaging (Signal/WhatsApp)
3. PGP-encrypted email attachments
4. Private cloud storage with access controls

### Transfer Verification
1. Compare file hashes before and after transfer
2. Verify contribution immediately after receipt
3. Document all transfer timestamps and methods
4. Keep logs of all verifications

## Common Issues and Solutions


### Issue: Verification Failure
1. Ensure file wasn't corrupted during transfer
2. Verify using:
```bash
node verifyContribution.js <ptauFile>
```
