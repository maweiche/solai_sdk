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

describe("Create a new ai nft", async () => {
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

  it("should create a new on chain inscription", async () => {
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
    const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), userWallet.publicKey.toBuffer()], program.programId)[0];
    const hardcoded_mint_address = new PublicKey("CRviVK8T5cCQfyLwDLxNKFZrpbdkDbNQxTwbBHw99Yjc")
    const auth = PublicKey.findProgramAddressSync([Buffer.from('auth')], program.programId)[0];
    let buyerNftAta = getAssociatedTokenAddressSync(hardcoded_mint_address, admin2Wallet.publicKey, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
    console.log('auth', auth.toBase58());
    
    // generate a keypair from the auth 
    
    const _create_tx = await sdk.inscription.createInscription(
        connection, // connection
        // @ts-expect-error
        auth, // owner
        hardcoded_mint_address, // mint
        // auth,
        admin2Keypair, // keypair
        {name: "test", description: "test"}
    );

    console.log('create tx', _create_tx);
  });
});