import type { SwitchboardProgram } from "../../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import type { AccountMeta, PublicKey } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface CrankInitArgs {
  params: types.CrankInitParamsFields;
}

export interface CrankInitAccounts {
  crank: PublicKey;
  queue: PublicKey;
  buffer: PublicKey;
  payer: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([types.CrankInitParams.layout("params")]);

export function crankInit(
  program: SwitchboardProgram,
  args: CrankInitArgs,
  accounts: CrankInitAccounts,
  programId: PublicKey = program.oracleProgramId
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.crank, isSigner: true, isWritable: true },
    { pubkey: accounts.queue, isSigner: false, isWritable: false },
    { pubkey: accounts.buffer, isSigner: false, isWritable: true },
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([57, 179, 94, 136, 82, 79, 25, 185]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.CrankInitParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
