// this will
// 1. create a new collection that can be minted from
// 2. get collections, returns the publickey of all collections

import { SDK } from ".";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Transaction, Connection, SystemProgram, DataSizeFilter, GetProgramAccountsConfig } from "@solana/web3.js";

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
    whitelist: {
        wallets: PublicKey[]
    },
    whitelistStartTime: bigint,
    whitelistPrice: bigint
  }


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

    public async getCollectionByOwner(
        connection: Connection,
        owner: PublicKey
    ): Promise<CollectionData | null>{
        try{
            const program = this.sdk.program;
            const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), owner.toBuffer()], program.programId)[0];

            const collection_account = await connection.getAccountInfo(collection);

            if(!collection_account) return null;

            const decode = program.coder.accounts.decode("Collection", collection_account.data);

            if(!decode) return null;

            return decode;
        }catch(error){
            throw new Error(`Failed to get collection: ${error}`);
        }
    };
    public async getAllCollections(
        connection: Connection,
    ): Promise<CollectionData[]>{
        try{
            const program = this.sdk.program;
            const size_filter: DataSizeFilter = {
                dataSize: 302
            };

            const get_accounts_config: GetProgramAccountsConfig = {
                commitment: "confirmed",
                filters: [size_filter]
            };
            
            const all_collections = await connection.getProgramAccounts(
                this.sdk.program.programId, 
                get_accounts_config
            );

            const _collections_decoded = all_collections.map((collection) => {
                  try {
                      const decode = program.coder.accounts.decode("Collection", collection.account.data);
                      console.log('decode', decode)

                      if(!decode) return null;

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
        connection: Connection,
        owner: PublicKey,
        name: string,
        symbol: string,
        sale_start_time: anchor.BN,
        max_supply: anchor.BN,
        price: anchor.BN,
        stable_id: string,
        reference: string,
        whitelist?: PublicKey[] | undefined,
        whitelist_price?: anchor.BN | undefined,
        whitelist_start_time?: anchor.BN | undefined,
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
                
            return base64;
        }catch(error){
            throw new Error(`Failed to create Placeholder: ${error}`);
        }
    };
}