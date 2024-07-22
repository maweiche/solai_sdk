import { SDK } from "../src";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import {
  PublicKey,
  Keypair,
  Connection,
  GetProgramAccountsFilter,
} from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getTokenMetadata } from "@solana/spl-token";
import { describe, it } from "node:test";

const _keypair = require('../test-wallet/admin.json');
const userKeypair = Keypair.fromSecretKey(Uint8Array.from(_keypair))
const userWallet = new NodeWallet(userKeypair);


describe("Typical user flow of buying an NFT", async () => {
    let sdk: SDK;
    const wallet = userWallet;
    const connection = new Connection("https://api.devnet.solana.com", "finalized");


    it("should find a placeholder, create/transfer nft, burn placeholder", async () => {
        sdk = new SDK(
            userWallet as NodeWallet,
            connection,
            { skipPreflight: true},
            "devnet",
        );
        const program = sdk.program;
        const _keypair = require('../test-wallet/keypair.json');
        const userKeypair = Keypair.fromSecretKey(Uint8Array.from(_keypair));

        const buyer = new PublicKey('')
        const collection_owner = new PublicKey('') 
        const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), collection_owner.toBuffer()], program.programId)[0];
        console.log('placeholder collection owner', collection_owner.toBase58());
        console.log('placeholder collection', collection.toBase58());
        
            const filters:GetProgramAccountsFilter[] = [
                {
                  dataSize: 170,    //size of account (bytes)
                },
                {
                  memcmp: {
                    offset: 32,     //location of our query in the account (bytes)
                    bytes: buyer.toBase58(),  //our search criteria, a base58 encoded string
                  },            
                }];
            const accounts = await sdk.rpcConnection.getParsedProgramAccounts(
                TOKEN_2022_PROGRAM_ID, //new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
                {filters: filters}
            );
            console.log(`Found ${accounts.length} token account(s) for wallet ${wallet}.`);
            for( let i = 0; i < accounts.length; i++ ) {
                //Parse the account data
                const parsedAccountInfo:any = accounts[i].account.data;
                const mintAddress:string = parsedAccountInfo["parsed"]["info"]["mint"];
                const tokenBalance: number = parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];
        
                const _token_metadata = await getTokenMetadata(sdk.rpcConnection, new PublicKey(mintAddress));
        
                if (_token_metadata!.additionalMetadata.length < 6  || tokenBalance == 0  ) {
                  continue;
                }
        
                const collection_key = _token_metadata!.additionalMetadata[5][1]
        
                //Log results
                console.log(`Token Account No. ${i + 1}: ${accounts[i].pubkey.toString()}`);
                console.log(`--Token Mint: ${mintAddress}`);
                console.log(`--Token Balance: ${tokenBalance}`);
                console.log(`--Collection Key: ${collection_key}`);
        
                if( collection_key === collection.toBase58() && _token_metadata!.additionalMetadata[1][1] !== '14' && _token_metadata!.additionalMetadata[1][1] !== '11' ) {
                    console.log('We have a match: ', mintAddress)

                    const placeholder_mint = new PublicKey(mintAddress);
                    const placeholder_metadata = await getTokenMetadata(connection, placeholder_mint);
                    console.log('placeholder_metadata', placeholder_metadata)
                    
                    const additional_metadata = _token_metadata!.additionalMetadata;
                    const token_id = additional_metadata[1][1];
                    console.log('placeholder mint', placeholder_mint);
                    console.log('placeholder token id', token_id);

                    const getCollectionUrl = async(collection: PublicKey) => {
                        const collection_data = await connection.getAccountInfo(collection);
                        const collection_decode = program.coder.accounts.decode("Collection", collection_data!.data);
                        console.log('collection_decode', collection_decode)
                        return {
                            url: collection_decode.url,
                            count: collection_decode.mintCount.toNumber(),
                            owner: collection_decode.owner,
                        }
                    }
                    const { url, owner } = await getCollectionUrl(collection);
                    console.log('URL TO POLL: ',`${url}/${token_id}/${buyer.toBase58()}`)


                    
                    const {tx_signature, nft_mint} = await sdk.nft.createNft(
                        connection,  // connection: Connection,
                        'BEARER_TOKEN_HERE', // bearer
                        userKeypair, // admin
                        collection_owner, // collection owner
                        buyer, // buyer    
                        placeholder_mint // placeholder mint address
                    ); // returns txn signature and nft mint address
            

                    console.log(`nft mint: ${nft_mint}`);

                    console.log(`nft tx url: https://explorer.solana.com/tx/${tx_signature}?cluster=${sdk.cluster}`);
                }
            }
        
        
        
    });

});
