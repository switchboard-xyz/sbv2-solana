import type { SwitchboardProgram } from "../../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import type { AccountMeta, PublicKey } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface FunctionRequestInitAndTriggerArgs {
  params: types.FunctionRequestInitAndTriggerParamsFields;
}

export interface FunctionRequestInitAndTriggerAccounts {
  request: PublicKey;
  authority: PublicKey;
  function: PublicKey;
  functionAuthority: PublicKey;
  escrow: PublicKey;
  mint: PublicKey;
  state: PublicKey;
  attestationQueue: PublicKey;
  payer: PublicKey;
  systemProgram: PublicKey;
  tokenProgram: PublicKey;
  associatedTokenProgram: PublicKey;
}

export const layout = borsh.struct([
  types.FunctionRequestInitAndTriggerParams.layout("params"),
]);

export function functionRequestInitAndTrigger(
  program: SwitchboardProgram,
  args: FunctionRequestInitAndTriggerArgs,
  accounts: FunctionRequestInitAndTriggerAccounts,
  programId: PublicKey = program.attestationProgramId
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.request, isSigner: true, isWritable: true },
    { pubkey: accounts.authority, isSigner: false, isWritable: false },
    { pubkey: accounts.function, isSigner: false, isWritable: true },
    { pubkey: accounts.functionAuthority, isSigner: true, isWritable: false },
    { pubkey: accounts.escrow, isSigner: false, isWritable: true },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.attestationQueue, isSigner: false, isWritable: false },
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    {
      pubkey: accounts.associatedTokenProgram,
      isSigner: false,
      isWritable: false,
    },
  ];
  const identifier = Buffer.from([86, 151, 134, 172, 35, 218, 207, 154]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.FunctionRequestInitAndTriggerParams.toEncodable(
        args.params
      ),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
