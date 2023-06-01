/* eslint-disable no-unused-vars */
import "mocha";

import {
  AggregatorAccount,
  CrankAccount,
  PermissionAccount,
  QueueAccount,
  SwitchboardNetwork,
  types,
} from "../src/index.js";

import { setupTest, TestContext } from "./utils.js";

import { Keypair } from "@solana/web3.js";
import { OracleJob } from "@switchboard-xyz/common";
import assert from "assert";

describe("Transfer Tests", () => {
  let ctx: TestContext;

  //   const freshUser = Keypair.generate();

  const origQueueAuthority = Keypair.generate();
  let origQueueAccount: QueueAccount;
  let origCrankAccount: CrankAccount;

  const newQueueAuthority = Keypair.generate();
  let newQueueAccount: QueueAccount;
  let newCrankAccount: CrankAccount;

  const aggregatorAuthority = Keypair.generate();
  let aggregatorAccount: AggregatorAccount;

  before(async () => {
    ctx = await setupTest();

    const [accounts, signatures] = await SwitchboardNetwork.create(
      ctx.program,
      {
        name: "Queue-1",
        reward: 0,
        minStake: 0,
        unpermissionedFeeds: false,
        unpermissionedVrf: false,
        authority: origQueueAuthority,
        oracles: [
          {
            name: "Oracle-1",
            enable: true,
            queueAuthority: origQueueAuthority,
          },
        ],
        cranks: [{ name: "Crank-1", maxRows: 100 }],
      }
    );
    if (accounts.oracles.length < 1) {
      throw new Error(`Failed to create an oracle`);
    }
    if (accounts.cranks.length < 1) {
      throw new Error(`Failed to create a crank`);
    }
    origQueueAccount = accounts.queue.account;
    origCrankAccount = accounts.cranks[0].account;
    await accounts.oracles[0].account.heartbeat({
      queueAccount: accounts.queue.account,
      queueAuthority: origQueueAuthority.publicKey,
    });

    const [accounts2, signatures2] = await SwitchboardNetwork.create(
      ctx.program,
      {
        name: "Queue-2",
        reward: 0,
        minStake: 0,
        unpermissionedFeeds: false,
        unpermissionedVrf: false,
        authority: newQueueAuthority,
        oracles: [
          { name: "Oracle-2", enable: true, queueAuthority: newQueueAuthority },
        ],
        cranks: [{ name: "Crank-2", maxRows: 100 }],
      }
    );
    if (accounts2.oracles.length < 1) {
      throw new Error(`Failed to create an oracle`);
    }
    if (accounts2.cranks.length < 1) {
      throw new Error(`Failed to create a crank`);
    }
    newQueueAccount = accounts2.queue.account;
    newCrankAccount = accounts2.cranks[0].account;
    await accounts2.oracles[0].account.heartbeat({
      queueAccount: accounts2.queue.account,
      queueAuthority: newQueueAuthority.publicKey,
    });
  });

  it("Creates an aggregator on the orig queue and crank", async () => {
    [aggregatorAccount] = await origQueueAccount.createFeed({
      name: "Aggregator-1",
      authority: aggregatorAuthority.publicKey,
      batchSize: 1,
      minRequiredOracleResults: 1,
      minRequiredJobResults: 1,
      minUpdateDelaySeconds: 10,
      crankPubkey: origCrankAccount.publicKey,
      fundAmount: 0.65,
      enable: true,
      queueAuthority: origQueueAuthority,
      jobs: [
        {
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

    const aggregator = await aggregatorAccount.loadData();
    const accounts = await aggregatorAccount.fetchAccounts(
      aggregator,
      origQueueAccount
    );

    assert(
      accounts.aggregator.data.queuePubkey.equals(origQueueAccount.publicKey),
      `Incorrect queue, expected ${origQueueAccount.publicKey}, received ${accounts.aggregator.data.queuePubkey}`
    );
    assert(
      accounts.aggregator.data.crankPubkey.equals(origCrankAccount.publicKey),
      `Incorrect crank, expected ${origCrankAccount.publicKey}, received ${accounts.aggregator.data.crankPubkey}`
    );
    assert(
      accounts.lease.balance === 0.65,
      `Incorrect lease balance, expected 0.65, received ${accounts.lease.balance}`
    );
    assert(
      accounts.permission.data.permissions === 2,
      `Incorrect permissions, expected PermitOracleQueueUsage (2), received ${accounts.permission.data.permissions}`
    );
  });

  it("Transfers the aggregator to a new queue and crank along with its balances", async () => {
    if (!aggregatorAccount) {
      throw new Error(`No aggregatorAccount to transfer`);
    }

    const [userTokenAddress] = await ctx.program.mint.getOrCreateWrappedUser(
      ctx.program.walletPubkey,
      { fundUpTo: 1.25 }
    );

    const [permissionAccount, leaseAccount, signatures] =
      await aggregatorAccount.transferQueue({
        authority: aggregatorAuthority,
        newQueue: newQueueAccount,
        newCrank: newCrankAccount,
        enable: true,
        queueAuthority: newQueueAuthority,
        fundAmount: 1,
        funderTokenWallet: userTokenAddress,
      });

    const accounts = await aggregatorAccount.fetchAccounts();

    assert(
      accounts.permission.publicKey.equals(permissionAccount.publicKey),
      `Incorrect permission account, expected ${permissionAccount.publicKey}, received ${accounts.permission.publicKey}`
    );

    assert(
      accounts.aggregator.data.queuePubkey.equals(newQueueAccount.publicKey),
      `Incorrect queue, expected ${newQueueAccount.publicKey}, received ${accounts.aggregator.data.queuePubkey}`
    );
    assert(
      accounts.aggregator.data.crankPubkey.equals(newCrankAccount.publicKey),
      `Incorrect crank, expected ${newCrankAccount.publicKey}, received ${accounts.aggregator.data.crankPubkey}`
    );
    assert(
      accounts.lease.balance === 1.65,
      `Incorrect lease balance, expected 1.65, received ${accounts.lease.balance}`
    );
    assert(
      accounts.permission.data.permissions === 2,
      `Incorrect permissions, expected PermitOracleQueueUsage (2), received ${accounts.permission.data.permissions}`
    );
  });

  it("Transfers an aggregator to a new queue in sequence", async () => {
    const [aggregatorAccount] = await origQueueAccount.createFeed({
      name: "Aggregator-2",
      authority: aggregatorAuthority.publicKey,
      batchSize: 1,
      minRequiredOracleResults: 1,
      minRequiredJobResults: 1,
      minUpdateDelaySeconds: 10,
      crankPubkey: origCrankAccount.publicKey,
      fundAmount: 0.25,
      enable: true,
      queueAuthority: origQueueAuthority,
      jobs: [
        {
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

    const [userTokenAddress] = await ctx.program.mint.getOrCreateWrappedUser(
      ctx.program.walletPubkey,
      { fundUpTo: 1.25 }
    );

    const [permissionAccount, leaseAccount] =
      await aggregatorAccount.transferQueuePart1({
        newQueue: newQueueAccount,
        fundAmount: 0.75,
        funderTokenWallet: userTokenAddress,
      });

    await aggregatorAccount.transferQueuePart2({
      newQueue: newQueueAccount,
      enable: true,
      queueAuthority: newQueueAuthority,
    });

    await aggregatorAccount.transferQueuePart3({
      newQueue: newQueueAccount,
      authority: aggregatorAuthority,
      newCrank: newCrankAccount,
    });

    const accounts = await aggregatorAccount.fetchAccounts();

    assert(
      accounts.aggregator.data.queuePubkey.equals(newQueueAccount.publicKey),
      `Incorrect queue, expected ${newQueueAccount.publicKey}, received ${accounts.aggregator.data.queuePubkey}`
    );
    assert(
      accounts.aggregator.data.crankPubkey.equals(newCrankAccount.publicKey),
      `Incorrect crank, expected ${newCrankAccount.publicKey}, received ${accounts.aggregator.data.crankPubkey}`
    );
    assert(
      accounts.lease.balance === 1,
      `Incorrect lease balance, expected 1.0, received ${accounts.lease.balance}`
    );
    assert(
      accounts.permission.data.permissions === 2,
      `Incorrect permissions, expected PermitOracleQueueUsage (2), received ${accounts.permission.data.permissions}`
    );
  });

  it("Transfers the aggregator to a new queue and crank with an existing permission account", async () => {
    const myAggregatorAuthority = Keypair.generate();
    const [myAggregatorAccount] = await origQueueAccount.createFeed({
      name: "Aggregator-2",
      authority: myAggregatorAuthority.publicKey,
      batchSize: 1,
      minRequiredOracleResults: 1,
      minRequiredJobResults: 1,
      minUpdateDelaySeconds: 10,
      crankPubkey: origCrankAccount.publicKey,
      fundAmount: 0.65,
      enable: true,
      queueAuthority: origQueueAuthority,
      jobs: [
        {
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

    const [newPermissionAccount] = await PermissionAccount.create(ctx.program, {
      granter: newQueueAccount.publicKey,
      grantee: myAggregatorAccount.publicKey,
      authority: newQueueAuthority.publicKey,
    });
    await newPermissionAccount.set({
      permission: new types.SwitchboardPermission.PermitOracleQueueUsage(),
      enable: true,
      queueAuthority: newQueueAuthority,
    });

    await myAggregatorAccount.transferQueue({
      newQueue: newQueueAccount,
      newCrank: newCrankAccount,
      authority: myAggregatorAuthority,
      enable: false,
      fundAmount: 0,
    });

    const accounts = await myAggregatorAccount.fetchAccounts();

    assert(
      accounts.aggregator.data.queuePubkey.equals(newQueueAccount.publicKey),
      `Incorrect queue, expected ${origQueueAccount.publicKey}, received ${accounts.aggregator.data.queuePubkey}`
    );
    assert(
      accounts.aggregator.data.crankPubkey.equals(newCrankAccount.publicKey),
      `Incorrect crank, expected ${origCrankAccount.publicKey}, received ${accounts.aggregator.data.crankPubkey}`
    );
    assert(
      accounts.lease.balance === 0.65,
      `Incorrect lease balance, expected 0.65, received ${accounts.lease.balance}`
    );
    assert(
      accounts.permission.data.permissions === 2,
      `Incorrect permissions, expected PermitOracleQueueUsage (2), received ${accounts.permission.data.permissions}`
    );
  });
});
