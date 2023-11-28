import { VRF_POOL_REQUEST_AMOUNT } from "../const.js";
import { AccountNotFoundError, InsufficientFundsError } from "../errors.js";
import * as types from "../generated/oracle-program/index.js";
import type { VrfPoolRequestEvent } from "../SwitchboardEvents.js";
import type { SwitchboardProgram } from "../SwitchboardProgram.js";
import { TransactionObject } from "../TransactionObject.js";

import type { OnAccountChangeCallback } from "./account.js";
import { Account } from "./account.js";
import { PermissionAccount } from "./permissionAccount.js";
import type { CreateVrfLiteParams } from "./queueAccount.js";
import { QueueAccount } from "./queueAccount.js";
import type { Callback } from "./vrfAccount.js";
import { VrfLiteAccount } from "./vrfLiteAccount.js";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type {
  AccountMeta,
  Commitment,
  TransactionSignature,
} from "@solana/web3.js";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { promiseWithTimeout } from "@switchboard-xyz/common";
import _ from "lodash";

// export type VrfPoolRow = {
//   timestamp: number;
//   pubkey: PublicKey;
// };

export type VrfPoolPushNewParams = CreateVrfLiteParams &
  Omit<VrfPoolPushParams, "vrf"> & {
    queueAccount?: QueueAccount;
    vrfPool?: types.VrfPoolAccountData;
  };

export interface VrfPoolInitParams {
  maxRows: number;
  minInterval?: number;
  authority?: PublicKey;
  keypair?: Keypair;
}

export interface VrfPoolPushParams {
  authority?: Keypair;
  vrf: VrfLiteAccount;
  permission?: PermissionAccount;
}

export interface VrfPoolPopParams {
  authority?: Keypair;
}

export interface VrfPoolRequestParams {
  authority?: Keypair;
  callback?: Callback;
}

export type VrfPoolDepositParams = {
  tokenWallet?: PublicKey;
  tokenAuthority?: Keypair;
  amount: number;
  disableWrap?: boolean;
};

export type VrfPoolAccountData = types.VrfPoolAccountData & {
  pool: Array<types.VrfPoolRow>;
};

export class VrfPoolAccount extends Account<VrfPoolAccountData> {
  /**
   * Invoke a callback each time a VrfAccount's data has changed on-chain.
   * @param callback - the callback invoked when the vrf state changes
   * @param commitment - optional, the desired transaction finality. defaults to 'confirmed'
   * @returns the websocket subscription id
   */
  onChange(
    callback: OnAccountChangeCallback<VrfPoolAccountData>,
    commitment: Commitment = "confirmed"
  ): number {
    return this.program.connection.onAccountChange(
      this.publicKey,
      (accountInfo) => callback(VrfPoolAccount.decode(accountInfo.data)),
      commitment
    );
  }

  public static decode(data: Buffer): VrfPoolAccountData {
    const accountData = types.VrfPoolAccountData.decode(
      data.slice(0, 8 + types.VrfPoolAccountData.layout.span)
    );

    const poolBytes = data.slice(8 + types.VrfPoolAccountData.layout.span);
    const ROW_SIZE = types.VrfPoolRow.layout().span;
    const pool: Array<types.VrfPoolRow> = [];
    for (let i = 0; i < poolBytes.length; i += ROW_SIZE) {
      if (i + ROW_SIZE > poolBytes.length) {
        break;
      }

      const row = types.VrfPoolRow.fromDecoded(
        types.VrfPoolRow.layout().decode(poolBytes, i)
      );
      if (row.pubkey.equals(PublicKey.default)) {
        break;
      }

      pool.push(row);
    }

    accountData["pool"] = pool;

    return accountData as VrfPoolAccountData;
  }

  public async loadData(): Promise<VrfPoolAccountData> {
    const info = await this.program.connection.getAccountInfo(this.publicKey);

    if (info === null) {
      throw new AccountNotFoundError("VrfPool", this.publicKey);
    }
    if (!info.owner.equals(this.program.oracleProgramId)) {
      throw new Error("account doesn't belong to this program");
    }

    return VrfPoolAccount.decode(info.data);
  }

  public static getSize(program: SwitchboardProgram, maxRows: number) {
    return 8 + types.VrfPoolAccountData.layout.span + maxRows * 40;
  }

  public static async createInstruction(
    program: SwitchboardProgram,
    payer: PublicKey,
    params: VrfPoolInitParams & { queueAccount: QueueAccount }
  ): Promise<[VrfPoolAccount, TransactionObject]> {
    const vrfPoolKeypair = params.keypair ?? Keypair.generate();
    const space = VrfPoolAccount.getSize(program, params.maxRows);

    const vrfPoolAccount = new VrfPoolAccount(
      program,
      vrfPoolKeypair.publicKey
    );

    const vrfPoolEscrow = program.mint.getAssociatedAddress(
      vrfPoolKeypair.publicKey
    );

    const vrfPoolInitTxn = new TransactionObject(
      payer,
      [
        SystemProgram.createAccount({
          fromPubkey: payer,
          newAccountPubkey: vrfPoolKeypair.publicKey,
          lamports: await program.connection.getMinimumBalanceForRentExemption(
            space
          ),
          space: space,
          programId: program.oracleProgramId,
        }),
        types.vrfPoolInit(
          program,
          {
            params: {
              maxRows: params.maxRows,
              minInterval: params.minInterval ?? 0,
              stateBump: program.programState.bump,
            },
          },
          {
            vrfPool: vrfPoolKeypair.publicKey,
            authority: params.authority ?? payer,
            queue: params.queueAccount.publicKey,
            mint: program.mint.address,
            escrow: vrfPoolEscrow,
            programState: program.programState.publicKey,
            payer: payer,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          }
        ),
      ],
      [vrfPoolKeypair]
    );

    return [vrfPoolAccount, vrfPoolInitTxn];
  }

  public static async create(
    program: SwitchboardProgram,
    params: VrfPoolInitParams & { queueAccount: QueueAccount }
  ): Promise<[VrfPoolAccount, TransactionSignature]> {
    const [account, transaction] = await VrfPoolAccount.createInstruction(
      program,
      program.walletPubkey,
      params
    );
    const txnSignature = await program.signAndSend(transaction, {
      skipPreflight: true,
    });
    return [account, txnSignature];
  }

  public async pushNewInstruction(
    payer: PublicKey,
    params?: VrfPoolPushNewParams
  ): Promise<[VrfLiteAccount, TransactionObject]> {
    const vrfPool = params?.vrfPool ?? (await this.loadData());
    const queueAccount =
      params?.queueAccount ?? new QueueAccount(this.program, vrfPool.queue);

    const [vrfLiteAccount, vrfLiteInit] =
      await queueAccount.createVrfLiteInstructions(payer, {
        ...params,
        authority: vrfPool.authority,
      });
    const pushTxn = await this.pushInstruction(payer, {
      ...params,
      vrf: vrfLiteAccount,
    });

    const packed = TransactionObject.pack([vrfLiteInit, pushTxn]);
    if (packed.length > 1) {
      throw new Error(`Packing error`);
    }

    return [vrfLiteAccount, packed[0]];
  }

  public async pushNew(
    params?: VrfPoolPushNewParams
  ): Promise<[VrfLiteAccount, TransactionSignature]> {
    const [vrfLiteAccount, transaction] = await this.pushNewInstruction(
      this.program.walletPubkey,
      params
    );
    const txnSignature = await this.program.signAndSend(transaction, {
      skipPreflight: true,
    });
    return [vrfLiteAccount, txnSignature];
  }

  public async pushInstruction(
    payer: PublicKey,
    params: VrfPoolPushParams
  ): Promise<TransactionObject> {
    const vrfPool = await this.loadData();
    const [queueAccount, queue] = await QueueAccount.load(
      this.program,
      vrfPool.queue
    );

    const [permissionAccount] = params.vrf.getPermissionAccount(
      queueAccount.publicKey,
      queue.authority
    );

    // verify permissions

    const pushIxn = types.vrfPoolAdd(
      this.program,
      { params: {} },
      {
        vrfPool: this.publicKey,
        authority: vrfPool.authority,
        vrfLite: params.vrf.publicKey,
        queue: queueAccount.publicKey,
        permission: permissionAccount.publicKey,
      }
    );

    return new TransactionObject(
      payer,
      [pushIxn],
      params.authority ? [params.authority] : []
    );
  }

  public async push(params: VrfPoolPushParams): Promise<TransactionSignature> {
    const transaction = await this.pushInstruction(
      this.program.walletPubkey,
      params
    );
    const txnSignature = await this.program.signAndSend(transaction, {
      skipPreflight: true,
    });
    return txnSignature;
  }

  public async popInstructions(
    payer: PublicKey,
    params?: VrfPoolPopParams
  ): Promise<TransactionObject> {
    const vrfPool = await this.loadData();
    const [queueAccount, queue] = await QueueAccount.load(
      this.program,
      vrfPool.queue
    );
    const vrfs = vrfPool.pool.slice(-5);

    const popIxn = types.vrfPoolRemove(
      this.program,
      { params: {} },
      {
        vrfPool: this.publicKey,
        authority: vrfPool.authority,
        queue: queueAccount.publicKey,
      }
    );
    popIxn.keys = popIxn.keys.concat(
      vrfs.map((v): AccountMeta => {
        return {
          pubkey: v.pubkey,
          isSigner: false,
          isWritable: true,
        };
      })
    );

    return new TransactionObject(
      payer,
      [popIxn],
      params?.authority ? [params.authority] : []
    );
  }

  public async pop(params?: VrfPoolPopParams): Promise<TransactionSignature> {
    const transaction = await this.popInstructions(
      this.program.walletPubkey,
      params
    );
    const txnSignature = await this.program.signAndSend(transaction, {
      skipPreflight: true,
    });
    return txnSignature;
  }

  /** Returns the sorted, next {@param size} rows in the pool */
  public getRemainingAccounts(
    vrfPool: VrfPoolAccountData,
    queueAuthority: PublicKey,
    size = 7
  ): Array<AccountMeta> {
    const vrfRows = [
      ...vrfPool.pool.slice(vrfPool.idx),
      ...vrfPool.pool.slice(0, vrfPool.idx),
    ].slice(0, size);

    const accountMetas = vrfRows.map((row): Array<AccountMeta> => {
      const escrow = this.program.mint.getAssociatedAddress(row.pubkey);
      const vrfLiteAccount = new VrfLiteAccount(this.program, row.pubkey);
      const [permission] = vrfLiteAccount.getPermissionAccount(
        vrfPool.queue,
        queueAuthority
      );

      return [
        {
          pubkey: row.pubkey,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: permission.publicKey,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: escrow,
          isSigner: false,
          isWritable: true,
        },
      ];
    });

    const remainingAccounts: Array<AccountMeta> = _.flatten(accountMetas).sort(
      (a, b) => Buffer.compare(a.pubkey.toBuffer(), b.pubkey.toBuffer())
    );

    return remainingAccounts;
  }

  public async requestInstructions(
    payer: PublicKey,
    params?: VrfPoolRequestParams,
    size = 7
  ): Promise<TransactionObject> {
    const vrfPool = await this.loadData();

    const [queueAccount, queue] = await QueueAccount.load(
      this.program,
      vrfPool.queue
    );

    const remainingAccounts = this.getRemainingAccounts(
      vrfPool,
      queue.authority,
      size
    );

    // we dont want to wrap any funds. it will take up space in the txn needed for remainingAccounts
    // to increase probability of popping the next row
    const vrfPoolBalance = await this.fetchBalance(vrfPool.escrow);
    if (vrfPoolBalance < VRF_POOL_REQUEST_AMOUNT) {
      throw new InsufficientFundsError(VRF_POOL_REQUEST_AMOUNT, vrfPoolBalance);
    }

    const requestIxn = types.vrfPoolRequest(
      this.program,
      {
        params: {
          callback: params?.callback ?? null,
        },
      },
      {
        vrfPool: this.publicKey,
        authority: vrfPool.authority,
        escrow: vrfPool.escrow,
        mint: this.program.mint.address,
        queue: queueAccount.publicKey,
        queueAuthority: queue.authority,
        dataBuffer: queue.dataBuffer,
        recentBlockhashes: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
        programState: this.program.programState.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      }
    );
    requestIxn.keys = requestIxn.keys.concat(remainingAccounts);

    const requestTxn = new TransactionObject(
      payer,
      [requestIxn],
      params?.authority ? [params.authority] : []
    );

    return requestTxn;
  }

  public async request(
    params?: VrfPoolRequestParams
  ): Promise<TransactionSignature> {
    const transaction = await this.requestInstructions(
      this.program.walletPubkey,
      params
    );
    const txnSignature = await this.program.signAndSend(transaction, {
      skipPreflight: true,
    });
    return txnSignature;
  }

  // public requestSync(
  //   payer: PublicKey,
  //   params: {
  //     payoutTokenWallet: PublicKey;

  //     queuePubkey: PublicKey;
  //     queueAuthority: PublicKey;
  //     queueDataBuffer: PublicKey;
  //     crankDataBuffer: PublicKey;

  //     readyAggregators: Array<[AggregatorAccount, AggregatorPdaAccounts]>;

  //     nonce?: number;
  //     failOpenOnMismatch?: boolean;
  //     popIdx?: number;
  //   },
  //   options?: TransactionObjectOptions
  // ): TransactionObject {
  //   if (params.readyAggregators.length < 1) {
  //     throw new Error(`No aggregators ready`);
  //   }

  //   let remainingAccounts: PublicKey[] = [];
  //   let txn: TransactionObject | undefined = undefined;

  //   const allLeaseBumps = params.readyAggregators.reduce(
  //     (map, [aggregatorAccount, pdaAccounts]) => {
  //       map.set(aggregatorAccount.publicKey.toBase58(), pdaAccounts.leaseBump);
  //       return map;
  //     },
  //     new Map<string, number>()
  //   );
  //   const allPermissionBumps = params.readyAggregators.reduce(
  //     (map, [aggregatorAccount, pdaAccounts]) => {
  //       map.set(
  //         aggregatorAccount.publicKey.toBase58(),
  //         pdaAccounts.permissionBump
  //       );
  //       return map;
  //     },
  //     new Map<string, number>()
  //   );

  //   // add as many readyAggregators until the txn overflows
  //   for (const [
  //     readyAggregator,
  //     aggregatorPdaAccounts,
  //   ] of params.readyAggregators) {
  //     const { leaseAccount, leaseEscrow, permissionAccount } =
  //       aggregatorPdaAccounts;

  //     const newRemainingAccounts = [
  //       ...remainingAccounts,
  //       readyAggregator.publicKey,
  //       leaseAccount.publicKey,
  //       leaseEscrow,
  //       permissionAccount.publicKey,
  //     ];

  //     try {
  //       const newTxn = this.getPopTxn(
  //         payer,
  //         {
  //           ...params,
  //           remainingAccounts: newRemainingAccounts,
  //           leaseBumps: allLeaseBumps,
  //           permissionBumps: allPermissionBumps,
  //         },
  //         options
  //       );
  //       // succeeded, so set running txn and remaining accounts and try again
  //       txn = newTxn;
  //       remainingAccounts = newRemainingAccounts;
  //     } catch (error) {
  //       if (error instanceof errors.TransactionOverflowError) {
  //         if (txn === undefined) {
  //           throw new Error(`Failed to create crank pop transaction, ${error}`);
  //         }
  //         return txn;
  //       }
  //       throw error;
  //     }
  //   }

  //   if (txn === undefined) {
  //     throw new Error(`Failed to create crank pop transaction`);
  //   }

  //   return txn;
  // }

  public async depositInstructions(
    payer: PublicKey,
    params: VrfPoolDepositParams
  ): Promise<TransactionObject> {
    const userTokenAddress =
      params.tokenWallet ??
      this.program.mint.getAssociatedAddress(
        params.tokenAuthority?.publicKey ?? payer
      );

    const userBalance = await this.program.mint.fetchBalance(userTokenAddress);
    if (params.disableWrap && !userBalance) {
      throw new InsufficientFundsError(params.amount, 0);
    }
    if (params.disableWrap && params.amount > (userBalance ?? 0)) {
      throw new InsufficientFundsError(params.amount, userBalance ?? 0);
    }

    const transferTxn = new TransactionObject(
      payer,
      [
        createTransferInstruction(
          userTokenAddress,
          this.getEscrow(),
          params.tokenAuthority?.publicKey ?? payer,
          this.program.mint.toTokenAmount(params.amount)
        ),
      ],
      params.tokenAuthority ? [params.tokenAuthority] : []
    );

    if (params.amount > (userBalance ?? 0)) {
      const [wrapAccount, wrapIxn] =
        await this.program.mint.getOrCreateWrappedUserInstructions(
          payer,
          { amount: params.amount },
          params.tokenAuthority
        );
      if (wrapIxn) {
        if (!wrapAccount.equals(userTokenAddress)) {
          throw new Error(
            `Incorrect token account, expected ${userTokenAddress}, received ${wrapAccount}`
          );
        }
        return wrapIxn.combine(transferTxn);
      }
    }

    return transferTxn;
  }

  public async deposit(
    params: VrfPoolDepositParams
  ): Promise<TransactionSignature> {
    const transaction = await this.depositInstructions(
      this.program.walletPubkey,
      params
    );
    const txnSignature = await this.program.signAndSend(transaction);
    return txnSignature;
  }

  public async requestAndAwaitEvent(
    params?: { vrf?: types.VrfAccountData } & (
      | VrfPoolRequestParams
      | {
          requestFunction: (...args: any[]) => Promise<TransactionSignature>;
        }
    ),
    timeout = 30000
  ): Promise<[VrfPoolRequestEvent, TransactionSignature]> {
    let ws: number | undefined = undefined;

    const closeWebsocket = async () => {
      if (ws !== undefined) {
        await this.program.removeEventListener(ws).catch();
        ws = undefined;
      }
    };

    const eventPromise: Promise<VrfPoolRequestEvent> = promiseWithTimeout(
      timeout,
      new Promise(async (resolve: (result: VrfPoolRequestEvent) => void) => {
        ws = await this.program.addEventListener(
          "VrfPoolRequestEvent",
          (event, slot, signature) => {
            if (event.vrfPoolPubkey.equals(this.publicKey)) {
              resolve(event);
            }
          }
        );
      })
    ).finally(async () => {
      await closeWebsocket();
    });

    let requestRandomnessSignature: string | undefined = undefined;
    if (params && "requestFunction" in params) {
      requestRandomnessSignature = await params
        .requestFunction()
        .catch(async (error) => {
          await closeWebsocket();
          throw new Error(`Failed to call requestRandomness, ${error}`);
        });
    } else {
      requestRandomnessSignature = await this.request(
        params as VrfPoolRequestParams
      ).catch(async (error) => {
        await closeWebsocket();
        throw new Error(`Failed to call requestRandomness, ${error}`);
      });
    }

    const event = await eventPromise;
    await closeWebsocket();

    return [event, requestRandomnessSignature];
  }

  public getPermissionAccount(
    queuePubkey: PublicKey,
    queueAuthority: PublicKey
  ): [PermissionAccount, number] {
    return PermissionAccount.fromSeed(
      this.program,
      queueAuthority,
      queuePubkey,
      this.publicKey
    );
  }

  public getEscrow(): PublicKey {
    return this.program.mint.getAssociatedAddress(this.publicKey);
  }

  public async fetchBalance(escrow?: PublicKey): Promise<number> {
    const escrowPubkey =
      escrow ?? this.program.mint.getAssociatedAddress(this.publicKey);
    const escrowBalance = await this.program.mint.fetchBalance(escrowPubkey);
    if (escrowBalance === null) {
      throw new AccountNotFoundError("VrfPool Escrow", escrowPubkey);
    }
    return escrowBalance;
  }

  public async fundUpToInstruction(
    payer: PublicKey,
    fundUpTo: number,
    disableWrap = false
  ): Promise<[TransactionObject | undefined, number | undefined]> {
    const escrowPubkey = this.getEscrow();
    const balance = await this.fetchBalance(escrowPubkey);
    if (balance >= fundUpTo) {
      return [undefined, undefined];
    }

    const fundAmount = fundUpTo - balance;

    const depositTxn = await this.depositInstructions(payer, {
      amount: fundAmount,
      disableWrap,
    });
    return [depositTxn, fundAmount];
  }

  public async fundUpTo(
    payer: PublicKey,
    fundUpTo: number,
    disableWrap = false
  ): Promise<[TransactionSignature | undefined, number | undefined]> {
    const [fundUpToTxn, fundAmount] = await this.fundUpToInstruction(
      payer,
      fundUpTo,
      disableWrap
    );
    if (!fundUpToTxn) {
      return [undefined, undefined];
    }

    const txnSignature = await this.program.signAndSend(fundUpToTxn);
    return [txnSignature, fundAmount!];
  }
}
