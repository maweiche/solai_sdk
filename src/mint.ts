import { SDK } from ".";
import * as anchor from "@coral-xyz/anchor";
import sol_factory_idl from "src/idl/sol_factory.json";
import { PublicKey, Transaction, Connection, ComputeBudgetProgram, SystemProgram, sendAndConfirmTransaction, Keypair } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export class Mint {
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

    public async mint_nft(
        connection: Connection,
        url: string,
        bearer: string,
        admin: Keypair,
        collectionOwner: PublicKey,
        buyer: PublicKey,
    ): Promise<{ message: string }>{
        try{
            const id = Math.floor(Math.random() * 100000);
            const program = this.sdk.program;

            await this.sdk.placeholder.createPlaceholder(
                connection,
                admin,
                collectionOwner,
                buyer,
                id,
                url,
            );

            await this.sdk.nft.createNft(
                connection,
                url,
                bearer,
                admin,
                collectionOwner,
                buyer,
            );

            await this.sdk.placeholder.burnPlaceholder(
                connection,
                id,
                admin,
                buyer,
                collectionOwner,
            );

            return { message: "success" };

        } catch (error) {
            console.error(error);
            return { message: "error" };
        }
    }
};