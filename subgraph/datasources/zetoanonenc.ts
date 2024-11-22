import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  OwnershipTransferred,
  Initialized,
  Upgraded,
  UTXOMint,
  UTXOTransferWithEncryptedValues,
} from "../../generated/schema";
import {
  UTXOMint as UTXOMintEvent,
  UTXOTransferWithEncryptedValues as UTXOTransferWithEncryptedValuesEvent,
  Upgraded as UpgradedEvent,
  Initialized as InitializedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
} from "../../generated/ZetoAnonEncContract/Zeto_AnonEnc";

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  const entity = new OwnershipTransferred(event.transaction.hash.toHex());
  entity.previousOwner = event.params.previousOwner;
  entity.newOwner = event.params.newOwner;
  entity.timestamp = event.block.timestamp;
  entity.save();
}

export function handleInitialized(event: InitializedEvent): void {
  const entity = new Initialized(event.transaction.hash.toHex());
  entity.version = event.params.version;
  entity.timestamp = event.block.timestamp;
  entity.save();
}

export function handleUpgraded(event: UpgradedEvent): void {
  const entity = new Upgraded(event.transaction.hash.toHex());
  entity.implementation = event.params.implementation;
  entity.timestamp = event.block.timestamp;
  entity.save();
}

export function handleUTXOTransferWithEncryptedValues(
  event: UTXOTransferWithEncryptedValuesEvent
): void {
  const transfer = new UTXOTransferWithEncryptedValues(
    event.transaction.hash.toHex()
  );
  transfer.inputs = event.params.inputs.map<BigInt>((input) => input);
  transfer.outputs = event.params.outputs.map<BigInt>((output) => output);
  transfer.encryptionNonce = event.params.encryptionNonce;
  transfer.ecdhPublicKeyX = event.params.ecdhPublicKey[0];
  transfer.ecdhPublicKeyY = event.params.ecdhPublicKey[1];
  transfer.encryptedValues = event.params.encryptedValues.map<BigInt>(
    (value) => value
  );
  transfer.submitter = event.params.submitter;
  transfer.data = event.params.data;
  transfer.timestamp = event.block.timestamp;
  transfer.save();
}

export function handleUTXOMint(event: UTXOMintEvent): void {
  const mint = new UTXOMint(event.transaction.hash.toHex());
  mint.outputs = event.params.outputs.map<BigInt>((output) => output);
  mint.submitter = event.params.submitter;
  mint.data = event.params.data;
  mint.timestamp = event.block.timestamp;
  mint.save();
}
