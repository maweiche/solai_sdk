import { SDK } from ".";
import { PublicKey, Transaction, Connection, SystemProgram, MemcmpFilter, DataSizeFilter, GetProgramAccountsConfig } from "@solana/web3.js";

export type AdminAccount = {
    publickey: string;
    username: string;
    initialized: string;
}

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
    public async checkIfAdmin(
        connection: Connection,
        admin: PublicKey
    ): Promise<AdminAccount | undefined> {
        const program = this.sdk.program;
        const memcmp_filter: MemcmpFilter = {
            memcmp: {
                offset: 8,
                bytes: admin.toBase58()
            }
        };
        

        const get_accounts_config: GetProgramAccountsConfig = {
            commitment: "confirmed",
            filters: [ memcmp_filter ]
        };

        try {
        
            const _admin = await connection.getProgramAccounts(
                this.sdk.program.programId, 
                get_accounts_config  
            );


            if(!_admin) return undefined;

            const admin_decoded = program.coder.accounts.decode("Admin", _admin[0].account.data);

            const admin = {
                publickey: admin_decoded.publickey.toBase58(),
                username: admin_decoded.username,
                initialized: new Date(admin_decoded.initialized.toNumber() * 1000).toLocaleString(),
            }

            return admin;

        } catch (error) {
            throw new Error(`Failed to get Admin: ${error}`);
        }
    }

    public async initAdmin(
        connection: Connection,
        admin: PublicKey,
        username: string,
        newAdmin?: PublicKey,
    ): Promise<string>{
        try{
            const program = this.sdk.program;
            const protocol = PublicKey.findProgramAddressSync([Buffer.from('protocol')], program.programId)[0];
            const adminState = PublicKey.findProgramAddressSync([Buffer.from('admin_state'), admin.toBuffer()], program.programId)[0];
            const newAdminState = PublicKey.findProgramAddressSync([Buffer.from('admin_state'), newAdmin ? newAdmin.toBuffer() : admin.toBuffer()], program.programId)[0];

            const createAdminIx = await program.methods
                .initializeAdminAccount(username)
                .accounts({
                    admin: admin,
                    adminState: null,
                    newAdmin: admin,
                    newAdminState: adminState,
                    protocol: protocol,
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
                
            return base64
        } catch (error) {
            throw new Error(`Failed to create NFT: ${error}`);
        }
    }

    public async initProtocolAccount(
        connection: Connection,
        admin: PublicKey,
    ):Promise<string>{
        try{
            const program = this.sdk.program;
            const protocol = PublicKey.findProgramAddressSync([Buffer.from('protocol')], program.programId)[0];

            const createAdminIx = await program.methods
                .initializeProtocolAccount()
                .accounts({
                    admin: admin,
                    protocol: protocol,
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
                
            return base64
        } catch (error) {
            throw new Error(`Failed to create NFT: ${error}`);
        }
    };

    public async lockProtocolAccount(
        connection: Connection,
        admin: PublicKey,
    ):Promise<string>{
        try{
            const program = this.sdk.program;
            const protocol = PublicKey.findProgramAddressSync([Buffer.from('protocol')], program.programId)[0];

            const createAdminIx = await program.methods
                .lockProtocol()
                .accounts({
                    admin: admin,
                    protocol: protocol,
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
                
            return base64
        } catch (error) {
            throw new Error(`Failed to create NFT: ${error}`);
        }
    };
};