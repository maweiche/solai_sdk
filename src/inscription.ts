import { SDK } from ".";
import * as anchor from "@coral-xyz/anchor";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { Connection, Keypair } from "@solana/web3.js";
import { Pda, keypairIdentity, PublicKey } from "@metaplex-foundation/umi";
import {
    mplInscription,
    findInscriptionMetadataPda,
    findInscriptionShardPda,
    initializeFromMint,
    findMintInscriptionPda,
    fetchInscriptionMetadata,
    writeData,
  } from '@metaplex-foundation/mpl-inscription'

export class Inscription {
    private readonly sdk: SDK;

    constructor(sdk: SDK) {
        this.sdk = sdk;
    }
    /**
     * 
     * 
     * 
     */

    public async createInscription(
        connection: Connection,
        owner: PublicKey,
        mint: PublicKey,
        keypair: Keypair,
        metadata: any
    ): Promise<{ inscriptionAccount: string, inscriptionMetadataAccount: string, inscriptionRank: string }>{
        try{
            
            const umi = createUmi('https://api.devnet.solana.com').use(mplInscription())
            const keypair_ = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(keypair.secretKey));
            umi.use(keypairIdentity(keypair_));
            // Step 2: Inscribe JSON
            const inscriptionShardAccount = await findInscriptionShardPda(umi, {
                shardNumber: 4, //random number between 0 and 31
              })
              await initializeFromMint(umi, {
                mintAccount: mint,
                inscriptionShardAccount,
              }).sendAndConfirm(umi)
            const inscriptionAccount = await findMintInscriptionPda(umi, {
                mint: mint,
            })
            const inscriptionMetadataAccount = await findInscriptionMetadataPda(umi, {
                inscriptionAccount: inscriptionAccount[0],
            })
            
            await initializeFromMint(umi, {
                mintAccount: mint,
            })
                .add(
                writeData(umi, {
                    inscriptionAccount,
                    inscriptionMetadataAccount,
                    value: Buffer.from(
                    JSON.stringify(metadata) // your NFT's JSON to be inscribed
                    ),
                    associatedTag: null,
                    offset: 0,
                })
                )
                .sendAndConfirm(umi)
            
            const inscriptionMetadata = await fetchInscriptionMetadata(
                umi,
                inscriptionMetadataAccount
            )
            console.log(
                'Inscription number: ',
                inscriptionMetadata.inscriptionRank.toString()
            )

            return {
                inscriptionAccount: inscriptionAccount[0].toString(),
                inscriptionMetadataAccount: inscriptionMetadataAccount.toString(),
                inscriptionRank: inscriptionMetadata.inscriptionRank.toString()
            }
        } catch(error){
            throw new Error(`Failed to get collection: ${error}`);
        }
    }
};