import { Keypair } from "@solana/web3.js";
import * as chalk from "chalk";
import fs from "fs";
import path from "path";
import { pubKeyConverter } from "../../accounts";
import { DEFAULT_LOGGER, LogProvider } from "./logging";

export class FsProvider {
  dataDir: string;

  keypairPath: string;

  logger: LogProvider;

  constructor(dataDirectory: string, logger = DEFAULT_LOGGER) {
    this.logger = logger;
    this.dataDir = dataDirectory;
    this.keypairPath = path.join(this.dataDir, ".keypairs");
    fs.mkdirSync(this.keypairPath, { recursive: true });
  }

  saveKeypair(keypair: Keypair): void {
    const keypairFullPath = path.join(
      this.keypairPath,
      `${keypair.publicKey}.json`
    );

    this.logger.debug(
      `${chalk.green("saved job keypair to:")} ${keypairFullPath}`
    );
    fs.writeFileSync(keypairFullPath, `[${keypair.secretKey}]`);
  }

  loadKeypair(publicKey: string): Keypair | undefined {
    const keypairFullPath = path.join(this.keypairPath, `${publicKey}.json`);

    if (fs.existsSync(keypairFullPath)) {
      const u8Array = new Uint8Array(
        JSON.parse(fs.readFileSync(keypairFullPath, "utf-8"))
      );

      return Keypair.fromSecretKey(u8Array);
    }
  }

  saveAccount(file: string, account: any): void {
    fs.writeFileSync(file, JSON.stringify(account, pubKeyConverter, 2));
  }
}

// export const DEFAULT_KEYPAIR_PROVIDER = new FsProvider(".");
