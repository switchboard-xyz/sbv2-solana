import { PublicKey } from "@solana/web3.js";
import * as chalk from "chalk";
import PrintBaseCommand from "../../PrintBaseCommand";

export default class Print extends PrintBaseCommand {
  static description =
    "find a switchboard account by public key for a given cluster";

  static flags = {
    ...PrintBaseCommand.flags,
  };

  static args = [
    {
      name: "publicKey",
      required: true,
      parse: (pubkey: string) => new PublicKey(pubkey),
      description: "public key of a switchboard account to lookup",
    },
  ];

  static examples = [
    "$ sbv2 print GhYg3R1V6DmJbwuc57qZeoYG6gUuvCotUF1zU3WCj98U",
  ];

  async run() {
    const { args } = this.parse(Print);
    const { publicKey } = args;

    console.log(`${chalk.green("############ DEVNET ############")}`);
    try {
      await this.printDevnetAccount(publicKey);
    } catch (error) {
      console.error(error.message);
    }

    console.log(`${chalk.green("############ MAINNET ############")}`);
    try {
      await this.printMainnetAccount(publicKey);
    } catch (error) {
      console.error(error.message);
    }
  }

  async catch(error) {
    super.catch(error, "failed to print switchboard account");
  }
}
