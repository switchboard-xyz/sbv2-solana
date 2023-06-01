import { SwitchboardProgram } from "../../SwitchboardProgram.js";
import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface VerificationPendingJSON {
  kind: "VerificationPending";
}

export class VerificationPending {
  static readonly discriminator = 0;
  static readonly kind = "VerificationPending";
  readonly discriminator = 0;
  readonly kind = "VerificationPending";

  toJSON(): VerificationPendingJSON {
    return {
      kind: "VerificationPending",
    };
  }

  toEncodable() {
    return {
      VerificationPending: {},
    };
  }
}

export interface VerificationFailureJSON {
  kind: "VerificationFailure";
}

export class VerificationFailure {
  static readonly discriminator = 1;
  static readonly kind = "VerificationFailure";
  readonly discriminator = 1;
  readonly kind = "VerificationFailure";

  toJSON(): VerificationFailureJSON {
    return {
      kind: "VerificationFailure",
    };
  }

  toEncodable() {
    return {
      VerificationFailure: {},
    };
  }
}

export interface VerificationSuccessJSON {
  kind: "VerificationSuccess";
}

export class VerificationSuccess {
  static readonly discriminator = 2;
  static readonly kind = "VerificationSuccess";
  readonly discriminator = 2;
  readonly kind = "VerificationSuccess";

  toJSON(): VerificationSuccessJSON {
    return {
      kind: "VerificationSuccess",
    };
  }

  toEncodable() {
    return {
      VerificationSuccess: {},
    };
  }
}

export interface VerificationOverrideJSON {
  kind: "VerificationOverride";
}

export class VerificationOverride {
  static readonly discriminator = 3;
  static readonly kind = "VerificationOverride";
  readonly discriminator = 3;
  readonly kind = "VerificationOverride";

  toJSON(): VerificationOverrideJSON {
    return {
      kind: "VerificationOverride",
    };
  }

  toEncodable() {
    return {
      VerificationOverride: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.VerificationStatusKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("VerificationPending" in obj) {
    return new VerificationPending();
  }
  if ("VerificationFailure" in obj) {
    return new VerificationFailure();
  }
  if ("VerificationSuccess" in obj) {
    return new VerificationSuccess();
  }
  if ("VerificationOverride" in obj) {
    return new VerificationOverride();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.VerificationStatusJSON
): types.VerificationStatusKind {
  switch (obj.kind) {
    case "VerificationPending": {
      return new VerificationPending();
    }
    case "VerificationFailure": {
      return new VerificationFailure();
    }
    case "VerificationSuccess": {
      return new VerificationSuccess();
    }
    case "VerificationOverride": {
      return new VerificationOverride();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "VerificationPending"),
    borsh.struct([], "VerificationFailure"),
    borsh.struct([], "VerificationSuccess"),
    borsh.struct([], "VerificationOverride"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
