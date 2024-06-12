// this will combine
// 1. createNft
// 2. transferNft

// into one txn instruction and return it
import { SDK } from ".";
import * as anchor from "@coral-xyz/anchor";
import sol_factory_idl from "src/idl/sol_factory.json";
import { PublicKey, Transaction, Connection, ComputeBudgetProgram, SystemProgram, sendAndConfirmTransaction, Keypair } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export class Nft {
    private readonly sdk: SDK;

    constructor(sdk: SDK) {
        this.sdk = sdk;
    }
    /**
     * Creates an NFT by pinging the respective API and minting through the SolAI Program.
     * 
     * The program will return the minted NFT's address and the tx signature.
     * 
     * This program is signed by the protocol wallet.
     * 
     * To use this method, you must first initialize an instance of the SDK.
     * The client will be used to fetch profile information.
     */

    public async createNft(
        connection: Connection,
        url: string,
        bearer: string,
        collectionAccount: PublicKey,
        owner: PublicKey,
        payer: Keypair,
    ): Promise<{ tx_signature: string, nft_mint: string }>{
        try{
            const modifyComputeUnitIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 });
            const id = Math.floor(Math.random() * 100000);
            const program = this.sdk.program;

            const nft_data = await fetch(url, {
                method: 'POST',
                headers: {
                  "x-authorization" : `Bearer ${bearer}`
                },
              });
              const metadata_json = await nft_data.json(); 
              const nft_name = metadata_json.name;
              const attributes = metadata_json.attributes.map((attr: any) => {
                return {key: attr.trait_type, value: attr.value}
              });
              const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), collectionAccount.toBuffer()], program.programId)[0];
              const nft = PublicKey.findProgramAddressSync([Buffer.from('ainft'), collection.toBuffer(), new anchor.BN(id).toBuffer("le", 8)], program.programId)[0];
              const nft_mint = PublicKey.findProgramAddressSync([Buffer.from('mint'), nft.toBuffer()], program.programId)[0];
              
              const auth = PublicKey.findProgramAddressSync([Buffer.from('auth')], program.programId)[0];
              const adminState = PublicKey.findProgramAddressSync([Buffer.from('admin_state'), payer.publicKey.toBuffer()], program.programId)[0];
              let ownerNftAta = getAssociatedTokenAddressSync(nft_mint, owner, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
    
              const createNftIx = await program.methods
                .createNft(
                  new anchor.BN(id),
                  metadata_json.metadataUrl,
                  nft_name,
                  attributes,
                )
                .accounts({
                  admin: payer.publicKey,
                  adminState,   
                  collection,
                  nft,
                  mint: nft_mint,
                  auth,
                  rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                  token2022Program: TOKEN_2022_PROGRAM_ID,
                  systemProgram: SystemProgram.programId,
                })
                .instruction()
    
              const transferNftIx = await program.methods
                .transferNft()
                .accounts({
                  payer: payer.publicKey,
                  buyer: owner,
                  buyerMintAta: ownerNftAta,
                  nft,
                  mint: nft_mint,
                  collection,
                  auth,
                  associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                  tokenProgram: TOKEN_PROGRAM_ID,
                  token2022Program: TOKEN_2022_PROGRAM_ID,
                  systemProgram: SystemProgram.programId,
                })
                .instruction();

                const { blockhash } = await connection.getLatestBlockhash("finalized");
                const transaction = new Transaction({
                    recentBlockhash: blockhash,
                    feePayer: payer.publicKey,
                });

                transaction.add(modifyComputeUnitIx).add(createNftIx).add(transferNftIx);

                const tx_signature = await sendAndConfirmTransaction(
                    connection,
                    transaction,
                    [payer],
                    { commitment: 'confirmed', skipPreflight: true }
                );
                
            return {
                tx_signature: tx_signature,
                nft_mint: nft_mint.toString(),
            }
        } catch (error) {
            throw new Error(`Failed to create NFT: ${error}`);
        }
    }
};