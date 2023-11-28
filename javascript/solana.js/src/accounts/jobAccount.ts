import * as errors from "../errors.js";
import * as types from "../generated/oracle-program/index.js";
import type { SwitchboardProgram } from "../SwitchboardProgram.js";
import type {
  SendTransactionObjectOptions,
  TransactionObjectOptions,
} from "../TransactionObject.js";
import { TransactionObject } from "../TransactionObject.js";
import type { WithRequired } from "../types.js";

import { Account } from "./account.js";

import * as anchor from "@coral-xyz/anchor";
import type {
  AccountInfo,
  Commitment,
  TransactionSignature,
} from "@solana/web3.js";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { BN, OracleJob, toUtf8 } from "@switchboard-xyz/common";

/**
 * Account type storing a list of SwitchboardTasks {@linkcode OracleJob.Task} dictating how to source data off-chain.
 *
 * Data: {@linkcode types.JobAccountData}
 */
export class JobAccount extends Account<types.JobAccountData> {
  static accountName = "JobAccountData";

  /**
   * Returns the job's name buffer in a stringified format.
   */
  public static getName = (job: types.JobAccountData) => toUtf8(job.name);
  /**
   * Returns the job's metadata buffer in a stringified format.
   */
  public static getMetadata = (job: types.JobAccountData) =>
    toUtf8(job.metadata);

  public static getAccountSize(byteLength: number): number {
    return 181 + byteLength;
  }

  /**
   * Return a job account initialized to the default values.
   *
   * @params byteLength - the length of the serialized job
   */
  public static default(byteLength: number): types.JobAccountData {
    const buffer = Buffer.alloc(JobAccount.getAccountSize(byteLength), 0);
    types.JobAccountData.discriminator.copy(buffer, 0);
    return types.JobAccountData.decode(buffer);
  }

  /**
   * Creates a mock account info for a given job. Useful for test integrations.
   */
  public static createMock(
    programId: PublicKey,
    data: Partial<types.JobAccountData> &
      ({ job: OracleJob } | { tasks: Array<OracleJob.Task> }),
    options?: {
      lamports?: number;
      rentEpoch?: number;
    }
  ): AccountInfo<Buffer> {
    let jobData: Buffer | undefined = undefined;
    if ("data" in data && data.data && data.data.byteLength > 0) {
      jobData = Buffer.from(data.data);
    }
    if ("job" in data) {
      jobData = Buffer.from(OracleJob.encodeDelimited(data.job).finish());
    } else if ("tasks" in data) {
      jobData = Buffer.from(
        OracleJob.encodeDelimited(OracleJob.fromObject(data.tasks)).finish()
      );
    }
    if (!jobData) {
      throw new Error(`No job data found to create mock`);
    }

    const fields: types.JobAccountDataFields = {
      ...JobAccount.default(jobData.byteLength),
      ...data,
      // any cleanup actions here
    };
    const state = new types.JobAccountData(fields);

    const buffer = Buffer.alloc(
      JobAccount.getAccountSize(jobData.byteLength),
      0
    );
    types.JobAccountData.discriminator.copy(buffer, 0);
    types.JobAccountData.layout.encode(state, buffer, 8);
    jobData.copy(buffer, 181);

    return {
      executable: false,
      owner: programId,
      lamports: options?.lamports ?? 1 * LAMPORTS_PER_SOL,
      data: buffer,
      rentEpoch: options?.rentEpoch ?? 0,
    };
  }

  /** Load an existing JobAccount with its current on-chain state */
  public static async load(
    program: SwitchboardProgram,
    publicKey: PublicKey | string
  ): Promise<[JobAccount, types.JobAccountData]> {
    const account = new JobAccount(
      program,
      typeof publicKey === "string" ? new PublicKey(publicKey) : publicKey
    );
    const state = await account.loadData();
    return [account, state];
  }

  /**
   * Retrieve and decode the {@linkcode types.JobAccountData} stored in this account.
   */
  public async loadData(): Promise<types.JobAccountData> {
    const data = await types.JobAccountData.fetch(this.program, this.publicKey);
    if (data === null)
      throw new errors.AccountNotFoundError("Job", this.publicKey);
    return data;
  }

  public static createInstructions(
    program: SwitchboardProgram,
    payer: PublicKey,
    params: JobInitParams,
    options?: TransactionObjectOptions
  ): [JobAccount, Array<TransactionObject>] {
    if (params.data.byteLength > 6400) {
      throw new Error("Switchboard jobs need to be less than 6400 bytes");
    }

    const jobKeypair = params.keypair ?? Keypair.generate();

    const authority = params.authority ? params.authority.publicKey : payer;

    const CHUNK_SIZE = 800;

    const txns: Array<TransactionObject> = [];

    if (params.data.byteLength <= CHUNK_SIZE) {
      const jobInitIxn = types.jobInit(
        program,
        {
          params: {
            name: [...Buffer.from(params.name ?? "", "utf8").slice(0, 32)],
            expiration: new BN(params.expiration ?? 0),
            stateBump: program.programState.bump,
            data: params.data,
            size: params.data.byteLength,
          },
        },
        {
          job: jobKeypair.publicKey,
          authority: authority,
          programState: program.programState.publicKey,
          payer,
          systemProgram: SystemProgram.programId,
        }
      );
      txns.push(
        new TransactionObject(
          payer,
          [jobInitIxn],
          params.authority ? [jobKeypair, params.authority] : [jobKeypair],
          options
        )
      );
    } else {
      const chunks: Uint8Array[] = [];

      for (let i = 0; i < params.data.byteLength; ) {
        const end =
          i + CHUNK_SIZE >= params.data.byteLength
            ? params.data.byteLength
            : i + CHUNK_SIZE;
        chunks.push(params.data.slice(i, end));
        i = end;
      }

      const jobInitIxn = types.jobInit(
        program,
        {
          params: {
            name: [...Buffer.from(params.name ?? "", "utf8").slice(0, 32)],
            expiration: new BN(params.expiration ?? 0),
            stateBump: program.programState.bump,
            data: new Uint8Array(),
            size: params.data.byteLength,
          },
        },
        {
          job: jobKeypair.publicKey,
          authority: authority,
          programState: program.programState.publicKey,
          payer,
          systemProgram: SystemProgram.programId,
        }
      );

      txns.push(
        new TransactionObject(
          payer,
          [jobInitIxn],
          params.authority ? [jobKeypair, params.authority] : [jobKeypair],
          options
        )
      );

      for (const [n, chunk] of chunks.entries()) {
        const jobSetDataIxn = types.jobSetData(
          program,
          {
            params: {
              data: chunk,
              chunkIdx: n,
            },
          },
          {
            job: jobKeypair.publicKey,
            authority: authority,
          }
        );
        txns.push(
          new TransactionObject(
            payer,
            [jobSetDataIxn],
            params.authority ? [params.authority] : [],
            options
          )
        );
      }
    }

    return [new JobAccount(program, jobKeypair.publicKey), txns];
  }

  public static async create(
    program: SwitchboardProgram,
    params: JobInitParams,
    options?: SendTransactionObjectOptions
  ): Promise<[JobAccount, Array<TransactionSignature>]> {
    const keypair = params.keypair ?? Keypair.generate();
    await program.verifyNewKeypair(keypair);
    const [account, transactions] = JobAccount.createInstructions(
      program,
      program.walletPubkey,
      { ...params, keypair },
      options
    );
    const txSignature = await program.signAndSendAll(transactions, options);
    return [account, txSignature];
  }

  decode(data: Buffer): types.JobAccountData {
    return types.JobAccountData.decode(data);
  }

  static decode(
    program: SwitchboardProgram,
    accountInfo: AccountInfo<Buffer>
  ): types.JobAccountData {
    if (!accountInfo || accountInfo.data === null) {
      throw new Error("Cannot decode empty JobAccountData");
    }

    return types.JobAccountData.decode(accountInfo.data);
  }

  static decodeJob(
    program: SwitchboardProgram,
    accountInfo: AccountInfo<Buffer>
  ): OracleJob {
    return OracleJob.decodeDelimited(
      JobAccount.decode(program, accountInfo).data!
    );
  }

  public async toAccountsJSON(
    _job?: types.JobAccountData
  ): Promise<JobAccountsJSON> {
    const job = _job ?? (await this.loadData());
    const oracleJob = OracleJob.decodeDelimited(job.data);

    return {
      publicKey: this.publicKey,
      ...job.toJSON(),
      tasks: oracleJob.tasks,
    };
  }

  static async fetchMultiple(
    program: SwitchboardProgram,
    publicKeys: Array<PublicKey>,
    commitment: Commitment = "confirmed"
  ): Promise<
    Array<{
      account: JobAccount;
      data: types.JobAccountData;
      job: OracleJob;
    }>
  > {
    const jobs: Array<{
      account: JobAccount;
      data: types.JobAccountData;
      job: OracleJob;
    }> = [];

    const accountInfos = await anchor.utils.rpc.getMultipleAccounts(
      program.connection,
      publicKeys,
      commitment
    );

    for (const accountInfo of accountInfos) {
      if (!accountInfo?.publicKey) {
        continue;
      }
      try {
        const account = new JobAccount(program, accountInfo.publicKey);
        const data = types.JobAccountData.decode(accountInfo.account.data);
        const job = OracleJob.decodeDelimited(data.data);
        jobs.push({ account, data, job });
        // eslint-disable-next-line no-empty
      } catch {}
    }

    return jobs;
  }
}

export interface JobInitParams {
  data: Uint8Array;
  weight?: number;
  name?: string;
  authority?: Keypair;
  expiration?: number;
  variables?: Array<string>;
  keypair?: Keypair;
}

export type JobAccountsJSON = types.JobAccountDataJSON & {
  publicKey: PublicKey;
  tasks: Array<OracleJob.ITask>;
};
