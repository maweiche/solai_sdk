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
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { describe, it } from "node:test";

const _keypair2 = require('../test-wallet/keypair2.json');
const admin2Keypair = Keypair.fromSecretKey(Uint8Array.from(_keypair2))
const admin2Wallet = new NodeWallet(admin2Keypair);
console.log('admin2Wallet', admin2Wallet.publicKey.toBase58());

const _keypair3 = require('../test-wallet/keypair3.json');
const admin3KeyPair = Keypair.fromSecretKey(Uint8Array.from(_keypair3))
const admin3Wallet = new NodeWallet(admin3KeyPair);
console.log('admin3Wallet', admin3Wallet.publicKey.toBase58());

describe("Create a new collection and get all collections", async () => {
  let sdk: SDK;
  const wallet = admin2Wallet;
  const connection = new Connection("https://api.devnet.solana.com", "finalized");
  console.log('wallet', wallet.publicKey.toBase58());

  // Helpers
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
  it("should return a list of collections", async () => {
    sdk = new SDK(
      admin2Wallet as NodeWallet,
      new Connection("https://api.devnet.solana.com", "confirmed"),
      { skipPreflight: true},
      "devnet",
    );

    const _collections = await sdk.collection.getAllCollections(connection);
    
    console.log('collections', _collections);
  });

  it("should create a new collection", async () => {
    sdk = new SDK(
      admin2Wallet as NodeWallet,
      new Connection("https://api.devnet.solana.com", "confirmed"),
      { skipPreflight: true},
      "devnet",
    );

    const name = "Test 12 Collection";
    const symbol = "TS5T";
    const sale_start_time = new anchor.BN(0);
    const max_supply = new anchor.BN(100);
    const price = new anchor.BN(1);
    const whitelist_price = new anchor.BN(0);
    const stable_id = "TS2233321T";
    const start_date_i64 = new anchor.BN(Date.now());
    const end_date_i64 = new anchor.BN(Date.now() + 86400000); // 24 hours

    console.log('admin2Wallet', admin2Wallet.publicKey.toBase58());
    const url = "https://amin.stable-dilution.art/nft/item/generation/3";
    const _tx = await sdk.collection.createCollection(
      admin2Keypair, 
      admin2Wallet.publicKey, 
      name, 
      symbol, 
      url,
      start_date_i64,
      end_date_i64,
      max_supply, 
      price, 
      stable_id,
    );
    const tx = new Transaction().add(_tx.instructions[0]);
    await sendAndConfirmTransaction(connection, tx, [admin2Wallet.payer], {commitment: "finalized", skipPreflight: true}).then(confirm).then(log);
  });

  it("should return a collection specific to an owner", async () => {
    sdk = new SDK(
      admin2Wallet as NodeWallet,
      new Connection("https://api.devnet.solana.com", "confirmed"),
      { skipPreflight: true},
      "devnet",
    );
    const owner = new PublicKey("ARTiXFSdAqtvh3MQi8GaxVa8dULaz67pwe77pGdyvkDp");
    const _collection = await sdk.collection.getCollectionByOwner(connection, owner);
    
    console.log('collections', _collection);
  });
  async function getAllCollections() {
    const size_filter: DataSizeFilter = {
      dataSize: 245
    };
    const get_accounts_config: GetProgramAccountsConfig = {
        commitment: "confirmed",
        filters: [size_filter]
    };

    const all_collections = await connection.getProgramAccounts(
      sdk.program.programId,
      get_accounts_config
    );
    console.log('all_collections', all_collections)
  }

  
});