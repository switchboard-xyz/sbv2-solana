import type { SwitchboardProgram } from "../../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import type { AccountMeta, PublicKey } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface OracleHeartbeatArgs {
  params: types.OracleHeartbeatParamsFields;
}

export interface OracleHeartbeatAccounts {
  oracle: PublicKey;
  oracleAuthority: PublicKey;
  tokenAccount: PublicKey;
  gcOracle: PublicKey;
  oracleQueue: PublicKey;
  permission: PublicKey;
  dataBuffer: PublicKey;
}

export const layout = borsh.struct([
  types.OracleHeartbeatParams.layout("params"),
]);

export function oracleHeartbeat(
  program: SwitchboardProgram,
  args: OracleHeartbeatArgs,
  accounts: OracleHeartbeatAccounts,
  programId: PublicKey = program.oracleProgramId
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.oracle, isSigner: false, isWritable: true },
    { pubkey: accounts.oracleAuthority, isSigner: true, isWritable: false },
    { pubkey: accounts.tokenAccount, isSigner: false, isWritable: false },
    { pubkey: accounts.gcOracle, isSigner: false, isWritable: true },
    { pubkey: accounts.oracleQueue, isSigner: false, isWritable: true },
    { pubkey: accounts.permission, isSigner: false, isWritable: false },
    { pubkey: accounts.dataBuffer, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([10, 175, 217, 130, 111, 35, 117, 54]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.OracleHeartbeatParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
