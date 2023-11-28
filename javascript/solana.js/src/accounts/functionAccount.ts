import { Account } from "../accounts/account.js";
import * as errors from "../errors.js";
import * as types from "../generated/attestation-program/index.js";
import type { SwitchboardProgram } from "../SwitchboardProgram.js";
import { SB_ATTESTATION_PID, SB_V2_PID } from "../SwitchboardProgram.js";
import type {
  SendTransactionObjectOptions,
  TransactionObjectOptions,
} from "../TransactionObject.js";
import { TransactionObject } from "../TransactionObject.js";
import {
  containsMrEnclave,
  handleOptionalPubkeys,
  numToBN,
  parseCronSchedule,
  parseRawBuffer,
} from "../utils.js";

import type {
  FunctionRequestAccountInitParams,
  FunctionRoutineAccountInitParams,
  SwitchboardWalletFundParams,
  VerifierAccount,
} from "./index.js";
import {
  AttestationPermissionAccount,
  AttestationQueueAccount,
  FunctionRequestAccount,
  FunctionRoutineAccount,
  SwitchboardWallet,
} from "./index.js";

import * as anchor from "@coral-xyz/anchor";
import * as spl from "@solana/spl-token";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type {
  AccountInfo,
  AddressLookupTableAccount,
  Keypair,
  SendOptions,
  TransactionInstruction,
  TransactionSignature,
} from "@solana/web3.js";
import {
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import type { RawBuffer } from "@switchboard-xyz/common";
import { BN, parseRawMrEnclave, toUtf8 } from "@switchboard-xyz/common";
import assert from "assert";

const addressLookupProgram = new PublicKey(
  "AddressLookupTab1e1111111111111111111111111"
);

export type ContainerRegistryType = "dockerhub" | "ipfs";

export type FunctionAccountInitSeeds = {
  recentSlot?: number;
  creatorSeed?: RawBuffer; // defaults to payer pubkey bytes
};

/**
 *  Parameters for initializing a {@linkcode FunctionAccount}
 */
export type FunctionAccountInitParams = FunctionAccountInitSeeds & {
  // Metadata Config
  name?: string;
  metadata?: string;

  // Container Config
  container: string;
  version?: string;
  containerRegistry?: ContainerRegistryType;
  mrEnclave?: Buffer | Uint8Array | number[];

  // Request Config
  requestsDisabled?: boolean;
  requestsRequireAuthorization?: boolean;
  requestsFee?: number;

  // Routines Config
  routinesDisabled?: boolean;
  routinesRequireAuthorization?: boolean;
  routinesFee?: number;

  // Accounts
  attestationQueue: AttestationQueueAccount;

  /**
   *  An authority to be used to control this account.
   *
   *  @default payer
   */
  authority?: PublicKey;
};

/**
 *  Parameters for setting a {@linkcode FunctionAccount} config
 */
export interface FunctionSetConfigParams {
  name?: string;
  metadata?: string;
  container?: string;
  containerRegistry?: ContainerRegistryType;
  version?: string;
  schedule?: string;
  mrEnclaves?: Array<RawBuffer>;
  requestsDisabled?: boolean;
  requestsRequireAuthorization?: boolean;
  requestsFee?: number;

  authority?: Keypair;
}

/**
 *  Parameters for setting a {@linkcode FunctionAccount} escrow
 */
export interface FunctionSetEscrowParams {
  authority?: Keypair;
  newEscrow: SwitchboardWallet;
  newEscrowAuthority?: Keypair;
}

/**
 *  Parameters for setting a {@linkcode FunctionAccount} authority
 */
export interface FunctionSetAuthorityParams {
  authority?: Keypair;
  newAuthority: PublicKey;
  walletAuthority?: Keypair;
}

/**
 *  Parameters for setting a {@linkcode types.functionClose} authority
 */
export interface FunctionCloseAccountParams {
  authority?: Keypair;
}

/**
 *  Parameters for an {@linkcode types.functionVerify} instruction.
 */
export interface FunctionVerifySyncParams {
  observedTime: anchor.BN;
  nextAllowedTimestamp: anchor.BN;
  isFailure: boolean;
  mrEnclave: Uint8Array;

  escrowWallet: PublicKey;
  functionEnclaveSigner: PublicKey;

  attestationQueue: PublicKey;
  attestationQueueAuthority: PublicKey;

  quoteVerifier: PublicKey;
  quoteVerifierEnclaveSigner: PublicKey;

  receiver: PublicKey;
}

/**
 *  Parameters for an {@linkcode types.functionVerify} instruction.
 */
export interface FunctionVerifyParams {
  observedTime: anchor.BN;
  nextAllowedTimestamp: anchor.BN;
  isFailure: boolean;
  mrEnclave: Uint8Array;
  verifier: VerifierAccount;
  verifierEnclaveSigner: PublicKey;
  functionEnclaveSigner: PublicKey;
  receiver: PublicKey;

  fnState?: types.FunctionAccountData;
  attestationQueueAuthority?: PublicKey;
}

/**
 *  Parameters for an {@linkcode types.functionTrigger} instruction.
 */
export interface FunctionTriggerParams {
  authority?: Keypair;
}

export type CreateFunctionRequestParams = Omit<
  FunctionRequestAccountInitParams,
  "functionAccount"
> & { keypair?: Keypair };

export type CreateFunctionRoutineParams = Omit<
  FunctionRoutineAccountInitParams,
  "functionAccount"
> & { keypair?: Keypair };

/**
 * Account type representing a Switchboard Function.
 *
 * Data: {@linkcode types.FunctionAccountData}
 */
export class FunctionAccount extends Account<types.FunctionAccountData> {
  static accountName = "FunctionAccountData";

  private _wallet: Promise<SwitchboardWallet> | undefined = undefined;

  /**
   *  Returns the functions's name buffer in a stringified format.
   */
  public static getName = (functionState: types.FunctionAccountData) =>
    toUtf8(functionState.name);

  /**
   *  Returns the functions's metadata buffer in a stringified format.
   */
  public static getMetadata = (functionState: types.FunctionAccountData) =>
    toUtf8(functionState.metadata);

  public get wallet(): Promise<SwitchboardWallet> {
    if (!this._wallet) {
      this._wallet = this.loadData().then((fnState) => {
        return new SwitchboardWallet(this.program, fnState.escrowWallet);
      });
    }

    return this._wallet;
  }

  public set wallet(_wallet: Promise<SwitchboardWallet>) {
    this._wallet = _wallet;
  }

  public static fromSeed(
    program: SwitchboardProgram,
    creatorSeed: Uint8Array,
    recentSlot: BN
  ): FunctionAccount {
    if (creatorSeed.length > 32) {
      throw new Error("Creator seed must be 32 bytes or less");
    }

    const functionPubkey = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("FunctionAccountData"),
        creatorSeed.length < 32 ? parseRawBuffer(creatorSeed, 32) : creatorSeed,
        recentSlot.toBuffer("le", 8),
      ],
      program.attestationProgramId
    )[0];
    return new FunctionAccount(program, functionPubkey);
  }

  public async getBalance(): Promise<number> {
    const wallet = await this.wallet;
    const balance = await wallet.getBalance();
    return balance;
  }

  public async getBalanceBN(): Promise<BN> {
    const wallet = await this.wallet;
    const balance = await wallet.getBalanceBN();
    return balance;
  }

  /**
   *  Retrieve and decode the {@linkcode types.FunctionAccountData} stored in this account.
   */
  public async loadData(): Promise<types.FunctionAccountData> {
    const data = await types.FunctionAccountData.fetch(
      this.program,
      this.publicKey
    );
    if (!data) {
      throw new errors.AccountNotFoundError("Function", this.publicKey);
    }
    this._wallet = Promise.resolve(
      new SwitchboardWallet(this.program, data.escrowWallet)
    );
    return data;
  }

  /**
   *  Decode the {@linkcode types.FunctionAccountData} stored in this account.
   */
  public static async decode(
    program: SwitchboardProgram,
    accountInfo: AccountInfo<Buffer>
  ): Promise<[FunctionAccount, types.FunctionAccountData]> {
    if (!accountInfo.owner.equals(program.attestationProgramId)) {
      throw new errors.IncorrectOwner(
        program.attestationProgramId,
        accountInfo.owner
      );
    }

    const data = types.FunctionAccountData.decode(accountInfo.data);
    if (!data) {
      throw new errors.AccountNotFoundError("Function", PublicKey.default);
    }

    assert(data.creatorSeed.length === 32);

    const functionAccount = FunctionAccount.fromSeed(
      program,
      new Uint8Array(data.creatorSeed),
      data.createdAtSlot
    );

    functionAccount._wallet = Promise.resolve(
      new SwitchboardWallet(program, data.escrowWallet)
    );

    return [functionAccount, data];
  }

  /**
   *  Load an existing {@linkcode FunctionAccount} with its current on-chain state
   */
  public static async load(
    program: SwitchboardProgram,
    address: PublicKey | string
  ): Promise<[FunctionAccount, types.FunctionAccountData]> {
    const functionAccount = new FunctionAccount(program, address);
    const state = await functionAccount.loadData();
    return [functionAccount, state];
  }

  public static async createInstruction(
    program: SwitchboardProgram,
    payer: PublicKey,
    params: FunctionAccountInitParams,
    wallet?: SwitchboardWallet,
    options?: TransactionObjectOptions
  ): Promise<[FunctionAccount, TransactionObject]> {
    const authorityPubkey = params.authority ?? payer;

    const attestationQueueAccount = params.attestationQueue;

    const recentSlot: BN = params.recentSlot
      ? new BN(params.recentSlot)
      : new BN(
          (
            await program.connection.getLatestBlockhashAndContext({
              commitment: "finalized",
            })
          ).context.slot - 1
        );

    const creatorSeed = params.creatorSeed
      ? parseRawBuffer(params.creatorSeed, 32)
      : payer.toBytes();
    assert(creatorSeed.length === 32);

    const functionAccount = FunctionAccount.fromSeed(
      program,
      creatorSeed,
      recentSlot
    );

    const [addressLookupTable] = PublicKey.findProgramAddressSync(
      [functionAccount.publicKey.toBuffer(), recentSlot.toBuffer("le", 8)],
      addressLookupProgram
    );

    let escrowWallet: SwitchboardWallet;
    let escrowWalletAuthority: PublicKey;
    if (wallet) {
      escrowWallet = wallet;
      escrowWalletAuthority = (await escrowWallet.loadData()).authority;
      if (
        !escrowWalletAuthority.equals(payer) &&
        !escrowWalletAuthority.equals(authorityPubkey)
      ) {
        throw new errors.IncorrectAuthority(
          escrowWalletAuthority,
          authorityPubkey
        );
      }
    } else {
      escrowWallet = SwitchboardWallet.fromSeed(
        program,
        attestationQueueAccount.publicKey,
        authorityPubkey,
        functionAccount.publicKey.toBytes()
      );
      escrowWalletAuthority = authorityPubkey;
    }

    const instruction = types.functionInit(
      program,
      {
        params: {
          // PDA Config
          recentSlot: recentSlot,
          creatorSeed: Array.from(creatorSeed),

          // Metadata Config
          name: new Uint8Array(Buffer.from(params.name ?? "", "utf8")),
          metadata: new Uint8Array(Buffer.from(params.metadata ?? "", "utf8")),

          // Container Config
          container: new Uint8Array(Buffer.from(params.container, "utf8")),
          containerRegistry: new Uint8Array(
            Buffer.from(params.containerRegistry ?? "dockerhub", "utf8")
          ),
          version: new Uint8Array(
            Buffer.from(params.version ?? "latest", "utf8")
          ),
          mrEnclave: Array.from(
            params.mrEnclave ? parseRawMrEnclave(params.mrEnclave) : []
          ),

          // Requests Config
          requestsDisabled: params.requestsDisabled ?? false,
          requestsRequireAuthorization:
            params.requestsRequireAuthorization ?? false,
          requestsDevFee: numToBN(params.requestsFee),

          // Routines Config
          routinesDisabled: false,
          routinesDevFee: new BN(0),
          routinesRequireAuthorization: false,
        },
      },
      {
        function: functionAccount.publicKey,
        addressLookupTable: addressLookupTable,
        authority: authorityPubkey,
        attestationQueue: attestationQueueAccount.publicKey,
        payer,
        escrowWallet: escrowWallet.publicKey,
        escrowWalletAuthority: escrowWalletAuthority,
        escrowTokenWallet: escrowWallet.tokenWallet,
        mint: program.mint.address,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        addressLookupProgram: addressLookupProgram,
      }
    );

    functionAccount.wallet = Promise.resolve(escrowWallet);

    return [
      functionAccount,
      new TransactionObject(
        payer,
        [
          ComputeBudgetProgram.setComputeUnitLimit({ units: 250_000 }),
          instruction,
        ],
        [],
        {
          ...options,
          computeUnitLimit: undefined,
        }
      ),
    ];
  }

  public static async create(
    program: SwitchboardProgram,
    params: FunctionAccountInitParams,
    wallet?: SwitchboardWallet,
    options?: SendTransactionObjectOptions
  ): Promise<[FunctionAccount, TransactionSignature]> {
    const [account, txnObject] = await this.createInstruction(
      program,
      program.walletPubkey,
      params,
      wallet,
      options
    );
    const txSignature = await program.signAndSend(txnObject, options);
    return [account, txSignature];
  }

  public async createRequestInstruction(
    payer: PublicKey,
    params: CreateFunctionRequestParams,
    options?: TransactionObjectOptions
  ): Promise<[FunctionRequestAccount, TransactionObject]> {
    // const functionState = await this.loadData();
    const [requestAccount, txnObject] =
      await FunctionRequestAccount.createInstruction(
        this.program,
        payer,
        {
          ...params,
          functionAccount: this,
        },
        options
      );

    return [requestAccount, txnObject];
  }

  public async createRequest(
    params: CreateFunctionRequestParams,
    options?: SendTransactionObjectOptions
  ): Promise<[FunctionRequestAccount, TransactionSignature]> {
    const [account, txnObject] = await this.createRequestInstruction(
      this.program.walletPubkey,
      params,
      options
    );
    const txSignature = await this.program.signAndSend(txnObject, options);
    return [account, txSignature];
  }

  public async createRoutineInstruction(
    payer: PublicKey,
    params: CreateFunctionRoutineParams,
    wallet?: SwitchboardWallet,
    options?: TransactionObjectOptions
  ): Promise<[FunctionRoutineAccount, TransactionObject]> {
    const [routineAccount, txnObject] =
      await FunctionRoutineAccount.createInstruction(
        this.program,
        payer,
        {
          ...params,
          functionAccount: this,
        },
        wallet,
        options
      );

    return [routineAccount, txnObject];
  }

  public async createRoutine(
    params: CreateFunctionRoutineParams,
    wallet?: SwitchboardWallet,
    options?: SendTransactionObjectOptions
  ): Promise<[FunctionRoutineAccount, TransactionSignature]> {
    const [account, txnObject] = await this.createRoutineInstruction(
      this.program.walletPubkey,
      params,
      wallet,
      options
    );
    const txSignature = await this.program.signAndSend(txnObject, options);
    return [account, txSignature];
  }

  public async setConfigInstruction(
    payer: PublicKey,
    params: FunctionSetConfigParams,
    options?: TransactionObjectOptions
  ): Promise<TransactionObject> {
    const functionState = await this.loadData();

    if (params.authority) {
      if (!params.authority.publicKey.equals(functionState.authority)) {
        throw new errors.IncorrectAuthority(
          functionState.authority,
          params.authority.publicKey
        );
      }
    } else {
      if (!payer.equals(functionState.authority)) {
        throw new errors.IncorrectAuthority(functionState.authority, payer);
      }
    }

    const toOptionalBytes = (param: string | undefined): Uint8Array | null => {
      return param ? new Uint8Array(Buffer.from(param, "utf8")) : null;
    };

    const setConfigIxn = types.functionSetConfig(
      this.program,
      {
        params: {
          // Metadata Config
          name: toOptionalBytes(params.name),
          metadata: toOptionalBytes(params.metadata),

          // Container Config
          container: toOptionalBytes(params.container),
          containerRegistry: toOptionalBytes(params.containerRegistry),
          version: toOptionalBytes(params.version),
          mrEnclaves: params.mrEnclaves
            ? params.mrEnclaves.map((mrEnclave) =>
                Array.from(parseRawBuffer(mrEnclave))
              )
            : null,

          // Requests Config
          requestsDisabled: params.requestsDisabled ?? null,
          requestsRequireAuthorization:
            params.requestsRequireAuthorization ?? null,
          requestsDevFee: params.requestsFee
            ? new BN(params.requestsFee)
            : null,

          // Routines Config
          routinesDisabled: null,
          lockRoutinesDisabled: null,
          routinesDevFee: null,
          routinesRequireAuthorization: null,
        },
      },
      {
        function: this.publicKey,
        authority: functionState.authority,
      }
    );

    return new TransactionObject(
      payer,
      [setConfigIxn],
      params?.authority ? [params.authority] : [],
      options
    );
  }

  public async setConfig(
    params: FunctionSetConfigParams,
    options?: SendTransactionObjectOptions
  ): Promise<TransactionSignature> {
    return await this.setConfigInstruction(
      this.program.walletPubkey,
      params,
      options
    ).then((txn) => this.program.signAndSend(txn, options));
  }

  public static hasMrEnclave(
    mrEnclaves: Array<number[]>,
    targetMrEnclave: number[] | Uint8Array
  ): boolean {
    return containsMrEnclave(mrEnclaves, targetMrEnclave);
  }

  public async addMrEnclaveInstruction(
    payer: PublicKey,
    mrEnclave: number[] | Uint8Array,
    params?: {
      // Optional authority if needing to change config and payer is not the authority
      authority?: Keypair;
      // Pre-fetched account state to reduce network calls
      functionState?: types.FunctionAccountData;
      // Force remove a MrEnclave if full
      force?: boolean;
    },
    options?: TransactionObjectOptions
  ): Promise<TransactionObject> {
    const force = params?.force ?? false;
    const functionState = params?.functionState ?? (await this.loadData());

    if (FunctionAccount.hasMrEnclave(functionState.mrEnclaves, mrEnclave)) {
      throw new errors.FunctionMrEnclaveAlreadySet();
    }

    const filteredMrEnclaves = functionState.mrEnclaves.filter(
      (arr) => !arr.every((num) => num === 0)
    );
    if (filteredMrEnclaves.length >= 32 && !force) {
      throw new errors.FunctionMrEnclavesFull();
    }

    const newMrEnclaves = [
      ...(filteredMrEnclaves.length >= 32
        ? filteredMrEnclaves.slice(filteredMrEnclaves.length - 32 + 1)
        : filteredMrEnclaves),
      Array.from(mrEnclave),
    ];

    if (params?.authority) {
      if (!params.authority.publicKey.equals(functionState.authority)) {
        throw new errors.IncorrectAuthority(
          functionState.authority,
          params.authority.publicKey
        );
      }
    } else {
      if (!payer.equals(functionState.authority)) {
        throw new errors.IncorrectAuthority(functionState.authority, payer);
      }
    }

    const setConfigIxn = types.functionSetConfig(
      this.program,
      {
        params: {
          // Metadata Config
          name: null,
          metadata: null,

          // Container Config
          container: null,
          containerRegistry: null,
          version: null,
          mrEnclaves: newMrEnclaves,

          // Requests Config
          requestsDisabled: null,
          requestsRequireAuthorization: null,
          requestsDevFee: null,

          // Routines Config
          routinesDisabled: null,
          lockRoutinesDisabled: null,
          routinesDevFee: null,
          routinesRequireAuthorization: null,
        },
      },
      {
        function: this.publicKey,
        authority: functionState.authority,
      }
    );

    return new TransactionObject(
      payer,
      [setConfigIxn],
      params?.authority ? [params.authority] : [],
      options
    );
  }

  public async addMrEnclave(
    mrEnclave: number[] | Uint8Array,
    params?: {
      // Optional authority if needing to change config and payer is not the authority
      authority?: Keypair;
      // Pre-fetched account state to reduce network calls
      functionState?: types.FunctionAccountData;
      // Force remove a MrEnclave if full
      force?: boolean;
    },
    options?: SendTransactionObjectOptions
  ): Promise<TransactionSignature> {
    return await this.addMrEnclaveInstruction(
      this.program.walletPubkey,
      mrEnclave,
      params,
      options
    ).then((txn) => this.program.signAndSend(txn, options));
  }

  /**
   * Try to add a MrEnclave to the function config, if it is not already present. Returns undefined
   * if MrEnclave is already in the config.
   */
  public async tryAddMrEnclave(
    mrEnclave: number[] | Uint8Array,
    params?: {
      // Optional authority if needing to change config and payer is not the authority
      authority?: Keypair;
      // Pre-fetched account state to reduce network calls
      functionState?: types.FunctionAccountData;
      // Force remove a MrEnclave if full
      force?: boolean;
    },
    options?: SendTransactionObjectOptions
  ): Promise<TransactionSignature | undefined> {
    const functionState = params?.functionState ?? (await this.loadData());
    if (FunctionAccount.hasMrEnclave(functionState.mrEnclaves, mrEnclave)) {
      return undefined;
    }
    return await this.addMrEnclaveInstruction(
      this.program.walletPubkey,
      mrEnclave,
      params,
      options
    ).then((txn) => this.program.signAndSend(txn, options));
  }

  public async setEscrowInstruction(
    payer: PublicKey,
    params: FunctionSetEscrowParams,
    options?: TransactionObjectOptions
  ): Promise<TransactionObject> {
    const signers: Keypair[] = [];
    if (params.authority) {
      signers.push(params.authority);
    }
    if (params.newEscrowAuthority) {
      signers.push(params.newEscrowAuthority);
    }
    const functionState = await this.loadData();

    const currentWallet = await this.wallet;
    const currentWalletState = await currentWallet.loadData();

    const newWallet = params.newEscrow;
    const newWalletState = await newWallet.loadData();

    const functionSetEscrowIxn = types.functionSetEscrow(
      this.program,
      { params: {} },
      {
        function: this.publicKey,
        authority: functionState.authority,
        attestationQueue: functionState.attestationQueue,
        escrowWallet: currentWallet.publicKey,
        escrowAuthority: currentWalletState.authority,
        newEscrow: newWallet.publicKey,
        newEscrowAuthority: newWalletState.authority,
        newEscrowTokenWallet: newWallet.tokenWallet,
      }
    );

    return new TransactionObject(
      payer,
      [functionSetEscrowIxn],
      signers,
      options
    );
  }

  public async setEscrow(
    params: FunctionSetEscrowParams,
    options?: SendTransactionObjectOptions
  ): Promise<TransactionSignature> {
    return await this.setEscrowInstruction(
      this.program.walletPubkey,
      params,
      options
    ).then((txn) => this.program.signAndSend(txn, options));
  }

  public async setAuthorityInstruction(
    payer: PublicKey,
    params: FunctionSetAuthorityParams,
    options?: TransactionObjectOptions
  ): Promise<TransactionObject> {
    const signers: Keypair[] = [];
    if (params.authority) {
      signers.push(params.authority);
    }
    if (params.walletAuthority) {
      signers.push(params.walletAuthority);
    }

    const functionState = await this.loadData();
    const wallet = await this.wallet;
    const walletState = await wallet.loadData();

    const functionSetAuthorityIxn = types.functionSetAuthority(
      this.program,
      { params: {} },
      {
        function: this.publicKey,
        authority: functionState.authority,
        attestationQueue: functionState.attestationQueue,
        escrowWallet: wallet.publicKey,
        escrowAuthority: walletState.authority,
        newAuthority: params.newAuthority,
        walletAuthority: params.walletAuthority
          ? params.walletAuthority.publicKey
          : SB_ATTESTATION_PID,
      }
    );

    return new TransactionObject(
      payer,
      [handleOptionalPubkeys(functionSetAuthorityIxn)],
      signers,
      options
    );
  }

  public async setAuthority(
    params: FunctionSetAuthorityParams,
    options?: SendTransactionObjectOptions
  ): Promise<TransactionSignature> {
    return await this.setAuthorityInstruction(
      this.program.walletPubkey,
      params,
      options
    ).then((txn) => this.program.signAndSend(txn, options));
  }

  public async resetEscrowInstruction(
    payer: PublicKey,
    authority?: Keypair,
    options?: TransactionObjectOptions
  ): Promise<TransactionObject> {
    const functionState = await this.loadData();

    const defaultWallet = SwitchboardWallet.fromSeed(
      this.program,
      functionState.attestationQueue,
      functionState.authority,
      this.publicKey.toBytes()
    );

    const ixn = types.functionResetEscrow(
      this.program,
      { params: {} },
      {
        function: this.publicKey,
        authority: functionState.authority,
        attestationQueue: functionState.attestationQueue,
        mint: this.program.mint.address,
        escrowWallet: functionState.escrowWallet,
        defaultWallet: defaultWallet.publicKey,
        tokenWallet: defaultWallet.tokenWallet,
        payer: payer,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
    );

    const txn = new TransactionObject(
      payer,
      [ixn],
      authority ? [authority] : [],
      options
    );
    return txn;
  }

  public async resetEscrow(
    authority?: Keypair,
    options?: SendTransactionObjectOptions
  ): Promise<TransactionSignature> {
    return await this.resetEscrowInstruction(
      this.program.walletPubkey,
      authority,
      options
    ).then((txn) => this.program.signAndSend(txn, options));
  }

  public async fundInstruction(
    payer: PublicKey,
    params: SwitchboardWalletFundParams,
    options?: TransactionObjectOptions
  ): Promise<TransactionObject> {
    const wallet = await this.wallet;

    const txn = await wallet.fundInstruction(payer, params, options);
    return txn;
  }

  public async fund(
    params: SwitchboardWalletFundParams,
    options?: SendTransactionObjectOptions
  ): Promise<TransactionSignature> {
    return await this.fundInstruction(
      this.program.walletPubkey,
      params,
      options
    ).then((txn) => this.program.signAndSend(txn, options));
  }

  public async wrapInstruction(
    payer: PublicKey,
    amount: number,
    options?: TransactionObjectOptions
  ): Promise<TransactionObject> {
    const wallet = await this.wallet;

    const txn = await wallet.wrapInstruction(payer, amount, options);
    return txn;
  }

  public async wrap(
    amount: number,
    options?: SendTransactionObjectOptions
  ): Promise<TransactionSignature> {
    return await this.wrapInstruction(
      this.program.walletPubkey,
      amount,
      options
    ).then((txn) => this.program.signAndSend(txn, options));
  }

  public async withdrawInstruction(
    payer: PublicKey,
    amount: number,
    destinationWallet?: PublicKey,
    options?: TransactionObjectOptions
  ): Promise<TransactionObject> {
    const wallet = await this.wallet;

    const txn = await wallet.withdrawInstruction(
      payer,
      amount,
      destinationWallet,
      options
    );

    return txn;
  }

  public async withdraw(
    amount: number,
    destinationWallet?: PublicKey,
    options?: SendTransactionObjectOptions
  ): Promise<TransactionSignature> {
    return await this.withdrawInstruction(
      this.program.walletPubkey,
      amount,
      destinationWallet,
      options
    ).then((txn) => this.program.signAndSend(txn, options));
  }

  public async closeAccountInstruction(
    payer: PublicKey,
    params: FunctionCloseAccountParams,
    options?: TransactionObjectOptions
  ): Promise<TransactionObject> {
    const signers: Keypair[] = [];
    if (params.authority) {
      signers.push(params.authority);
    }

    const functionState = await this.loadData();
    const wallet = await this.wallet;

    const functionCloseIxn = types.functionClose(
      this.program,
      { params: {} },
      {
        function: this.publicKey,
        authority: functionState.authority,
        addressLookupProgram: addressLookupProgram,
        addressLookupTable: functionState.addressLookupTable,
        escrowWallet: wallet.publicKey,
        solDest: payer,
        escrowDest: this.program.mint.getAssociatedAddress(payer),
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
    );
    return new TransactionObject(payer, [functionCloseIxn], signers, options);
  }

  public async closeAccount(
    params: FunctionCloseAccountParams,
    options?: SendTransactionObjectOptions
  ): Promise<TransactionSignature> {
    return await this.closeAccountInstruction(
      this.program.walletPubkey,
      params,
      options
    ).then((txn) => this.program.signAndSend(txn, options));
  }

  public verifyInstructionSync(
    params: FunctionVerifySyncParams
  ): TransactionInstruction {
    const wallet = new SwitchboardWallet(this.program, params.escrowWallet);
    const escrowTokenWallet = wallet.tokenWallet;

    return types.functionVerify(
      this.program,
      {
        params: {
          observedTime: params.observedTime,
          nextAllowedTimestamp: params.nextAllowedTimestamp,
          errorCode: params.isFailure ? 1 : 0,
          mrEnclave: Array.from(params.mrEnclave),
        },
      },
      {
        // fn accounts
        function: this.publicKey,
        functionEnclaveSigner: params.functionEnclaveSigner,
        // verifier accounts
        verifier: params.quoteVerifier,
        verifierSigner: params.quoteVerifierEnclaveSigner,
        verifierPermission: AttestationPermissionAccount.fromSeed(
          this.program,
          params.attestationQueueAuthority,
          params.attestationQueue,
          params.quoteVerifier
        ).publicKey,
        // token accounts
        escrowWallet: params.escrowWallet,
        escrowTokenWallet: escrowTokenWallet,
        receiver: params.receiver,
        // others
        attestationQueue: params.attestationQueue,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
      }
    );
  }

  public async verifyInstruction(
    params: FunctionVerifyParams
  ): Promise<TransactionInstruction> {
    const functionState = params.fnState ?? (await this.loadData());

    const wallet = await this.wallet;

    let attestationQueueAuthority = params.attestationQueueAuthority;
    if (!attestationQueueAuthority) {
      const attestationQueueAccount = new AttestationQueueAccount(
        this.program,
        functionState.attestationQueue
      );
      attestationQueueAuthority = (await attestationQueueAccount.loadData())
        .authority;
    }

    const quoteVerifier = await params.verifier.loadData();

    return this.verifyInstructionSync({
      observedTime: params.observedTime,
      nextAllowedTimestamp: params.nextAllowedTimestamp,
      isFailure: params.isFailure,
      mrEnclave: params.mrEnclave,

      escrowWallet: wallet.publicKey,
      functionEnclaveSigner: params.functionEnclaveSigner,

      attestationQueue: functionState.attestationQueue,
      attestationQueueAuthority: attestationQueueAuthority,

      quoteVerifier: params.verifier.publicKey,
      quoteVerifierEnclaveSigner: quoteVerifier.enclave.enclaveSigner,

      receiver: params.receiver,
    });
  }

  public async verifyTransaction(
    params: FunctionVerifyParams
  ): Promise<anchor.web3.VersionedTransaction> {
    const fnState = await this.loadData();
    const ixn = await this.verifyInstruction({ ...params, fnState });

    const lookupTable = await this.program.connection
      .getAddressLookupTable(fnState.addressLookupTable)
      .then((res) => res.value!);

    const messageV0 = new anchor.web3.TransactionMessage({
      payerKey: this.program.walletPubkey,
      recentBlockhash: (await this.program.connection.getLatestBlockhash())
        .blockhash,
      instructions: [ixn], // note this is an array of instructions
    }).compileToV0Message([lookupTable]);
    const transactionV0 = new anchor.web3.VersionedTransaction(messageV0);

    return transactionV0;
  }

  public async verify(
    params: {
      observedTime: anchor.BN;
      nextAllowedTimestamp: anchor.BN;
      isFailure: boolean;
      mrEnclave: Uint8Array;

      verifier: VerifierAccount;
      verifierEnclaveSigner: Keypair;

      functionEnclaveSigner: Keypair;
      receiver: PublicKey;

      fnState?: types.FunctionAccountData;
      attestationQueueAuthority?: PublicKey;
    },
    options?: SendOptions
  ): Promise<TransactionSignature> {
    const transactionV0 = await this.verifyTransaction({
      ...params,
      verifierEnclaveSigner: params.verifierEnclaveSigner.publicKey,
      functionEnclaveSigner: params.functionEnclaveSigner.publicKey,
    });

    transactionV0.sign([params.verifierEnclaveSigner]);
    transactionV0.sign([params.functionEnclaveSigner]);
    transactionV0.sign([this.program.wallet.payer]);

    const txnSignature = await this.program.connection.sendEncodedTransaction(
      Buffer.from(transactionV0.serialize()).toString("base64"),
      options
    );
    return txnSignature;
  }

  public async triggerInstruction(
    payer: PublicKey,
    params?: FunctionTriggerParams,
    options?: TransactionObjectOptions
  ): Promise<TransactionObject> {
    const functionState = await this.loadData();

    // verify authority is correct
    if (params && params?.authority) {
      if (!params.authority.publicKey.equals(functionState.authority)) {
        throw new errors.IncorrectAuthority(
          functionState.authority,
          params.authority.publicKey
        );
      }
    } else {
      if (!payer.equals(functionState.authority)) {
        throw new errors.IncorrectAuthority(functionState.authority, payer);
      }
    }

    const functionTrigger = types.functionTrigger(
      this.program,
      { params: {} },
      {
        function: this.publicKey,
        authority: functionState.authority,
        attestationQueue: functionState.attestationQueue,
      }
    );

    return new TransactionObject(
      payer,
      [functionTrigger],
      params?.authority ? [params.authority] : [],
      options
    );
  }

  public async trigger(
    params?: FunctionTriggerParams,
    options?: SendTransactionObjectOptions
  ): Promise<TransactionSignature> {
    return await this.triggerInstruction(
      this.program.walletPubkey,
      params,
      options
    ).then((txn) => this.program.signAndSend(txn, options));
  }

  public static decodeAddressLookup(lookupTable: AddressLookupTableAccount) {
    const addresses = lookupTable.state.addresses;
    if (addresses.length < 16) {
      throw new Error(`Failed to decode address lookup table`);
    }

    const systemProgram = addresses[0]!;
    if (!systemProgram.equals(anchor.web3.SystemProgram.programId)) {
      throw new Error("AddressLookupMismatch");
    }

    const tokenProgram = addresses[1]!;
    if (!tokenProgram.equals(anchor.utils.token.TOKEN_PROGRAM_ID)) {
      throw new Error("AddressLookupMismatch");
    }

    const assocatedTokenProgram = addresses[2]!;
    if (
      !assocatedTokenProgram.equals(anchor.utils.token.ASSOCIATED_PROGRAM_ID)
    ) {
      throw new Error("AddressLookupMismatch");
    }

    const sysVarRent = addresses[3]!;
    if (!sysVarRent.equals(anchor.web3.SYSVAR_RENT_PUBKEY)) {
      throw new Error("AddressLookupMismatch");
    }

    const sysVarRecentBlockhashes = addresses[4]!;
    if (
      !sysVarRecentBlockhashes.equals(
        anchor.web3.SYSVAR_RECENT_BLOCKHASHES_PUBKEY
      )
    ) {
      throw new Error("AddressLookupMismatch");
    }

    const sysVarInstructions = addresses[5]!;
    if (!sysVarInstructions.equals(anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY)) {
      throw new Error("AddressLookupMismatch");
    }

    const sysVarSlotHashes = addresses[6]!;
    if (!sysVarSlotHashes.equals(anchor.web3.SYSVAR_SLOT_HASHES_PUBKEY)) {
      throw new Error("AddressLookupMismatch");
    }

    const sysVarSlotHistory = addresses[7]!;
    if (!sysVarSlotHistory.equals(anchor.web3.SYSVAR_SLOT_HISTORY_PUBKEY)) {
      throw new Error("AddressLookupMismatch");
    }

    const switchboardProgram = addresses[8]!;
    if (!switchboardProgram.equals(SB_V2_PID)) {
      throw new Error("AddressLookupMismatch");
    }

    const attestationProgram = addresses[9]!;
    if (!attestationProgram.equals(SB_ATTESTATION_PID)) {
      throw new Error("AddressLookupMismatch");
    }

    // switchboard accounts, not worth the network calls
    const attestationQueuePubkey = addresses[10]!;
    const functionPubkey = addresses[11]!;
    const functionAuthorityPubkey = addresses[12]!;
    const mintPubkey = addresses[13]!;
    const walletPubkey = addresses[14]!;
    const escrowPubkey = addresses[15]!;

    return {
      systemProgram, // 1
      tokenProgram,
      assocatedTokenProgram,
      sysVarRent,
      sysVarRecentBlockhashes, // 5
      sysVarInstructions,
      sysVarSlotHashes,
      sysVarSlotHistory,
      switchboardProgram,
      attestationProgram, // 10
      attestationQueuePubkey,
      functionPubkey,
      functionAuthorityPubkey,
      mintPubkey,
      walletPubkey, // 15
      escrowPubkey, // 16
    };
  }

  public static getVerificationStatus(
    state: types.FunctionAccountData
  ): types.VerificationStatusKind {
    switch (state.enclave.verificationStatus) {
      case types.VerificationStatus.None.discriminator:
        return new types.VerificationStatus.None();
      case types.VerificationStatus.VerificationPending.discriminator:
        return new types.VerificationStatus.VerificationPending();
      case types.VerificationStatus.VerificationFailure.discriminator:
        return new types.VerificationStatus.VerificationFailure();
      case types.VerificationStatus.VerificationSuccess.discriminator:
        return new types.VerificationStatus.VerificationSuccess();
      case types.VerificationStatus.VerificationOverride.discriminator:
        return new types.VerificationStatus.VerificationOverride();
    }

    throw new Error(
      `Failed to get the verification status, expected [${types.VerificationStatus.None.discriminator}, ${types.VerificationStatus.VerificationPending.discriminator}, ${types.VerificationStatus.VerificationFailure.discriminator}, ${types.VerificationStatus.VerificationSuccess.discriminator}], or ${types.VerificationStatus.VerificationOverride.discriminator}], received ${state.enclave.verificationStatus}`
    );
  }
}
