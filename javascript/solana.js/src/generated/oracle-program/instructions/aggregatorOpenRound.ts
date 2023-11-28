import type { SwitchboardProgram } from "../../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import type { AccountMeta, PublicKey } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface AggregatorOpenRoundArgs {
  params: types.AggregatorOpenRoundParamsFields;
}

export interface AggregatorOpenRoundAccounts {
  aggregator: PublicKey;
  lease: PublicKey;
  oracleQueue: PublicKey;
  queueAuthority: PublicKey;
  permission: PublicKey;
  escrow: PublicKey;
  programState: PublicKey;
  payoutWallet: PublicKey;
  tokenProgram: PublicKey;
  dataBuffer: PublicKey;
  mint: PublicKey;
}

export const layout = borsh.struct([
  types.AggregatorOpenRoundParams.layout("params"),
]);

export function aggregatorOpenRound(
  program: SwitchboardProgram,
  args: AggregatorOpenRoundArgs,
  accounts: AggregatorOpenRoundAccounts,
  programId: PublicKey = program.oracleProgramId
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.aggregator, isSigner: false, isWritable: true },
    { pubkey: accounts.lease, isSigner: false, isWritable: true },
    { pubkey: accounts.oracleQueue, isSigner: false, isWritable: true },
    { pubkey: accounts.queueAuthority, isSigner: false, isWritable: false },
    { pubkey: accounts.permission, isSigner: false, isWritable: true },
    { pubkey: accounts.escrow, isSigner: false, isWritable: true },
    { pubkey: accounts.programState, isSigner: false, isWritable: false },
    { pubkey: accounts.payoutWallet, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.dataBuffer, isSigner: false, isWritable: false },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([239, 69, 229, 179, 156, 246, 118, 191]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.AggregatorOpenRoundParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
