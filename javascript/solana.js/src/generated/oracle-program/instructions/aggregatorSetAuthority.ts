import type { SwitchboardProgram } from "../../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import type { AccountMeta, PublicKey } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface AggregatorSetAuthorityArgs {
  params: types.AggregatorSetAuthorityParamsFields;
}

export interface AggregatorSetAuthorityAccounts {
  aggregator: PublicKey;
  authority: PublicKey;
  newAuthority: PublicKey;
}

export const layout = borsh.struct([
  types.AggregatorSetAuthorityParams.layout("params"),
]);

export function aggregatorSetAuthority(
  program: SwitchboardProgram,
  args: AggregatorSetAuthorityArgs,
  accounts: AggregatorSetAuthorityAccounts,
  programId: PublicKey = program.oracleProgramId
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.aggregator, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.newAuthority, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([140, 176, 3, 173, 23, 2, 4, 81]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.AggregatorSetAuthorityParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
