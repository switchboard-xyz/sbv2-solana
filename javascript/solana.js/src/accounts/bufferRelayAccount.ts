import * as errors from '../errors';
import * as types from '../generated';
import { bufferRelayerSaveResult } from '../generated';
import { SwitchboardProgram } from '../SwitchboardProgram';
import {
  TransactionObject,
  TransactionObjectOptions,
} from '../TransactionObject';

import { Account, OnAccountChangeCallback } from './account';
import { JobAccount } from './jobAccount';
import { OracleAccount } from './oracleAccount';
import { PermissionAccount } from './permissionAccount';
import { QueueAccount } from './queueAccount';

import * as spl from '@solana/spl-token';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  Commitment,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
  TransactionSignature,
} from '@solana/web3.js';
import { BN, promiseWithTimeout } from '@switchboard-xyz/common';

/**
 * Account type holding a buffer of data sourced from the buffers sole {@linkcode JobAccount}. A buffer relayer has no consensus mechanism and relies on trusting an {@linkcode OracleAccount} to respond honestly. A buffer relayer has a max capacity of 500 bytes.
 *
 * Data: {@linkcode types.BufferRelayerAccountData}
 */
export class BufferRelayerAccount extends Account<types.BufferRelayerAccountData> {
  static accountName = 'BufferRelayerAccountData';

  /**
   * Returns the size of an on-chain {@linkcode BufferRelayerAccount}.
   */
  public get size(): number {
    return this.program.account.bufferRelayerAccountData.size;
  }

  public decode(data: Buffer): types.BufferRelayerAccountData {
    try {
      return types.BufferRelayerAccountData.decode(data);
    } catch {
      return this.program.coder.decode<types.BufferRelayerAccountData>(
        BufferRelayerAccount.accountName,
        data
      );
    }
  }

  /**
   * Invoke a callback each time a BufferRelayerAccount's data has changed on-chain.
   * @param callback - the callback invoked when the buffer relayer state changes
   * @param commitment - optional, the desired transaction finality. defaults to 'confirmed'
   * @returns the websocket subscription id
   */
  public onChange(
    callback: OnAccountChangeCallback<types.BufferRelayerAccountData>,
    commitment: Commitment = 'confirmed'
  ): number {
    return this.program.connection.onAccountChange(
      this.publicKey,
      accountInfo => {
        callback(this.decode(accountInfo.data));
      },
      commitment
    );
  }

  /** Load an existing BufferRelayer with its current on-chain state */
  public static async load(
    program: SwitchboardProgram,
    publicKey: PublicKey | string
  ): Promise<[BufferRelayerAccount, types.BufferRelayerAccountData]> {
    const account = new BufferRelayerAccount(
      program,
      typeof publicKey === 'string' ? new PublicKey(publicKey) : publicKey
    );
    const state = await account.loadData();
    return [account, state];
  }

  /**
   * Load and parse {@linkcode BufferRelayerAccount} data based on the program IDL.
   */
  public async loadData(): Promise<types.BufferRelayerAccountData> {
    const data = await types.BufferRelayerAccountData.fetch(
      this.program,
      this.publicKey
    );
    if (data === null)
      throw new errors.AccountNotFoundError('Buffer Relayer', this.publicKey);
    return data;
  }

  public static async createInstructions(
    program: SwitchboardProgram,
    payer: PublicKey,
    params: {
      name?: string;
      minUpdateDelaySeconds: number;
      queueAccount: QueueAccount;
      authority?: PublicKey;
      jobAccount: JobAccount;
      keypair?: Keypair;
    }
  ): Promise<[BufferRelayerAccount, TransactionObject]> {
    const keypair = params.keypair ?? Keypair.generate();
    program.verifyNewKeypair(keypair);

    const size = 2048;

    const ixns: TransactionInstruction[] = [];

    const escrow = program.mint.getAssociatedAddress(keypair.publicKey);

    ixns.push(
      SystemProgram.createAccount({
        fromPubkey: payer,
        newAccountPubkey: keypair.publicKey,
        space: size,
        lamports:
          await program.provider.connection.getMinimumBalanceForRentExemption(
            size
          ),
        programId: program.programId,
      })
    );

    ixns.push(
      types.bufferRelayerInit(
        program,
        {
          params: {
            name: [...Buffer.from(params.name ?? '', 'utf8').slice(0, 32)],
            minUpdateDelaySeconds: params.minUpdateDelaySeconds ?? 30,
            stateBump: program.programState.bump,
          },
        },
        {
          bufferRelayer: keypair.publicKey,
          escrow: escrow,
          authority: params.authority ?? payer,
          queue: params.queueAccount.publicKey,
          job: params.jobAccount.publicKey,
          programState: program.programState.publicKey,
          mint: program.mint.address,
          payer: payer,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        }
      )
    );

    return [
      new BufferRelayerAccount(program, keypair.publicKey),
      new TransactionObject(payer, ixns, [keypair]),
    ];
  }

  public static async create(
    program: SwitchboardProgram,
    params: {
      name?: string;
      minUpdateDelaySeconds: number;
      queueAccount: QueueAccount;
      authority?: PublicKey;
      jobAccount: JobAccount;
      keypair?: Keypair;
    }
  ): Promise<[BufferRelayerAccount, TransactionSignature]> {
    const [bufferAccount, bufferInit] =
      await BufferRelayerAccount.createInstructions(
        program,
        program.walletPubkey,
        params
      );
    const txnSignature = await program.signAndSend(bufferInit);
    return [bufferAccount, txnSignature];
  }

  public async openRoundInstructions(
    payer: PublicKey,
    params?: BufferRelayerOpenRoundParams
  ): Promise<TransactionObject> {
    const txns: TransactionObject[] = [];
    const bufferRelayer = params?.bufferRelayer ?? (await this.loadData());

    const queueAccount =
      params?.queueAccount ??
      new QueueAccount(this.program, bufferRelayer.queuePubkey);
    const queue = params?.queue ?? (await queueAccount.loadData());

    const openRoundAmount = this.program.mint.fromTokenAmountBN(queue.reward);

    let tokenWallet: PublicKey;
    if (params?.tokenWallet) {
      tokenWallet = params.tokenWallet;
      // check if we need to wrap any funds
      const tokenAccount = await getAccount(
        this.program.connection,
        tokenWallet
      );
      const tokenAmountBN = new BN(tokenAccount.amount.toString());
      if (tokenAmountBN.lt(queue.reward)) {
        const wrapTxn = await this.program.mint.wrapInstructions(payer, {
          fundUpTo: openRoundAmount,
        });
        txns.push(wrapTxn);
      }
    } else {
      const [userTokenWallet, txn] =
        await this.program.mint.getOrCreateWrappedUserInstructions(payer, {
          fundUpTo: openRoundAmount,
        });
      tokenWallet = userTokenWallet;
      if (txn !== undefined) {
        txns.push(txn);
      }
    }

    const [permissionAccount, permissionBump] = this.getPermissionAccount(
      queueAccount.publicKey,
      queue.authority
    );

    const openRoundTxn = new TransactionObject(
      payer,
      [
        createTransferInstruction(
          tokenWallet,
          bufferRelayer.escrow,
          payer,
          BigInt(queue.reward.toString())
        ),
        types.bufferRelayerOpenRound(
          this.program,
          {
            params: {
              stateBump: this.program.programState.bump,
              permissionBump,
            },
          },
          {
            bufferRelayer: this.publicKey,
            oracleQueue: queueAccount.publicKey,
            dataBuffer: queue.dataBuffer,
            permission: permissionAccount.publicKey,
            escrow: bufferRelayer.escrow,
            programState: this.program.programState.publicKey,
          }
        ),
      ],
      []
    );
    txns.push(openRoundTxn);

    const packed = TransactionObject.pack(txns);
    if (packed.length > 1) {
      throw new Error(`Failed to pack instructions into a single txn`);
    }

    return packed[0];
  }

  public async openRound(
    params?: BufferRelayerOpenRoundParams
  ): Promise<TransactionSignature> {
    const openRound = await this.openRoundInstructions(
      this.program.walletPubkey,
      params
    );
    const txnSignature = await this.program.signAndSend(openRound);
    return txnSignature;
  }

  public async openRoundAndAwaitResult(
    params: BufferRelayerOpenRoundParams,
    timeout = 30000
  ): Promise<[types.BufferRelayerAccountData, TransactionSignature]> {
    const bufferRelayer = params?.bufferRelayer ?? (await this.loadData());
    const currentRoundOpenSlot = bufferRelayer.currentRound.roundOpenSlot;

    let ws: number | undefined = undefined;

    const closeWebsocket = async () => {
      if (ws !== undefined) {
        await this.program.connection.removeAccountChangeListener(ws);
        ws = undefined;
      }
    };

    const statePromise: Promise<types.BufferRelayerAccountData> =
      promiseWithTimeout(
        timeout,
        new Promise(
          (
            resolve: (result: types.BufferRelayerAccountData) => void,
            reject: (reason: string) => void
          ) => {
            ws = this.onChange(bufferRelayer => {
              if (
                bufferRelayer.currentRound.roundOpenSlot.gt(
                  currentRoundOpenSlot
                ) &&
                bufferRelayer.currentRound.numSuccess > 0
              ) {
                resolve(bufferRelayer);
              }
            });
          }
        )
      ).finally(async () => {
        await closeWebsocket();
      });

    const openRoundSignature = await this.openRound(params);

    const state = await statePromise;

    await closeWebsocket();

    return [state, openRoundSignature];
  }

  public async saveResultInstructions(
    payer: PublicKey,
    params: BufferRelayerSaveResultParams,
    options?: TransactionObjectOptions
  ): Promise<TransactionObject> {
    const bufferRelayer = await this.loadData();

    const [queueAccount, queue] = await QueueAccount.load(
      this.program,
      bufferRelayer.queuePubkey
    );

    const { permissionAccount, permissionBump } = this.getAccounts(
      queueAccount,
      queue.authority
    );

    const [oracleAccount, oracle] = await OracleAccount.load(
      this.program,
      bufferRelayer.currentRound.oraclePubkey
    );

    return this.saveResultSyncInstructions(
      payer,
      {
        ...params,
        escrow: bufferRelayer.escrow,
        queueAccount: queueAccount,
        queueAuthority: queue.authority,
        queueDataBuffer: queue.dataBuffer,
        oracleAccount: oracleAccount,
        oracleAuthority: oracle.oracleAuthority,
        oracleTokenAccount: oracle.tokenAccount,
        permissionAccount: permissionAccount,
        permissionBump: permissionBump,
      },
      options
    );
  }

  public async saveResult(
    params: BufferRelayerSaveResultParams,
    options?: TransactionObjectOptions
  ): Promise<TransactionSignature> {
    const saveResult = await this.saveResultInstructions(
      this.program.walletPubkey,
      params,
      options
    );
    const txnSignature = await this.program.signAndSend(saveResult);
    return txnSignature;
  }

  public saveResultSyncInstructions(
    payer: PublicKey,
    params: BufferRelayerSaveResultSyncParams,
    options?: TransactionObjectOptions
  ): TransactionObject {
    const saveResultIxn = bufferRelayerSaveResult(
      this.program,
      {
        params: {
          stateBump: this.program.programState.bump,
          permissionBump: params.permissionBump,
          result: params.result,
          success: params.success,
        },
      },
      {
        bufferRelayer: this.publicKey,
        oracleAuthority: params.oracleAuthority,
        oracle: params.oracleAccount.publicKey,
        oracleQueue: params.queueAccount.publicKey,
        dataBuffer: params.queueDataBuffer,
        queueAuthority: params.queueAuthority,
        permission: params.permissionAccount.publicKey,
        escrow: params.escrow,
        programState: this.program.programState.publicKey,
        oracleWallet: params.oracleTokenAccount,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
      }
    );

    return new TransactionObject(payer, [saveResultIxn], [], options);
  }

  public async saveResultSync(
    params: BufferRelayerSaveResultSyncParams,
    options?: TransactionObjectOptions
  ): Promise<TransactionSignature> {
    const saveResult = await this.saveResultSyncInstructions(
      this.program.walletPubkey,
      params,
      options
    );
    const txnSignature = await this.program.signAndSend(saveResult);
    return txnSignature;
  }

  public getAccounts(queueAccount: QueueAccount, queueAuthority: PublicKey) {
    const [permissionAccount, permissionBump] = this.getPermissionAccount(
      queueAccount.publicKey,
      queueAuthority
    );

    return {
      queueAccount,
      permissionAccount,
      permissionBump,
    };
  }

  public async toAccountsJSON(
    _bufferRelayer?: types.BufferRelayerAccountData,
    _queueAccount?: QueueAccount,
    _queue?: types.OracleQueueAccountData
  ): Promise<BufferRelayerAccountsJSON> {
    const { bufferRelayer, queue, permission, escrow } =
      await this.fetchAccounts(_bufferRelayer, _queueAccount, _queue);

    return {
      publicKey: this.publicKey,
      balance: this.program.mint.fromTokenAmount(escrow.data.amount),
      ...bufferRelayer.data.toJSON(),
      queue: {
        publicKey: queue.publicKey,
        ...queue.data.toJSON(),
      },
      permission: {
        publicKey: permission.publicKey,
        ...permission.data.toJSON(),
        bump: permission.bump,
      },
    };
  }

  public async fetchAccounts(
    _bufferRelayer?: types.BufferRelayerAccountData,
    _queueAccount?: QueueAccount,
    _queue?: types.OracleQueueAccountData
  ): Promise<BufferRelayerAccounts> {
    const bufferRelayer = _bufferRelayer ?? (await this.loadData());

    const queueAccount =
      _queueAccount ??
      new QueueAccount(this.program, bufferRelayer.queuePubkey);
    const queue = _queue ?? (await queueAccount.loadData());

    const { permissionAccount, permissionBump } = this.getAccounts(
      queueAccount,
      queue.authority
    );
    const permission = await permissionAccount.loadData();

    const bufferEscrow = await this.program.mint.getAccount(
      bufferRelayer.escrow
    );
    if (!bufferEscrow) {
      throw new errors.AccountNotFoundError(
        'Buffer Relayer Escrow',
        bufferRelayer.escrow
      );
    }
    const vrfEscrowBalance: number = this.program.mint.fromTokenAmount(
      bufferEscrow.amount
    );

    return {
      bufferRelayer: { publicKey: this.publicKey, data: bufferRelayer },
      queue: {
        publicKey: queueAccount.publicKey,
        data: queue,
      },
      permission: {
        publicKey: permissionAccount.publicKey,
        bump: permissionBump,
        data: permission,
      },
      escrow: {
        publicKey: bufferRelayer.escrow,
        data: bufferEscrow,
        balance: vrfEscrowBalance,
      },
    };
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
}

export interface BufferRelayerInit {
  name?: string;
  minUpdateDelaySeconds: number;
  queueAccount: QueueAccount;
  authority?: PublicKey;
  jobAccount: JobAccount;
  keypair?: Keypair;
}

export type BufferRelayerAccounts = {
  bufferRelayer: {
    publicKey: PublicKey;
    data: types.BufferRelayerAccountData;
  };
  queue: {
    publicKey: PublicKey;
    data: types.OracleQueueAccountData;
  };
  permission: {
    publicKey: PublicKey;
    bump: number;
    data: types.PermissionAccountData;
  };
  escrow: {
    publicKey: PublicKey;
    data: spl.Account;
    balance: number;
  };
};

export type BufferRelayerAccountsJSON = types.BufferRelayerAccountDataJSON & {
  publicKey: PublicKey;
  balance: number;
  queue: types.OracleQueueAccountDataJSON & { publicKey: PublicKey };
  permission: types.PermissionAccountDataJSON & {
    bump: number;
    publicKey: PublicKey;
  };
};

export type BufferRelayerOpenRoundParams = {
  tokenWallet?: PublicKey;
  bufferRelayer?: types.BufferRelayerAccountData;
  queueAccount?: QueueAccount;
  queue?: types.OracleQueueAccountData;
};

export type BufferRelayerSaveResultParams = {
  result: Buffer;
  success: boolean;
};

export type BufferRelayerSaveResultSyncParams =
  BufferRelayerSaveResultParams & {
    escrow: PublicKey;
    queueAccount: QueueAccount;
    queueAuthority: PublicKey;
    queueDataBuffer: PublicKey;
    oracleAccount: OracleAccount;
    oracleAuthority: PublicKey;
    oracleTokenAccount: PublicKey;
    permissionAccount: PermissionAccount;
    permissionBump: number;
  };
