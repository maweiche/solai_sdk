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

const _keypair = require('../test-wallet/keypair.json');
const admin1Keypair = Keypair.fromSecretKey(Uint8Array.from(_keypair))
const admin1Wallet = new NodeWallet(admin1Keypair);

const _keypair2 = require('../test-wallet/keypair2.json');
const admin2KeyPair = Keypair.fromSecretKey(Uint8Array.from(_keypair2))
const admin2Wallet = new NodeWallet(admin2KeyPair);

const _keypair3 = require('../test-wallet/keypair3.json');
const admin3KeyPair = Keypair.fromSecretKey(Uint8Array.from(_keypair3))
const admin3Wallet = new NodeWallet(admin3KeyPair);

const buyer = admin3KeyPair;

describe("Typical user flow of buying an NFT", async () => {
    let sdk: SDK;
    const wallet = admin1Wallet;
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


  it("should create a placeholder, create/transfer nft, burn placeholder", async () => {
    sdk = new SDK(
      admin1Wallet as NodeWallet,
      new Connection("https://api.devnet.solana.com", "confirmed"),
      { skipPreflight: true},
      "devnet",
    );
    const program = sdk.program;
    const _keypair2 = require('../test-wallet/keypair2.json');
    const admin2Keypair = Keypair.fromSecretKey(Uint8Array.from(_keypair2))
    const admin2Wallet = new NodeWallet(admin2Keypair);
    console.log('admin2Wallet', admin2Wallet.publicKey.toBase58());

    const _keypair3 = require('../test-wallet/keypair3.json');
    const admin3KeyPair = Keypair.fromSecretKey(Uint8Array.from(_keypair3))
    const admin3Wallet = new NodeWallet(admin3KeyPair);
    console.log('admin3Wallet', admin3Wallet.publicKey.toBase58());

    const collection_owner = admin3Wallet.publicKey;
    const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), collection_owner.toBuffer()], program.programId)[0];
    console.log('collection', collection.toBase58())
    console.log('placeholder collection owner', collection_owner.toBase58())
    const _tx = await sdk.placeholder.createPlaceholder(
      connection,  // connection: Connection,
      admin2Keypair,  // admin: Keypair,
      collection_owner,  // collection owner: PublicKey,
      buyer.publicKey,  // buyer: PublicKey,
      id,  // id: number,
      "https://www.example.com" // uri: string
    ); // returns base64 string
    const _txJSON = JSON.parse(_tx);
    const tx = Transaction.from(Buffer.from(_txJSON, "base64"))
    const sig = await sendAndConfirmTransaction(connection, tx, [buyer, admin2KeyPair], {commitment: "confirmed", skipPreflight: true}).then(confirm).then(log);
    console.log('signature', sig)
    
    

    const _create_tx = await sdk.nft.createNft(
      connection, // connection
      "https://amin.stable-dilution.art/nft/item/generation/3/11/0xf75e77b4EfD56476708792066753AC428eB0c21c", // url for ai image
      "ad4a356ddba9eff73cd627f69a481b8493ed975d7aac909eec4aaebdd9b506ef", // bearer
      admin2Keypair, // admin
      admin3Wallet.publicKey, // collection owner
      buyer.publicKey, // buyer
    ); // returns base64 string
    console.log(_create_tx);

    const { tx_signature }= await sdk.placeholder.burnPlaceholder(
      connection, // connection
      id, // id
      admin2Keypair,  // admin
      buyer.publicKey, // buyer
      collection_owner  // collection owner
    ); // returns base64 string
    
    console.log('signature', tx_signature)
  });

});