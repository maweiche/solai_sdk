import * as anchor from "@project-serum/anchor";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import { Cluster } from "@solana/web3.js";
// import { Connection, GraphQLConnection } from "./connection";
import { SolFactory } from "src/idl/sol_factory";
import sol_factory_idl from "src/idl/sol_factory.json";
import { SOL_FACTORY_PROGRAMS } from "./constants";

export {
  SOL_FACTORY_PROGRAMS
};

export class SDK {
  readonly program: anchor.Program<SolFactory>;
  readonly provider: anchor.AnchorProvider;
  readonly rpcConnection: anchor.web3.Connection;
  readonly cluster: Cluster | "localnet";

  constructor(
    wallet: Wallet,
    connection: anchor.web3.Connection,
    opts: anchor.web3.ConfirmOptions,
    cluster: Cluster | "localnet",
  ) {
    this.cluster = cluster;
    this.provider = new anchor.AnchorProvider(connection, wallet, opts);
    this.program =  new anchor.Program(
      sol_factory_idl as anchor.Idl,
      SOL_FACTORY_PROGRAMS[this.cluster] as anchor.web3.PublicKey,
      this.provider
    ) as anchor.Program<SolFactory>;

    this.rpcConnection = connection;
  }
}