import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import '@openzeppelin/hardhat-upgrades';
import "./scripts/deploy_upgradeable_token"; // Changed this line to correct path

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.27",
        settings: {
          evmVersion: "cancun",
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {},
    btp: {
      url: process.env.BTP_RPC_URL || "",
      gasPrice: process.env.BTP_GAS_PRICE ? parseInt(process.env.BTP_GAS_PRICE) : "auto",
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  sourcify: {
    enabled: true,
  }
};

export default config;
