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
const userKeypair = Keypair.fromSecretKey(Uint8Array.from(_keypair));
const userWallet = new NodeWallet(userKeypair);

const collection_owner = new PublicKey("")

const whiteList = [];

let sdk: SDK;
const wallet = userWallet;

// Helpers
async function getNewId() {
    return Math.floor(Math.random() * 100000);
}

sdk = new SDK(
    userWallet as NodeWallet,
    new Connection('YOUR_RPC_CONNECTION_HERE', "confirmed"),
    { skipPreflight: true},
    "mainnet-beta", // mainnet-beta / devnet / testnet / localnet
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

    const transactions: any = []

    for(let i = 0; i < instructions.length; i+=4){
        const transaction = new Transaction();
        transaction.add(...instructions.slice(i, i+4));
        transactions.push(transaction);
    }

    for(let i = 0; i < transactions.length; i++){
        const sig = await sendAndConfirmTransaction(
            sdk.rpcConnection,
            transactions[i],
            [userKeypair],
            { commitment: 'confirmed' }
        );
        console.log(`√ Transaction ${i} sent: ${sig}`);    

        await new Promise((resolve) => setTimeout(resolve, 6000));
    }

}

airdropToWhitelist();