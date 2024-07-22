import { SDK } from ".";
import * as anchor from "@coral-xyz/anchor";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, TransactionInstruction, Connection, SystemProgram, Keypair, GetProgramAccountsConfig, MemcmpFilter } from "@solana/web3.js";

export type CollectionData = {
    name: string,
    symbol: string,
    owner: PublicKey,
    saleStartTime: bigint,
    maxSupply: bigint,
    totalSupply: bigint,
    price: bigint,
    stableId: string,
    reference: string,
  }


export class Collection {
    private readonly sdk: SDK;

    constructor(sdk: SDK) {
        this.sdk = sdk;
    }
    /**
     * 
     * Instructions for creating a collection, getting a collection by owner, and getting all collections.
     * 
     */

    public async getCollectionByOwner(
        connection: Connection,
        owner: PublicKey
    ): Promise<CollectionData | null>{
        try{
            const program = this.sdk.program;
            
            const protocol = PublicKey.findProgramAddressSync([Buffer.from('protocol')], program.programId)[0];
            const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), owner.toBuffer()], program.programId)[0];
            const collection_account = await connection.getAccountInfo(collection);
            if(!collection_account) return null;

            const decode = program.coder.accounts.decode("Collection", collection_account.data);
            if(!decode) return null;

            return decode
        }catch(error){
            throw new Error(`Failed to get collection: ${error}`);
        }
    };
    public async getAllCollections(
        connection: Connection,
    ): Promise<CollectionData[]>{
        try{
            const program = this.sdk.program;
            const collectionRefKey = new PublicKey("mwUt7aCktvBeSm8bry6TvqEcNSUGtxByKCbBKfkxAzA");
            const memcmp_filter: MemcmpFilter = {
                memcmp: {
                    offset: 8,
                    bytes: collectionRefKey.toBase58()
                }
            }

            const get_accounts_config: GetProgramAccountsConfig = {
                commitment: "confirmed",
                filters: [memcmp_filter]
            };
            
            const all_collections = await connection.getProgramAccounts(
                this.sdk.program.programId, 
                get_accounts_config
            );
            const _collections_decoded = all_collections.map((collection) => {
                try {
                    const decode = program.coder.accounts.decode("Collection", collection.account.data);
                    console.log('decode', decode)

                    if(!decode) return;

                    return decode;
                } catch (error) {
                    console.log('error', error)
                    return null;
                }
            })
            
            return _collections_decoded;
        }catch(error){
            throw new Error(`Failed to get collections: ${error}`);
        }
    }
    public async createCollection(
        admin: Keypair,
        owner: PublicKey,
        name: string,
        symbol: string,
        url: string,
        sale_start_time: anchor.BN,
        sale_end_time: anchor.BN,
        max_supply: anchor.BN,
        price: anchor.BN,
        stable_id: string,
    ): Promise<{ 
        instructions: TransactionInstruction[]
      }>{
        try{
            const program = this.sdk.program;
            const protocol = PublicKey.findProgramAddressSync([Buffer.from('protocol')], program.programId)[0];
            const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), owner.toBuffer()], program.programId)[0];
            const collection_mint = PublicKey.findProgramAddressSync([Buffer.from('mint'), collection.toBuffer()], program.programId)[0];

            const adminState = PublicKey.findProgramAddressSync([Buffer.from('admin_state'), admin.publicKey.toBuffer()], program.programId)[0];
            const collectionRefKey = new PublicKey("mwUt7aCktvBeSm8bry6TvqEcNSUGtxByKCbBKfkxAzA");
            const createCollectionIx = await program.methods
                .createCollection(
                    collectionRefKey,
                    name,
                    symbol,
                    url,
                    sale_start_time,
                    sale_end_time,
                    max_supply,
                    price,
                    stable_id,
                )
                .accounts({
                    admin: admin.publicKey,
                    owner,
                    collection,
                    mint: collection_mint,
                    adminState: adminState,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    token2022Program: TOKEN_2022_PROGRAM_ID,
                    protocol: protocol,
                    systemProgram: SystemProgram.programId,
                })
                .instruction()

           
                const instructions: TransactionInstruction[] = [createCollectionIx];
            return {
                instructions: instructions
            }
        }catch(error){
            throw new Error(`Failed to create Placeholder: ${error}`);
        }
    };
}