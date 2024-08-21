import { events, transactions } from "@amxx/graphprotocol-utils";
import { Bytes } from "@graphprotocol/graph-ts";
import {
    TradeInitiated as TradeInitiatedEvent,
} from "../../generated/zkdvp/zkDvP";
import { TradeInitiated } from "../../generated/schema";
import { fetchZkDvP } from "../fetch/zkdvp";

export function handleTradeInitiated(event: TradeInitiatedEvent): void {
  const contract = fetchZkDvP(event.address);

  const ev = new TradeInitiated(events.id(event));
  ev.emitter = contract.id;
  ev.transaction = transactions.log(event).id;
  ev.timestamp = event.block.timestamp;

  ev.contract = contract.id;
  ev.save();

  contract.save();
}
