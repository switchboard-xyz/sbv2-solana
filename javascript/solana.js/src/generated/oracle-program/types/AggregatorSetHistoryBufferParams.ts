import { SwitchboardProgram } from "../../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh";
import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface AggregatorSetHistoryBufferParamsFields {}

export interface AggregatorSetHistoryBufferParamsJSON {}

export class AggregatorSetHistoryBufferParams {
  constructor(fields: AggregatorSetHistoryBufferParamsFields) {}

  static layout(property?: string) {
    return borsh.struct([], property);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new AggregatorSetHistoryBufferParams({});
  }

  static toEncodable(fields: AggregatorSetHistoryBufferParamsFields) {
    return {};
  }

  toJSON(): AggregatorSetHistoryBufferParamsJSON {
    return {};
  }

  static fromJSON(
    obj: AggregatorSetHistoryBufferParamsJSON
  ): AggregatorSetHistoryBufferParams {
    return new AggregatorSetHistoryBufferParams({});
  }

  toEncodable() {
    return AggregatorSetHistoryBufferParams.toEncodable(this);
  }
}
