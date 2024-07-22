import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import {
  PublicKey,
  sendAndConfirmTransaction,
  Keypair,
  Transaction,
  Connection,
} from "@solana/web3.js";
import { getTokenMetadata } from "@solana/spl-token";
import { describe, it } from "node:test";

const _keypair = require('../test-wallet/keypair2.json');
const userKeypair = Keypair.fromSecretKey(Uint8Array.from(_keypair))
const userWallet = new NodeWallet(userKeypair);


describe("Typical user flow of buying an NFT", async () => {
    let sdk: SDK;
    const connection = new Connection("https://api.devnet.solana.com", "finalized");

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

        const _keypair3 = require('../test-wallet/keypair3.json')
        const admin3KeyPair = Keypair.fromSecretKey(Uint8Array.from(_keypair3))
        const admin3Wallet = new NodeWallet(admin3KeyPair);

        const buyer = userWallet.publicKey;
        const collection_owner = admin3Wallet.publicKey;
        const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), collection_owner.toBuffer()], program.programId)[0];
                
        const placeholder_tx = await sdk.placeholder.createPlaceholder(
            userWallet.payer,
            collection_owner,
            buyer,
            id,
        );

        const transaction = new Transaction();

        transaction.add(
            ...placeholder_tx.instructions,
        )
        
        const sig = await sendAndConfirmTransaction(
            connection,
            transaction,
            [userKeypair],
            { commitment: 'confirmed' }
        );

        console.log(`placeholder tx url: https://explorer.solana.com/tx/${sig}?cluster=devnet`);

        const confirmation = await confirm(sig);
        await log(confirmation);


        const placeholder_mint = placeholder_tx.placeholder_mint;
        const placeholder_metadata = await getTokenMetadata(connection, placeholder_mint);
        
        const additional_metadata = placeholder_metadata!.additionalMetadata;
        const token_id = additional_metadata[1][1];

        const getCollectionUrl = async(collection: PublicKey) => {
            const collection_data = await connection.getAccountInfo(collection);
            const collection_decode = program.coder.accounts.decode("Collection", collection_data!.data);

            return {
                url: collection_decode.url,
                count: collection_decode.mintCount.toNumber(),
            }
        }
        const { url } = await getCollectionUrl(collection);
        console.log('URL TO POLL: ',`${url}/${token_id}/${buyer.toBase58()}`)





        const {tx_signature, nft_mint} = await sdk.nft.createNft(
            connection,  // connection: Connection,
            'BEARER_TOKEN_HERE', // bearer
            userKeypair, // admin
            collection_owner, // collection owner
            buyer, // buyer    
            placeholder_mint // placeholder mint address
        ); // returns txn signature and nft mint address

        console.log(`nft mint: ${nft_mint}`);

        console.log(`nft tx url: https://explorer.solana.com/tx/${tx_signature}?cluster=${sdk.cluster}`);

    });


});
