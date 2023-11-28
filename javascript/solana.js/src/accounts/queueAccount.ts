import * as errors from "../errors.js";
import * as types from "../generated/oracle-program/index.js";
import {
  PermitOracleHeartbeat,
  PermitOracleQueueUsage,
  PermitVrfRequests,
} from "../generated/oracle-program/types/SwitchboardPermission.js";
import { SolanaClock } from "../SolanaClock.js";
import type { SwitchboardProgram } from "../SwitchboardProgram.js";
import type {
  SendTransactionObjectOptions,
  TransactionObjectOptions,
} from "../TransactionObject.js";
import { TransactionObject } from "../TransactionObject.js";

import type { OnAccountChangeCallback } from "./account.js";
import { Account } from "./account.js";
import type { AggregatorInitParams } from "./aggregatorAccount.js";
import { AggregatorAccount } from "./aggregatorAccount.js";
import { AggregatorHistoryBuffer } from "./aggregatorHistoryBuffer.js";
import type { BufferRelayerInit } from "./bufferRelayAccount.js";
import { BufferRelayerAccount } from "./bufferRelayAccount.js";
import type { CrankInitParams } from "./crankAccount.js";
import { CrankAccount } from "./crankAccount.js";
import type { JobInitParams } from "./jobAccount.js";
import { JobAccount } from "./jobAccount.js";
import type { LeaseInitParams } from "./leaseAccount.js";
import { LeaseAccount } from "./leaseAccount.js";
import type { OracleInitParams, OracleStakeParams } from "./oracleAccount.js";
import { OracleAccount } from "./oracleAccount.js";
import type { PermissionSetParams } from "./permissionAccount.js";
import { PermissionAccount } from "./permissionAccount.js";
import { QueueDataBuffer } from "./queueDataBuffer.js";
import type { VrfInitParams } from "./vrfAccount.js";
import { VrfAccount } from "./vrfAccount.js";
import type { VrfLiteInitParams } from "./vrfLiteAccount.js";
import { VrfLiteAccount } from "./vrfLiteAccount.js";

import type * as anchor from "@coral-xyz/anchor";
import type * as spl from "@solana/spl-token";
import type { Commitment, TransactionSignature } from "@solana/web3.js";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { Big, BN, SwitchboardDecimal, toUtf8 } from "@switchboard-xyz/common";

/**
 * Account type representing an oracle queue's configuration along with a buffer account holding a list of oracles that are actively heartbeating.
 *
 * A QueueAccount is responsible for allocating update requests to it's round robin queue of {@linkcode OracleAccount}'s.
 *
 * Data: {@linkcode types.OracleQueueAccountData}
 *
 * Buffer: {@linkcode QueueDataBuffer}
 */
export class QueueAccount extends Account<types.OracleQueueAccountData> {
  static accountName = "OracleQueueAccountData";

  /** The {@linkcode QueueDataBuffer} storing a list of oracle's that are actively heartbeating */
  dataBuffer?: QueueDataBuffer;

  public static size = 1269;

  /**
   * Returns the queue's name buffer in a stringified format.
   */
  public static getName = (queue: types.OracleQueueAccountData) =>
    toUtf8(queue.name);

  /**
   * Returns the queue's metadata buffer in a stringified format.
   */
  public static getMetadata = (queue: types.OracleQueueAccountData) =>
    toUtf8(queue.metadata);

  /** Load an existing QueueAccount with its current on-chain state */
  public static async load(
    program: SwitchboardProgram,
    publicKey: PublicKey | string
  ): Promise<[QueueAccount, types.OracleQueueAccountData]> {
    const account = new QueueAccount(
      program,
      typeof publicKey === "string" ? new PublicKey(publicKey) : publicKey
    );
    const state = await account.loadData();
    return [account, state];
  }

  /**
   * Invoke a callback each time a QueueAccount's data has changed on-chain.
   * @param callback - the callback invoked when the queues state changes
   * @param commitment - optional, the desired transaction finality. defaults to 'confirmed'
   * @returns the websocket subscription id
   */
  onChange(
    callback: OnAccountChangeCallback<types.OracleQueueAccountData>,
    commitment: Commitment = "confirmed"
  ): number {
    return this.program.connection.onAccountChange(
      this.publicKey,
      (accountInfo) =>
        callback(types.OracleQueueAccountData.decode(accountInfo.data)),
      commitment
    );
  }

  /**
   * Retrieve and decode the {@linkcode types.OracleQueueAccountData} stored in this account.
   */
  public async loadData(): Promise<types.OracleQueueAccountData> {
    const data = await types.OracleQueueAccountData.fetch(
      this.program,
      this.publicKey
    );
    if (data === null)
      throw new errors.AccountNotFoundError("Queue", this.publicKey);
    this.dataBuffer = new QueueDataBuffer(this.program, data.dataBuffer);
    return data;
  }

  /**
   * Get the spl Mint associated with this {@linkcode QueueAccount}.
   */
  public get mint(): { address: PublicKey; decimals: number } {
    return this.program.mint.mint;
  }

  /**
   * Creates a transaction object with oracleQueueInit instructions.
   *
   * @param program The SwitchboardProgram.
   *
   * @param payer - the publicKey of the account that will pay for the new accounts. Will also be used as the account authority if no other authority is provided.
   *
   * @param params oracle queue configuration parameters.
   *
   * @return Transaction signature and the newly created QueueAccount.
   *
   * Basic usage example:
   *
   * ```ts
   * import { QueueAccount } from '@switchboard-xyz/solana.js';
   * const [queueAccount, queueInitTxn] = await QueueAccount.createInstructions(program, payer, {
        name: 'My Queue',
        metadata: 'Top Secret',
        queueSize: 100,
        reward: 0.00001337,
        minStake: 10,
        oracleTimeout: 60,
        slashingEnabled: false,
        unpermissionedFeeds: true,
        unpermissionedVrf: true,
        enableBufferRelayers: false,
   * });
   * const queueInitSignature = await program.signAndSend(queueInitTxn);
   * const queue = await queueAccount.loadData();
   * ```
   */
  public static async createInstructions(
    program: SwitchboardProgram,
    payer: PublicKey,
    params: QueueInitParams,
    options?: TransactionObjectOptions
  ): Promise<[QueueAccount, TransactionObject]> {
    const keypair = params.keypair ?? Keypair.generate();
    const dataBuffer = params.dataBufferKeypair ?? Keypair.generate();
    await program.verifyNewKeypairs(keypair, dataBuffer);

    const queueAccount = new QueueAccount(program, keypair.publicKey);
    queueAccount.dataBuffer = new QueueDataBuffer(
      program,
      dataBuffer.publicKey
    );

    const queueSize = params.queueSize ?? 500;
    const queueDataSize = QueueDataBuffer.getAccountSize(queueSize);

    const reward = program.mint.toTokenAmountBN(params.reward);
    const minStake = program.mint.toTokenAmountBN(params.minStake);

    const txn = new TransactionObject(
      payer,
      [
        SystemProgram.createAccount({
          fromPubkey: payer,
          newAccountPubkey: dataBuffer.publicKey,
          space: queueDataSize,
          lamports: await program.connection.getMinimumBalanceForRentExemption(
            queueDataSize
          ),
          programId: program.oracleProgramId,
        }),
        types.oracleQueueInit(
          program,
          {
            params: {
              name: Array.from(
                new Uint8Array(Buffer.from(params.name ?? "").slice(0, 32))
              ),
              metadata: [
                ...new Uint8Array(
                  Buffer.from(params.metadata ?? "").slice(0, 64)
                ),
              ],
              reward: reward,
              minStake: minStake,
              feedProbationPeriod: params.feedProbationPeriod ?? 0,
              oracleTimeout: params.oracleTimeout ?? 180,
              slashingEnabled: params.slashingEnabled ?? false,
              varianceToleranceMultiplier: SwitchboardDecimal.fromBig(
                new Big(params.varianceToleranceMultiplier ?? 2)
              ),
              consecutiveFeedFailureLimit: new BN(
                params.consecutiveFeedFailureLimit ?? 1000
              ),
              consecutiveOracleFailureLimit: new BN(
                params.consecutiveOracleFailureLimit ?? 1000
              ),
              queueSize: queueSize,
              unpermissionedFeeds: params.unpermissionedFeeds ?? false,
              unpermissionedVrf: params.unpermissionedVrf ?? false,
              enableBufferRelayers: params.enableBufferRelayers ?? false,
              enableTeeOnly: params.enableTeeOnly ?? false,
            },
          },
          {
            oracleQueue: queueAccount.publicKey,
            authority: params.authority ?? payer,
            buffer: dataBuffer.publicKey,
            systemProgram: SystemProgram.programId,
            payer,
            mint: program.mint.address,
          }
        ),
      ],
      [dataBuffer, keypair],
      options
    );

    return [queueAccount, txn];
  }

  /**
   * Creates an oracle queue on-chain and return the transaction signature and created account resource.
   *
   * @param program The SwitchboardProgram.
   *
   * @param params oracle queue configuration parameters.
   *
   * @return Transaction signature and the newly created QueueAccount.
   *
   * Basic usage example:
   *
   * ```ts
   * import { QueueAccount } from '@switchboard-xyz/solana.js';
   * const [queueAccount, txnSignature] = await QueueAccount.create(program, {
        name: 'My Queue',
        metadata: 'Top Secret',
        queueSize: 100,
        reward: 0.00001337,
        minStake: 10,
        oracleTimeout: 60,
        slashingEnabled: false,
        unpermissionedFeeds: true,
        unpermissionedVrf: true,
        enableBufferRelayers: false,
   * });
   * const queue = await queueAccount.loadData();
   * ```
   */
  public static async create(
    program: SwitchboardProgram,
    params: QueueInitParams,
    options?: SendTransactionObjectOptions
  ): Promise<[QueueAccount, string]> {
    const [account, txnObject] = await this.createInstructions(
      program,
      program.walletPubkey,
      params,
      options
    );
    const txnSignature = await program.signAndSend(txnObject, options);
    return [account, txnSignature];
  }

  /**
   * Creates a transaction object with oracleInit instructions for the given QueueAccount.
   *
   * @param payer - the publicKey of the account that will pay for the new accounts. Will also be used as the account authority if no other authority is provided.
   *
   * @param params - the oracle configuration parameters.
   *
   * @return Transaction signature and the newly created OracleAccount.
   *
   * Basic usage example:
   *
   * ```ts
   * import { QueueAccount } from '@switchboard-xyz/solana.js';
   * const queueAccount = new QueueAccount(program, queuePubkey);
   * const [oracleAccount, oracleInitTxn] = await queueAccount.createOracleInstructions(payer, {
   *  name: "My Oracle",
   *  metadata: "Oracle #1"
   * });
   * const oracleInitSignature = await program.signAndSend(oracleInitTxn);
   * const oracle = await oracleAccount.loadData();
   * ```
   */
  public async createOracleInstructions(
    /** The publicKey of the account that will pay for the new accounts. Will also be used as the account authority if no other authority is provided. */
    payer: PublicKey,
    params: CreateQueueOracleParams & { teeOracle?: boolean },
    options?: TransactionObjectOptions
  ): Promise<[OracleAccount, Array<TransactionObject>]> {
    const queueAuthorityPubkey = params.queueAuthority
      ? params.queueAuthority.publicKey
      : params.queueAuthorityPubkey ?? (await this.loadData()).authority;

    if (
      params.teeOracle &&
      (!params.authority || !(params.authority instanceof Keypair))
    ) {
      throw new Error(
        `Need to provide authority keypair when creating a teeOracle`
      );
    }

    const [oracleAccount, createOracleTxnObject] =
      await OracleAccount.createInstructions(
        this.program,
        payer,
        {
          ...params,
          queueAccount: this,
        },
        options
      );

    const permissionGrantee = params.teeOracle
      ? params.authority?.publicKey ?? payer
      : oracleAccount.publicKey;

    const [permissionAccount, createPermissionTxnObject] =
      PermissionAccount.createInstruction(
        this.program,
        payer,
        {
          granter: this.publicKey,
          grantee: permissionGrantee,
          authority: queueAuthorityPubkey,
        },
        options
      );

    if (
      params.enable &&
      (params.queueAuthority || queueAuthorityPubkey.equals(payer))
    ) {
      const permissionSetTxn = permissionAccount.setInstruction(
        payer,
        {
          permission: new PermitOracleHeartbeat(),
          enable: true,
          queueAuthority: params.queueAuthority,
        },
        options
      );
      createPermissionTxnObject.combine(permissionSetTxn);
    }

    return [
      oracleAccount,
      TransactionObject.pack(
        [...createOracleTxnObject, createPermissionTxnObject],
        options
      ),
    ];
  }

  /**
   * Creates a new {@linkcode OracleAccount}.
   *
   * @param params - the oracle configuration parameters.
   *
   * @return Transaction signature and the newly created OracleAccount.
   *
   * Basic usage example:
   *
   * ```ts
   * import { QueueAccount } from '@switchboard-xyz/solana.js';
   * const queueAccount = new QueueAccount(program, queuePubkey);
   * const [oracleAccount, oracleInitSignature] = await queueAccount.createOracle({
   *  name: "My Oracle",
   *  metadata: "Oracle #1"
   * });
   * const oracle = await oracleAccount.loadData();
   * ```
   */
  public async createOracle(
    params: CreateQueueOracleParams & { teeOracle?: boolean },
    options?: SendTransactionObjectOptions
  ): Promise<[OracleAccount, Array<TransactionSignature>]> {
    const signers: Keypair[] = [];

    const queue = await this.loadData();

    if (
      params.queueAuthority &&
      params.queueAuthority.publicKey.equals(queue.authority)
    ) {
      signers.push(params.queueAuthority);
    }

    const [oracleAccount, txn] = await this.createOracleInstructions(
      this.program.walletPubkey,
      params,
      options
    );

    const signatures = await this.program.signAndSendAll(txn);

    return [oracleAccount, signatures];
  }

  /**
   * Create a new {@linkcode TransactionObject} constaining the instructions and signers needed to create a new {@linkcode AggregatorAccount} for the queue along with its {@linkcode PermissionAccount} and {@linkcode LeaseAccount}.
   *
   * @param payer - the publicKey of the account that will pay for the new accounts. Will also be used as the account authority if no other authority is provided.
   *
   * @param params - the aggregatorInit, jobInit, permissionInit, permissionSet, leaseInit, and crankPush configuration parameters.
   *
   * Optionally, specify a crankPubkey in order to push it onto an existing {@linkcode CrankAccount}.
   *
   * Optionally, enable the permissions by setting a queueAuthority keypair along with the enable boolean set to true.
   *
   * ```ts
   * import { QueueAccount } from '@switchboard-xyz/solana.js';
   * const queueAccount = new QueueAccount(program, queuePubkey);
   * const [aggregatorAccount, aggregatorInitTxnObject] =
      await queueAccount.createFeedInstructions({
        enable: true, // not needed if queue has unpermissionedFeedsEnabled
        queueAuthority: queueAuthority, // not needed if queue has unpermissionedFeedsEnabled
        batchSize: 1,
        minRequiredOracleResults: 1,
        minRequiredJobResults: 1,
        minUpdateDelaySeconds: 60,
        fundAmount: 2.5, // deposit 2.5 wSOL into the leaseAccount escrow
        jobs: [
          { pubkey: jobAccount.publicKey },
          {
            weight: 2,
            data: OracleJob.encodeDelimited(
              OracleJob.fromObject({
                tasks: [
                  {
                    valueTask: {
                      value: 1,
                    },
                  },
                ],
              })
            ).finish(),
          },
        ],
      });
      const aggregatorInitSignatures = await this.program.signAndSendAll(txns);
   * ```
   */
  public async createFeedInstructions(
    payer: PublicKey,
    params: CreateQueueFeedParams,
    options?: TransactionObjectOptions
  ): Promise<[AggregatorAccount, Array<TransactionObject>]> {
    const queueAuthorityPubkey = params.queueAuthority
      ? params.queueAuthority.publicKey
      : params.queueAuthorityPubkey ?? (await this.loadData()).authority;

    const pre: Array<TransactionObject> = [];
    const txns: Array<TransactionObject> = [];
    const post: Array<TransactionObject> = [];

    // getOrCreate token account for
    const userTokenAddress = this.program.mint.getAssociatedAddress(payer);
    const userTokenAccountInfo = await this.program.connection.getAccountInfo(
      userTokenAddress
    );

    if (userTokenAccountInfo === null && params.disableWrap !== true) {
      const [createTokenAccount] =
        this.program.mint.createAssocatedUserInstruction(payer);
      pre.push(createTokenAccount);
    }

    // create / load jobs
    const jobs: { job: JobAccount; weight: number }[] = [];
    if (params.jobs && Array.isArray(params.jobs)) {
      for await (const job of params.jobs) {
        if ("data" in job) {
          const [jobAccount, jobInit] = JobAccount.createInstructions(
            this.program,
            payer,
            {
              data: job.data,
              name: job.name ?? "",
              authority: job.authority,
              expiration: job.expiration,
              variables: job.variables,
              keypair: job.keypair ?? Keypair.generate(),
            },
            options
          );
          pre.push(...jobInit);
          jobs.push({ job: jobAccount, weight: job.weight ?? 1 });
        } else if ("pubkey" in job) {
          const jobAccount = new JobAccount(this.program, job.pubkey);
          // should we verify its a valid job account?
          jobs.push({ job: jobAccount, weight: job.weight ?? 1 });
        } else {
          throw new Error(`Failed to create job account ${job}`);
        }
      }
    }

    const [aggregatorAccount, aggregatorInit] =
      await AggregatorAccount.createInstruction(
        this.program,
        payer,
        {
          ...params,
          queueAccount: this,
          queueAuthority: queueAuthorityPubkey,
          keypair: params.keypair,
          authority: payer, // payer is authority until end of the instruction
        },
        options
      );

    txns.push(aggregatorInit);

    const [leaseAccount, leaseInit] = await LeaseAccount.createInstructions(
      this.program,
      payer,
      {
        fundAmount: params.fundAmount,
        funderTokenWallet: params.funderTokenWallet ?? userTokenAddress,
        funderAuthority: params.funderAuthority,
        withdrawAuthority: params.withdrawAuthority ?? params.authority, // make sure we set this correctly
        aggregatorAccount: aggregatorAccount,
        queueAccount: this,
        jobAuthorities: [], // create lease before adding jobs to skip this step
        jobPubkeys: [],
        disableWrap: params.disableWrap,
      },
      options
    );
    txns.push(leaseInit);

    // create permission account
    const [permissionAccount, permissionInit] =
      PermissionAccount.createInstruction(
        this.program,
        payer,
        {
          granter: this.publicKey,
          authority: queueAuthorityPubkey,
          grantee: aggregatorAccount.publicKey,
        },
        options
      );

    // set permissions
    if (
      params.enable &&
      (params.queueAuthority || queueAuthorityPubkey.equals(payer))
    ) {
      const permissionSetTxn = permissionAccount.setInstruction(
        payer,
        {
          permission: new PermitOracleQueueUsage(),
          enable: true,
          queueAuthority: params.queueAuthority,
        },
        options
      );
      permissionInit.combine(permissionSetTxn);
    }

    txns.push(permissionInit);

    // set resolution mode
    if (params.slidingWindow !== undefined && params.slidingWindow === true) {
      const setResolutionMode = aggregatorAccount.setResolutionModeInstruction(
        payer,
        {
          authority: undefined,
          mode: new types.AggregatorResolutionMode.ModeSlidingResolution(),
        },
        options
      );
      post.push(setResolutionMode);
    }

    // set priority fees
    if (
      (params.basePriorityFee !== undefined && params.basePriorityFee > 0) ||
      (params.priorityFeeBump !== undefined && params.priorityFeeBump > 0) ||
      (params.priorityFeeBumpPeriod !== undefined &&
        params.priorityFeeBumpPeriod > 0) ||
      (params.maxPriorityFeeMultiplier !== undefined &&
        params.maxPriorityFeeMultiplier > 0)
    ) {
      const setAggregatorConfig = await aggregatorAccount.setConfigInstruction(
        payer,
        {
          force: true,
          authority: undefined,
          basePriorityFee: params.basePriorityFee,
          priorityFeeBump: params.priorityFeeBump,
          priorityFeeBumpPeriod: params.priorityFeeBumpPeriod,
          maxPriorityFeeMultiplier: params.maxPriorityFeeMultiplier,
        },
        options
      );

      post.push(setAggregatorConfig);
    }

    for await (const { job, weight } of jobs) {
      const addJobTxn = aggregatorAccount.addJobInstruction(
        payer,
        {
          job: job,
          weight: weight,
          authority: undefined,
        },
        options
      );
      post.push(addJobTxn);
    }

    if (params.crankPubkey) {
      const [permissionAccount, permissionBump] = PermissionAccount.fromSeed(
        this.program,
        queueAuthorityPubkey,
        this.publicKey,
        aggregatorAccount.publicKey
      );

      const leaseEscrow = this.program.mint.getAssociatedAddress(
        leaseAccount.publicKey
      );

      post.push(
        new TransactionObject(
          payer,
          [
            types.crankPush(
              this.program,
              {
                params: {
                  stateBump: this.program.programState.bump,
                  permissionBump: permissionBump,
                  notifiRef: null,
                },
              },
              {
                crank: params.crankPubkey,
                aggregator: aggregatorAccount.publicKey,
                oracleQueue: this.publicKey,
                queueAuthority: queueAuthorityPubkey,
                permission: permissionAccount.publicKey,
                lease: leaseAccount.publicKey,
                escrow: leaseEscrow,
                programState: this.program.programState.publicKey,
                dataBuffer:
                  params.crankDataBuffer ??
                  (
                    await new CrankAccount(
                      this.program,
                      params.crankPubkey
                    ).loadData()
                  ).dataBuffer,
              }
            ),
          ],
          [],
          options
        )
      );
    }

    if (params.historyLimit && params.historyLimit > 0) {
      const historyBufferInit = (
        await AggregatorHistoryBuffer.createInstructions(this.program, payer, {
          aggregatorAccount,
          maxSamples: params.historyLimit,
        })
      )[1];
      post.push(historyBufferInit);
    }

    if (params.authority && !params.authority.equals(payer)) {
      post.push(
        aggregatorAccount.setAuthorityInstruction(
          payer,
          {
            newAuthority: params.authority,
          },
          options
        )
      );
    }

    const packed = TransactionObject.pack(
      [
        ...(pre.length ? TransactionObject.pack(pre) : []),
        ...(txns.length ? TransactionObject.pack(txns) : []),
        ...(post.length ? TransactionObject.pack(post) : []),
      ],
      options
    );

    return [aggregatorAccount, packed];
  }

  /**
   * Create a new {@linkcode AggregatorAccount} for the queue, along with its {@linkcode PermissionAccount} and {@linkcode LeaseAccount}.
   *
   * Optionally, specify a crankPubkey in order to push it onto an existing {@linkcode CrankAccount}.
   *
   * Optionally, enable the permissions by setting a queueAuthority keypair along with the enable boolean set to true.
   *
   * ```ts
   * import { QueueAccount } from '@switchboard-xyz/solana.js';
   * const queueAccount = new QueueAccount(program, queuePubkey);
   * const [aggregatorAccount, aggregatorInitSignatures] =
      await queueAccount.createFeed({
        enable: true, // not needed if queue has unpermissionedFeedsEnabled
        queueAuthority: queueAuthority, // not needed if queue has unpermissionedFeedsEnabled
        batchSize: 1,
        minRequiredOracleResults: 1,
        minRequiredJobResults: 1,
        minUpdateDelaySeconds: 60,
        fundAmount: 2.5, // deposit 2.5 wSOL into the leaseAccount escrow
        jobs: [
          { pubkey: jobAccount.publicKey },
          {
            weight: 2,
            data: OracleJob.encodeDelimited(
              OracleJob.fromObject({
                tasks: [
                  {
                    valueTask: {
                      value: 1,
                    },
                  },
                ],
              })
            ).finish(),
          },
        ],
      });
   * ```
   */
  public async createFeed(
    params: CreateQueueFeedParams,
    options?: SendTransactionObjectOptions
  ): Promise<[AggregatorAccount, Array<TransactionSignature>]> {
    const signers: Keypair[] = [];

    const queue = await this.loadData();

    if (
      params.queueAuthority &&
      params.queueAuthority.publicKey.equals(queue.authority)
    ) {
      signers.push(params.queueAuthority);
    }

    const [aggregatorAccount, txns] = await this.createFeedInstructions(
      this.program.walletPubkey,
      params,
      options
    );

    const signatures = await this.program.signAndSendAll(txns, {
      ...options,
      skipPreflight: true,
    });

    return [aggregatorAccount, signatures];
  }

  /**
   * Creates a transaction object with crankInit instructions for the given QueueAccount.
   *
   * @param payer - the publicKey of the account that will pay for the new accounts. Will also be used as the account authority if no other authority is provided.
   *
   * @param params - the crank configuration parameters.
   *
   * @return Transaction signature and the newly created CrankAccount.
   *
   * Basic usage example:
   *
   * ```ts
   * import { QueueAccount } from '@switchboard-xyz/solana.js';
   * const queueAccount = new QueueAccount(program, queuePubkey);
   * const [crankAccount, crankInitTxn] = await queueAccount.createCrankInstructions(payer, {
   *  name: "My Crank",
   *  metadata: "Crank #1",
   *  maxRows: 1000,
   * });
   * const crankInitSignature = await program.signAndSend(crankInitTxn);
   * const crank = await crankAccount.loadData();
   * ```
   */
  public async createCrankInstructions(
    payer: PublicKey,
    params: CreateQueueCrankParams,
    options?: TransactionObjectOptions
  ): Promise<[CrankAccount, TransactionObject]> {
    return await CrankAccount.createInstructions(
      this.program,
      payer,
      {
        ...params,
        queueAccount: this,
      },
      options
    );
  }

  /**
   * Creates a new {@linkcode CrankAccount}.
   *
   * @param params - the crank configuration parameters.
   *
   * @return Transaction signature and the newly created CrankAccount.
   *
   * Basic usage example:
   *
   * ```ts
   * import { QueueAccount } from '@switchboard-xyz/solana.js';
   * const queueAccount = new QueueAccount(program, queuePubkey);
   * const [crankAccount, crankInitSignature] = await queueAccount.createCrank({
   *  name: "My Crank",
   *  metadata: "Crank #1",
   *  maxRows: 1000,
   * });
   * const crank = await crankAccount.loadData();
   * ```
   */
  public async createCrank(
    params: CreateQueueCrankParams,
    options?: SendTransactionObjectOptions
  ): Promise<[CrankAccount, TransactionSignature]> {
    const [crankAccount, txn] = await this.createCrankInstructions(
      this.program.walletPubkey,
      params,
      options
    );
    const txnSignature = await this.program.signAndSend(txn, options);
    return [crankAccount, txnSignature];
  }

  /**
   * Creates a transaction object with vrfInit instructions for the given QueueAccount.
   *
   * @param payer - the publicKey of the account that will pay for the new accounts. Will also be used as the account authority if no other authority is provided.
   *
   * @param params - the vrf configuration parameters.
   *
   * @return Transaction signature and the newly created VrfAccount.
   *
   * Basic usage example:
   *
   * ```ts
   * import { QueueAccount } from '@switchboard-xyz/solana.js';
   * const queueAccount = new QueueAccount(program, queuePubkey);
   * const vrfKeypair = Keypair.generate();
   * const [vrfAccount, vrfInitTxn] = await queueAccount.createVrfInstructions(payer, {
   *  vrfKeypair: vrfKeypair,
   *  callback: {
   *    programId: "",
   *    accounts: [],
   *    ixData: Buffer.from("")
   *  },
   * });
   * const vrfInitSignature = await program.signAndSend(vrfInitTxn);
   * const vrf = await vrfAccount.loadData();
   * ```
   */
  public async createVrfInstructions(
    payer: PublicKey,
    params: CreateQueueVrfParams,
    options?: TransactionObjectOptions
  ): Promise<[VrfAccount, TransactionObject]> {
    const queueAuthorityPubkey = params.queueAuthority
      ? params.queueAuthority.publicKey
      : params.queueAuthorityPubkey ?? (await this.loadData()).authority;

    const [vrfAccount, vrfInit] = await VrfAccount.createInstructions(
      this.program,
      payer,
      {
        vrfKeypair: params.vrfKeypair,
        queueAccount: this,
        callback: params.callback,
        authority: params.authority,
      },
      options
    );

    let [
      // eslint-disable-next-line prefer-const
      permissionAccount,
      permissionInit,
    ] = PermissionAccount.createInstruction(
      this.program,
      payer,
      {
        granter: this.publicKey,
        grantee: vrfAccount.publicKey,
        authority: queueAuthorityPubkey,
      },
      options
    );

    if (
      params.enable &&
      (params.queueAuthority || queueAuthorityPubkey.equals(payer))
    ) {
      const permissionSet = permissionAccount.setInstruction(
        payer,
        {
          permission: new PermitVrfRequests(),
          enable: true,
          queueAuthority: params.queueAuthority,
        },
        options
      );
      permissionInit = permissionInit.combine(permissionSet);
    }

    return [vrfAccount, vrfInit.combine(permissionInit)];
  }

  /**
   * Creates a new {@linkcode VrfAccount} for a given QueueAccount.
   *
   * @param params - the vrf configuration parameters.
   *
   * @return Transaction signature and the newly created VrfAccount.
   *
   * Basic usage example:
   *
   * ```ts
   * import { QueueAccount } from '@switchboard-xyz/solana.js';
   * const queueAccount = new QueueAccount(program, queuePubkey);
   * const vrfKeypair = Keypair.generate();
   * const [vrfAccount, vrfInitSignature] = await queueAccount.createVrf({
   *  vrfKeypair: vrfKeypair,
   *  callback: {
   *    programId: "",
   *    accounts: [],
   *    ixData: Buffer.from("")
   *  },
   * });
   * const vrf = await vrfAccount.loadData();
   * ```
   */
  public async createVrf(
    params: CreateQueueVrfParams,
    options?: SendTransactionObjectOptions
  ): Promise<[VrfAccount, TransactionSignature]> {
    const [vrfAccount, txn] = await this.createVrfInstructions(
      this.program.walletPubkey,
      params,
      options
    );
    const txnSignature = await this.program.signAndSend(txn, options);
    return [vrfAccount, txnSignature];
  }

  /**
   * Creates a transaction object with bufferRelayerInit instructions for the given QueueAccount.
   *
   * @param payer - the publicKey of the account that will pay for the new accounts. Will also be used as the account authority if no other authority is provided.
   *
   * @param params - the buffer relayer configuration parameters.
   *
   * @return Transaction signature and the newly created BufferRelayerAccount.
   *
   * Basic usage example:
   *
   * ```ts
   * import { QueueAccount } from '@switchboard-xyz/solana.js';
   * const queueAccount = new QueueAccount(program, queuePubkey);
   * const [bufferRelayerAccount, bufferRelayerInitTxn] = await queueAccount.createBufferRelayerInstructions(payer, {
   *  name: "My Buffer",
   *  minUpdateDelaySeconds: 30,
   *  job: existingJobPubkey,
   * });
   * const bufferRelayerInitSignature = await program.signAndSend(bufferRelayerInitTxn);
   * const bufferRelayer = await bufferRelayerAccount.loadData();
   * ```
   */
  public async createBufferRelayerInstructions(
    payer: PublicKey,
    params: CreateQueueBufferRelayerParams
  ): Promise<[BufferRelayerAccount, TransactionObject]> {
    const queueAuthorityPubkey = params.queueAuthority
      ? params.queueAuthority.publicKey
      : params.queueAuthorityPubkey ?? (await this.loadData()).authority;

    const txns: Array<TransactionObject> = [];

    let job: JobAccount;
    if ("data" in params.job) {
      const [jobAccount, jobInit] = JobAccount.createInstructions(
        this.program,
        payer,
        {
          data: params.job.data,
          name: params.job.name ?? "",
          authority: params.job.authority,
          expiration: params.job.expiration,
          variables: params.job.variables,
          keypair: params.job.keypair ?? Keypair.generate(),
        }
      );
      txns.push(...jobInit);
      job = jobAccount;
    } else if (params.job instanceof PublicKey) {
      const jobAccount = new JobAccount(this.program, params.job);
      // should we verify its a valid job account?
      job = jobAccount;
    } else if (params.job instanceof JobAccount) {
      job = params.job;
    } else {
      throw new Error(
        `Failed to create BufferRelayer job account. 'data' or 'pubkey' was not defined in jobDefinition`
      );
    }

    const [bufferAccount, bufferInit] =
      await BufferRelayerAccount.createInstructions(this.program, payer, {
        name: params.name,
        minUpdateDelaySeconds: params.minUpdateDelaySeconds,
        queueAccount: this,
        authority: params.authority,
        jobAccount: job,
        keypair: params.keypair,
      });

    txns.push(bufferInit);

    let [
      // eslint-disable-next-line prefer-const
      permissionAccount,
      permissionInit,
    ] = PermissionAccount.createInstruction(this.program, payer, {
      granter: this.publicKey,
      grantee: bufferAccount.publicKey,
      authority: queueAuthorityPubkey,
    });

    if (
      params.enable &&
      (params.queueAuthority || queueAuthorityPubkey.equals(payer))
    ) {
      const permissionSet = permissionAccount.setInstruction(payer, {
        permission: new PermitOracleQueueUsage(),
        enable: true,
        queueAuthority: params.queueAuthority,
      });
      permissionInit = permissionInit.combine(permissionSet);
    }

    txns.push(permissionInit);

    const packed = TransactionObject.pack(txns);
    if (packed.length > 1) {
      throw new Error(
        `Failed to pack buffer relayer instructions into a single transaction`
      );
    }

    return [bufferAccount, packed[0]];
  }

  /**
   * Creates a new {@linkcode BufferRelayerAccount} for a given QueueAccount.
   *
   * @param params - the buffer relayer configuration parameters.
   *
   * @return Transaction signature and the newly created BufferRelayerAccount.
   *
   * Basic usage example:
   *
   * ```ts
   * import { QueueAccount } from '@switchboard-xyz/solana.js';
   * const queueAccount = new QueueAccount(program, queuePubkey);
   * const [bufferRelayerAccount, bufferRelayerInitSignature] = await queueAccount.createBufferRelayer({
   *  name: "My Buffer",
   *  minUpdateDelaySeconds: 30,
   *  job: existingJobPubkey,
   * });
   * const bufferRelayer = await bufferRelayerAccount.loadData();
   * ```
   */
  public async createBufferRelayer(
    params: CreateQueueBufferRelayerParams
  ): Promise<[BufferRelayerAccount, TransactionSignature]> {
    const [bufferRelayerAccount, txn] =
      await this.createBufferRelayerInstructions(
        this.program.walletPubkey,
        params
      );
    const txnSignature = await this.program.signAndSend(txn);
    return [bufferRelayerAccount, txnSignature];
  }

  public async createVrfLiteInstructions(
    payer: PublicKey,
    params: CreateVrfLiteParams
  ): Promise<[VrfLiteAccount, TransactionObject]> {
    const queueAuthorityPubkey = params.queueAuthority
      ? params.queueAuthority.publicKey
      : params.queueAuthorityPubkey ?? (await this.loadData()).authority;

    const txns: Array<TransactionObject> = [];

    const [vrfLite, vrfLiteInit] = await VrfLiteAccount.createInstruction(
      this.program,
      payer,
      {
        ...params,
        queueAccount: this,
      }
    );
    txns.push(vrfLiteInit);

    const [permissionAccount] = PermissionAccount.fromSeed(
      this.program,
      queueAuthorityPubkey,
      this.publicKey,
      vrfLite.publicKey
    );

    if (
      params.enable &&
      (params.queueAuthority || queueAuthorityPubkey.equals(payer))
    ) {
      const permissionSet = permissionAccount.setInstruction(payer, {
        permission: new PermitVrfRequests(),
        enable: true,
        queueAuthority: params.queueAuthority,
      });
      vrfLiteInit.combine(permissionSet);
    }

    return [vrfLite, vrfLiteInit];
  }

  public async createVrfLite(
    params: CreateVrfLiteParams
  ): Promise<[VrfLiteAccount, TransactionSignature]> {
    const [vrfLiteAccount, txn] = await this.createVrfLiteInstructions(
      this.program.walletPubkey,
      params
    );
    const txnSignature = await this.program.signAndSend(txn, {
      skipPreflight: true,
    });
    return [vrfLiteAccount, txnSignature];
  }

  /** Load the list of oracles that are currently stored in the buffer */
  public async loadOracles(): Promise<Array<PublicKey>> {
    let queue: QueueDataBuffer;
    if (this.dataBuffer) {
      queue = this.dataBuffer;
    } else {
      const queueData = await this.loadData();
      queue = new QueueDataBuffer(this.program, queueData.dataBuffer);
    }

    return queue.loadData();
  }

  /** Loads the oracle states for the oracles currently on the queue's dataBuffer */
  public async loadOracleAccounts(_oracles?: Array<PublicKey>): Promise<
    Array<{
      account: OracleAccount;
      data: types.OracleAccountData;
    }>
  > {
    const oraclePubkeys = _oracles ?? (await this.loadOracles());

    return await OracleAccount.fetchMultiple(this.program, oraclePubkeys);
  }

  public async loadActiveOracleAccounts(
    _queue?: types.OracleQueueAccountData
  ): Promise<
    Array<{
      account: OracleAccount;
      data: types.OracleAccountData;
    }>
  > {
    const queue = _queue ?? (await this.loadData());

    const oracles = await this.loadOracleAccounts();

    const unixTimestamp = (await SolanaClock.fetch(this.program.connection))
      .unixTimestamp;
    const timeout = unixTimestamp.sub(new BN(queue.oracleTimeout));
    const activeOracles = oracles.filter(
      (o) => o.data && o.data.lastHeartbeat.gte(timeout)
    );
    return activeOracles;
  }

  /** Returns a flag dictating whether enough oracles are actively heartbeating on an oracle queue and ready for on-chain update requests */
  public async isReady(
    _queue?: types.OracleQueueAccountData,
    oraclesNeeded = 1
  ): Promise<boolean> {
    const activeOracles = await this.loadActiveOracleAccounts(_queue);
    return activeOracles.length >= oraclesNeeded;
  }

  public async setConfig(
    params: QueueSetConfigParams & { authority?: Keypair }
  ): Promise<TransactionSignature> {
    const setConfigTxn = this.setConfigInstruction(
      this.program.walletPubkey,
      params
    );
    const txnSignature = await this.program.signAndSend(setConfigTxn);
    return txnSignature;
  }

  public setConfigInstruction(
    payer: PublicKey,
    params: QueueSetConfigParams & { authority?: Keypair }
  ): TransactionObject {
    const multiplier =
      params.varianceToleranceMultiplier &&
      Number.isFinite(params.varianceToleranceMultiplier)
        ? SwitchboardDecimal.fromBig(
            new Big(params.varianceToleranceMultiplier)
          )
        : null;

    const reward = params.reward
      ? this.program.mint.toTokenAmountBN(params.reward)
      : null;
    const minStake = params.minStake
      ? this.program.mint.toTokenAmountBN(params.minStake)
      : null;

    return new TransactionObject(
      payer,
      [
        types.oracleQueueSetConfig(
          this.program,
          {
            params: {
              name: params.name
                ? [
                    ...new Uint8Array(
                      Buffer.from(params.name ?? "").slice(0, 32)
                    ),
                  ]
                : null,
              metadata: params.metadata
                ? [
                    ...new Uint8Array(
                      Buffer.from(params.metadata ?? "").slice(0, 64)
                    ),
                  ]
                : null,
              unpermissionedFeedsEnabled:
                params.unpermissionedFeedsEnabled ?? null,
              unpermissionedVrfEnabled: params.unpermissionedVrfEnabled ?? null,
              enableBufferRelayers: params.enableBufferRelayers ?? null,
              enableTeeOnly: params.enableTeeOnly ?? null,
              slashingEnabled: params.slashingEnabled ?? null,
              reward: reward,
              minStake: minStake,
              oracleTimeout: params.oracleTimeout ?? null,
              consecutiveFeedFailureLimit: params.consecutiveFeedFailureLimit
                ? new BN(params.consecutiveFeedFailureLimit)
                : null,
              consecutiveOracleFailureLimit:
                params.consecutiveOracleFailureLimit
                  ? new BN(params.consecutiveOracleFailureLimit)
                  : null,
              varianceToleranceMultiplier: multiplier,
            },
          },
          {
            authority: params.authority ? params.authority.publicKey : payer,
            queue: this.publicKey,
          }
        ),
      ],
      params.authority ? [params.authority] : []
    );
  }

  public async toAccountsJSON(
    _queue?: types.OracleQueueAccountData,
    _oracles?: Array<PublicKey>
  ): Promise<QueueAccountsJSON> {
    const queue = _queue ?? (await this.loadData());
    const oracles = _oracles ?? (await this.loadOracles());
    const oracleAccounts = await this.loadOracleAccounts(oracles);

    return {
      publicKey: this.publicKey,
      ...queue.toJSON(),
      dataBuffer: {
        publicKey: queue.dataBuffer,
        data: oracles,
      },
      oracles: oracleAccounts.map((o) => {
        return {
          publicKey: o.account.publicKey,
          data: o.data.toJSON(),
        };
      }),
    };
  }

  public async fetchAccounts(
    _queue?: types.OracleQueueAccountData,
    _oracles?: Array<PublicKey>
  ): Promise<QueueAccounts> {
    const queue = _queue ?? (await this.loadData());
    const oracles = _oracles ?? (await this.loadOracles());

    const oracleAccounts = await this.loadOracleAccounts(oracles);

    return {
      queue: {
        publicKey: this.publicKey,
        data: queue,
      },
      dataBuffer: {
        publicKey: queue.dataBuffer,
        data: oracles,
      },
      oracles: oracleAccounts.map((o) => {
        return {
          publicKey: o.account.publicKey,
          data: o.data,
        };
      }),
    };
  }
}

/**
 *  Parameters for initializing an {@linkcode QueueAccount}
 */
export interface QueueInitParams {
  /**
   *  A name to assign to this {@linkcode QueueAccount}
   */
  name?: string;
  /**
   *  Metadata for the queue for easier identification.
   */
  metadata?: string;
  /**
   *  Rewards to provide oracles and round openers on this queue.
   */
  reward: number;
  /**
   *  The minimum amount of stake oracles must present to remain on the queue.
   */
  minStake: number;
  /**
   *  After a feed lease is funded or re-funded, it must consecutively succeed
   *  N amount of times or its authorization to use the queue is auto-revoked.
   */
  feedProbationPeriod?: number;
  /**
   *  Time period (in seconds) we should remove an oracle after if no response.
   */
  oracleTimeout?: number;
  /**
   *  Whether slashing is enabled on this queue.
   */
  slashingEnabled?: boolean;
  /**
   *  The tolerated variance amount oracle results can have from the accepted round result
   *  before being slashed.
   *  slashBound = varianceToleranceMultiplier * stdDeviation
   *  Default: 2
   */
  varianceToleranceMultiplier?: number;
  /**
   *  Consecutive failure limit for a feed before feed permission is revoked.
   */
  consecutiveFeedFailureLimit?: number;
  /**
   *  Consecutive failure limit for an oracle before oracle permission is revoked.
   */
  consecutiveOracleFailureLimit?: number;
  /**
   *  Optionally set the size of the queue.
   */
  queueSize?: number;
  /**
   *  Enabling this setting means data feeds do not need explicit permission to join the queue.
   */
  unpermissionedFeeds?: boolean;
  /**
   *  Enabling this setting means data feeds do not need explicit permission
   *  to request VRF proofs and verifications from this queue.
   */
  unpermissionedVrf?: boolean;
  /**
   *  Enabling this setting will allow buffer relayer accounts to call openRound.
   */
  enableBufferRelayers?: boolean;
  /**
   *  Only allow TEE oracles to heartbeat on this queue.
   */
  enableTeeOnly?: boolean;
  /**
   *  The account to delegate authority to for creating permissions targeted at the queue.
   *
   *  Defaults to the payer.
   */
  authority?: PublicKey;

  keypair?: Keypair;
  dataBufferKeypair?: Keypair;
}

export interface QueueSetConfigParams {
  /**
   *  Alternative keypair that is the queue authority and is permitted to make account changes.
   *  Defaults to the payer if not provided.
   */
  authority?: anchor.web3.Keypair;
  /**
   *  A name to assign to this {@linkcode QueueAccount}
   */
  name?: string;
  /**
   *  Metadata for the queue for easier identification.
   */
  metadata?: string;
  /**
   *  Enabling this setting means data feeds do not need explicit permission to join the queue.
   */
  unpermissionedFeedsEnabled?: boolean;
  /**
   *  Enabling this setting means data feeds do not need explicit permission to request VRF proofs
   *  and verifications from this queue.
   */
  unpermissionedVrfEnabled?: boolean;
  /**
   *  Enabling this setting will allow buffer relayer accounts to call openRound.
   */
  enableBufferRelayers?: boolean;
  /**
   *  Only allow TEE oracles to heartbeat on this queue.
   */
  enableTeeOnly?: boolean;
  /**
   *  Whether slashing is enabled on this queue.
   */
  slashingEnabled?: boolean;
  /**
   *  The tolerated variance amount oracle results can have from the accepted round result
   *  before being slashed.
   *  slashBound = varianceToleranceMultiplier * stdDeviation
   */
  varianceToleranceMultiplier?: number;
  /**
   *  Time period (in seconds) we should remove an oracle after if no response.
   */
  oracleTimeout?: number;
  /**
   *  Rewards to provide oracles and round openers on this queue.
   */
  reward?: number;
  /**
   *  The minimum amount of stake oracles must present to remain on the queue.
   */
  minStake?: number;
  /**
   *  Consecutive failure limit for a feed before feed permission is revoked.
   */
  consecutiveFeedFailureLimit?: number;
  /**
   *  Consecutive failure limit for an oracle before oracle permission is revoked.
   */
  consecutiveOracleFailureLimit?: number;
}

export type QueueAccountsJSON = Omit<
  types.OracleQueueAccountDataJSON,
  "dataBuffer"
> & {
  publicKey: PublicKey;
  dataBuffer: { publicKey: PublicKey; data: Array<PublicKey> };
  oracles: Array<{
    publicKey: PublicKey;
    data: types.OracleAccountDataJSON;
  }>;
};

export type QueueAccounts = {
  queue: {
    publicKey: PublicKey;
    data: types.OracleQueueAccountData;
  };
  dataBuffer: {
    publicKey: PublicKey;
    data: Array<PublicKey>;
  };
  oracles: Array<{
    publicKey: PublicKey;
    data: types.OracleAccountData;
  }>;
};

export type CreateQueueOracleParams = OracleInitParams &
  Partial<OracleStakeParams> &
  Partial<PermissionSetParams> & {
    queueAuthorityPubkey?: PublicKey;
  };

export type CreateQueueCrankParams = Omit<CrankInitParams, "queueAccount">;

export type CreateQueueFeedParams = Omit<
  Omit<Omit<AggregatorInitParams, "queueAccount">, "queueAuthority">,
  "authority"
> & {
  authority?: PublicKey;
  crankPubkey?: PublicKey;
  crankDataBuffer?: PublicKey;
  historyLimit?: number;
} & {
  slidingWindow?: boolean;
  basePriorityFee?: number;
  priorityFeeBump?: number;
  priorityFeeBumpPeriod?: number;
  maxPriorityFeeMultiplier?: number;
} & Partial<LeaseInitParams> &
  Partial<PermissionSetParams> & {
    // job params
    jobs?: Array<{ pubkey: PublicKey; weight?: number } | JobInitParams>;
  } & {
    queueAuthorityPubkey?: PublicKey;
  };

export type CreateQueueVrfParams = Omit<VrfInitParams, "queueAccount"> &
  Partial<PermissionSetParams> & {
    queueAuthorityPubkey?: PublicKey;
  };

export type CreateQueueBufferRelayerParams = Omit<
  Omit<BufferRelayerInit, "jobAccount">,
  "queueAccount"
> &
  Partial<PermissionSetParams> & {
    // job params
    job: JobAccount | PublicKey | Omit<JobInitParams, "weight">;
  } & {
    queueAuthorityPubkey?: PublicKey;
  };

export type CreateVrfLiteParams = VrfLiteInitParams &
  Partial<PermissionSetParams> & {
    queueAuthorityPubkey?: PublicKey;
  };
