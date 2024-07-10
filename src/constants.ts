import * as anchor from "@coral-xyz/anchor";

export const SOL_FACTORY_PROGRAMS = {
    "mainnet-beta": new anchor.web3.PublicKey(
      "DHHnPaKKDLadRHLqVHWf2YpuK5Y6guJio99pD5sh2GVD"
    ),
    devnet: new anchor.web3.PublicKey(
      "DHHnPaKKDLadRHLqVHWf2YpuK5Y6guJio99pD5sh2GVD"
    ),
    localnet: new anchor.web3.PublicKey(
      "DHHnPaKKDLadRHLqVHWf2YpuK5Y6guJio99pD5sh2GVD"
    ),
    testnet: new anchor.web3.PublicKey(
      "DHHnPaKKDLadRHLqVHWf2YpuK5Y6guJio99pD5sh2GVD"
    ),
  };