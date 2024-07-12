import { SDK } from "../src";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import {
    PublicKey,
    sendAndConfirmTransaction,
    Keypair,
    Transaction,
    Connection,
    TransactionInstruction,
} from "@solana/web3.js";

const _keypair = require('../test-wallet/keypair.json');
const userKeypair = Keypair.fromSecretKey(Uint8Array.from(_keypair))
console.log('userKeypair', userKeypair.publicKey.toBase58());
console.log('admin*********', userKeypair.publicKey.toBase58());
const userWallet = new NodeWallet(userKeypair);

const _keypair2 = require('../test-wallet/keypair.json')
const admin2Keypair = Keypair.fromSecretKey(Uint8Array.from(_keypair2))
const admin2Wallet = new NodeWallet(admin2Keypair);
console.log('admin2Wallet***********', admin2Wallet.publicKey.toBase58());

const _keypair3 = require('../test-wallet/keypair3.json')
const admin3KeyPair = Keypair.fromSecretKey(Uint8Array.from(_keypair3))
const admin3Wallet = new NodeWallet(admin3KeyPair);
console.log('admin3Wallet', admin3Wallet.publicKey.toBase58());

const collection_owner = new PublicKey("H21y6LmZkGmBU9k6YzCRB1MpSnMoXHVtiuCxtTqS87w9")

const whiteList = [
    "6Y8AFH7EwyfLkWov2ziYD6Yut7dDgbfNCavmU5rePqHX",
    "H21y6LmZkGmBU9k6YzCRB1MpSnMoXHVtiuCxtTqS87w9"
];

let sdk: SDK;
const wallet = userWallet;
const connection = new Connection("https://api.devnet.solana.com", "finalized");
console.log('wallet', wallet.publicKey.toBase58());

// Helpers
async function getNewId() {
    return Math.floor(Math.random() * 100000);
}


const id = Math.floor(Math.random() * 100000);

sdk = new SDK(
    userWallet as NodeWallet,
    new Connection("https://api.devnet.solana.com", "confirmed"),
    { skipPreflight: true},
    "devnet",
);

const program = sdk.program;

async function airdropToWhitelist(){
    let instructions: TransactionInstruction[] = [];
    for(let i = 0; i < whiteList.length; i++){
        const newId = await getNewId();
        const placeholder_tx: {instructions: TransactionInstruction[]} = await sdk.placeholder.airdropPlaceholder(
            userKeypair,
            collection_owner,
            new PublicKey(whiteList[i]),
            newId,
        );
        instructions.push(...placeholder_tx.instructions);
    }
    console.log('whitelist.length: ', whiteList.length);
    console.log('instruction array length: ', instructions.length); // should be divisible by 4

    // how many instructions can we send in one transaction?
    // will need to split the instructions array into chunks of 8 instructions, that should equal 2 complete airdrops
    // 2 airdrops per transaction == 50 txn for 100 airdrops
    // 50 txn * 0.002 SOL == 0.1 SOL
    // 3 airdrops per transaction == 34 txn for 100 airdrops
    // 34 txn * 0.002 SOL == 0.068 SOL
    

    // run a loop to send the transactions, the for loop should be instructions.length / 8, each loop should return a transaction

    const transactions: any = []

    for(let i = 0; i < instructions.length; i+=4){
        const transaction = new Transaction();
        transaction.add(...instructions.slice(i, i+4));
        transactions.push(transaction);
    }

    for(let i = 0; i < transactions.length; i++){
        const sig = await sendAndConfirmTransaction(
            connection,
            transactions[i],
            [userKeypair],
            { commitment: 'confirmed' }
        );
        console.log(`√ Transaction ${i} sent: ${sig}`);    

        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

}

airdropToWhitelist();