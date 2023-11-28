import type { SwitchboardProgram } from "../../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import type { AccountMeta, PublicKey } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface AggregatorRemoveJobArgs {
  params: types.AggregatorRemoveJobParamsFields;
}

export interface AggregatorRemoveJobAccounts {
  aggregator: PublicKey;
  authority: PublicKey;
  job: PublicKey;
}

export const layout = borsh.struct([
  types.AggregatorRemoveJobParams.layout("params"),
]);

export function aggregatorRemoveJob(
  program: SwitchboardProgram,
  args: AggregatorRemoveJobArgs,
  accounts: AggregatorRemoveJobAccounts,
  programId: PublicKey = program.oracleProgramId
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.aggregator, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.job, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([158, 221, 231, 65, 41, 151, 155, 172]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.AggregatorRemoveJobParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
