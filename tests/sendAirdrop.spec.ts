import { SDK } from "../src";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import {
  PublicKey,
  ComputeBudgetProgram,
  sendAndConfirmTransaction,
  Keypair,
  Transaction,
  Connection,
  GetProgramAccountsConfig,
  DataSizeFilter,
    VersionedTransaction,
    Ed25519Program
} from "@solana/web3.js";
import { describe, it } from "node:test";

const _keypair = require('../test-wallet/keypair2.json');
const userKeypair = Keypair.fromSecretKey(Uint8Array.from(_keypair))
const userWallet = new NodeWallet(userKeypair);


describe("Typical flow of collection owner airdropping a Placeholder and User trading it for an NFT", async () => {
    let sdk: SDK;
    const wallet = userWallet;
    const connection = new Connection("http://api.devnet.solana.com", "confirmed");
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
        const modifyComputeUnitIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 });
        const program = sdk.program;
        const _keypair2 = require('../test-wallet/keypair2.json')
        const admin2Keypair = Keypair.fromSecretKey(Uint8Array.from(_keypair2))
        const admin2Wallet = new NodeWallet(admin2Keypair);

        const buyer = userWallet.publicKey;
        const collection_owner = admin2Wallet.publicKey;

        const airdrop_tx = await sdk.placeholder.airdropPlaceholder(
            userKeypair,
            collection_owner,
            buyer,
            id,
        );

        const transaction = new Transaction();

        transaction.add(
            ...airdrop_tx.instructions
        )

        const sig = await sendAndConfirmTransaction(
            connection,
            transaction,
            [userKeypair, admin2Keypair],
            { commitment: 'confirmed' }
        );

        console.log('sig placeholder', sig);    
    });


});