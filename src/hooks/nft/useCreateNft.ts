// this will combine
// 1. createNft
// 2. transferNft

// into one txn instruction and return it
import * as anchor from "@coral-xyz/anchor";
import { SolFactory } from "src/idl/sol_factory";
import sol_factory_idl from "src/idl/sol_factory.json";
import { useState, useCallback } from "react";
import { PublicKey, Transaction, Connection, ComputeBudgetProgram, SystemProgram } from "@solana/web3.js";
import { SendTransactionOptions } from '@solana/wallet-adapter-base';
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

type sendTransactionFn = <T extends Transaction>(transaction: T, connection?: Connection, options?: SendTransactionOptions) => Promise<string>;


const useCreateNft = (
  url: string,
  bearer: string,
) => {
  const [postPDA, setPostPDA] = useState<PublicKey | null>(null);
  const [nftMintAddress, setNftMintAddress] = useState<PublicKey | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isCreatingNft, setIsCreatingNft] = useState(false);
  const [createPostError, setCreatePostError] = useState<Error | null>(null);
  const [createNftError, setCreateNftError] = useState<Error | null>(null);
  const modifyComputeUnitIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 });
  const id = Math.floor(Math.random() * 100000);

  const connection = new Connection("https://api.devnet.solana.com", "finalized");
  const programId = new PublicKey("EsgdV69W9Qi6i2q6Gfus8vuy27aXwrf61gC1z1hbnr6d");

  const program = new anchor.Program(sol_factory_idl as anchor.Idl, programId);

  const createNft = useCallback(
    async (
      collectionAccount: PublicKey,
      owner: PublicKey,
      payer: PublicKey,
    ) => {
      setIsCreatingNft(true);
      setCreateNftError(null);

      try {
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
        const adminState = PublicKey.findProgramAddressSync([Buffer.from('admin_state'), payer.toBuffer()], program.programId)[0];
        let ownerNftAta = getAssociatedTokenAddressSync(nft_mint, owner, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)

        const createNftIx = await program.methods
          .createNft(
            new anchor.BN(id),
            metadata_json.metadataUrl,
            nft_name,
            attributes,
          )
          .accounts({
            admin: payer,
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
            payer: payer,
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
          feePayer: payer,
        });

        transaction.add(modifyComputeUnitIx).add(createNftIx).add(transferNftIx);
        const serializedTransaction = transaction.serialize({
          requireAllSignatures: false,
        });
        const base64 = serializedTransaction.toString("base64");

        
        return JSON.stringify({transaction: base64 })

      } catch (err: any) {
        setCreatePostError(err);
      } finally {
        setIsCreatingPost(false);
      }
    },
    []
  );

  return {
    createNft,
    nftMintAddress,
    isCreatingNft,
    createNftError,
  };
};

export { useCreateNft };