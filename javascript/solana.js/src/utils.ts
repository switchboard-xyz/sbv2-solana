import type {
  AggregatorAccount,
  CreateQueueFeedParams,
  QueueAccount,
} from "./accounts/index.js";
import { JobAccount } from "./accounts/index.js";
import type { AggregatorAccountData } from "./generated/index.js";
import { InvalidCronSchedule } from "./errors.js";
import { TransactionObject } from "./TransactionObject.js";

import type { AccountMeta } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js";
import { Keypair, PublicKey } from "@solana/web3.js";
import type { RawBuffer } from "@switchboard-xyz/common";
import { BN, OracleJob } from "@switchboard-xyz/common";
import { isValidCron } from "cron-validator";
import fs from "fs";
import os from "os";
import path from "path";

export {
  combineMrEnclaveSets,
  containsMrEnclave,
  filterEmptyMrEnclaves,
} from "@switchboard-xyz/common";

export function handleOptionalPubkeys(
  ixn: TransactionInstruction
): TransactionInstruction {
  const programId = ixn.programId;
  const data = ixn.data;
  const keys = ixn.keys.map((meta: AccountMeta): AccountMeta => {
    if (meta.pubkey.equals(programId)) {
      return {
        isSigner: false,
        isWritable: false,
        pubkey: programId,
      };
    }

    return meta;
  });
  return new TransactionInstruction({
    programId,
    keys,
    data,
  });
}

export function loadKeypair(keypairPath: string): Keypair {
  const fullPath =
    keypairPath.startsWith("/") || keypairPath.startsWith("C:")
      ? keypairPath
      : keypairPath.startsWith("~")
      ? os.homedir() + keypairPath.slice(1)
      : path.join(process.cwd(), keypairPath);

  if (!fs.existsSync(fullPath)) {
    const keypair = Keypair.generate();
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, `[${keypair.secretKey}]`);
    return keypair;
  }

  return Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(fullPath, "utf-8")))
  );
}

/**
 * Create a feed and wait for it to resolve to a static value
 * @param queueAccount - the oracle queue to create the feed on
 * @param params - the aggregator init params and the static value to resolve the feed to
 * @param timeout - the number of milliseconds to wait before timing out
 *
 * Basic usage example:
 *
 * ```ts
 * import { createStaticFeed, QueueAccount, AggregatorAccount } from "@switchboard-xyz/solana.js";
 *
 * let queueAccount: QueueAccount;
 * let staticFeedAccount: AggregatorAccount;
 *
 * [staticFeedAccount] = await createStaticFeed(queueAccount, {
 *    value: 10,
 * });
 * const staticFeedValue: Big = await staticFeedAccount.fetchLatestValue();
 * assert(staticFeedValue.toNumber() === 10, "StaticFeedValueMismatch");
 * ```
 */
export async function createStaticFeed(
  queueAccount: QueueAccount,
  params: Partial<CreateQueueFeedParams> & { value: number },
  timeout = 30000
): Promise<[AggregatorAccount, AggregatorAccountData]> {
  const [aggregatorAccount] = await queueAccount.createFeed({
    ...params,
    batchSize: params.batchSize ?? 1,
    minUpdateDelaySeconds: params.minUpdateDelaySeconds ?? 10,
    minRequiredOracleResults: params.minRequiredOracleResults ?? 1,
    minRequiredJobResults: params.minRequiredJobResults ?? 1,
    jobs: [
      {
        weight: 1,
        data: OracleJob.encodeDelimited(
          OracleJob.fromObject({
            tasks: [
              {
                valueTask: {
                  value: params.value,
                },
              },
            ],
          })
        ).finish(),
      },
    ],
  });

  const [state] = await aggregatorAccount.openRoundAndAwaitResult(
    undefined,
    timeout
  );

  return [aggregatorAccount, state];
}

/**
 * Update an existing aggregator that resolves to a new static value, then await the new result
 * @param aggregatorAccount - the aggregator account to modify
 * @param value - the static value the feed will resolve to
 * @param timeout - the number of milliseconds to wait before timing out
 *
 * Basic usage example:
 *
 * ```ts
 * import { updateStaticFeed, AggregatorAccount } from "@switchboard-xyz/solana.js";
 *
 * let staticFeedAccount: AggregatorAccount;
 *
 * const staticFeedState = await updateStaticFeed(staticFeedAccount, 100);
 * staticFeedValue = AggregatorAccount.decodeLatestValue(staticFeedState);
 * assert(staticFeedValue.toNumber() === 100, "StaticFeedValueMismatch");
 * ```
 */
export async function updateStaticFeed(
  aggregatorAccount: AggregatorAccount,
  value: number,
  timeout = 30000
): Promise<AggregatorAccountData> {
  const aggregator = await aggregatorAccount.loadData();

  const [jobAccount, jobInit] = JobAccount.createInstructions(
    aggregatorAccount.program,
    aggregatorAccount.program.walletPubkey,
    {
      keypair: Keypair.generate(),
      data: OracleJob.encodeDelimited(
        OracleJob.create({
          tasks: [
            OracleJob.Task.create({
              valueTask: OracleJob.ValueTask.create({
                value,
              }),
            }),
          ],
        })
      ).finish(),
    }
  );

  const oldJobKeys = aggregator.jobPubkeysData.filter(
    (pubkey) => !pubkey.equals(PublicKey.default)
  );

  const oldJobs: Array<[JobAccount, number]> = oldJobKeys.map((pubkey, i) => [
    new JobAccount(aggregatorAccount.program, pubkey),
    i,
  ]);

  const removeJobTxns = oldJobs.map((job) =>
    aggregatorAccount.removeJobInstruction(
      aggregatorAccount.program.walletPubkey,
      {
        job: job[0],
        jobIdx: job[1],
      }
    )
  );

  const addJobTxn = aggregatorAccount.addJobInstruction(
    aggregatorAccount.program.walletPubkey,
    { job: jobAccount }
  );

  const txns = TransactionObject.pack([
    ...jobInit,
    ...removeJobTxns,
    addJobTxn,
  ]);
  await aggregatorAccount.program.signAndSendAll(txns);

  const [state] = await aggregatorAccount.openRoundAndAwaitResult(
    undefined,
    timeout
  );

  return state;
}

const bytesRegex = /^\[(\s)?[0-9]+((\s)?,(\s)?[0-9]+){31,}\]/g;
const hexRegex = /^(0x|0X)?[a-fA-F0-9]{64}/g;
const base64Regex =
  /^(?:[A-Za-z\d+\/]{4})*(?:[A-Za-z\d+\/]{3}=|[A-Za-z\d+\/]{2}==)?/g;

export function parseRawBuffer(rawBuffer: RawBuffer, size = 32): Uint8Array {
  let myUint8Array: Uint8Array;

  if (typeof rawBuffer === "string") {
    if (bytesRegex.test(rawBuffer)) {
      // check if its a string of bytes '[1,2,3]'
      myUint8Array = new Uint8Array(JSON.parse(rawBuffer));
    } else if (hexRegex.test(rawBuffer)) {
      // check if its a hex string '0x1A'
      myUint8Array = new Uint8Array(
        Buffer.from(rawBuffer.replaceAll(/0x|0X/g, ""), "hex")
      );
    } else if (base64Regex.test(rawBuffer)) {
      // check if its a base64 string
      myUint8Array = new Uint8Array(Buffer.from(rawBuffer, "base64"));
    } else {
      // assume utf-8
      myUint8Array = new Uint8Array(Buffer.from(rawBuffer, "utf-8"));
    }
  } else if (rawBuffer instanceof Buffer) {
    myUint8Array = new Uint8Array(rawBuffer);
  } else if (rawBuffer instanceof Uint8Array) {
    myUint8Array = rawBuffer;
  } else {
    // Assume input is number[]
    myUint8Array = new Uint8Array(rawBuffer);
  }

  // make sure its always 32 bytes
  return new Uint8Array(
    Array.from(myUint8Array).concat(Array(size).fill(0)).slice(0, size)
  );
}

/**
 * Validate a cron schedule and return a valid 6 element cron string which includes seconds
 * @param cronSchedule - the cron string to validate
 * @returns - a valid cron schedule with seconds included
 * @throws {@link InvalidCronSchedule} if the cron schedule is not valid
 */
export function parseCronSchedule(cronSchedule: string): string {
  if (!isValidCron(cronSchedule, { seconds: true })) {
    throw new InvalidCronSchedule(cronSchedule);
  }

  const fields = cronSchedule.split(" ");
  if (fields.length === 0) {
    throw new InvalidCronSchedule(cronSchedule);
  }

  if (fields.length === 6) {
    return cronSchedule;
  }

  fields.unshift(...Array(6 - fields.length).fill("0"));
  return fields.join(" ");
}

export function numToBN(num?: number | BN, defaultVal = 0): BN {
  if (!num) {
    return new BN(defaultVal);
  }
  if (typeof num === "number") {
    return new BN(num);
  }

  return num;
}

export function calculatePriorityFee(
  timestamp: number,
  roundOpenTimestamp: number,
  basePriorityFee: number,
  priorityFeeBump: number,
  priorityFeeBumpPeriod: number,
  maxPriorityFeeMultiplier: number
): number {
  if (priorityFeeBumpPeriod <= 0) {
    return basePriorityFee;
  }

  if (maxPriorityFeeMultiplier <= 0) {
    return basePriorityFee;
  }

  const staleness = Math.round(timestamp - roundOpenTimestamp);
  if (staleness <= 0) {
    return basePriorityFee;
  }

  const feeMultiplier = Math.floor(staleness / priorityFeeBumpPeriod) - 1;
  const multiplier =
    feeMultiplier > 0 ? Math.min(feeMultiplier, maxPriorityFeeMultiplier) : 0;

  return Math.floor(priorityFeeBump * multiplier + basePriorityFee);
}
