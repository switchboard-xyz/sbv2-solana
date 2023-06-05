import { Account } from "../accounts/account.js";
import * as errors from "../errors.js";
import * as types from "../generated/attestation-program/index.js";
import { SwitchboardProgram } from "../SwitchboardProgram.js";
import {
  SendTransactionObjectOptions,
  TransactionObject,
  TransactionObjectOptions,
} from "../TransactionObject.js";
import { RawBuffer } from "../types.js";
import { parseMrEnclave, parseRawBuffer } from "../utils.js";

import {
  AttestationPermissionAccount,
  AttestationQueueAccount,
} from "./index.js";

import * as anchor from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  TransactionSignature,
} from "@solana/web3.js";

export const QUOTE_SEED: string = "QuoteAccountData";

/**
 *  Parameters for initializing an {@linkcode QuoteAccount}
 */
export interface QuoteAccountInitParams {
  /**
   * Key to lookup the buffer data on IPFS or an alternative decentralized storage solution.
   */
  registryKey: Uint8Array;
  /**
   *  The queue to which this function account will be linked
   */
  queueAccount: AttestationQueueAccount;
  /**
   *  A keypair to be used to address this account
   *
   *  @default Keypair.generate()
   */
  keypair?: Keypair;
  /**
   *  An authority to be used to control this account.
   *
   *  @default payer
   */
  authority?: PublicKey;
}

/**
 *  Parameters for an {@linkcode types.quoteHeartbeat} instruction.
 */
export interface QuoteHeartbeatSyncParams {
  gcOracle: PublicKey;
  attestationQueue: PublicKey;
  permission: [AttestationPermissionAccount, number];
  queueAuthority: PublicKey;
}

/**
 *  Parameters for an {@linkcode types.quoteHeartbeat} instruction.
 */
export type QuoteHeartbeatParams = Partial<QuoteHeartbeatSyncParams> & {
  securedSigner: Keypair;
} & Partial<{
    quote: types.QuoteAccountData;
    queue: types.AttestationQueueAccountData;
  }>;

/**
 *  Parameters for an {@linkcode types.quoteVerify} instruction.
 */
export interface QuoteVerifyParams {
  /**
   *  @TODO: Docs for timestamp
   */
  timestamp: anchor.BN;
  /**
   *  @TODO: Docs for mrEnclave
   */
  mrEnclave: RawBuffer;

  /**
   * Keypair of the secured signer generated in the verifiers secure enclave
   */
  verifierSecuredSigner: Keypair;
  verifier: PublicKey;
}

/**
 *  Parameters for an {@linkcode types.quoteRotate} instruction.
 */
export interface QuoteRotateParams {
  authority?: Keypair;
  securedSigner: Keypair;
  registryKey: string | Buffer | Uint8Array;
}

/**
 * Account type representing a Switchboard Attestation quote.
 *
 * Data: {@linkcode types.QuoteAccountData}
 */
export class QuoteAccount extends Account<types.QuoteAccountData> {
  static accountName = "QuoteAccountData";

  /**
   *  Load an existing {@linkcode QuoteAccount} with its current on-chain state
   */
  public static async load(
    program: SwitchboardProgram,
    address: PublicKey | string
  ): Promise<[QuoteAccount, types.QuoteAccountData]> {
    program.verifyAttestation();

    const quoteAccount = new QuoteAccount(program, address);
    const state = await quoteAccount.loadData();
    return [quoteAccount, state];
  }

  /**
   * Finds the {@linkcode QuoteAccount} from the seed from which it was generated.
   *
   * Only applicable for QuoteAccounts tied to a {@linkcode FunctionAccount}. Quotes can also be generated from a keypair.
   *
   * @return QuoteAccount and PDA bump tuple.
   */
  public static fromSeed(
    program: SwitchboardProgram,
    functionPubkey: PublicKey
  ): [QuoteAccount, number] {
    const [publicKey, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from(QUOTE_SEED), functionPubkey.toBytes()],
      program.attestationProgramId
    );
    return [new QuoteAccount(program, publicKey), bump];
  }

  /**
   * Create a transaction object to initialize a quote account.
   */
  public static async createInstruction(
    program: SwitchboardProgram,
    payer: PublicKey,
    params: QuoteAccountInitParams,
    options?: TransactionObjectOptions
  ): Promise<[QuoteAccount, TransactionObject]> {
    program.verifyAttestation();

    const quoteKeypair = params.keypair ?? Keypair.generate();
    program.verifyNewKeypair(quoteKeypair);

    const queueData = await params.queueAccount.loadData();

    const registryKey = Array.from(params.registryKey)
      .concat(Array(64).fill(0))
      .slice(0, 64);

    const instruction = types.quoteInit(
      program,
      { params: { registryKey } },
      {
        quote: quoteKeypair.publicKey,
        attestationQueue: params.queueAccount.publicKey,
        queueAuthority: queueData.authority,
        authority: params.authority ?? payer,
        payer,
        systemProgram: SystemProgram.programId,
      }
    );
    return [
      new QuoteAccount(program, quoteKeypair.publicKey),
      new TransactionObject(payer, [instruction], [quoteKeypair], options),
    ];
  }

  public static async create(
    program: SwitchboardProgram,
    params: QuoteAccountInitParams,
    options?: SendTransactionObjectOptions
  ): Promise<[QuoteAccount, TransactionSignature]> {
    const [account, txnObject] = await this.createInstruction(
      program,
      program.walletPubkey,
      params,
      options
    );
    const txSignature = await program.signAndSend(txnObject, options);
    return [account, txSignature];
  }

  public getPermissionAccount(
    queuePubkey: PublicKey,
    queueAuthority: PublicKey,
    owner: PublicKey
  ): [AttestationPermissionAccount, number] {
    return AttestationPermissionAccount.fromSeed(
      this.program,
      queueAuthority,
      queuePubkey,
      owner
    );
  }

  static getVerificationStatus(
    state: types.QuoteAccountData
  ): types.VerificationStatusKind {
    switch (state.verificationStatus) {
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
      `Failed to get the verification status, expected [${types.VerificationStatus.None.discriminator}, ${types.VerificationStatus.VerificationPending.discriminator}, ${types.VerificationStatus.VerificationFailure.discriminator}, ${types.VerificationStatus.VerificationSuccess.discriminator}], or ${types.VerificationStatus.VerificationOverride.discriminator}], received ${state.verificationStatus}`
    );
  }

  /**
   * Get the size of an {@linkcode QuoteAccount} on-chain.
   */
  public readonly size = this.program.attestationAccount.quoteAccountData.size;

  /**
   *  Retrieve and decode the {@linkcode types.QuoteAccountData} stored in this account.
   */
  public async loadData(): Promise<types.QuoteAccountData> {
    this.program.verifyAttestation();
    const data = await types.QuoteAccountData.fetch(
      this.program,
      this.publicKey
    );
    if (data) return data;
    throw new errors.AccountNotFoundError("Quote", this.publicKey);
  }

  public heartbeatInstruction(params: {
    gcOracle: PublicKey;
    attestationQueue: PublicKey;
    permission: [AttestationPermissionAccount, number];
    queueAuthority: PublicKey;
    securedSigner: PublicKey;
  }): TransactionInstruction {
    this.program.verifyAttestation();

    const [permissionAccount, permissionBump] = params.permission;
    const instruction = types.quoteHeartbeat(
      this.program,
      { params: {} },
      {
        quote: this.publicKey,
        securedSigner: params.securedSigner,
        attestationQueue: params.attestationQueue,
        queueAuthority: params.queueAuthority,
        gcNode: params.gcOracle,
        permission: permissionAccount.publicKey,
      }
    );
    return instruction;
  }

  public async heartbeat(
    params: QuoteHeartbeatParams,
    options?: SendTransactionObjectOptions
  ): Promise<TransactionSignature> {
    const quote = params.quote ?? (await this.loadData());
    const queue =
      params.queue ??
      (await new AttestationQueueAccount(
        this.program,
        quote.attestationQueue
      ).loadData());

    const quotes = queue.data.slice(0, queue.dataLen);

    let lastPubkey = this.publicKey;
    if (quotes.length !== 0 && quotes.length > queue.gcIdx) {
      lastPubkey = quotes[queue.gcIdx];
    }

    const heartbeatIxn = this.heartbeatInstruction({
      queueAuthority: queue.authority,
      permission:
        params.permission ??
        this.getPermissionAccount(
          quote.attestationQueue,
          queue.authority,
          this.publicKey
        ),
      gcOracle: lastPubkey,
      attestationQueue: quote.attestationQueue,
      securedSigner: params.securedSigner.publicKey,
    });

    const heartbeatTxn = new TransactionObject(
      this.program.walletPubkey,
      [heartbeatIxn],
      [params.securedSigner],
      options
    );

    const txnSignature = await this.program.signAndSend(heartbeatTxn, options);
    return txnSignature;
  }

  public async rotateInstruction(
    payer: PublicKey,
    params: QuoteRotateParams,
    options?: TransactionObjectOptions
  ): Promise<TransactionObject> {
    this.program.verifyAttestation();

    const registryKey = parseRawBuffer(params.registryKey, 64);

    const quoteData = await this.loadData();

    const authority = params.authority ? params.authority.publicKey : payer;
    if (!quoteData.authority.equals(authority)) {
      throw new errors.IncorrectAuthority(quoteData.authority, authority);
    }

    const rotateIxn = types.quoteRotate(
      this.program,
      {
        params: { registryKey: [...registryKey].slice(0, 64) },
      },
      {
        quote: this.publicKey,
        authority: authority,
        securedSigner: params.securedSigner.publicKey,
        attestationQueue: quoteData.attestationQueue,
      }
    );

    const rotateTxn: TransactionObject = new TransactionObject(
      payer,
      [rotateIxn],
      params.authority
        ? [params.authority, params.securedSigner]
        : [params.securedSigner],
      options
    );
    return rotateTxn;
  }

  public async rotate(
    params: QuoteRotateParams,
    options?: SendTransactionObjectOptions
  ): Promise<TransactionSignature> {
    return await this.rotateInstruction(
      this.program.walletPubkey,
      params,
      options
    ).then((txn) => this.program.signAndSend(txn, options));
  }

  public async verifyInstruction(
    payer: PublicKey,
    params: QuoteVerifyParams,
    options?: TransactionObjectOptions
  ): Promise<TransactionObject> {
    this.program.verifyAttestation();

    const quoteData = await this.loadData();

    const attestationQueueAccount = new AttestationQueueAccount(
      this.program,
      quoteData.attestationQueue
    );
    const attestationQueue = await attestationQueueAccount.loadData();
    const verifierIdx = attestationQueue.data
      .slice(0, attestationQueue.dataLen)
      .findIndex((pubkey) => pubkey.equals(params.verifier));
    if (verifierIdx === -1) {
      throw new Error(`Verifier not found on the attestation queue`);
    }

    const instruction = types.quoteVerify(
      this.program,
      {
        params: {
          timestamp: params.timestamp,
          mrEnclave: Array.from(parseMrEnclave(params.mrEnclave)),
          idx: verifierIdx,
        },
      },
      {
        quote: this.publicKey,
        quoteSigner: quoteData.securedSigner,
        securedSigner: params.verifierSecuredSigner.publicKey,
        verifier: params.verifier,
        attestationQueue: quoteData.attestationQueue,
      }
    );
    return new TransactionObject(
      payer,
      [instruction],
      [params.verifierSecuredSigner],
      options
    );
  }

  public async verify(
    params: QuoteVerifyParams,
    options?: SendTransactionObjectOptions
  ): Promise<TransactionSignature> {
    return await this.verifyInstruction(
      this.program.walletPubkey,
      params,
      options
    ).then((txn) => this.program.signAndSend(txn, options));
  }
}
