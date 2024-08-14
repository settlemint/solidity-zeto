import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const zkDvPModule = buildModule("zkDvPModule", (m) => {
  const dvp = m.contract("zkDvP", ["0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"]);

  return { dvp };
});

export default zkDvPModule;
