# SolAi - Solana Program SDK
A SDK built for use in correlation with the [Sol Factory](https://github.com/maweiche/sol_factory) Solana program.

Below you can find instructions on using the SDK locally followed by a deeper dive into the SDK's structure and details.

> [!WARNING]  
> SolAi-SDK is still in development and is unstable, there can be minor and major changes at any time.

## Program ID
| Cluster      | Program Id |
| :---        |    :----:   |
| **Localnet**     | `4Fj9kuGYLye3pwCBYaXbuzocEy22gPWT5TcJVJ6JauUt` |
| **Devnet**  | `6rHuJFF9XCxi9eDHtgJPcBKNpMWyBHhQhrFSkUD5XMYo` |
| **Mainnet**  | ``  |

## Description

The Sol Factory program is structured for Artists to create on-chain `Collections` that a user can mint a Token-2022 `NFT` from on the Solana blockchain.

The Solana Factory program was built for use with the [Sol Ai SDK](https://npmjs.com).

You can view a baremetal combination of the Program and SDK live on Devnet [here]().

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

### Collections

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
  const name = body.name;
  const symbol = body.symbol;
  const sale_start_time = new anchor.BN(body.sale_start_time);
  const max_supply = new anchor.BN(body.max_supply);
  const price = new anchor.BN(body.price);
  const stable_id = body.stable_id;
  const reference = body.reference;

  const whitelist = body.whitelist ? body.whitelist : undefined;
  const whitelist_price = body.whitelist_price ? new anchor.BN(body.whitelist_price) : undefined;
  const whitelist_start_time = body.whitelist_start_time ? new anchor.BN(body.whitelist_start_time) : undefined;

  const keypair = Keypair.fromSecretKey(base58.decode(YOUR_BS58_SECRET_KEY));
  const wallet = new NodeWallet(keypair);
  const connection = new Connection('https://api.devnet.solana.com/', 'confirmed')
  const sdk = new SDK(
    wallet,
    connection,
    { skipPreflight: true},
    "devnet",
  )

  const base64txn = await sdk.collection.createCollection(
    connection,
    collectionRefKey,
    owner,
    name,
    symbol,
    sale_start_time,
    max_supply,
    price,
    stable_id,
    whitelist,
    whitelist_price,
    whitelist_start_time
  );

  const tx = Transaction.from(Buffer.from(base64txn, "base64"));
  const serializedTransaction = tx.serialize({
      requireAllSignatures: false,
    });
  const base64 = serializedTransaction.toString("base64");
  const base64JSON = JSON.stringify(base64);

  return new Response(base64JSON, { status: 200 });
}

```

### Minting NFTs

After a user selects an available Collection they are able to Mint a NFT from that Collection. Because the AI Image Generation will not return instanaeously, we have built the following flow for the minting process:

- User Selects a Collection and clicks 'Mint'
- User is then prompted with a Transaction to pay the Mint price and receive a Placeholder NFT (Token 2022)
- Once the transaction is approved and confirmed the AI Image Generation begins
- Upon completion of the AI Image Generation a new NFT (Token 2022) is created and sent directly to the User while simultaneously Burning their Placeholder NFT.

For this API route example we broke this process down into two routes:
- `mint` - returns a base64 encoded transaction
- `finalize` - returns a base64 encoded transaction

The `mint` route returns a transaction to be signed by the user while the `finalize` returns a transaction signature since the admin wallet is paying for the nft transfer/creation after the AI Image Generation is complete.

> **🚨 Important Notes**
> **to prevent unauthorized calls to these functions, they require an admin signature**

#### Mint
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

  const keypair = Keypair.fromSecretKey(base58.decode(YOUR_BS58_SECRET_KEY));
  const wallet = new NodeWallet(keypair);
  const connection = new Connection('https://api.devnet.solana.com/', 'confirmed')
  const sdk = new SDK(
    wallet,
    connection,
    { skipPreflight: true},
    "devnet",
  )

  const base64txn = await sdk.placeholder.createPlaceholder(
    sdk.rpcConnection, // rpc connection
    admin, // keypair
    collectionOwner, // collection owner publickey
    publicKey,
    id,
    'https://gateway.irys.xyz/-mpn67FnEePrsoKez4f6Dvjb1aMcH1CqCdZX0NCyHK8'
  );

  const tx = Transaction.from(Buffer.from(base64txn, "base64"));
  tx.partialSign(keypair);

  const serializedTransaction = tx.serialize({
    requireAllSignatures: false,
  });
  const base64 = serializedTransaction.toString("base64");
  const base64JSON = JSON.stringify(base64);

  return new Response(base64JSON, { status: 200 });
  }
```

#### Finalize

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

    const createNft = await sdk.nft.createNft(
      connection, // connection
      "https://amin.stable-dilution.art/nft/item/generation/3/11/0xf75e77b4EfD56476708792066753AC428eB0c21c", // url for ai image
      bearerToken, // bearer
      admin2Keypair, // admin
      collectionOwner, // collection owner
      publicKey, // buyer
    );

    await sdk.placeholder.burnPlaceholder(
      connection, // connection
      id, // id
      admin2Keypair,  // admin
      publicKey, // buyer
      collectionOwner  // collection owner
    );

    return new Response(JSON.stringify(createNft), { status: 200 });
  } catch (error) {
    console.log('error', error)
    return new Response('error', { status: 500 });
  }
}
```

## App

Check out the [example app](https://solai-sdk-test.vercel.app/) 

## Contributing

We welcome contributions to improve the SDK. Please raise an issue or submit a pull request with any suggestions or bug fixes.

## License

The SolAI SDK is licensed under the [GNU General Public License v3.0](https://github.com/maweiche).