import * as anchor from "@coral-xyz/anchor";

export const SOL_FACTORY_PROGRAMS = {
    "mainnet-beta": new anchor.web3.PublicKey(
      "8C8XhQJovt2zb44dNmLg8ZKa5tg7XwHAGfQ4n7WWB2nx"
    ),
    devnet: new anchor.web3.PublicKey(
      "8C8XhQJovt2zb44dNmLg8ZKa5tg7XwHAGfQ4n7WWB2nx"
    ),
    localnet: new anchor.web3.PublicKey(
      "EsgdV69W9Qi6i2q6Gfus8vuy27aXwrf61gC1z1hbnr6d"
    ),
    testnet: new anchor.web3.PublicKey(
      "EsgdV69W9Qi6i2q6Gfus8vuy27aXwrf61gC1z1hbnr6d"
    ),
  };