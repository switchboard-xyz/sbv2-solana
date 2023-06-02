import * as errors from "../errors.js";
import * as types from "../generated/oracle-program/index.js";
import { SwitchboardProgram } from "../SwitchboardProgram.js";

import {
  Account,
  BUFFER_DISCRIMINATOR,
  OnAccountChangeCallback,
} from "./account.js";

import { AccountInfo, Commitment, PublicKey } from "@solana/web3.js";
import { BN } from "@switchboard-xyz/common";

/**
 * Account holding a priority queue of aggregators and their next available update time.
 *
 * Data: Array<{@linkcode types.CrankRow}>
 */
export class CrankDataBuffer extends Account<Array<types.CrankRow>> {
  static accountName = "CrankDataBuffer";

  public size = 40;

  /**
   * Invoke a callback each time a crank's buffer has changed on-chain. The buffer stores a list of {@linkcode AggregatorAccount} public keys along with their next available update time.
   * @param callback - the callback invoked when the crank's buffer changes
   * @param commitment - optional, the desired transaction finality. defaults to 'confirmed'
   * @returns the websocket subscription id
   */
  onChange(
    callback: OnAccountChangeCallback<Array<types.CrankRow>>,
    commitment: Commitment = "confirmed"
  ): number {
    if (this.publicKey.equals(PublicKey.default)) {
      throw new Error(
        `No crank dataBuffer provided. Call crankAccount.loadData() or pass it to this function in order to watch the account for changes`
      );
    }
    return this.program.connection.onAccountChange(
      this.publicKey,
      (accountInfo) => callback(CrankDataBuffer.decode(accountInfo)),
      commitment
    );
  }

  /**
   * Retrieve and decode the {@linkcode types.CrankAccountData} stored in this account.
   */
  public async loadData(): Promise<Array<types.CrankRow>> {
    if (this.publicKey.equals(PublicKey.default)) {
      return [];
    }
    const accountInfo = await this.program.connection.getAccountInfo(
      this.publicKey
    );
    if (accountInfo === null)
      throw new errors.AccountNotFoundError(
        "Crank Data Buffer",
        this.publicKey
      );
    const data = CrankDataBuffer.decode(accountInfo);
    return data;
  }

  public static decode(
    bufferAccountInfo: AccountInfo<Buffer>
  ): Array<types.CrankRow> {
    const buffer = bufferAccountInfo.data.slice(8) ?? Buffer.from("");
    const maxRows = Math.floor(buffer.byteLength / 40);

    const pqData: Array<types.CrankRow> = [];

    for (let i = 0; i < maxRows * 40; i += 40) {
      if (buffer.byteLength - i < 40) {
        break;
      }

      const rowBuf = buffer.slice(i, i + 40);
      const pubkey = new PublicKey(rowBuf.slice(0, 32));
      if (pubkey.equals(PublicKey.default)) {
        break;
      }

      const nextTimestamp = new BN(rowBuf.slice(32, 40), "le");
      pqData.push(new types.CrankRow({ pubkey, nextTimestamp }));
    }

    return pqData;
  }

  public static getAccountSize(size: number): number {
    return 8 + size * 40;
  }

  public static default(size = 100): Buffer {
    const buffer = Buffer.alloc(CrankDataBuffer.getAccountSize(size), 0);
    BUFFER_DISCRIMINATOR.copy(buffer, 0);
    return buffer;
  }

  public static sort(crankRows: Array<types.CrankRow>): Array<types.CrankRow> {
    const sorted: Array<types.CrankRow> = [];

    const rows = [...crankRows];

    while (rows.length > 0) {
      const popped = pqPop(rows);
      if (popped !== undefined) {
        sorted.push(popped);
      }
    }

    if (sorted.length !== crankRows.length) {
      throw new Error(`Crank sort error`);
    }

    return sorted;
  }

  /**
   * Return a crank's dataBuffer
   *
   * @throws {string} if dataBuffer is equal to default publicKey
   */
  static fromCrank(
    program: SwitchboardProgram,
    crank: types.CrankAccountData
  ): CrankDataBuffer {
    if (crank.dataBuffer.equals(PublicKey.default)) {
      throw new Error(`Failed to find crank data buffer`);
    }

    return new CrankDataBuffer(program, crank.dataBuffer);
  }
}

function pqPop<T extends types.CrankRow>(crankData: Array<T>): T | undefined {
  const ret = crankData[0]!;
  crankData[0] = crankData.at(-1)!;
  crankData.pop();
  let current = 0;

  let maxLoops = crankData.length * 2;
  while (maxLoops > 0) {
    const leftChildIdx = current * 2 + 1;
    const rightChildIdx = current * 2 + 2;
    let swapIdx = rightChildIdx;
    if (rightChildIdx < crankData.length) {
      const leftChild = crankData[leftChildIdx];
      const rightChild = crankData[rightChildIdx];
      if (leftChild.nextTimestamp < rightChild.nextTimestamp) {
        swapIdx = leftChildIdx;
      }
    }
    if (swapIdx >= crankData.length) {
      swapIdx = leftChildIdx;
    }
    if (swapIdx >= crankData.length) {
      break;
    }
    const currentItem = crankData[current];
    const swapItem = crankData[swapIdx];
    if (currentItem.nextTimestamp < swapItem.nextTimestamp) {
      break;
    }
    crankData[current] = swapItem;
    crankData[swapIdx] = currentItem;
    current = swapIdx;
    --maxLoops;
    if (maxLoops === 0) {
      throw new Error(
        `Failed to sort crank rows in ${crankData.length * 2} loops`
      );
    }
  }
  return ret;
}
