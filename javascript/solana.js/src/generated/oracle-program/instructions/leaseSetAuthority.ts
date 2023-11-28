import type { SwitchboardProgram } from "../../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import type { AccountMeta, PublicKey } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface LeaseSetAuthorityArgs {
  params: types.LeaseSetAuthorityParamsFields;
}

export interface LeaseSetAuthorityAccounts {
  lease: PublicKey;
  withdrawAuthority: PublicKey;
  newAuthority: PublicKey;
}

export const layout = borsh.struct([
  types.LeaseSetAuthorityParams.layout("params"),
]);

export function leaseSetAuthority(
  program: SwitchboardProgram,
  args: LeaseSetAuthorityArgs,
  accounts: LeaseSetAuthorityAccounts,
  programId: PublicKey = program.oracleProgramId
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.lease, isSigner: false, isWritable: true },
    { pubkey: accounts.withdrawAuthority, isSigner: true, isWritable: false },
    { pubkey: accounts.newAuthority, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([255, 4, 88, 2, 213, 175, 87, 22]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.LeaseSetAuthorityParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
