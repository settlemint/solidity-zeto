import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { UTXOMint, UTXOTransfer, OwnershipTransferred } from "../../generated/schema";
import {
  UTXOMint as UTXOMintEvent,
  UTXOTransfer as UTXOTransferEvent,
  OwnershipTransferred as OwnershipTransferredEvent
} from "../../generated/ZetoAnonContract/ZetoAnon";

// Handle UTXOTransfer
export function handleUTXOTransfer(event: UTXOTransferEvent): void {
  const transfer = new UTXOTransfer(event.transaction.hash.toHex());
  transfer.inputs = event.params.inputs.map<BigInt>((input) =>
    BigInt.fromUnsignedBytes(Bytes.fromUint8Array(input))
  );
  transfer.outputs = event.params.outputs.map<BigInt>((output) =>
    BigInt.fromUnsignedBytes(Bytes.fromUint8Array(output))
  );
  transfer.sender = event.params.submitter;
  transfer.data = event.params.data;
  transfer.timestamp = event.block.timestamp;
  transfer.save();
}

// Handle UTXOMint
export function handleUTXOMint(event: UTXOMintEvent): void {
  const mint = new UTXOMint(event.transaction.hash.toHex());

  // Map outputs as BigInt array
  mint.outputs = event.params.outputs.map<BigInt>((output) =>
    BigInt.fromUnsignedBytes(Bytes.fromUint8Array(output))
  );
  mint.submitter = event.params.submitter;
  mint.data = event.params.data;
  mint.timestamp = event.block.timestamp;

  mint.save();
}

// Handle OwnershipTransferred
export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {
  const transfer = new OwnershipTransferred(event.transaction.hash.toHex());
  transfer.previousOwner = event.params.previousOwner;
  transfer.newOwner = event.params.newOwner;
  transfer.timestamp = event.block.timestamp;
  transfer.save();
}
