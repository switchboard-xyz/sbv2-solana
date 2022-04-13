import { flags } from "@oclif/command";
import { PublicKey } from "@solana/web3.js";
import { AggregatorAccount } from "@switchboard-xyz/switchboard-v2";
import * as chalk from "chalk";
import BaseCommand from "../../../BaseCommand";
import { CHECK_ICON, verifyProgramHasPayer } from "../../../utils";

export default class AggregatorSetBatchSize extends BaseCommand {
  static description = "set an aggregator's batch size";

  static flags = {
    ...BaseCommand.flags,
    authority: flags.string({
      char: "a",
      description: "alternate keypair that is the authority for the aggregator",
    }),
  };

  static args = [
    {
      name: "aggregatorKey",
      required: true,
      parse: (pubkey: string) => new PublicKey(pubkey),
      description: "public key of the aggregator account",
    },
    {
      name: "batchSize",
      required: true,
      description: "number of oracles requested for each open round call",
    },
  ];

  //   static examples = ["$ sbv2 aggregator:set:authority"];

  async run() {
    const { args, flags } = this.parse(AggregatorSetBatchSize);
    verifyProgramHasPayer(this.program);

    const batchSize = Number.parseInt(args.batchSize, 10);
    if (batchSize <= 0 || batchSize > 16) {
      throw new Error(`Invalid batch size (1 - 16), ${batchSize}`);
    }

    const aggregatorAccount = new AggregatorAccount({
      program: this.program,
      publicKey: args.aggregatorKey,
    });
    const aggregator = await aggregatorAccount.loadData();
    const authority = await this.loadAuthority(
      flags.authority,
      aggregator.authority
    );

    const txn = await aggregatorAccount.setBatchSize({
      authority,
      batchSize,
    });

    if (this.silent) {
      console.log(txn);
    } else {
      this.logger.log(
        `${chalk.green(
          `${CHECK_ICON}Aggregator batch size set successfully\r\n`
        )}`
      );
      this.logger.log(`https://solscan.io/tx/${txn}?cluster=${this.cluster}`);
    }
  }

  async catch(error) {
    super.catch(error, "failed to set aggregator batch size");
  }
}
