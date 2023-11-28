import type { SwitchboardProgram } from "../../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import type { AccountMeta, PublicKey } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface PermissionSetArgs {
  params: types.PermissionSetParamsFields;
}

export interface PermissionSetAccounts {
  permission: PublicKey;
  authority: PublicKey;
}

export const layout = borsh.struct([
  types.PermissionSetParams.layout("params"),
]);

export function permissionSet(
  program: SwitchboardProgram,
  args: PermissionSetArgs,
  accounts: PermissionSetAccounts,
  programId: PublicKey = program.oracleProgramId
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.permission, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([211, 122, 185, 120, 129, 182, 55, 103]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.PermissionSetParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
