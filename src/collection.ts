// this will
// 1. create a new collection that can be minted from


import { SDK } from ".";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Transaction, Connection, SystemProgram } from "@solana/web3.js";

export class Collection {
    private readonly sdk: SDK;

    constructor(sdk: SDK) {
        this.sdk = sdk;
    }
    /**
     * 
     * 
     * 
     */

    public async createCollection(
        connection: Connection,
        owner: PublicKey,
        name: string,
        symbol: string,
        sale_start_time: anchor.BN,
        max_supply: anchor.BN,
        price: anchor.BN,
        stable_id: string,
        reference: string,
        whitelist?: PublicKey[] | null,
        whitelist_price?: anchor.BN | null,
        whitelist_start_time?: anchor.BN | null,
    ): Promise<string>{
        try{
            const program = this.sdk.program;
            const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), owner.toBuffer()], program.programId)[0];

            const createCollectionIx = await program.methods
                .createCollection(
                    name,
                    symbol,
                    sale_start_time,
                    max_supply,
                    price,
                    stable_id,
                    reference,
                    whitelist,
                    whitelist_start_time,
                    whitelist_price
                )
                .accounts({
                    owner,
                    collection,
                    systemProgram: SystemProgram.programId,
                })
                .instruction()

            const { blockhash } = await connection.getLatestBlockhash("finalized");
            const transaction = new Transaction({
                recentBlockhash: blockhash,
                feePayer: owner,
            });

            transaction.add(createCollectionIx);

            const serializedTransaction = transaction.serialize({
                requireAllSignatures: false,
              });
            const base64 = serializedTransaction.toString("base64");
                
            return JSON.stringify({transaction: base64 })
        }catch(error){
            throw new Error(`Failed to create Placeholder: ${error}`);
        }
    };
}