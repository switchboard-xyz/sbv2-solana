import { SwitchboardProgram } from '../../SwitchboardProgram';
import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from '@solana/web3.js'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from '@switchboard-xyz/common'; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from '@coral-xyz/borsh'; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from '../types'; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface SetBumpsArgs {
  params: types.SetBumpsParamsFields;
}

export interface SetBumpsAccounts {
  state: PublicKey;
}

export const layout = borsh.struct([types.SetBumpsParams.layout('params')]);

export function setBumps(
  program: SwitchboardProgram,
  args: SetBumpsArgs,
  accounts: SetBumpsAccounts
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([19, 216, 193, 244, 22, 47, 180, 64]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.SetBumpsParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({
    keys,
    programId: program.programId,
    data,
  });
  return ix;
}
