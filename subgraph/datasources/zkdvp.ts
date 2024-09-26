import { Address } from '@graphprotocol/graph-ts';
import { Trade, zkDvPContract } from '../../generated/schema';
import { fetchAccount } from '../fetch/account';

export function fetchZkDvP(address: Address): zkDvPContract {
  const account = fetchAccount(address);
  let contract = zkDvPContract.load(account.id.toHex());
  // trade id TBD
  const trade = new Trade("0");
  if (contract == null) {
    contract = new zkDvPContract(account.id.toHex());
    contract.asTrade = trade.id;

    contract.save();
  }

  return contract as zkDvPContract;
}