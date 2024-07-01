import * as anchor from "@coral-xyz/anchor";

export const SOL_FACTORY_PROGRAMS = {
    "mainnet-beta": new anchor.web3.PublicKey(
      "4Fj9kuGYLye3pwCBYaXbuzocEy22gPWT5TcJVJ6JauUt"
    ),
    devnet: new anchor.web3.PublicKey(
      "4Fj9kuGYLye3pwCBYaXbuzocEy22gPWT5TcJVJ6JauUt"
    ),
    localnet: new anchor.web3.PublicKey(
      "6rHuJFF9XCxi9eDHtgJPcBKNpMWyBHhQhrFSkUD5XMYo"
    ),
    testnet: new anchor.web3.PublicKey(
      "4Fj9kuGYLye3pwCBYaXbuzocEy22gPWT5TcJVJ6JauUt"
    ),
  };