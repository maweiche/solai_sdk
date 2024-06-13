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


const _keypair2 = require('../test-wallet/keypair2.json')
const adminKeypair = Keypair.fromSecretKey(Uint8Array.from(_keypair2))
const adminWallet = new NodeWallet(adminKeypair);

const _keypair3 = require('../test-wallet/keypair3.json')
const admin2KeyPair = Keypair.fromSecretKey(Uint8Array.from(_keypair3))
const admin2Wallet = new NodeWallet(admin2KeyPair);

describe("Initialize Admin", async () => {
  let sdk: SDK;
  let profilePDA: anchor.web3.PublicKey;
  let postPDA: anchor.web3.PublicKey;
  let program: anchor.Program;
  console.log('starting')
  const wallet = userWallet;
  const provider = anchor.getProvider();
  const connection = new Connection("https://api.devnet.solana.com", "finalized");
  // const programId = new PublicKey("EsgdV69W9Qi6i2q6Gfus8vuy27aXwrf61gC1z1hbnr6d");
  console.log('wallet', wallet.publicKey.toBase58());

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

 
  // it("should initialize an admin", async () => {
  //   sdk = new SDK(
  //     userWallet as NodeWallet,
  //     new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed"),
  //     { skipPreflight: true},
  //     "devnet",
  //   );

  //   const check_if_admin_fail = await sdk.admin.checkIfAdmin(
  //     sdk.rpcConnection, // connection: Connection,
  //     admin2Wallet.publicKey //   admin: PublicKey,
  //   );

  //   console.log('check_if_admin_fail', check_if_admin_fail)
    
  //   const _tx = await sdk.admin.initAdmin(
  //     sdk.rpcConnection, // connection: Connection,
  //     adminWallet.publicKey, //   admin: PublicKey,
  //     "STU", //   username: string,
  //     admin2Wallet.publicKey //   newAdmin?: PublicKey,
  //   );
  //   console.log('tx', _tx)  // returns base64 string
  //   const tx = Transaction.from(Buffer.from(_tx, "base64"));
  //   await sendAndConfirmTransaction(connection, tx, [adminWallet.payer], {commitment: "finalized", skipPreflight: true}).then(confirm).then(log);


  //   const check_if_admin_pass = await sdk.admin.checkIfAdmin(
  //     sdk.rpcConnection, // connection: Connection,
  //     admin2Wallet.publicKey //   admin: PublicKey,
  //   );

  //   console.log('check_if_admin', check_if_admin_pass)
  // });


});