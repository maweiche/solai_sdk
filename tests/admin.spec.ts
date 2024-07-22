import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { expect } from "chai";
import {
  PublicKey,
  SystemProgram,
  ComputeBudgetProgram,
  sendAndConfirmTransaction,
  Keypair,
  Transaction,
  Connection,
  GetProgramAccountsConfig,
  DataSizeFilter
} from "@solana/web3.js";
// import dotenv from "dotenv";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { describe, it } from "node:test";
import * as base58 from 'bs58';

describe("Initialize Admin", async () => {
  let sdk: SDK;

  console.log('starting')
  const _keypair = require('../test-wallet/keypair.json');
  const userKeypair = Keypair.fromSecretKey(Uint8Array.from(_keypair));
  const userWallet = new NodeWallet(userKeypair);

  const connection = new Connection("https://api.devnet.solana.com", "finalized");

  // Helpers
  function wait(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  const confirm = async (signature: string): Promise<string> => {
    const block = await sdk.rpcConnection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...block
    })
    return signature
  }

  const log = async(signature: string): Promise<string> => {
    console.log(`Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`);
    return signature;
  }

 
  it("should initialize an admin", async () => {
    sdk = new SDK(
      userWallet as NodeWallet,
      new Connection("https://api.devnet.solana.com", "confirmed"),
      { skipPreflight: true},
      "devnet",
    );
    
    const _tx = await sdk.admin.initAdmin(
      sdk.rpcConnection, // connection: Connection,
      userWallet.publicKey, //   admin: PublicKey,
      "BOO", //   username: string,
      userWallet.publicKey// admin2Wallet.publicKey //   newAdmin?: PublicKey,
    );
    const tx = Transaction.from(Buffer.from(_tx, "base64"));
    await sendAndConfirmTransaction(connection, tx, [userKeypair], {commitment: "finalized", skipPreflight: true}).then(confirm).then(log);


    const check_if_admin_pass = await sdk.admin.checkIfAdmin(
      sdk.rpcConnection, // connection: Connection,
      userWallet.publicKey //   admin: PublicKey,
    );

    console.log('check_if_admin', check_if_admin_pass)
  });

  it("should lock the protocol", async () => {
    sdk = new SDK(
      userWallet as NodeWallet,
      new Connection("https://api.devnet.solana.com", "confirmed"),
      { skipPreflight: true},
      "devnet",
    );

    const _tx = await sdk.admin.lockProtocolAccount(
      sdk.rpcConnection, // connection: Connection,
      userWallet.publicKey //   admin: PublicKey,
    );
    const tx = Transaction.from(Buffer.from(_tx, "base64"));
    await sendAndConfirmTransaction(connection, tx, [userKeypair], {commitment: "finalized", skipPreflight: true}).then(confirm).then(log);
  });
});