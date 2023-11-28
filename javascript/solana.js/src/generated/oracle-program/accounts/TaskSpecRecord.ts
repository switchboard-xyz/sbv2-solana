import type { SwitchboardProgram } from "../../../SwitchboardProgram.js";
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import type { PublicKey } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface TaskSpecRecordFields {
  hash: types.HashFields;
}

export interface TaskSpecRecordJSON {
  hash: types.HashJSON;
}

export class TaskSpecRecord {
  readonly hash: types.Hash;

  static readonly discriminator = Buffer.from([
    202, 10, 194, 236, 111, 47, 234, 48,
  ]);

  static readonly layout = borsh.struct([types.Hash.layout("hash")]);

  constructor(fields: TaskSpecRecordFields) {
    this.hash = new types.Hash({ ...fields.hash });
  }

  static async fetch(
    program: SwitchboardProgram,
    address: PublicKey,
    programId: PublicKey = program.oracleProgramId
  ): Promise<TaskSpecRecord | null> {
    const info = await program.connection.getAccountInfo(address);

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(programId)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(
    program: SwitchboardProgram,
    addresses: PublicKey[],
    programId: PublicKey = program.oracleProgramId
  ): Promise<Array<TaskSpecRecord | null>> {
    const infos = await program.connection.getMultipleAccountsInfo(addresses);

    return infos.map((info) => {
      if (info === null) {
        return null;
      }
      if (!info.owner.equals(programId)) {
        throw new Error("account doesn't belong to this program");
      }

      return this.decode(info.data);
    });
  }

  static decode(data: Buffer): TaskSpecRecord {
    if (!data.slice(0, 8).equals(TaskSpecRecord.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = TaskSpecRecord.layout.decode(data.slice(8));

    return new TaskSpecRecord({
      hash: types.Hash.fromDecoded(dec.hash),
    });
  }

  toJSON(): TaskSpecRecordJSON {
    return {
      hash: this.hash.toJSON(),
    };
  }

  static fromJSON(obj: TaskSpecRecordJSON): TaskSpecRecord {
    return new TaskSpecRecord({
      hash: types.Hash.fromJSON(obj.hash),
    });
  }
}
