import { SwitchboardProgram } from "../../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh";
import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface VrfSetCallbackParamsFields {
  callback: types.CallbackFields;
}

export interface VrfSetCallbackParamsJSON {
  callback: types.CallbackJSON;
}

export class VrfSetCallbackParams {
  readonly callback: types.Callback;

  constructor(fields: VrfSetCallbackParamsFields) {
    this.callback = new types.Callback({ ...fields.callback });
  }

  static layout(property?: string) {
    return borsh.struct([types.Callback.layout("callback")], property);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new VrfSetCallbackParams({
      callback: types.Callback.fromDecoded(obj.callback),
    });
  }

  static toEncodable(fields: VrfSetCallbackParamsFields) {
    return {
      callback: types.Callback.toEncodable(fields.callback),
    };
  }

  toJSON(): VrfSetCallbackParamsJSON {
    return {
      callback: this.callback.toJSON(),
    };
  }

  static fromJSON(obj: VrfSetCallbackParamsJSON): VrfSetCallbackParams {
    return new VrfSetCallbackParams({
      callback: types.Callback.fromJSON(obj.callback),
    });
  }

  toEncodable() {
    return VrfSetCallbackParams.toEncodable(this);
  }
}
