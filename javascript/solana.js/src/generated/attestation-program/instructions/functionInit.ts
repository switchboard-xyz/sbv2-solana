import type { SwitchboardProgram } from "../../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import type { AccountMeta, PublicKey } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface FunctionInitArgs {
  params: types.FunctionInitParamsFields;
}

export interface FunctionInitAccounts {
  function: PublicKey;
  addressLookupTable: PublicKey;
  authority: PublicKey;
  attestationQueue: PublicKey;
  payer: PublicKey;
  escrowWallet: PublicKey;
  escrowWalletAuthority: PublicKey;
  escrowTokenWallet: PublicKey;
  mint: PublicKey;
  tokenProgram: PublicKey;
  associatedTokenProgram: PublicKey;
  systemProgram: PublicKey;
  addressLookupProgram: PublicKey;
}

export const layout = borsh.struct([types.FunctionInitParams.layout("params")]);

export function functionInit(
  program: SwitchboardProgram,
  args: FunctionInitArgs,
  accounts: FunctionInitAccounts,
  programId: PublicKey = program.attestationProgramId
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.function, isSigner: false, isWritable: true },
    { pubkey: accounts.addressLookupTable, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: false, isWritable: false },
    { pubkey: accounts.attestationQueue, isSigner: false, isWritable: false },
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.escrowWallet, isSigner: false, isWritable: true },
    {
      pubkey: accounts.escrowWalletAuthority,
      isSigner: true,
      isWritable: false,
    },
    { pubkey: accounts.escrowTokenWallet, isSigner: false, isWritable: true },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    {
      pubkey: accounts.associatedTokenProgram,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    {
      pubkey: accounts.addressLookupProgram,
      isSigner: false,
      isWritable: false,
    },
  ];
  const identifier = Buffer.from([0, 20, 30, 24, 100, 146, 13, 162]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.FunctionInitParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
