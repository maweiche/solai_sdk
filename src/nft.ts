import { SDK } from ".";
import * as anchor from "@coral-xyz/anchor";
import sol_factory_idl from "src/idl/sol_factory.json";
import { PublicKey, Transaction, Connection, ComputeBudgetProgram, SystemProgram, sendAndConfirmTransaction, Keypair, TransactionInstruction } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getTokenMetadata } from "@solana/spl-token";
import axios from "axios";
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
        placeholderMint: PublicKey,
    ): Promise<{ 
        tx_signature: string, 
        nft_mint: string 
      }>{
        try{
            const modifyComputeUnitIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 });
            const program = this.sdk.program;
            const protocol = PublicKey.findProgramAddressSync([Buffer.from('protocol')], program.programId)[0];
            const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), collectionOwner.toBuffer()], program.programId)[0];
            const collection_mint = PublicKey.findProgramAddressSync([Buffer.from('mint'), collection.toBuffer()], program.programId)[0];
            const adminState = PublicKey.findProgramAddressSync([Buffer.from('admin_state'), admin.publicKey.toBuffer()], program.programId)[0];


            const placeholder_metadata = await getTokenMetadata(connection, placeholderMint);            
            const additional_metadata = placeholder_metadata.additionalMetadata;
            console.log('placeholder metadata', additional_metadata)
            const id = additional_metadata[0][1];
            const count = additional_metadata[1][1];

            // GET THE DYNAMIC IMAGE GENERATION URL
            const getCollectionUrl = async(collection: PublicKey) => {
              const collection_data = await connection.getAccountInfo(collection);
              const collection_decode = program.coder.accounts.decode("Collection", collection_data.data);
              return {
                url: collection_decode.url,
              }
            };

            const { url } = await getCollectionUrl(collection);
            
            // BEGIN THE NFT CREATION
            const url_as_string = `${url}/${count}/${buyer.toBase58()}`
            console.log('URL TO POLL: ', bearer)

            const nft_data: any = await axios.post(url_as_string, {}, {
              headers: {
                "x-authorization" : `Bearer ${bearer}`
              }
            })
            console.log('nft_data', nft_data)
            const metadata_json = await nft_data.data;
            console.log('metadata_json', metadata_json)
            await new Promise(resolve => setTimeout(resolve, 3000));
            let arweave_metadata;
            arweave_metadata = await fetch(metadata_json.metadataUrl)

            console.log('arweave_metadata', arweave_metadata)

            let retries = 0;
            while(arweave_metadata.status !== 200 && retries < 5){
              await new Promise(resolve => setTimeout(resolve, 3000));
              arweave_metadata = await fetch(metadata_json.metadataUrl);
              retries++;
            }
            if(arweave_metadata.status !== 200){
              throw new Error(`Failed to fetch metadata from Arweave: ${arweave_metadata.status}`);
            }
            
              const arweave_json = await arweave_metadata.json()
              
              const nft_name = arweave_json.name;
              const attributes = metadata_json.attributes.map((attr: any) => {
                return {key: attr.trait_type, value: attr.value}
              });

              attributes.push({key: 'token_id', value: count})
              console.log('attributes after all is added', attributes)
              const nft = PublicKey.findProgramAddressSync([Buffer.from('ainft'), collection.toBuffer(), new anchor.BN(id).toBuffer("le", 8)], program.programId)[0];
              const nft_mint = PublicKey.findProgramAddressSync([Buffer.from('mint'), nft.toBuffer()], program.programId)[0];
              
              const auth = PublicKey.findProgramAddressSync([Buffer.from('auth')], program.programId)[0];
              const buyerNftAta = getAssociatedTokenAddressSync(nft_mint, buyer, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)

              const placeholder = PublicKey.findProgramAddressSync([Buffer.from('placeholder'), collection.toBuffer(), new anchor.BN(id).toBuffer("le", 8)], program.programId)[0];
              const placeholder_mint = PublicKey.findProgramAddressSync([Buffer.from('mint'), placeholder.toBuffer()], program.programId)[0];
              const buyerPlaceholderAta = getAssociatedTokenAddressSync(placeholder_mint, buyer, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

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
                  collectionMint: collection_mint,
                  nft,
                  mint: nft_mint,
                  auth,
                  rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                  token2022Program: TOKEN_2022_PROGRAM_ID,
                  protocol: protocol,
                  systemProgram: SystemProgram.programId,
                })
                .instruction()
    
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
                
                const instructions: TransactionInstruction[] = [modifyComputeUnitIx, createNftIx, transferNftIx];

                const txn = new Transaction();
                txn.add(
                  ...instructions
                );

                const _sig = await sendAndConfirmTransaction(
                  connection,
                  txn,
                  [admin],
                  { commitment: 'confirmed' }
                );

            return {
              tx_signature: _sig,
              nft_mint: nft_mint.toBase58()
            }
        } catch (error) {
            throw new Error(`Failed to create NFT: ${error}`);
        }
    }
};