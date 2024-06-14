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

describe("Create a new collection and get all collections", async () => {
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
      userWallet as NodeWallet,
      new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed"),
      { skipPreflight: true},
      "devnet",
    );

    const _collections = await sdk.collection.getAllCollections(connection);
    
    console.log('collections', _collections);
  });

  it("should create a new collection", async () => {
    sdk = new SDK(
      userWallet as NodeWallet,
      new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed"),
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
    const reference = "T1234ST123";
    const date_i64 = new anchor.BN(Date.now());
    const yesterday_date_i64 = new anchor.BN(Date.now() * 1000 - 86400000);

    const _keypair3 = require('../test-wallet/keypair3.json')
    const admin2KeyPair = Keypair.fromSecretKey(Uint8Array.from(_keypair3))
    const admin2Wallet = new NodeWallet(admin2KeyPair);
    console.log('admin2Wallet', admin2Wallet.publicKey.toBase58());
    const _tx = await sdk.collection.createCollection(
      connection, 
      admin2Wallet.publicKey, 
      name, 
      symbol, 
      date_i64,
      max_supply, 
      price, 
      stable_id, 
      reference,
      [
        admin2Wallet.publicKey,
        new PublicKey('2UbngADg4JvCftthHoDY4gKNqsScRsQ1LLtyDqLQbWhb'),
        new PublicKey('DEVJb1nq3caksGybAFxoxsYXLi9nyp8ZQnmAFmfAYMSN')
      ], 
      yesterday_date_i64, 
      whitelist_price
    );
    const tx = Transaction.from(Buffer.from(_tx, "base64"));
    await sendAndConfirmTransaction(connection, tx, [admin2Wallet.payer], {commitment: "finalized", skipPreflight: true}).then(confirm).then(log);
  });

  it("should return a collection specific to an owner", async () => {
    sdk = new SDK(
      userWallet as NodeWallet,
      new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed"),
      { skipPreflight: true},
      "devnet",
    );
    const owner = new PublicKey("ARTiXFSdAqtvh3MQi8GaxVa8dULaz67pwe77pGdyvkDp");
    const _collection = await sdk.collection.getCollectionByOwner(connection, owner);
    
    console.log('collections', _collection);
  });
  // async function getAllCollections() {
  //   const size_filter: DataSizeFilter = {
  //     dataSize: 245
  //   };
  //   const get_accounts_config: GetProgramAccountsConfig = {
  //       commitment: "confirmed",
  //       filters: [size_filter]
  //   };

  //   const all_collections = await connection.getProgramAccounts(
  //     programId, 
  //     get_accounts_config
  //   );
  //   console.log('all_collections', all_collections)

    // ex. collection:
    // {
  //   account: {
  //     data: <Buffer 5b da f2 1c 8b d0 49 59 84 35 00 00 00 00 00 00 27 26 92 08 00 b7 4c a4 e3 1a 20 a2 71 97 b7 cd e0 4f 8a a9 d9 96 ac 48 35 02 41 49 9e 42 f1 c2 06 00 ... 52 more bytes>,
  //     executable: false,
  //     lamports: 1600800,
  //     owner: [PublicKey [PublicKey(EsgdV69W9Qi6i2q6Gfus8vuy27aXwrf61gC1z1hbnr6d)]],
  //     rentEpoch: 18446744073709552000,
  //     space: 102
  //   },
  //   pubkey: PublicKey [PublicKey(F67Lkabu45txsmB7j6jgsac6uRT3kGCcmsR4vwK5gici)] {
  //     _bn: <BN: d152b0b6a0ad1f2e32f18b7630b5f054483a3075c62a4864c4617fee0496a173>
  //   }
  // }

    // for each collection we need to return the account.space and pubkey.toString()

  //   const _collection_decode = all_collections.map((collection) => {
  //       try {
  //           const decode = program.coder.accounts.decode("collection", collection.account.data);
  //           console.log('decode', decode)
  //           return decode;
  //       } catch (error) {
  //           console.log('error', error)
  //           return null;
  //       }
  //   })

  //   console.log('_collection_decode', _collection_decode)

  //   return all_collections;
  // }

  // getAllCollections();
  
});