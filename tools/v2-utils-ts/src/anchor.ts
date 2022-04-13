import * as anchor from "@project-serum/anchor";
import { ACCOUNT_DISCRIMINATOR_SIZE } from "@project-serum/anchor";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  AggregatorAccount,
  CrankAccount,
  JobAccount,
  LeaseAccount,
  OracleAccount,
  OracleQueueAccount,
  PermissionAccount,
  ProgramStateAccount,
  VrfAccount,
} from "@switchboard-xyz/switchboard-v2";
import { InvalidSwitchboardAccount, NoPayerKeypairProvided } from "./errors";

const DEFAULT_KEYPAIR = Keypair.fromSeed(new Uint8Array(32).fill(1));

/** Return the default anchor.Provider that will fail if a transaction is sent. This is used to avoid accidentally loading a
 * valid keypair from the anchor environment defaults.
 * @param connection a Solana connection object for a given Solana cluster and endpoint
 * @return the anchor.Provider object
 * */
export const getDefaultProvider = (connection: Connection): anchor.Provider => {
  return new anchor.Provider(
    connection,
    new anchor.Wallet(DEFAULT_KEYPAIR),
    anchor.Provider.defaultOptions()
  );
};

/** Get the program data address for a given programId
 * @param programId the programId for a given on-chain program
 * @return the publicKey of the address holding the upgradeable program buffer
 */
export const getProgramDataAddress = (programId: PublicKey): PublicKey => {
  return findProgramAddressSync(
    [programId.toBytes()],
    new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")
  )[0];
};

/** Get the IDL address for a given programId
 * @param programId the programId for a given on-chain program
 * @return the publicKey of the IDL address
 */
export const getIdlAddress = async (
  programId: PublicKey
): Promise<PublicKey> => {
  const base = (await PublicKey.findProgramAddress([], programId))[0];
  return PublicKey.createWithSeed(base, "anchor:idl", programId);
};

export const programHasPayer = (program: anchor.Program): boolean => {
  const payer = (program.provider.wallet as anchor.Wallet).payer;
  return !payer.publicKey.equals(DEFAULT_KEYPAIR.publicKey);
};

export const getProgramPayer = (program: anchor.Program): Keypair => {
  if (programHasPayer(program)) {
    return (program.provider.wallet as anchor.Wallet).payer;
  }
  throw new NoPayerKeypairProvided();
};

export const verifyProgramHasPayer = (program: anchor.Program): void => {
  if (programHasPayer(program)) {
    return;
  }
  throw new NoPayerKeypairProvided();
};

export const SWITCHBOARD_ACCOUNT_TYPES = [
  "JobAccountData",
  "AggregatorAccountData",
  "OracleAccountData",
  "OracleQueueAccountData",
  "PermissionAccountData",
  "LeaseAccountData",
  "ProgramStateAccountData",
  "VrfAccountData",
  "SbState",
  "BUFFERxx",
  "CrankAccountData",
] as const;

export type SwitchboardAccount =
  | JobAccount
  | AggregatorAccount
  | OracleAccount
  | OracleQueueAccount
  | PermissionAccount
  | LeaseAccount
  | ProgramStateAccount
  | VrfAccount
  | CrankAccount;

export type SwitchboardAccountType = typeof SWITCHBOARD_ACCOUNT_TYPES[number];

export const SWITCHBOARD_DISCRIMINATOR_MAP = new Map<
  SwitchboardAccountType,
  Buffer
>(
  SWITCHBOARD_ACCOUNT_TYPES.map((accountType) => [
    accountType,
    anchor.BorshAccountsCoder.accountDiscriminator(accountType),
  ])
);

// should also check if pubkey is a token account
export const findAccountType = async (
  program: anchor.Program,
  publicKey: PublicKey
): Promise<SwitchboardAccountType> => {
  const account = await program.provider.connection.getAccountInfo(publicKey);
  if (!account) {
    throw new Error(`failed to fetch account info for ${publicKey}`);
  }

  const accountDiscriminator = account.data.slice(
    0,
    ACCOUNT_DISCRIMINATOR_SIZE
  );

  for (const [name, discriminator] of SWITCHBOARD_DISCRIMINATOR_MAP.entries()) {
    if (Buffer.compare(accountDiscriminator, discriminator) === 0) {
      return name;
    }
  }

  throw new InvalidSwitchboardAccount();
};

export const loadSwitchboardAccount = async (
  program: anchor.Program,
  publicKey: PublicKey
): Promise<[SwitchboardAccountType, SwitchboardAccount]> => {
  const accountType = await findAccountType(program, publicKey);
  switch (accountType) {
    case "JobAccountData": {
      return [accountType, new JobAccount({ program, publicKey })];
    }
    case "AggregatorAccountData": {
      return [accountType, new AggregatorAccount({ program, publicKey })];
    }
    case "OracleAccountData": {
      return [accountType, new OracleAccount({ program, publicKey })];
    }
    case "PermissionAccountData": {
      return [accountType, new PermissionAccount({ program, publicKey })];
    }
    case "LeaseAccountData": {
      return [accountType, new LeaseAccount({ program, publicKey })];
    }
    case "OracleQueueAccountData": {
      return [accountType, new OracleQueueAccount({ program, publicKey })];
    }
    case "CrankAccountData": {
      return [accountType, new CrankAccount({ program, publicKey })];
    }
    case "SbState":
    case "ProgramStateAccountData": {
      return [accountType, new ProgramStateAccount({ program, publicKey })];
    }
    case "VrfAccountData": {
      return [accountType, new VrfAccount({ program, publicKey })];
    }
  }

  throw new InvalidSwitchboardAccount();
};
