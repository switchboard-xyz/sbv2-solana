import { SwitchboardProgram } from "../../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import {
  AccountMeta,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface FunctionVerifyArgs {
  params: types.FunctionVerifyParamsFields;
}

export interface FunctionVerifyAccounts {
  function: PublicKey;
  authority: PublicKey;
  functionEnclaveSigner: PublicKey;
  fnQuote: PublicKey;
  verifierQuote: PublicKey;
  verifierEnclaveSigner: PublicKey;
  verifierPermission: PublicKey;
  escrowWallet: PublicKey;
  escrowTokenWallet: PublicKey;
  receiver: PublicKey;
  state: PublicKey;
  attestationQueue: PublicKey;
  tokenProgram: PublicKey;
}

export const layout = borsh.struct([
  types.FunctionVerifyParams.layout("params"),
]);

export function functionVerify(
  program: SwitchboardProgram,
  args: FunctionVerifyArgs,
  accounts: FunctionVerifyAccounts
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.function, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: false, isWritable: false },
    {
      pubkey: accounts.functionEnclaveSigner,
      isSigner: true,
      isWritable: false,
    },
    { pubkey: accounts.fnQuote, isSigner: false, isWritable: true },
    { pubkey: accounts.verifierQuote, isSigner: false, isWritable: false },
    {
      pubkey: accounts.verifierEnclaveSigner,
      isSigner: true,
      isWritable: false,
    },
    { pubkey: accounts.verifierPermission, isSigner: false, isWritable: false },
    { pubkey: accounts.escrowWallet, isSigner: false, isWritable: false },
    { pubkey: accounts.escrowTokenWallet, isSigner: false, isWritable: true },
    { pubkey: accounts.receiver, isSigner: false, isWritable: true },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.attestationQueue, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([210, 108, 154, 138, 198, 14, 53, 191]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.FunctionVerifyParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({
    keys,
    programId: program.attestationProgramId,
    data,
  });
  return ix;
}
