import * as anchor from "@project-serum/anchor";
import { strict as assert } from "assert";
import Big from "big.js";
import SwitchboardProgram from "../src";

describe("Switchboard V2 Lite Test", () => {
  let sbv2: SwitchboardProgram;

  before(async () => {
    // TODO: Add try catch block to check devnet environment accounts
    sbv2 = await SwitchboardProgram.loadMainnet();
  });

  it("fetches and decodes SOL/USD mainnet aggregator", async () => {
    const accountInfo = await sbv2.program.provider.connection.getAccountInfo(
      solAggregatorPubkey
    );
    if (!accountInfo) {
      throw new Error(`failed to fetch account info`);
    }

    // Get latest value if its been updated in the last 300 seconds
    const latestResult = sbv2.decodeLatestAggregatorValue(accountInfo, 300);
    if (latestResult === null) {
      throw new Error(`failed to fetch latest result for aggregator`);
    }
    assert(latestResult instanceof Big, "latest result is not a big.js object");
    assert(
      latestResult.toNumber() >= 0,
      "latest result is less than or equal to 0"
    );
  });

  it("decodes SOL/USD aggregator", async () => {
    const aggregator = sbv2.decodeAggregator(solAggregatorAccountInfo);

    const latestResult = sbv2.decodeLatestAggregatorValue(
      solAggregatorAccountInfo
    );
    if (latestResult === null) {
      throw new Error(`failed to fetch latest result for aggregator`);
    }
    assert(latestResult instanceof Big, "latest result is not a big.js object");
    assert(
      latestResult.toNumber() === 104.967865328125,
      "latest result is not equal to expected value of 104.967865328125"
    );
  });

  it("fails to decode stale aggregator", async () => {
    const latestResult = sbv2.decodeLatestAggregatorValue(
      solAggregatorAccountInfo,
      300
    );
    assert(
      latestResult === null,
      "aggregator should return null if value is more than 300s old"
    );
  });
});

const solAggregatorAccountInfo: anchor.web3.AccountInfo<Buffer> = {
  data: Buffer.from([
    217, 230, 65, 101, 201, 162, 27, 125, 83, 79, 76, 95, 85, 83, 68, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    254, 83, 137, 67, 40, 165, 83, 155, 80, 27, 250, 104, 141, 83, 132, 233, 58,
    21, 213, 37, 206, 133, 134, 11, 167, 160, 205, 213, 5, 110, 232, 148, 33,
    220, 163, 22, 231, 144, 81, 75, 91, 144, 77, 37, 153, 183, 156, 217, 79, 99,
    143, 60, 146, 199, 29, 200, 242, 61, 250, 67, 81, 245, 189, 99, 3, 0, 0, 0,
    2, 0, 0, 0, 1, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 114, 88, 96, 98, 0, 0, 0, 0, 0,
    232, 48, 130, 157, 109, 192, 148, 28, 222, 236, 197, 193, 185, 28, 120, 114,
    223, 110, 18, 68, 255, 63, 82, 34, 211, 20, 254, 125, 247, 195, 0, 190, 2,
    0, 0, 0, 0, 0, 0, 0, 0, 216, 184, 200, 7, 0, 0, 0, 0, 108, 88, 96, 98, 0, 0,
    0, 0, 226, 211, 65, 91, 173, 186, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 0, 0, 0,
    0, 0, 221, 178, 249, 215, 167, 146, 206, 248, 90, 0, 0, 0, 0, 0, 28, 0, 0,
    0, 111, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 45, 134,
    16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 32, 199, 151, 80,
    108, 73, 163, 195, 33, 198, 249, 191, 21, 162, 83, 134, 106, 247, 198, 82,
    36, 86, 177, 202, 241, 190, 232, 37, 55, 41, 29, 163, 222, 100, 183, 122,
    190, 54, 183, 109, 12, 229, 164, 70, 125, 112, 97, 247, 188, 14, 113, 24,
    176, 15, 175, 208, 157, 159, 107, 244, 41, 209, 227, 55, 231, 82, 60, 73, 4,
    36, 138, 53, 16, 25, 166, 74, 76, 144, 202, 226, 183, 187, 50, 183, 15, 179,
    60, 128, 97, 204, 166, 164, 161, 196, 113, 97, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 163, 37, 143, 62, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 105,
    228, 200, 58, 140, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0,
    216, 184, 200, 7, 0, 0, 0, 0, 108, 88, 96, 98, 0, 0, 0, 0, 226, 211, 65, 91,
    173, 186, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 0, 0, 0, 0, 0, 221, 178, 249,
    215, 167, 146, 206, 248, 90, 0, 0, 0, 0, 0, 28, 0, 0, 0, 111, 0, 16, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 45, 134, 16, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 32, 199, 151, 80, 108, 73, 163, 195, 33,
    198, 249, 191, 21, 162, 83, 134, 106, 247, 198, 82, 36, 86, 177, 202, 241,
    190, 232, 37, 55, 41, 29, 163, 222, 100, 183, 122, 190, 54, 183, 109, 12,
    229, 164, 70, 125, 112, 97, 247, 188, 14, 113, 24, 176, 15, 175, 208, 157,
    159, 107, 244, 41, 209, 227, 55, 231, 82, 60, 73, 4, 36, 138, 53, 16, 25,
    166, 74, 76, 144, 202, 226, 183, 187, 50, 183, 15, 179, 60, 128, 97, 204,
    166, 164, 161, 196, 113, 97, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    163, 37, 143, 62, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 105, 228, 200, 58, 140,
    9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    212, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 212, 48, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 142, 45, 185, 18, 195, 245, 198, 216,
    233, 244, 18, 45, 14, 178, 93, 34, 177, 51, 25, 116, 102, 136, 188, 191,
    157, 71, 47, 158, 238, 28, 135, 110, 82, 134, 175, 95, 239, 3, 109, 92, 42,
    64, 56, 180, 32, 227, 236, 51, 157, 192, 153, 42, 190, 45, 255, 202, 12,
    242, 92, 15, 11, 14, 177, 185, 33, 246, 102, 130, 36, 106, 21, 161, 247,
    205, 155, 14, 124, 142, 3, 168, 151, 84, 181, 87, 173, 190, 106, 59, 132,
    136, 154, 229, 166, 218, 27, 254, 15, 12, 81, 31, 191, 153, 61, 184, 173,
    48, 160, 244, 41, 218, 75, 26, 56, 127, 150, 233, 41, 239, 214, 129, 194,
    98, 70, 104, 108, 76, 201, 199, 1, 114, 138, 67, 214, 204, 45, 81, 248, 201,
    102, 170, 130, 118, 159, 46, 111, 203, 207, 41, 179, 92, 83, 44, 137, 83,
    37, 172, 244, 190, 204, 148, 44, 144, 244, 196, 3, 215, 109, 102, 136, 14,
    91, 35, 45, 207, 101, 215, 32, 16, 32, 145, 151, 95, 213, 34, 67, 159, 141,
    241, 95, 34, 37, 27, 250, 181, 234, 77, 97, 0, 151, 71, 1, 11, 13, 80, 72,
    110, 160, 244, 210, 106, 163, 148, 141, 44, 186, 37, 238, 148, 24, 174, 95,
    4, 43, 72, 73, 105, 234, 83, 27, 132, 156, 157, 168, 18, 141, 66, 18, 10,
    180, 34, 74, 131, 207, 12, 238, 147, 14, 127, 12, 189, 235, 223, 218, 207,
    136, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 72, 145, 18, 6, 17, 49, 126, 4, 68, 220, 147, 77,
    236, 138, 17, 39, 208, 107, 24, 211, 125, 170, 224, 128, 61, 223, 155, 37,
    149, 160, 11, 221, 174, 189, 225, 195, 114, 46, 165, 44, 213, 21, 155, 29,
    127, 14, 92, 73, 55, 26, 92, 23, 240, 56, 241, 200, 215, 196, 7, 201, 132,
    3, 99, 100, 225, 234, 208, 159, 177, 21, 205, 255, 192, 147, 93, 2, 96, 63,
    242, 200, 155, 213, 219, 243, 20, 253, 69, 114, 48, 237, 214, 59, 37, 39,
    77, 198, 171, 28, 164, 16, 10, 131, 26, 12, 190, 150, 68, 188, 48, 252, 199,
    156, 19, 116, 207, 255, 225, 136, 26, 230, 90, 112, 2, 0, 229, 167, 169,
    171, 197, 211, 123, 234, 255, 110, 0, 86, 32, 135, 64, 158, 98, 179, 86, 87,
    140, 208, 163, 129, 164, 90, 15, 76, 168, 62, 27, 170, 36, 159, 225, 233,
    167, 162, 101, 176, 19, 52, 14, 195, 66, 178, 53, 218, 155, 89, 174, 252,
    122, 165, 166, 113, 184, 60, 102, 207, 206, 3, 120, 64, 107, 228, 234, 49,
    189, 236, 79, 136, 142, 206, 151, 242, 234, 167, 95, 96, 237, 99, 153, 188,
    43, 63, 191, 63, 185, 119, 37, 39, 1, 114, 48, 47, 174, 23, 83, 57, 99, 58,
    84, 135, 120, 90, 129, 130, 178, 93, 98, 36, 16, 7, 22, 86, 238, 55, 78,
    184, 132, 246, 30, 109, 138, 157, 70, 169, 207, 203, 214, 171, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 8, 0, 0, 0, 211, 99, 128, 93, 12, 140, 85, 191, 58, 26, 142, 190, 248,
    72, 216, 45, 94, 39, 1, 153, 200, 155, 92, 125, 159, 237, 129, 71, 26, 9,
    215, 164, 236, 129, 16, 81, 18, 162, 87, 214, 29, 244, 207, 95, 19, 238, 10,
    27, 1, 145, 151, 200, 197, 52, 59, 79, 42, 126, 200, 132, 106, 226, 44, 26,
    193, 211, 158, 16, 56, 168, 103, 76, 155, 255, 160, 102, 203, 171, 43, 147,
    5, 136, 255, 154, 90, 206, 174, 147, 168, 217, 240, 103, 28, 252, 117, 64,
    241, 135, 8, 125, 137, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 90,
    184, 200, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]),
  executable: false,
  lamports: 27693840,
  owner: SwitchboardProgram.mainnetPid,
  rentEpoch: 302,
};

const solAggregatorPubkey = new anchor.web3.PublicKey(
  "GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR"
);
