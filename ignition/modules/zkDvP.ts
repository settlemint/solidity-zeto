import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ZkDvPModule", (m) => {
  const paymentToken = m.getParameter("paymentToken");
  const assetToken = m.getParameter("assetToken");
  
  const zkDvP = m.contract("zkDvP", [paymentToken, assetToken]);
  return { zkDvP };
});
