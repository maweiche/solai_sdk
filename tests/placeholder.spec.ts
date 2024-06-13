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
import dotenv from "dotenv";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { describe, it } from "node:test";
dotenv.config();

anchor.setProvider(anchor.AnchorProvider.env());
// anchor.setProvider(anchor.AnchorProvider.env());
const _keypair = require('../test-wallet/keypair.json')
const userKeypair = Keypair.fromSecretKey(Uint8Array.from(_keypair))
const userWallet = new NodeWallet(userKeypair);
anchor.setProvider(anchor.AnchorProvider.env());

describe("Create a new placeholder nft", async () => {
  let sdk: SDK;
  const wallet = userWallet;
  const connection = new Connection("https://api.devnet.solana.com", "finalized");
  console.log('wallet', wallet.publicKey.toBase58());

  // Helpers
  const id = Math.floor(Math.random() * 100000);

  function wait(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
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
  it("should create the placeholder", async () => {
    sdk = new SDK(
      userWallet as NodeWallet,
      new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed"),
      { skipPreflight: true},
      "devnet",
    );
    const program = sdk.program;
    const _keypair2 = require('../test-wallet/keypair2.json')
    const adminKeypair = Keypair.fromSecretKey(Uint8Array.from(_keypair2))
    const adminWallet = new NodeWallet(adminKeypair);
    const collection_owner = new PublicKey("6KuX26FZqzqpsHDLfkXoBXbQRPEDEbstqNiPBKHNJQ9e");
    const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), collection_owner.toBuffer()], program.programId)[0];

    const _tx = await sdk.placeholder.createPlaceholder(connection, adminKeypair, adminWallet.publicKey, collection, id, "https://www.example.com"); // returns base64 string
    const tx = Transaction.from(Buffer.from(_tx, "base64"));
    await sendAndConfirmTransaction(connection, tx, [adminKeypair], {commitment: "finalized", skipPreflight: true}).then(confirm).then(log);
  });

  it("should burn the placeholder", async () => {
    sdk = new SDK(
      userWallet as NodeWallet,
      new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed"),
      { skipPreflight: true},
      "devnet",
    );
    const program = sdk.program;
    const _keypair2 = require('../test-wallet/keypair2.json')
    const adminKeypair = Keypair.fromSecretKey(Uint8Array.from(_keypair2))
    const adminWallet = new NodeWallet(adminKeypair);
    const collection_owner = new PublicKey("6KuX26FZqzqpsHDLfkXoBXbQRPEDEbstqNiPBKHNJQ9e");
    const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), collection_owner.toBuffer()], program.programId)[0];
    const { tx_signature }= await sdk.placeholder.burnPlaceholder(connection, id, adminKeypair, adminWallet.publicKey, collection); // returns base64 string
    console.log('signature', tx_signature)
  });
});