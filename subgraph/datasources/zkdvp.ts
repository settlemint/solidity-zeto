import { BigInt } from "@graphprotocol/graph-ts";
import {
  TradeAccepted,
  TradeCompleted,
  TradeInitiated,
} from "../../generated/schema";
import {
  TradeAccepted as TradeAcceptedEvent,
  TradeCompleted as TradeCompletedEvent,
  TradeInitiated as TradeInitiatedEvent,
} from "../../generated/zkDvPContract/zkDvP";

// Handle TradeInitiated
export function handleTradeInitiated(event: TradeInitiatedEvent): void {
  const trade = new TradeInitiated(event.transaction.hash.toHex());
  trade.tradeId = event.params.tradeId;
  trade.status = event.params.trade.status; 
  trade.paymentCounterparty = event.params.trade.paymentCounterparty;
  trade.paymentInputs = event.params.trade.paymentInputs.map<BigInt>(
    (input) => input as BigInt
  ); // Correct .map syntax
  trade.paymentOutputs = event.params.trade.paymentOutputs.map<BigInt>(
    (output) => output as BigInt
  );
  trade.paymentProofHash = event.params.trade.paymentProofHash;
  trade.assetCounterparty = event.params.trade.assetCounterparty;
  trade.assetInput = event.params.trade.assetInput;
  trade.assetOutput = event.params.trade.assetOutput;
  trade.assetProofHash = event.params.trade.assetProofHash;
  trade.timestamp = event.block.timestamp;
  trade.save();
}

// Handle TradeAccepted
export function handleTradeAccepted(event: TradeAcceptedEvent): void {
  const trade = new TradeAccepted(event.transaction.hash.toHex());
  trade.tradeId = event.params.tradeId;
  trade.status = event.params.trade.status;
  trade.paymentCounterparty = event.params.trade.paymentCounterparty;
  trade.paymentInputs = event.params.trade.paymentInputs.map<BigInt>(
    (input) => input as BigInt
  );
  trade.paymentOutputs = event.params.trade.paymentOutputs.map<BigInt>(
    (output) => output as BigInt
  );
  trade.paymentProofHash = event.params.trade.paymentProofHash;
  trade.assetCounterparty = event.params.trade.assetCounterparty;
  trade.assetInput = event.params.trade.assetInput;
  trade.assetOutput = event.params.trade.assetOutput;
  trade.assetProofHash = event.params.trade.assetProofHash;
  trade.timestamp = event.block.timestamp;
  trade.save();
}

// Handle TradeCompleted
export function handleTradeCompleted(event: TradeCompletedEvent): void {
  const trade = new TradeCompleted(event.transaction.hash.toHex());
  trade.tradeId = event.params.tradeId;
  trade.status = event.params.trade.status;
  trade.paymentCounterparty = event.params.trade.paymentCounterparty;
  trade.paymentInputs = event.params.trade.paymentInputs.map<BigInt>(
    (input) => input as BigInt
  );
  trade.paymentOutputs = event.params.trade.paymentOutputs.map<BigInt>(
    (output) => output as BigInt
  );
  trade.paymentProofHash = event.params.trade.paymentProofHash;
  trade.assetCounterparty = event.params.trade.assetCounterparty;
  trade.assetInput = event.params.trade.assetInput;
  trade.assetOutput = event.params.trade.assetOutput;
  trade.assetProofHash = event.params.trade.assetProofHash;
  trade.timestamp = event.block.timestamp;
  trade.save();
}
