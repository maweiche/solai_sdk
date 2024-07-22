# SolAi - Solana Program SDK
A SDK built for use in correlation with Playground's [Vision](https://github.com/playground-solana/sol_factory) Solana program.

Below you can find instructions on using the SDK locally followed by a deeper dive into the SDK's structure and details.

> [!WARNING]  
> SolAi-SDK is still in development and is unstable, there can be minor and major changes at any time.

## Program ID
| Cluster      | Program Id |
| :---        |    :----:   |
| **Localnet**     | `E72hAXTsSJn79Xb9mBB7kmK9VoX3HGNaoCyrqEqCE6dd` |
| **Devnet**  | `E72hAXTsSJn79Xb9mBB7kmK9VoX3HGNaoCyrqEqCE6dd` |
| **Mainnet**  | `E72hAXTsSJn79Xb9mBB7kmK9VoX3HGNaoCyrqEqCE6dd`  |

## Description

The Vision program is structured for Artists to create on-chain `Collections` that a user can mint a Token-2022 `NFT` from on the Solana blockchain.

The Vision program was built for use with the [Vision SDK](https://www.npmjs.com/package/@maweiche/react-sdk).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [Anchor](https://www.anchor-lang.com/)
- [Solana CLI](https://docs.solanalabs.com/cli/install)
- [Solana Wallet](https://docs.solanalabs.com/cli/wallets/paper)

***For testing purposes it is advised to use at least three developer wallets (Admin, Artist, User)***

### Installation

```bash
npm install @maweiche/react-sdk
```

### Documentation

For more detailed documentation, please visit the [SolAI documentation](https://docs.com/).

### Usage
> **🚨 Important Notes**
> **Because SDK instances require Keypair usage all examples are for backend use**

To utilize the `sdk` you will need to import it's type and create an instance with the following to start:
- Wallet
- RPC Connection
- Confirm Options
- Cluster

```tsx
const keypair = Keypair.fromSecretKey(base58.decode(YOUR_BS58_SECRET_KEY));
const wallet = new NodeWallet(keypair);
const connection = new Connection('https://api.devnet.solana.com/', 'confirmed')

const sdk = new SDK(
  wallet,
  connection,
  { skipPreflight: true},
  "devnet",
)
```

## Collections

An Artist's Collection consists of the following data:

```tsx
{
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
```

Collections can be fetched two ways:
- **All** - returns every collection
- **Collection Owner** - Artist's Wallet Address

```tsx
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Keypair, Connection } from '@solana/web3.js';
import base58 from "bs58";
import { SDK } from '@maweiche/react-sdk';

export async function GET(request: Request) {
  try{
    const keypair = Keypair.fromSecretKey(base58.decode(YOUR_BS58_SECRET_KEY));

    const wallet = new NodeWallet(keypair);

    const connection = new Connection('https://api.devnet.solana.com/', 'confirmed')

    const sdk = new SDK(
      wallet,
      connection,
      { skipPreflight: true},
      "devnet",
    )

    // ALL COLLECTIONS******************************************
    const collections = await sdk.collection.getAllCollections(
      connection, // connection
    )
    

    // BY OWNER*************************************************
    const collection = await sdk.collection.getCollectionByOwner(
      connection, // connection
      owner // owner
    )
    
    if(!collections) {
      return new Response('error', { status: 500 });
    }

    return new Response(JSON.stringify(collections), { status: 200 });
  } catch (error) {
    console.log('error', error)
    return new Response('error', { status: 500 });
  }
}
```

To Create a Collection the signer of the transaction will be the owner of the Collection as well as the payer for the transaction fees.

The example below demonstrates a `POST` API route that returns a transaction to be signed by the user's wallet on the Front-End.

```tsx
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Keypair, Connection, PublicKey, Transaction } from '@solana/web3.js';
import { SDK } from '@maweiche/react-sdk';
import * as anchor from '@project-serum/anchor';
import base58, * as bs58 from "bs58";

export async function POST(request: Request) {
  const body = await request.json();

  const owner = new PublicKey(body.owner);  // Collection Owner
  const name = body.name; /// Test Collection
  const symbol = body.symbol; // TST
  const sale_start_time = new anchor.BN(body.sale_start_time); // new Date()
  const max_supply = new anchor.BN(body.max_supply); //100
  const price = new anchor.BN(body.price);   // 1.5

  const stable_id = body.stable_id;

  const keypair = Keypair.fromSecretKey(base58.decode(YOUR_BS58_SECRET_KEY));
  const wallet = new NodeWallet(keypair);
  const connection = new Connection('https://api.devnet.solana.com/', 'confirmed')
  const sdk = new SDK(
    wallet,
    connection,
    { skipPreflight: true},
    "devnet",
  )

  const { instructions } = await sdk.collection.createCollection(
    admin.publicKey,
    collectionOwner, // publickey
    name, //string
    symbol, // string
    url, // string
    sale_start_time, // Big Number
    sale_end_time, // Big Number
    max_supply, // Big Number
    price, // Big Number
    stable_id, //string
  );

  const tx = Transaction.from(Buffer.from(instructions, "base64"));
  const serializedTransaction = tx.serialize({
      requireAllSignatures: false,
    });
  const base64 = serializedTransaction.toString("base64");
  const base64JSON = JSON.stringify(base64);

  return new Response(base64JSON, { status: 200 });
}

```

### Collections - FRONT END
```tsx
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';

const { publicKey, sendTransaction } = useWallet();

const confirm = async (signature: string): Promise<string> => {
  const block = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
      signature,
      ...block
  })
  return signature
}

async function createCollection(){
  try {
    const _collection = await fetch('/api/collections/create', {
      method: 'POST',
      body: JSON.stringify({ 
        owner: publicKey?.toBase58(),
        name: name,
        symbol: symbol,
        sale_start_time: sale_start_time,
        max_supply: max_supply,
        price: price,
        stable_id: stable_id,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const _txJson = await _collection.json();
    const tx = Transaction.from(Buffer.from(_txJson, "base64"));
    const signature = await sendTransaction(tx, connection, {skipPreflight: true});
    console.log('signature', signature);
  } catch (error) {
    console.log(error)
  }
}

```


## Minting NFTs

After a user selects an available Collection they are able to Mint a NFT from that Collection. Because the AI Image Generation will not return instanaeously, we have built the following flow for the minting process:

- User Selects a Collection and clicks 'Mint'
- User is then prompted with a Transaction to pay the Mint price and receive a Placeholder NFT (Token 2022)
- Once the transaction is approved and confirmed the AI Image Generation begins
- Upon completion of the AI Image Generation a new NFT (Token 2022) is created and sent directly to the User while simultaneously Burning their Placeholder NFT.

For this API route example we broke this process down into two routes:
- `mint` - returns { instructions: TransactionInstruction[], placeholder_mint: PublicKey}
- `finalize` - returns { tx_signature: string, nft_mint: string }

The `mint` route returns a transaction to be signed by the user while the `finalize` returns a transaction signature since the admin wallet is paying for the nft transfer/creation after the AI Image Generation is complete.

> **🚨 Important Notes**
> **to prevent unauthorized calls to these functions, they require an admin signature**

### Standard Flow

#### Mint -- API ROUTE
```tsx
import { Keypair, Connection, PublicKey, Transaction } from '@solana/web3.js';
import { SDK } from '@maweiche/react-sdk';
import base58, * as bs58 from "bs58";
import dotenv from 'dotenv';
dotenv.config()
export async function POST(request: Request) {
  const body = await request.json();
  const id = body.id;
  const collectionOwner = new PublicKey(body.collectionOwner);
  const publicKey = new PublicKey(body.publicKey);
  const keypair = Keypair.fromSecretKey(base58.decode(YOUR_BS58_SECRET_KEY));
  const wallet = new NodeWallet(keypair);
  const connection = new Connection("https://api.devnet.solana.com", "finalized");

  const sdk = new SDK(
    wallet,
    connection, // rpc connection
    { skipPreflight: true }, // confirmation options
    "devnet", // rpc cluster -- mainnet / devnet / localnet
  )

  const { instructions, placeholder_mint } = await sdk.placeholder.createPlaceholder(
    wallet.feePayer, // admin keypair
    collectionOwner, // collection owner publickey
    buyer.publicKey, // buyer's publickey
    id, // id used for seeds
    'https://arweave.net/-mpn67FnEePrsoKez4f6Dvjb1aMcH1CqCdZX0NCyHK8' // placeholder uri
  );


  const tx = new Transaction().add(...instructions);
  tx.partialSign(wallet.feePayer);

  const serializedTransaction = tx.serialize({
    requireAllSignatures: false,
  });

  const base64 = serializedTransaction.toString("base64");
  
  return new Response(
    JSON.stringify({
      transaction: base64,
      placeholder_mint: placeholder_mint
    }), 
    { status: 200 }
  );
}
```

#### MINT - FRONT END
```tsx
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';

const { publicKey, sendTransaction } = useWallet();

const confirm = async (signature: string): Promise<string> => {
  const block = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
      signature,
      ...block
  })
  return signature
}

async function mintNft(){
  try {
    const id = Math.floor(Math.random() * 100000); //random number used to create seeds for buyers placeholder/nft

    // INITIATE MINTING TXN -- REQUIRES USER WALLET SIGNATURE
    const _tx = await fetch('/api/mint', {
      method: 'POST',
      body: JSON.stringify({ 
        id: id, 
        collectionOwner: collectionOwner.publicKey, 
        publicKey: buyer.publicKey?.toBase58()})
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { transaction, placeholder_mint } = await _tx.json();

    const tx = Transaction.from(Buffer.from(transaction, "base64"));
    const signature = await sendTransaction(tx, connection, {skipPreflight: true});

    // ONCE THIS CONFIRMS, WE KNOW THE USER HAS PAID AND THE PLACEHOLDER SUCCESFULLY MINTED
    const confirmation = await confirm(sig);

    // GET THE IMAGE URL TO POLL
    const placeholder_metadata = await getTokenMetadata(connection, placeholder_mint);
    console.log('placeholder_metadata', placeholder_metadata)
    
    const additional_metadata = placeholder_metadata!.additionalMetadata;
    const token_id = additional_metadata[1][1];
    console.log('placeholder mint', placeholder_mint.toBase58());
    console.log('placeholder token id', token_id);

    const getCollectionUrl = async(collection: PublicKey) => {
        const collection_data = await connection.getAccountInfo(collection);
        const collection_decode = program.coder.accounts.decode("Collection", collection_data!.data);
        // console.log('collection_decode', collection_decode)
        return {
            url: collection_decode.url,
            count: collection_decode.mintCount.toNumber(),
        }
    }
    const { url } = await getCollectionUrl(collection);
    console.log('URL TO POLL: ',`${url}/${token_id}/${buyer.toBase58()}`)


    
    // BEGIN MINTING THE NFT -- SEE NEXT SNIPPET FOR API ROUTE
    if(confirmation) {
      const _response = await fetch('/api/finalize', {
        method: 'POST',
        body: JSON.stringify({ 
          id: id, 
          collectionOwner: collectionOwner.toBase58(), 
          publicKey: publicKey?.toBase58(),
          placeholderMint: placeholder_mint
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const { tx_signature, nft_mint } = await _response.json();

      console.log(`View NFT: https://solscan.io/token/${response.nft_mint}?cluster=${sdk.cluster}`)
      console.log(`View txn: https://explorer.solana.com/tx/${tx_signature}?cluster=${sdk.cluster}`)
    }
  } catch (error) {
    console.log('error', error)
  }
};

```


#### Finalize -- API ENDPOINT

```tsx
// ex. response
nft tx {
  tx_signature: 'fcYTRbSpDRiu4HbvGPj2FXgdzZej3kPQc12HkZjBRV5VSfNbMBrfoeQYhMiH1Gss3HVy7V7vFz9cE2H5NrYNQ8c',
  nft_mint: 'FjM7C6Xb2pVaaBQ4jhcWeBj8H7ca99mpoMDbvpeuyA17'
}
```


```tsx
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import base58, * as bs58 from "bs58";
import { SDK } from '@maweiche/react-sdk';

export async function POST(request: Request) {
  try{
    const body = await request.json();
    const id = body.id;
    const publicKey = new PublicKey(body.publicKey);
    const placeholderMint = new PublicKey(body.placeholderMint)
    const collectionOwner = new PublicKey(body.collectionOwner);

    const bearerToken = process.env.BEARER as string;

    const keypair = Keypair.fromSecretKey(base58.decode(YOUR_BS58_SECRET_KEY));
    const wallet = new NodeWallet(keypair);
    const connection = new Connection('https://api.devnet.solana.com/', 'confirmed')
    const sdk = new SDK(
      wallet,
      connection,
      { skipPreflight: true},
      "devnet",
    )

    const {tx_signature, nft_mint} = await sdk.nft.createNft(
      sdk.rpcConnection,  // rpc connection
      process.env.BEARER, // bearer token for ai image auth
      wallet.feePayer, // admin keypair
      collectionOwner, // collection owner publickey
      publicKey, // buyer publickey   
      placeholderMint // placeholder mint address as publickey
    ); // returns txn signature and nft mint address


    return new Response(
      JSON.stringify({
        tx_signature: tx_signature,
        nft_mint: nft_mint
      }), 
      { status: 200 }
    );
  } catch (error) {
    console.log('error', error)
    return new Response('error', { status: 500 });
  }
}
```

### Airdrop Placeholder as Collection Owner
```tsx
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Keypair, Connection, PublicKey, Transaction } from '@solana/web3.js';
import { SDK } from '@maweiche/react-sdk';
import base58, * as bs58 from "bs58";
import dotenv from 'dotenv';
dotenv.config()
export async function POST(request: Request) {
  const body = await request.json();
  const id = body.id;
  const collectionOwner = new PublicKey(body.collectionOwner);
  const publicKey = new PublicKey(body.publicKey);

  const program = this.sdk.program;
  const uri = "https://gateway.irys.xyz/-mpn67FnEePrsoKez4f6Dvjb1aMcH1CqCdZX0NCyHK8";
  const protocol = PublicKey.findProgramAddressSync([Buffer.from('protocol')], program.programId)[0];
  const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), collectionOwner.toBuffer()], program.programId)[0];

  const keypair = Keypair.fromSecretKey(base58.decode(YOUR_BS58_SECRET_KEY));
  const wallet = new NodeWallet(keypair);
  const sdk = new SDK(
    wallet,
    connection,
    { skipPreflight: true},
    "devnet",
  )

  // airdrop placeholder to buyer special instructions
    const ed25519Ix = Ed25519Program.createInstructionWithPrivateKey({
      privateKey: collection_wallet.secretKey,
      message: buyer.publicKey.toBuffer(),
    });

  const airdropPlaceholderIx = await program.methods
    .airdropPlaceholder()
    .accounts({
        buyer: buyer,
        payer: admin,
        collection,
        collectionOwner: collectionOwner,
        buyerMintAta: buyerPlaceholderAta,
        placeholder,
        mint: placeholder_mint,
        auth,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        token2022Program: TOKEN_2022_PROGRAM_ID,
        protocol: protocol,
        systemProgram: SystemProgram.programId,
    })
    .instruction()

  const instructions = [ed25519Ix, airdropPlaceholderIx]

  return new Response(JSON.stringify({
    instructions: instructions
    token_id: id
  }), { status: 200 });
}
```

### Claim Airdrop as User

When a user already has a Placeholder NFT, their mint process is different because we just need to `finalize` the mint process with the AI image generation. For this use case we will assume the user knows which collection they have received an Airdrop for and have selected it.

#### API ENDPOINT
```tsx
import { SDK } from "../src";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import {
  PublicKey,
  Keypair,
  Connection,
  GetProgramAccountsFilter,
} from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getTokenMetadata } from "@solana/spl-token";

export async function POST(request: Request) {
  const body = await request.json();
  const collection = body.collection;
  const buyer = new PublicKey(body.publicKey);

  sdk = new SDK(
      userWallet as NodeWallet,
      new Connection("https://api.devnet.solana.com", "confirmed"),
      { skipPreflight: true},
      "devnet",
  );

  const program = sdk.program;

  const filters:GetProgramAccountsFilter[] = [
    {
      dataSize: 170,    //size of account (bytes)
    },
    {
      memcmp: {
        offset: 32,     //location of our query in the account (bytes)
        bytes: buyer.toBase58(),  //our search criteria, a base58 encoded string
      },         
    }
  ];
  const accounts = await sdk.rpcConnection.getParsedProgramAccounts(
      TOKEN_2022_PROGRAM_ID, 
      {filters: filters}
  );

  const completedTxns = [];

  // THIS WILL MINT A NFT FOR EVERY PLACEHOLDER
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

    if(collection_key === collection) {

      const placeholder_mint = new PublicKey(mintAddress);
      const placeholder_metadata = await getTokenMetadata(connection, placeholder_mint);
      
      const additional_metadata = _token_metadata!.additionalMetadata;
      const token_id = additional_metadata[1][1];

      const getCollectionUrl = async(collection: PublicKey) => {
          const collection_data = await connection.getAccountInfo(collection);
          const collection_decode = program.coder.accounts.decode("Collection", collection_data!.data);

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
        process.env.bearer, // bearer
        userKeypair, // admin
        collection_owner, // collection owner
        buyer, // buyer    
        placeholder_mint // placeholder mint address
      ); // returns txn signature and nft mint address


      console.log(`nft mint: ${nft_mint}`);

      console.log(`nft tx url: https://explorer.solana.com/tx/${tx_signature}?cluster=${sdk.cluster}`);

      const _tx_obj = {
        nft_mint: nft_mint
        signature: tx_signature
      }

      completedTxns.push(_tx_obj);
    }
  }

  return new Response(JSON.stringify({
    transactions: completedTxns
  }), { status: 200 });
}
```

#### FRONT-END

```tsx
async function mintNft(){
  try {
    const id = Math.floor(Math.random() * 100000); //random number used to create seeds for buyers placeholder/nft

    // INITIATE MINTING TXN -- REQUIRES USER WALLET SIGNATURE
    const { transactions } : <nft_mint: string, signature: string>[] = await fetch('/api/claim', {
      method: 'POST',
      body: JSON.stringify({ 
        collection: collection.publicKey, 
        publicKey: buyer.publicKey?.toBase58()
      })
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`View your NFT: https://solscan.io/address/${transactions[0].nft_mint}?cluster=${sdk.cluster}`)
    console.log(`View the mint txn: https://explorer.solana.com/tx/${transactions[0].signature}?cluster=${sdk.cluster}`)
  } catch (error) {
    console.log('error', error)
  }
};
```
## Contributing

We welcome contributions to improve the SDK. Please raise an issue or submit a pull request with any suggestions or bug fixes.

## License

The Vision - SolAI SDK is licensed under the [MIT License](https://github.com/playground-solana/solai_sdk/LICENSE).