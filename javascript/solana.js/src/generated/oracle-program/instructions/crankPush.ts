import type { SwitchboardProgram } from "../../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import type { AccountMeta, PublicKey } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface CrankPushArgs {
  params: types.CrankPushParamsFields;
}

export interface CrankPushAccounts {
  crank: PublicKey;
  aggregator: PublicKey;
  oracleQueue: PublicKey;
  queueAuthority: PublicKey;
  permission: PublicKey;
  lease: PublicKey;
  escrow: PublicKey;
  programState: PublicKey;
  dataBuffer: PublicKey;
}

export const layout = borsh.struct([types.CrankPushParams.layout("params")]);

export function crankPush(
  program: SwitchboardProgram,
  args: CrankPushArgs,
  accounts: CrankPushAccounts,
  programId: PublicKey = program.oracleProgramId
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.crank, isSigner: false, isWritable: true },
    { pubkey: accounts.aggregator, isSigner: false, isWritable: true },
    { pubkey: accounts.oracleQueue, isSigner: false, isWritable: true },
    { pubkey: accounts.queueAuthority, isSigner: false, isWritable: false },
    { pubkey: accounts.permission, isSigner: false, isWritable: false },
    { pubkey: accounts.lease, isSigner: false, isWritable: true },
    { pubkey: accounts.escrow, isSigner: false, isWritable: true },
    { pubkey: accounts.programState, isSigner: false, isWritable: false },
    { pubkey: accounts.dataBuffer, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([155, 175, 160, 18, 7, 147, 249, 16]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.CrankPushParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
