export { useUploader, useArweaveStorage, useShadowStorage } from "./storage";


export class SDK {
  readonly program: anchor.Program<GplCore>;
  readonly nameserviceProgram: anchor.Program<GplNameservice>;
  readonly provider: anchor.AnchorProvider;
  readonly rpcConnection: anchor.web3.Connection;
  readonly cluster: Cluster | "localnet";
  readonly gqlClient?: GraphQLClient;

  constructor(
    wallet: Wallet,
    connection: anchor.web3.Connection,
    opts: anchor.web3.ConfirmOptions,
    cluster: Cluster | "localnet",
    gqlClient?: GraphQLClient
  ) {
    this.cluster = cluster;
    this.provider = new anchor.AnchorProvider(connection, wallet, opts);
    this.program = new anchor.Program(
      gpl_core_idl as anchor.Idl,
      GPLCORE_PROGRAMS[this.cluster] as anchor.web3.PublicKey,
      this.provider
    ) as anchor.Program<GplCore>;
    this.nameserviceProgram = new anchor.Program(
        gpl_nameservice as anchor.Idl,
        GPL_NAMESERVICE_PROGRAMS[cluster] as anchor.web3.PublicKey,
        this.provider) as anchor.Program<GplNameservice>;
    this.rpcConnection = connection;
    this.gqlClient = gqlClient;
  }