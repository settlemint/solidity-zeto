import {
    Initialized as InitializedEvent,
    OwnershipTransferred as OwnershipTransferredEvent,
    Upgraded as UpgradedEvent,
    UTXOMint as UTXOMintEvent,
    UTXOTransferNonRepudiation as UTXOTransferNonRepudiationEvent,
  } from "../../generated/ZetoAnonEncNonRepudiationContract/Zeto_AnonEncNullifierNonRepudiation";
  import {
    Initialized,
    OwnershipTransferred,
    Upgraded,
    UTXOMint,
    UTXOTransferNonRepudiation,
  } from "../../generated/schema";
  
  export function handleUTXOTransferNonRepudiation(
    event: UTXOTransferNonRepudiationEvent
  ): void {
    let id = event.transaction.hash.toHex();
    let entity = new UTXOTransferNonRepudiation(id);
  
    entity.inputs = event.params.inputs;
    entity.outputs = event.params.outputs;
    entity.encryptionNonce = event.params.encryptionNonce;
    entity.ecdhPublicKey = event.params.ecdhPublicKey;
    entity.encryptedValuesForReceiver = event.params.encryptedValuesForReceiver;
    entity.encryptedValuesForAuthority = event.params.encryptedValuesForAuthority;
    entity.submitter = event.params.submitter;
    entity.data = event.params.data;
  
    entity.save();
  }
  
  export function handleUTXOMint(event: UTXOMintEvent): void {
    let id = event.transaction.hash.toHex();
    let entity = new UTXOMint(id);
  
    entity.outputs = event.params.outputs;
    entity.submitter = event.params.submitter;
    entity.data = event.params.data;
  
    entity.save();
  }
  
  export function handleOwnershipTransferred(
    event: OwnershipTransferredEvent
  ): void {
    let id = event.transaction.hash.toHex();
    let entity = new OwnershipTransferred(id);
  
    entity.previousOwner = event.params.previousOwner;
    entity.newOwner = event.params.newOwner;
  
    entity.save();
  }
  
  export function handleUpgraded(event: UpgradedEvent): void {
    let id = event.transaction.hash.toHex();
    let entity = new Upgraded(id);
  
    entity.implementation = event.params.implementation;
  
    entity.save();
  }
  
  export function handleInitialized(event: InitializedEvent): void {
    let id = event.transaction.hash.toHex();
    let entity = new Initialized(id);
  
    entity.version = event.params.version;
  
    entity.save();
  }
  