import { Address, BigInt } from '@graphprotocol/graph-ts';
import { CounterContract } from '../../generated/schema';
import { fetchAccount } from './account';

export function fetchCounter(address: Address): CounterContract {
  const account = fetchAccount(address);
  let contract = CounterContract.load(account.id.toHex());

  if (contract == null) {
    contract = new CounterContract(account.id.toHex());
    contract.asAccount = account.id;
    account.asCounter = contract.id;
    contract.currentValue = BigInt.fromString('0');

    contract.save();
    account.save();
  }

  return contract as CounterContract;
}
