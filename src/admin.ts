// this will combine
// 1. inititialize an Admin of the Program
// 2. Get the Current Admin of the Program

import { SDK } from ".";
import * as anchor from "@coral-xyz/anchor";
import sol_factory_idl from "src/idl/sol_factory.json";
import { PublicKey, Transaction, Connection, ComputeBudgetProgram, SystemProgram, sendAndConfirmTransaction, Keypair } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export class Admin {
    private readonly sdk: SDK;

    constructor(sdk: SDK) {
        this.sdk = sdk;
    }
    /**
     * 
     * 
     * 
     */

    public async initAdmin(
        connection: Connection,
        admin: PublicKey,
        username: string,
        newAdmin?: PublicKey,
    ): Promise<string>{
        try{
            const program = this.sdk.program;

            const adminState = PublicKey.findProgramAddressSync([Buffer.from('admin_state'), admin.toBuffer()], program.programId)[0];
            const newAdminState = PublicKey.findProgramAddressSync([Buffer.from('admin_state'), newAdmin ? newAdmin.toBuffer() : admin.toBuffer()], program.programId)[0];

            const createAdminIx = await program.methods
                .initializeAdminAccount(username)
                .accounts({
                    admin: admin,
                    adminState: null,
                    newAdmin: newAdmin ? newAdmin : admin,
                    newAdminState: adminState,
                    systemProgram: SystemProgram.programId,
                })
                .instruction()

            const { blockhash } = await connection.getLatestBlockhash("finalized");
            const transaction = new Transaction({
                recentBlockhash: blockhash,
                feePayer: admin,
            });

            transaction.add(createAdminIx);

            const serializedTransaction = transaction.serialize({
                requireAllSignatures: false,
              });
            const base64 = serializedTransaction.toString("base64");
                
            return JSON.stringify({transaction: base64 })
        } catch (error) {
            throw new Error(`Failed to create NFT: ${error}`);
        }
    }

    public async getAdmin(){};
};