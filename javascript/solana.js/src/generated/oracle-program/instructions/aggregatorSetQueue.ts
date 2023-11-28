import type { SwitchboardProgram } from "../../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import type { AccountMeta, PublicKey } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface AggregatorSetQueueArgs {
  params: types.AggregatorSetQueueParamsFields;
}

export interface AggregatorSetQueueAccounts {
  aggregator: PublicKey;
  authority: PublicKey;
  queue: PublicKey;
}

export const layout = borsh.struct([
  types.AggregatorSetQueueParams.layout("params"),
]);

export function aggregatorSetQueue(
  program: SwitchboardProgram,
  args: AggregatorSetQueueArgs,
  accounts: AggregatorSetQueueAccounts,
  programId: PublicKey = program.oracleProgramId
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.aggregator, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.queue, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([111, 152, 142, 153, 206, 39, 22, 148]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.AggregatorSetQueueParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
