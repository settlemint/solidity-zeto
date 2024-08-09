import { Address, BigInt } from '@graphprotocol/graph-ts';
import { ZkDvPContract } from '../../generated/schema';
import { fetchAccount } from './account';

export function fetchZkDvP(address: Address): ZkDvPContract {
  const account = fetchAccount(address);
  let contract = ZkDvPContract.load(account.id.toHex());

  if (contract == null) {
    contract = new ZkDvPContract(account.id.toHex());
    contract.asAccount = account.id;
    account.asCounter = contract.id;
    

    contract.save();
    account.save();
  }

  return contract as ZkDvPContract;
}
