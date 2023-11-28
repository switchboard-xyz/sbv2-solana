import type { SwitchboardProgram } from "../../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import type { AccountMeta, PublicKey } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface AggregatorSetConfigArgs {
  params: types.AggregatorSetConfigParamsFields;
}

export interface AggregatorSetConfigAccounts {
  aggregator: PublicKey;
  authority: PublicKey;
}

export const layout = borsh.struct([
  types.AggregatorSetConfigParams.layout("params"),
]);

export function aggregatorSetConfig(
  program: SwitchboardProgram,
  args: AggregatorSetConfigArgs,
  accounts: AggregatorSetConfigAccounts,
  programId: PublicKey = program.oracleProgramId
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.aggregator, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([236, 77, 162, 17, 192, 67, 224, 217]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.AggregatorSetConfigParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
