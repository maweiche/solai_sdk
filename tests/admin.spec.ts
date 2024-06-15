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
import * as base58 from 'bs58';
dotenv.config();

// anchor.setProvider(anchor.AnchorProvider.env());
const keypair1 = process.env.KEYPAIR1 as any;
const keypair2 = process.env.KEYPAIR2 as any;
const keypair3 = process.env.KEYPAIR3 as any;

const admin1Keypair = Keypair.fromSecretKey(base58.decode(keypair1));
const admin2Keypair = Keypair.fromSecretKey(base58.decode(keypair2));
const admin3KeyPair = Keypair.fromSecretKey(base58.decode(keypair3))

const admin1Wallet = new NodeWallet(admin1Keypair);
const admin2Wallet = new NodeWallet(admin2Keypair);
const admin3Wallet = new NodeWallet(admin3KeyPair);
describe("Initialize Admin", async () => {
  let sdk: SDK;

  console.log('starting')
  const wallet = admin1Wallet;
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

 
  it("should initialize an admin", async () => {
    sdk = new SDK(
      admin1Wallet as NodeWallet,
      new Connection("https://api.devnet.solana.com", "confirmed"),
      { skipPreflight: true},
      "devnet",
    );

    // const check_if_admin_fail = await sdk.admin.checkIfAdmin(
    //   sdk.rpcConnection, // connection: Connection,
    //   admin2Wallet.publicKey //   admin: PublicKey,
    // );

    // console.log('check_if_admin_fail', check_if_admin_fail)
    
    const _tx = await sdk.admin.initAdmin(
      sdk.rpcConnection, // connection: Connection,
      admin2Wallet.publicKey, //   admin: PublicKey,
      "BOO", //   username: string,
      admin3Wallet.publicKey// admin2Wallet.publicKey //   newAdmin?: PublicKey,
    );
    const tx = Transaction.from(Buffer.from(_tx, "base64"));
    await sendAndConfirmTransaction(connection, tx, [admin2Keypair], {commitment: "finalized", skipPreflight: true}).then(confirm).then(log);


    const check_if_admin_pass = await sdk.admin.checkIfAdmin(
      sdk.rpcConnection, // connection: Connection,
      admin2Wallet.publicKey //   admin: PublicKey,
    );

    console.log('check_if_admin', check_if_admin_pass)
  });


});