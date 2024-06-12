# Sol AI SDK

## Installation

```bash
yarn add @solai/react-sdk
```

## Documentation

For more detailed documentation, please visit the [SolAI documentation](https://docs.com/).

## Usage

The `useCreateNft` ...  hooks provide the necessary utilities to create a create/transfer new nft.

```tsx
import {
  useCreateNft
} from "@solai/react-sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

export function ProfileCreation() {
  const wallet = useWallet();
  const { publicKey } = wallet;
  
}
```

## Quickstart



## App

Check out the [example app](https://github.com/maweiche) 

## Contributing

We welcome contributions to improve the SDK. Please raise an issue or submit a pull request with any suggestions or bug fixes.

## License

The SolAI SDK is licensed under the [GNU General Public License v3.0](https://github.com/maweiche).

