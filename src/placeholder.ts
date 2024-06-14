// this will
// 1. create/transfer a new placeholder
// 2. burn the placeholder

// note: the create/transfer is where the user is paying for nft creation/transfer -- when actual nft is created, the program pays for it


import { SDK } from ".";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Transaction, Connection, ComputeBudgetProgram, SystemProgram, sendAndConfirmTransaction, Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

export class Placeholder {
    private readonly sdk: SDK;

    constructor(sdk: SDK) {
        this.sdk = sdk;
    }
    /**
     * Creates a Placeholder with the associated metadata.
     * 
     * Upon creation of the actual NFT with the AI image, the Placeholder will be burned with an automated txn.
     */

    public async createPlaceholder(
        connection: Connection,
        admin: Keypair,
        collectionOwner: PublicKey, //collection owner
        buyer: PublicKey, //buyer of nft
        id: number, //id to track
        uri: string, //uri of placeholder nft
    ): Promise<string>{
        try{
            const program = this.sdk.program;
            const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), collectionOwner.toBuffer()], program.programId)[0];
            const modifyComputeUnitIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 });
            const placeholder = PublicKey.findProgramAddressSync([Buffer.from('placeholder'), collection.toBuffer(), new anchor.BN(id).toBuffer("le", 8)], program.programId)[0];
            const placeholder_mint = PublicKey.findProgramAddressSync([Buffer.from('mint'), placeholder.toBuffer()], program.programId)[0];
            const auth = PublicKey.findProgramAddressSync([Buffer.from('auth')], program.programId)[0];
            const adminState = PublicKey.findProgramAddressSync([Buffer.from('admin_state'), admin.publicKey.toBuffer()], program.programId)[0];
            let buyerPlaceholderAta = getAssociatedTokenAddressSync(placeholder_mint, buyer, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
            const createPlaceholderIx = await program.methods
              .createPlaceholder(
                new anchor.BN(id),
                uri,
              )
              .accounts({
                admin: admin.publicKey,
                adminState,   
                collection,
                placeholder,
                mint: placeholder_mint,
                auth,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                token2022Program: TOKEN_2022_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
              })
              .instruction()
            
            const transferPlaceholderIx = await program.methods
                .buyPlaceholder()
                .accounts({
                    payer: buyer,
                    buyer: buyer,
                    collection,
                    buyerMintAta: buyerPlaceholderAta,
                    placeholder,
                    mint: placeholder_mint,
                    auth,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    token2022Program: TOKEN_2022_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .instruction()
                
            const { blockhash } = await connection.getLatestBlockhash("finalized");
            const transaction = new Transaction({
                recentBlockhash: blockhash,
                feePayer: buyer,
            });

            transaction.add(modifyComputeUnitIx).add(createPlaceholderIx).add(transferPlaceholderIx);

            const serializedTransaction = transaction.serialize({
                requireAllSignatures: false,
              });
            const base64 = serializedTransaction.toString("base64");
                
            return base64;
        }catch(error){
            throw new Error(`Failed to create Placeholder: ${error}`);
        }
    };

    public async burnPlaceholder(
        connection: Connection,
        id: number,
        admin: Keypair,
        buyer: PublicKey,
        collectionOwner: PublicKey,
    ): Promise<{tx_signature: string}>{
        try{
            const program = this.sdk.program;
            const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), collectionOwner.toBuffer()], program.programId)[0];
            const placeholder = PublicKey.findProgramAddressSync([Buffer.from('placeholder'), collection.toBuffer(), new anchor.BN(id).toBuffer("le", 8)], program.programId)[0];
            const placeholder_mint = PublicKey.findProgramAddressSync([Buffer.from('mint'), placeholder.toBuffer()], program.programId)[0];
            let buyerPlaceholderAta = getAssociatedTokenAddressSync(placeholder_mint, buyer, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
            const auth = PublicKey.findProgramAddressSync([Buffer.from('auth')], program.programId)[0];

            const burnPlaceholderIx = await this.sdk.program.methods
                .burnPlaceholder()
                .accounts({
                    buyer: buyer,
                    buyerMintAta: buyerPlaceholderAta,
                    placeholder,
                    placeholderMint: placeholder_mint,
                    authority: auth,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    token2022Program: TOKEN_2022_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    mint: placeholder_mint,
                    mintAuthority: admin.publicKey
                })
                .instruction();

                const { blockhash } = await connection.getLatestBlockhash("finalized");
                const transaction = new Transaction({
                    recentBlockhash: blockhash,
                    feePayer: admin.publicKey,
                });

                transaction.add(burnPlaceholderIx);

                const tx_signature = await sendAndConfirmTransaction(
                    connection,
                    transaction,
                    [admin],
                    { commitment: 'confirmed', skipPreflight: true }
                );

            return {tx_signature: tx_signature};
        } catch (error) {
            throw new Error(`Failed to burn Placeholder: ${error}`);
        }
    };
}