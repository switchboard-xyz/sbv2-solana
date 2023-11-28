import type { SwitchboardProgram } from "../../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import type { AccountMeta, PublicKey } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface JobSetDataArgs {
  params: types.JobSetDataParamsFields;
}

export interface JobSetDataAccounts {
  job: PublicKey;
  authority: PublicKey;
}

export const layout = borsh.struct([types.JobSetDataParams.layout("params")]);

export function jobSetData(
  program: SwitchboardProgram,
  args: JobSetDataArgs,
  accounts: JobSetDataAccounts,
  programId: PublicKey = program.oracleProgramId
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.job, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([225, 207, 69, 27, 161, 171, 223, 104]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.JobSetDataParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
