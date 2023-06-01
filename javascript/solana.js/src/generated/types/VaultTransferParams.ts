import { SwitchboardProgram } from "../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh";
import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface VaultTransferParamsFields {
  stateBump: number;
  amount: BN;
}

export interface VaultTransferParamsJSON {
  stateBump: number;
  amount: string;
}

export class VaultTransferParams {
  readonly stateBump: number;
  readonly amount: BN;

  constructor(fields: VaultTransferParamsFields) {
    this.stateBump = fields.stateBump;
    this.amount = fields.amount;
  }

  static layout(property?: string) {
    return borsh.struct([borsh.u8("stateBump"), borsh.u64("amount")], property);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new VaultTransferParams({
      stateBump: obj.stateBump,
      amount: obj.amount,
    });
  }

  static toEncodable(fields: VaultTransferParamsFields) {
    return {
      stateBump: fields.stateBump,
      amount: fields.amount,
    };
  }

  toJSON(): VaultTransferParamsJSON {
    return {
      stateBump: this.stateBump,
      amount: this.amount.toString(),
    };
  }

  static fromJSON(obj: VaultTransferParamsJSON): VaultTransferParams {
    return new VaultTransferParams({
      stateBump: obj.stateBump,
      amount: new BN(obj.amount),
    });
  }

  toEncodable() {
    return VaultTransferParams.toEncodable(this);
  }
}
