import * as anchor from "@coral-xyz/anchor";

export const SOL_FACTORY_PROGRAMS = {
    "mainnet-beta": new anchor.web3.PublicKey(
      "HLZ9fPXguJVJfBvY6moUo8dSdUABS6xNQNR7XiNmF1JR"
    ),
    devnet: new anchor.web3.PublicKey(
      "HLZ9fPXguJVJfBvY6moUo8dSdUABS6xNQNR7XiNmF1JR"
    ),
    localnet: new anchor.web3.PublicKey(
      "HLZ9fPXguJVJfBvY6moUo8dSdUABS6xNQNR7XiNmF1JR"
    ),
    testnet: new anchor.web3.PublicKey(
      "HLZ9fPXguJVJfBvY6moUo8dSdUABS6xNQNR7XiNmF1JR"
    ),
  };