import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { expect } from "chai";
import {
  PublicKey,
  SystemProgram,
  ComputeBudgetProgram,
  sendAndConfirmTransaction,
  Keypair,
  Transaction,
  Connection,
  GetProgramAccountsConfig,
  DataSizeFilter
} from "@solana/web3.js";
import dotenv from "dotenv";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { describe, it } from "node:test";
dotenv.config();

anchor.setProvider(anchor.AnchorProvider.env());
// anchor.setProvider(anchor.AnchorProvider.env());
const _keypair = require('../test-wallet/keypair.json')
const userKeypair = Keypair.fromSecretKey(Uint8Array.from(_keypair))
const userWallet = new NodeWallet(userKeypair);
anchor.setProvider(anchor.AnchorProvider.env());

describe("Create a new collection and get all collections", async () => {
  let sdk: SDK;
  let profilePDA: anchor.web3.PublicKey;
  let postPDA: anchor.web3.PublicKey;
  let program: anchor.Program;
  console.log('starting')
  const wallet = userWallet;
  const provider = anchor.getProvider();
  const connection = new Connection("https://api.devnet.solana.com", "finalized");
  // const programId = new PublicKey("EsgdV69W9Qi6i2q6Gfus8vuy27aXwrf61gC1z1hbnr6d");
  console.log('wallet', wallet.publicKey.toBase58());

  // Helpers
  function wait(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...block
    })
    return signature
  }

  const log = async(signature: string): Promise<string> => {
    console.log(`Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`);
    return signature;
  }

  // const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), wallet.publicKey.toBuffer()], program.programId)[0];

  //  console.log('all_program_accounts', all_program_accounts)
  // const id = Math.floor(Math.random() * 100000);
  // const placeholder = PublicKey.findProgramAddressSync([Buffer.from('placeholder'), collection.toBuffer(), new anchor.BN(id).toBuffer("le", 8)], program.programId)[0];
  // const placeholder_mint = PublicKey.findProgramAddressSync([Buffer.from('mint'), placeholder.toBuffer()], program.programId)[0];

  // const nft = PublicKey.findProgramAddressSync([Buffer.from('ainft'), collection.toBuffer(), new anchor.BN(id).toBuffer("le", 8)], program.programId)[0];
  // const nft_mint = PublicKey.findProgramAddressSync([Buffer.from('mint'), nft.toBuffer()], program.programId)[0];
  
  // const auth = PublicKey.findProgramAddressSync([Buffer.from('auth')], program.programId)[0];
  // const adminState = PublicKey.findProgramAddressSync([Buffer.from('admin_state'), wallet.publicKey.toBuffer()], program.programId)[0];

  // const buyer_keypair = require('../test-wallet/keypair.json')
  // const buyer = Keypair.fromSecretKey(Uint8Array.from(buyer_keypair))
  // const buyer_collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), buyer.publicKey.toBuffer()], program.programId)[0];
  // console.log(buyer.publicKey.toBase58()); 
  // let buyerPlaceholderAta = getAssociatedTokenAddressSync(placeholder_mint, buyer.publicKey, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
  // let buyerNftAta = getAssociatedTokenAddressSync(nft_mint, buyer.publicKey, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
  it("should return a list of collections", async () => {
    sdk = new SDK(
      userWallet as NodeWallet,
      new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed"),
      { skipPreflight: true},
      "devnet",
    );

    const _collections = await sdk.collection.getAllCollections(connection);
    
    console.log('collections', _collections);
    const whitelist_to_string = _collections[0].whitelist.wallets.map((wallets) => {
        return wallets.toString()
    });

    console.log('whitelist_to_string', whitelist_to_string)
  });

  it("should return a collection specific to an owner", async () => {
    sdk = new SDK(
      userWallet as NodeWallet,
      new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed"),
      { skipPreflight: true},
      "devnet",
    );
    const owner = new PublicKey("6KuX26FZqzqpsHDLfkXoBXbQRPEDEbstqNiPBKHNJQ9e");
    const _collection = await sdk.collection.getCollectionByOwner(connection, owner);
    
    console.log('collections', _collection);
  });
  // async function getAllCollections() {
  //   const size_filter: DataSizeFilter = {
  //     dataSize: 245
  //   };
  //   const get_accounts_config: GetProgramAccountsConfig = {
  //       commitment: "confirmed",
  //       filters: [size_filter]
  //   };

  //   const all_collections = await connection.getProgramAccounts(
  //     programId, 
  //     get_accounts_config
  //   );
  //   console.log('all_collections', all_collections)

    // ex. collection:
    // {
  //   account: {
  //     data: <Buffer 5b da f2 1c 8b d0 49 59 84 35 00 00 00 00 00 00 27 26 92 08 00 b7 4c a4 e3 1a 20 a2 71 97 b7 cd e0 4f 8a a9 d9 96 ac 48 35 02 41 49 9e 42 f1 c2 06 00 ... 52 more bytes>,
  //     executable: false,
  //     lamports: 1600800,
  //     owner: [PublicKey [PublicKey(EsgdV69W9Qi6i2q6Gfus8vuy27aXwrf61gC1z1hbnr6d)]],
  //     rentEpoch: 18446744073709552000,
  //     space: 102
  //   },
  //   pubkey: PublicKey [PublicKey(F67Lkabu45txsmB7j6jgsac6uRT3kGCcmsR4vwK5gici)] {
  //     _bn: <BN: d152b0b6a0ad1f2e32f18b7630b5f054483a3075c62a4864c4617fee0496a173>
  //   }
  // }

    // for each collection we need to return the account.space and pubkey.toString()

  //   const _collection_decode = all_collections.map((collection) => {
  //       try {
  //           const decode = program.coder.accounts.decode("collection", collection.account.data);
  //           console.log('decode', decode)
  //           return decode;
  //       } catch (error) {
  //           console.log('error', error)
  //           return null;
  //       }
  //   })

  //   console.log('_collection_decode', _collection_decode)

  //   return all_collections;
  // }

  // getAllCollections();
  

  // it ("Initialize a new Admin", async () => {
  //   const username = "MW";

  //   const createAdminIx = await program.methods
  //   .initializeAdminAccount(username)
  //   .accounts({
  //     admin: wallet.publicKey,
  //     adminState: null,
  //     newAdmin: wallet.publicKey,
  //     newAdminState: adminState,
  //     systemProgram: SystemProgram.programId, //TYPE: PublicKey
  //   })
  //   .instruction()

  //   const tx = new anchor.web3.Transaction().add(createAdminIx);
  //   await sendAndConfirmTransaction(connection, tx, [wallet.payer], {commitment: "finalized", skipPreflight: true}).then(confirm).then(log);
  // });

  // it("Create Collection", async () => {
  //   const name = "Test 2 Collection";
  //   const symbol = "TST2";
  //   const sale_start_time = new anchor.BN(0);
  //   const max_supply = new anchor.BN(100);
  //   const price = new anchor.BN(1);
  //   const whitelist_price = new anchor.BN(0);
  //   const stable_id = "TST2";
  //   const reference = "TST456";
  //   const date_i64 = new anchor.BN(Date.now());
  //   const yesterday_date_i64 = new anchor.BN(Date.now() * 1000 - 86400000);

    

  //   const createCollectionIx = await program.methods
  //     .createCollection(
  //       name,
  //       symbol,
  //       date_i64,
  //       max_supply,
  //       price,
  //       stable_id,
  //       reference,
  //       [
  //         new PublicKey('7wK3jPMYjpZHZAghjersW6hBNMgi9VAGr75AhYRqR2n'),
  //         new PublicKey('2UbngADg4JvCftthHoDY4gKNqsScRsQ1LLtyDqLQbWhb'),
  //         new PublicKey('DEVJb1nq3caksGybAFxoxsYXLi9nyp8ZQnmAFmfAYMSN')
  //       ],
  //       yesterday_date_i64,
  //       whitelist_price
  //     )
  //     .accounts({
  //       owner: buyer.publicKey,
  //       collection: buyer_collection,
  //       systemProgram: SystemProgram.programId,
  //     })
  //     .instruction()

  //   const tx = new anchor.web3.Transaction().add(createCollectionIx);
  //   await sendAndConfirmTransaction(connection, tx, [buyer], {commitment: "finalized", skipPreflight: true}).then(confirm).then(log);
  // });

  // it("Create Placeholder", async () => {
  //   const modifyComputeUnitIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 });
    
  //   const createListingIx = await program.methods
  //   .createPlaceholder(
  //     new anchor.BN(id),
  //     "https://www.example.com",
  //   )
  //   .accounts({
  //     admin: wallet.publicKey,
  //     adminState,   
  //     collection,
  //     placeholder,
  //     mint: placeholder_mint,
  //     auth,
  //     rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //     token2022Program: TOKEN_2022_PROGRAM_ID,
  //     systemProgram: SystemProgram.programId,
  //   })
  //   .instruction()

  //   const tx = new anchor.web3.Transaction().add(modifyComputeUnitIx).add(createListingIx);
  //   await sendAndConfirmTransaction(connection, tx, [wallet.payer], {commitment: "finalized", skipPreflight: true}).then(confirm).then(log);
  // });

  // it("Buy Placeholder", async () => {
  //   const transaction = new Transaction().add(
  //     await program.methods
  //     .buyPlaceholder()
  //     .accounts({
  //       payer: wallet.publicKey,
  //       buyer: buyer.publicKey,
  //       collection,
  //       buyerMintAta: buyerPlaceholderAta,
  //       placeholder,
  //       mint: placeholder_mint,
  //       auth,
  //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       token2022Program: TOKEN_2022_PROGRAM_ID,
  //       systemProgram: SystemProgram.programId,
  //     })
  //     .instruction()
  //   );
  //   transaction.feePayer = wallet.publicKey;
    
  //   await sendAndConfirmTransaction(connection, transaction, [buyer, wallet.payer], {commitment: "finalized", skipPreflight: true}).then(confirm).then(log);
  // });

  // it("Create Nft", async () => {
  //   const modifyComputeUnitIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 });

  //   // const attributes = [
  //   //   {key: "season", value: "winter"},
  //   //   {key: "camera angle", value: "low angle"},
  //   //   {key: "theme", value: "nichijo"},
  //   //   {key: "seed", value: "3808958`1"},
  //   //   {key: "model", value: "gpt-3"},
  //   // ];
     
  //   // url for fetch: https://amin.stable-dilution.art/nft/item/generation/3/11/0xf75e77b4EfD56476708792066753AC428eB0c21c
  //   // headers: "x-authorization: Bearer ad4a356ddba9eff73cd627f69a481b8493ed975d7aac909eec4aaebdd9b506ef"

  //   const nft_data = await fetch("https://amin.stable-dilution.art/nft/item/generation/3/11/0xf75e77b4EfD56476708792066753AC428eB0c21c", {
  //     headers: {
  //       "x-authorization" : "Bearer ad4a356ddba9eff73cd627f69a481b8493ed975d7aac909eec4aaebdd9b506ef"
  //     }
  //   })
  //   console.log('nft data from api', nft_data)
  //   // fetch the name from the metadataUrl
  //   const metadata_json: any = await nft_data.json(); 
  //   console.log('metadata json from api', metadata_json)
  //   const nft_name = metadata_json.name;

  //   // sample response {"metadataUrl":"https://arweave.net/o8XcENbEAQie9Sr-esLrLy4g2u7gnu9Xj289mmOyJZ4","image":"https://arweave.net/E-uaro2mHTJFINUJc9nbu7aCsnCi6jdWov43MhqY9LI","seed":3808958412,"attributes":[{"trait_type":"Season","value":"Winter"},{"trait_type":"Camera Angle","value":"Low Angle"},{"trait_type":"Theme","value":"Nichijo"},{"trait_type":"Seed","value":"3808958412"}],"model_name":"sdxl-base-1.0","model_hash":"31e35c80fc"}
  //   const attributes = metadata_json.attributes.map((attr: any) => {
  //     return {key: attr.trait_type, value: attr.value}
  //   })
    
  //   const createListingIx = await program.methods
  //   .createNft(
  //     new anchor.BN(id),
  //     metadata_json.metadataUrl,
  //     nft_name,
  //     attributes,
  //   )
  //   .accounts({
  //     admin: wallet.publicKey,
  //     adminState,   
  //     collection,
  //     nft,
  //     mint: nft_mint,
  //     auth,
  //     rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //     token2022Program: TOKEN_2022_PROGRAM_ID,
  //     systemProgram: SystemProgram.programId,
  //   })
  //   .instruction()

  //   const tx = new anchor.web3.Transaction().add(modifyComputeUnitIx).add(createListingIx);
  //   await sendAndConfirmTransaction(connection, tx, [wallet.payer], {commitment: "finalized", skipPreflight: true}).then(confirm).then(log);
  // });

  // it("Transfer Nft", async () => {
  //   const transaction = new Transaction().add(
  //     await program.methods
  //     .transferNft()
  //     .accounts({
  //       payer: wallet.publicKey,
  //       buyer: buyer.publicKey,
  //       buyerMintAta: buyerNftAta,
  //       nft,
  //       mint: nft_mint,
  //       collection,
  //       auth,
  //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       token2022Program: TOKEN_2022_PROGRAM_ID,
  //       systemProgram: SystemProgram.programId,
  //     })
  //     .instruction()
  //   );
  //   transaction.feePayer = wallet.publicKey;
    
  //   await sendAndConfirmTransaction(connection, transaction, [buyer, wallet.payer], {commitment: "finalized", skipPreflight: true}).then(confirm).then(log);
  // });

  // it("Burn Placeholder", async () => {

  //   const transaction = new Transaction().add(
  //     await program.methods
  //     .burnPlaceholder()
  //     .accounts({
  //       buyer: buyer.publicKey,
  //       buyerMintAta: buyerPlaceholderAta,
  //       placeholder,
  //       placeholderMint: placeholder_mint,
  //       authority: auth,
  //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //       token2022Program: TOKEN_2022_PROGRAM_ID,
  //       systemProgram: SystemProgram.programId,
  //       mint: placeholder_mint,
  //       mintAuthority: wallet.publicKey
  //     })
  //     .instruction()
  //   );
    
  //   await sendAndConfirmTransaction(connection, transaction, [wallet.payer], {commitment: "finalized", skipPreflight: true}).then(confirm).then(log);
  // });
});