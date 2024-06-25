import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
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
  DataSizeFilter,
    VersionedTransaction,
} from "@solana/web3.js";
import dotenv from "dotenv";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { describe, it } from "node:test";
dotenv.config();

const _keypair = require('../test-wallet/keypair2.json');
const userKeypair = Keypair.fromSecretKey(Uint8Array.from(_keypair))
console.log('userKeypair', userKeypair.publicKey.toBase58());
const userWallet = new NodeWallet(userKeypair);


describe("Typical user flow of buying an NFT", async () => {
    let sdk: SDK;
    const wallet = userWallet;
    const connection = new Connection("https://api.devnet.solana.com", "finalized");
    console.log('wallet', wallet.publicKey.toBase58());

    // Helpers
    const id = Math.floor(Math.random() * 100000);




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
            userWallet as NodeWallet,
            new Connection("https://api.devnet.solana.com", "confirmed"),
            { skipPreflight: true},
            "devnet",
        );
        const program = sdk.program;
        const _keypair2 = require('../test-wallet/keypair.json')
        const admin2Keypair = Keypair.fromSecretKey(Uint8Array.from(_keypair2))
        const admin2Wallet = new NodeWallet(admin2Keypair);
        console.log('admin2Wallet', admin2Wallet.publicKey.toBase58());

        const _keypair3 = require('../test-wallet/keypair3.json')
        const admin3KeyPair = Keypair.fromSecretKey(Uint8Array.from(_keypair3))
        const admin3Wallet = new NodeWallet(admin3KeyPair);
        console.log('admin3Wallet', admin3Wallet.publicKey.toBase58());

        const collection_owner = wallet.publicKey;
        const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), collection_owner.toBuffer()], program.programId)[0];
        console.log('placeholder collection owner', collection_owner.toBase58());

        const placeholder_tx = await sdk.placeholder.createPlaceholder(
            connection,
            userKeypair,
            collection_owner,
            admin2Wallet.publicKey,
            id,
        );
        const tx_obj = Buffer.from(placeholder_tx, 'base64');
        var transaction = Transaction.from(tx_obj);
        const sig = await sendAndConfirmTransaction(
            connection,
            transaction,
            [userKeypair, admin2Keypair],
            { commitment: 'confirmed' }
        );
        console.log('sig placeholder', sig);
        const _tx = await sdk.nft.createNft(
            connection,  // connection: Connection,
            "ad4a356ddba9eff73cd627f69a481b8493ed975d7aac909eec4aaebdd9b506ef", // bearer
            userKeypair, // admin
            collection_owner, // collection owner
            admin2Wallet.publicKey, // buyer    
            id, // id
        ); // returns base64 string

        console.log('nft tx', _tx);
    });


});
