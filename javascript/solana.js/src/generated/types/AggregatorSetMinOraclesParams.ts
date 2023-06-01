import { SwitchboardProgram } from "../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh";
import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface AggregatorSetMinOraclesParamsFields {
  minOracleResults: number;
}

export interface AggregatorSetMinOraclesParamsJSON {
  minOracleResults: number;
}

export class AggregatorSetMinOraclesParams {
  readonly minOracleResults: number;

  constructor(fields: AggregatorSetMinOraclesParamsFields) {
    this.minOracleResults = fields.minOracleResults;
  }

  static layout(property?: string) {
    return borsh.struct([borsh.u32("minOracleResults")], property);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new AggregatorSetMinOraclesParams({
      minOracleResults: obj.minOracleResults,
    });
  }

  static toEncodable(fields: AggregatorSetMinOraclesParamsFields) {
    return {
      minOracleResults: fields.minOracleResults,
    };
  }

  toJSON(): AggregatorSetMinOraclesParamsJSON {
    return {
      minOracleResults: this.minOracleResults,
    };
  }

  static fromJSON(
    obj: AggregatorSetMinOraclesParamsJSON
  ): AggregatorSetMinOraclesParams {
    return new AggregatorSetMinOraclesParams({
      minOracleResults: obj.minOracleResults,
    });
  }

  toEncodable() {
    return AggregatorSetMinOraclesParams.toEncodable(this);
  }
}
