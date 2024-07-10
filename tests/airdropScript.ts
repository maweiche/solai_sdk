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
    TransactionInstruction,
} from "@solana/web3.js";

const _keypair = require('../test-wallet/keypair2.json');
const userKeypair = Keypair.fromSecretKey(Uint8Array.from(_keypair))
console.log('userKeypair', userKeypair.publicKey.toBase58());
const userWallet = new NodeWallet(userKeypair);

const _keypair2 = require('../test-wallet/keypair.json')
const admin2Keypair = Keypair.fromSecretKey(Uint8Array.from(_keypair2))
const admin2Wallet = new NodeWallet(admin2Keypair);
console.log('admin2Wallet***********', admin2Wallet.publicKey.toBase58());

const _keypair3 = require('../test-wallet/keypair3.json')
const admin3KeyPair = Keypair.fromSecretKey(Uint8Array.from(_keypair3))
const admin3Wallet = new NodeWallet(admin3KeyPair);
console.log('admin3Wallet', admin3Wallet.publicKey.toBase58());

const collection_owner = admin3Wallet.publicKey;

let sdk: SDK;
const wallet = userWallet;
const connection = new Connection("http://localhost:8899 ", "finalized");
console.log('wallet', wallet.publicKey.toBase58());

// Helpers
async function getNewId() {
    return Math.floor(Math.random() * 100000);
}

const whiteList = [];

const id = Math.floor(Math.random() * 100000);

sdk = new SDK(
    userWallet as NodeWallet,
    new Connection("https://api.devnet.solana.com", "confirmed"),
    { skipPreflight: true},
    "devnet",
);

const program = sdk.program;

const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), collection_owner.toBuffer()], program.programId)[0];
console.log('placeholder collection owner', collection_owner.toBase58());

const placeholder_tx = await sdk.placeholder.airdropPlaceholder(
    userKeypair.publicKey,
    collection_owner,
    admin2Wallet.publicKey,
    id,
);

const transaction = new Transaction();

transaction.add(
    ...placeholder_tx.instructions,
)

const sig = await sendAndConfirmTransaction(
    connection,
    transaction,
    [userKeypair, admin3Wallet.payer, admin2Keypair],
    { commitment: 'confirmed' }
);

console.log('sig placeholder', sig);    



async function airdropToWhitelist(){
    let instructions: TransactionInstruction[] = [];
    for(let i = 0; i < whiteList.length; i++){
        const newId = await getNewId();
        const placeholder_tx: {instructions: TransactionInstruction[]} = await sdk.placeholder.airdropPlaceholder(
            userKeypair.publicKey,
            collection_owner,
            whiteList[i],
            newId,
        );
        instructions.push(...placeholder_tx.instructions);
    }

    console.log('instruction array length: ', instructions.length); // should be divisible by 2

    // how many instructions can we send in one transaction?
    // will need to split the instructions array into chunks of 6 instructions, that should equal 3 complete airdrops
    // 6 will most likely be too large, hopefully can complete 4 instructions per transaction, 2 airdrops
    // 2 airdrops per transaction == 50 txn for 100 airdrops
    // 50 txn * 0.002 SOL == 0.1 SOL
    // 3 airdrops per transaction == 34 txn for 100 airdrops
    // 34 txn * 0.002 SOL == 0.068 SOL
    
    
}
