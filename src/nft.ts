// this will combine
// 1. createNft
// 2. transferNft

// into one txn instruction and return it
import { SDK } from ".";
import * as anchor from "@coral-xyz/anchor";
import sol_factory_idl from "src/idl/sol_factory.json";
import { PublicKey, Transaction, Connection, ComputeBudgetProgram, SystemProgram, sendAndConfirmTransaction, Keypair, TransactionInstruction } from "@solana/web3.js";
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
        bearer: string,
        admin: Keypair,
        collectionOwner: PublicKey,
        buyer: PublicKey,
        id: number,
    ): Promise<{ 
        // tx_signature: string, 
        // nft_mint: string 
        instructions: any
      }>{
        try{
            const modifyComputeUnitIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 });
            const program = this.sdk.program;
            const protocol = PublicKey.findProgramAddressSync([Buffer.from('protocol')], program.programId)[0];
            console.log('collection owner', collectionOwner.toBase58())
            const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), collectionOwner.toBuffer()], program.programId)[0];
            console.log('collection', collection.toBase58())
            const getCollectionUrl = async (collection: PublicKey) => {
              console.log('collection', collection.toBase58())
              const collection_data = await connection.getAccountInfo(collection);
              const collection_decode = program.coder.accounts.decode("Collection", collection_data!.data);
              // console.log('collection_decode', collection_decode)
              return collection_decode.url;
            };

            const url = await getCollectionUrl(collection);

            const nft_data = await fetch(url, {
                method: 'POST',
                headers: {
                  "x-authorization" : `Bearer ${bearer}`
                },
              });
              const metadata_json = await nft_data.json(); 
              const areweave_metadata: any = await fetch(metadata_json.metadataUrl)
              const areweave_json = await areweave_metadata.json()

              const nft_name = areweave_json.name;
              const attributes = metadata_json.attributes.map((attr: any) => {
                return {key: attr.trait_type, value: attr.value}
            });


              
              const nft = PublicKey.findProgramAddressSync([Buffer.from('ainft'), collection.toBuffer(), new anchor.BN(id).toBuffer("le", 8)], program.programId)[0];
              const nft_mint = PublicKey.findProgramAddressSync([Buffer.from('mint'), nft.toBuffer()], program.programId)[0];
              
              const auth = PublicKey.findProgramAddressSync([Buffer.from('auth')], program.programId)[0];
              const adminState = PublicKey.findProgramAddressSync([Buffer.from('admin_state'), admin.publicKey.toBuffer()], program.programId)[0];
              const buyerNftAta = getAssociatedTokenAddressSync(nft_mint, buyer, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)

              const placeholder = PublicKey.findProgramAddressSync([Buffer.from('placeholder'), collection.toBuffer(), new anchor.BN(id).toBuffer("le", 8)], program.programId)[0];
              const placeholder_mint = PublicKey.findProgramAddressSync([Buffer.from('mint'), placeholder.toBuffer()], program.programId)[0];
              console.log('placeholder to base58', placeholder.toBase58())
              console.log('placeholder mint to base58', placeholder_mint.toBase58())
              const buyerPlaceholderAta = getAssociatedTokenAddressSync(placeholder_mint, buyer, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
              console.log('buyerPlaceholderAta', buyerPlaceholderAta.toBase58())
              const createNftIx = await program.methods
                .createNft(
                  new anchor.BN(id),
                  metadata_json.metadataUrl,
                  nft_name,
                  attributes,
                )
                .accounts({
                  admin: admin.publicKey,
                  adminState,   
                  collection: collection,
                  nft,
                  mint: nft_mint,
                  auth,
                  rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                  token2022Program: TOKEN_2022_PROGRAM_ID,
                  protocol: protocol,
                  systemProgram: SystemProgram.programId,
                })
                .instruction()
    
              console.log('buyerPlaceholderAta222', buyerPlaceholderAta.toBase58())
              const transferNftIx = await program.methods
                .transferNft()
                .accounts({
                  payer: admin.publicKey,
                  buyer: buyer,
                  buyerMintAta: buyerNftAta,
                  nft,
                  mint: nft_mint,
                  collection,
                  auth,
                  buyerPlaceholderMintAta: buyerPlaceholderAta,
                  placeholder,
                  placeholderMint: placeholder_mint,
                  placeholderMintAuthority: admin.publicKey,
                  associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                  tokenProgram: TOKEN_PROGRAM_ID,
                  token2022Program: TOKEN_2022_PROGRAM_ID,
                  protocol: protocol,
                  systemProgram: SystemProgram.programId,
                })
                .instruction();

                // const { blockhash } = await connection.getLatestBlockhash("finalized");
                // const transaction = new Transaction({
                //     recentBlockhash: blockhash,
                //     feePayer: admin.publicKey,
                // });

                // transaction.add(modifyComputeUnitIx).add(createNftIx).add(transferNftIx);

                // const tx_signature = await sendAndConfirmTransaction(
                //     connection,
                //     transaction,
                //     [admin],
                //     { commitment: 'confirmed', skipPreflight: true }
                // );
                
                const instructions: TransactionInstruction[] = [modifyComputeUnitIx, createNftIx, transferNftIx];
            return {
                // tx_signature: tx_signature,
                // nft_mint: nft_mint.toString(),
                instructions: instructions
            }
        } catch (error) {
            throw new Error(`Failed to create NFT: ${error}`);
        }
    }
};