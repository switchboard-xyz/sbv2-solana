import { SwitchboardProgram } from "../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh";
import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface LeaseSetAuthorityParamsFields {}

export interface LeaseSetAuthorityParamsJSON {}

export class LeaseSetAuthorityParams {
  constructor(fields: LeaseSetAuthorityParamsFields) {}

  static layout(property?: string) {
    return borsh.struct([], property);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new LeaseSetAuthorityParams({});
  }

  static toEncodable(fields: LeaseSetAuthorityParamsFields) {
    return {};
  }

  toJSON(): LeaseSetAuthorityParamsJSON {
    return {};
  }

  static fromJSON(obj: LeaseSetAuthorityParamsJSON): LeaseSetAuthorityParams {
    return new LeaseSetAuthorityParams({});
  }

  toEncodable() {
    return LeaseSetAuthorityParams.toEncodable(this);
  }
}
