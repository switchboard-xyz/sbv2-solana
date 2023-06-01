import { SwitchboardProgram } from "../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh";
import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface OracleHeartbeatParamsFields {
  permissionBump: number;
}

export interface OracleHeartbeatParamsJSON {
  permissionBump: number;
}

export class OracleHeartbeatParams {
  readonly permissionBump: number;

  constructor(fields: OracleHeartbeatParamsFields) {
    this.permissionBump = fields.permissionBump;
  }

  static layout(property?: string) {
    return borsh.struct([borsh.u8("permissionBump")], property);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new OracleHeartbeatParams({
      permissionBump: obj.permissionBump,
    });
  }

  static toEncodable(fields: OracleHeartbeatParamsFields) {
    return {
      permissionBump: fields.permissionBump,
    };
  }

  toJSON(): OracleHeartbeatParamsJSON {
    return {
      permissionBump: this.permissionBump,
    };
  }

  static fromJSON(obj: OracleHeartbeatParamsJSON): OracleHeartbeatParams {
    return new OracleHeartbeatParams({
      permissionBump: obj.permissionBump,
    });
  }

  toEncodable() {
    return OracleHeartbeatParams.toEncodable(this);
  }
}
