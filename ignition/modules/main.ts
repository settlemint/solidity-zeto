import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import zkDvPModule from "./zkDvP";
//Deploy non upgradable contracts

const ZetoAnonModule = buildModule("Zeto_Anon", (m) => {
  const zetoAnon = m.contract("Zeto_Anon", []);
  return { zetoAnon };
});

const ZetoNfAnonModule = buildModule("Zeto_NfAnon", (m) => {
  const zetoNfAnon = m.contract("Zeto_NfAnon", []);
  return { zetoNfAnon };
});

export default buildModule("MainModule", (m) => {
    const { zetoAnon } = m.useModule(ZetoAnonModule);
    const { zetoNfAnon } = m.useModule(ZetoNfAnonModule);

    const zkDvP = m.contract("zkDvP", [zetoAnon, zetoNfAnon]);
  
    return { zetoAnon, zetoNfAnon, zkDvP };
  });