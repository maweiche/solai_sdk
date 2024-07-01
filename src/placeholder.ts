// this will
// 1. create/transfer a new placeholder
// 2. burn the placeholder

// note: the create/transfer is where the user is paying for nft creation/transfer -- when actual nft is created, the program pays for it


import { SDK } from ".";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Transaction, Connection, ComputeBudgetProgram, SystemProgram, sendAndConfirmTransaction, Keypair, TransactionInstruction } from "@solana/web3.js";
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
        admin: PublicKey,
        collectionOwner: PublicKey, //collection owner
        buyer: PublicKey, //buyer of nft
        id: number, //id to track
    ): Promise<{ 
        // tx_signature: string, 
        // nft_mint: string 
        instructions: TransactionInstruction[]
      }>{
        try{
            const program = this.sdk.program;
            const uri = "https://gateway.irys.xyz/-mpn67FnEePrsoKez4f6Dvjb1aMcH1CqCdZX0NCyHK8";
            const protocol = PublicKey.findProgramAddressSync([Buffer.from('protocol')], program.programId)[0];
            const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), collectionOwner.toBuffer()], program.programId)[0];
            const modifyComputeUnitIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 });
            const placeholder = PublicKey.findProgramAddressSync([Buffer.from('placeholder'), collection.toBuffer(), new anchor.BN(id).toBuffer("le", 8)], program.programId)[0];
            const placeholder_mint = PublicKey.findProgramAddressSync([Buffer.from('mint'), placeholder.toBuffer()], program.programId)[0];
            const auth = PublicKey.findProgramAddressSync([Buffer.from('auth')], program.programId)[0];
            const adminState = PublicKey.findProgramAddressSync([Buffer.from('admin_state'), admin.toBuffer()], program.programId)[0];
            let buyerPlaceholderAta = getAssociatedTokenAddressSync(placeholder_mint, buyer, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);


            console.log('placeholder to be created', placeholder.toBase58());
            console.log('placeholder mint******', placeholder_mint.toBase58());
            const createPlaceholderIx = await program.methods
              .createPlaceholder(
                new anchor.BN(id),
                uri,
              )
              .accounts({
                admin: admin,
                adminState,   
                collection,
                placeholder,
                mint: placeholder_mint,
                auth,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                token2022Program: TOKEN_2022_PROGRAM_ID,
                protocol: protocol,
                systemProgram: SystemProgram.programId,
              })
              .instruction()
            
            const transferPlaceholderIx = await program.methods
                .buyPlaceholder()
                .accounts({
                    buyer: buyer,
                    payer: admin,
                    collection,
                    collectionOwner: collectionOwner,
                    buyerMintAta: buyerPlaceholderAta,
                    placeholder,
                    mint: placeholder_mint,
                    auth,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    token2022Program: TOKEN_2022_PROGRAM_ID,
                    protocol: protocol,
                    systemProgram: SystemProgram.programId,
                })
                .instruction()
                
            // const { blockhash } = await connection.getLatestBlockhash("finalized");
            // const transaction = new Transaction({
            //     recentBlockhash: blockhash,
            //     feePayer: admin.publicKey,
            // });

            // transaction
            //     .add(modifyComputeUnitIx)
            //     .add(createPlaceholderIx)
            //     .add(transferPlaceholderIx);
            // transaction.partialSign(admin);
            // const serializedTransaction = transaction.serialize({
            //     requireAllSignatures: false,
            //   });
            // const base64 = serializedTransaction.toString("base64");
            // const base64JSON = JSON.stringify(base64);

            // return base64JSON;

            const instructions: TransactionInstruction[] = [createPlaceholderIx, transferPlaceholderIx];

            return {
                instructions: instructions
            }
        }catch(error){
            throw new Error(`Failed to create Placeholder: ${error}`);
        }
    };

    public async airdropPlaceholder(
        connection: Connection,
        admin: PublicKey,
        collectionOwner: PublicKey, //collection owner
        buyer: PublicKey, //buyer of nft
        id: number, //id to track
    ): Promise<{ 
        // tx_signature: string, 
        // nft_mint: string 
        instructions: TransactionInstruction[]
      }>{
        try{
            const program = this.sdk.program;
            const uri = "https://gateway.irys.xyz/-mpn67FnEePrsoKez4f6Dvjb1aMcH1CqCdZX0NCyHK8";
            const protocol = PublicKey.findProgramAddressSync([Buffer.from('protocol')], program.programId)[0];
            const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), collectionOwner.toBuffer()], program.programId)[0];
            const modifyComputeUnitIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 });
            const placeholder = PublicKey.findProgramAddressSync([Buffer.from('placeholder'), collection.toBuffer(), new anchor.BN(id).toBuffer("le", 8)], program.programId)[0];
            const placeholder_mint = PublicKey.findProgramAddressSync([Buffer.from('mint'), placeholder.toBuffer()], program.programId)[0];
            const auth = PublicKey.findProgramAddressSync([Buffer.from('auth')], program.programId)[0];
            const adminState = PublicKey.findProgramAddressSync([Buffer.from('admin_state'), admin.toBuffer()], program.programId)[0];
            let buyerPlaceholderAta = getAssociatedTokenAddressSync(placeholder_mint, buyer, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);


            console.log('placeholder to be created', placeholder.toBase58());
            console.log('placeholder mint******', placeholder_mint.toBase58());
            const createPlaceholderIx = await program.methods
              .createPlaceholder(
                new anchor.BN(id),
                uri,
              )
              .accounts({
                admin: admin,
                adminState,   
                collection,
                placeholder,
                mint: placeholder_mint,
                auth,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                token2022Program: TOKEN_2022_PROGRAM_ID,
                protocol: protocol,
                systemProgram: SystemProgram.programId,
              })
              .instruction()
            
            const airdropPlaceholderIx = await program.methods
                .airdropPlaceholder()
                .accounts({
                    buyer: buyer,
                    payer: admin,
                    collection,
                    collectionOwner: collectionOwner,
                    buyerMintAta: buyerPlaceholderAta,
                    placeholder,
                    mint: placeholder_mint,
                    auth,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    token2022Program: TOKEN_2022_PROGRAM_ID,
                    protocol: protocol,
                    systemProgram: SystemProgram.programId,
                })
                .instruction()
                
            // const { blockhash } = await connection.getLatestBlockhash("finalized");
            // const transaction = new Transaction({
            //     recentBlockhash: blockhash,
            //     feePayer: admin.publicKey,
            // });

            // transaction
            //     .add(modifyComputeUnitIx)
            //     .add(createPlaceholderIx)
            //     .add(transferPlaceholderIx);
            // transaction.partialSign(admin);
            // const serializedTransaction = transaction.serialize({
            //     requireAllSignatures: false,
            //   });
            // const base64 = serializedTransaction.toString("base64");
            // const base64JSON = JSON.stringify(base64);

            // return base64JSON;

            const instructions: TransactionInstruction[] = [createPlaceholderIx, airdropPlaceholderIx];

            return {
                instructions: instructions
            }
        }catch(error){
            throw new Error(`Failed to create Placeholder: ${error}`);
        }

    };
}   