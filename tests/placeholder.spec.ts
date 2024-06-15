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
const _keypair = process.env.KEYPAIR1 as any
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
    const _keypair2 = process.env.KEYPAIR2 as any;
    const admin2Keypair = Keypair.fromSecretKey(Uint8Array.from(_keypair2))
    const admin2Wallet = new NodeWallet(admin2Keypair);
    console.log('admin2Wallet', admin2Wallet.publicKey.toBase58());

    const _keypair3 = process.env.KEYPAIR3 as any;
    const admin3KeyPair = Keypair.fromSecretKey(Uint8Array.from(_keypair3))
    const admin3Wallet = new NodeWallet(admin3KeyPair);
    console.log('admin3Wallet', admin3Wallet.publicKey.toBase58());

    const collection_owner = admin3Wallet.publicKey;
    const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), collection_owner.toBuffer()], program.programId)[0];
    console.log('placeholder collection owner', collection_owner.toBase58())
    const _tx = await sdk.placeholder.createPlaceholder(
      connection,  // connection: Connection,
      admin2Keypair,  // admin: Keypair,
      admin2Wallet.publicKey,  // admin: PublicKey,
      collection,  // collection: PublicKey,
      id,  // id: number,
      "https://www.example.com" // uri: string
    ); // returns base64 string
    const tx = Transaction.from(Buffer.from(_tx, "base64"));
    await sendAndConfirmTransaction(connection, tx, [admin2Keypair], {commitment: "finalized", skipPreflight: true}).then(confirm).then(log);
  });



  it("should burn the placeholder", async () => {
    sdk = new SDK(
      userWallet as NodeWallet,
      new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed"),
      { skipPreflight: true},
      "devnet",
    );
    const program = sdk.program;
    const _keypair2 = process.env.KEYPAIR2 as any;
    const admin2Keypair = Keypair.fromSecretKey(Uint8Array.from(_keypair2))
    const admin2Wallet = new NodeWallet(admin2Keypair);

    const _keypair3 = process.env.KEYPAIR3 as any;
    const admin3KeyPair = Keypair.fromSecretKey(Uint8Array.from(_keypair3))
    const admin3Wallet = new NodeWallet(admin3KeyPair);
    console.log('admin3Wallet', admin3Wallet.publicKey.toBase58());

    const collection_owner = admin3Wallet.publicKey;
    const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), collection_owner.toBuffer()], program.programId)[0];

    const { tx_signature }= await sdk.placeholder.burnPlaceholder(
      connection, // connection
      id, // id
      admin2Keypair,  // admin
      admin2Wallet.publicKey, // buyer
      collection  // collection
    ); // returns base64 string
    console.log('signature', tx_signature)
  });
});