import type { SwitchboardProgram } from "../../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import type { AccountMeta, PublicKey } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface VrfPoolRemoveArgs {
  params: types.VrfPoolRemoveParamsFields;
}

export interface VrfPoolRemoveAccounts {
  authority: PublicKey;
  vrfPool: PublicKey;
  queue: PublicKey;
}

export const layout = borsh.struct([
  types.VrfPoolRemoveParams.layout("params"),
]);

export function vrfPoolRemove(
  program: SwitchboardProgram,
  args: VrfPoolRemoveArgs,
  accounts: VrfPoolRemoveAccounts,
  programId: PublicKey = program.oracleProgramId
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.vrfPool, isSigner: false, isWritable: true },
    { pubkey: accounts.queue, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([15, 73, 86, 124, 75, 183, 20, 199]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.VrfPoolRemoveParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
