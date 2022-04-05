<b>Size: </b>3851 Bytes<br /><b>Rent Exemption: </b>0.027693840 SOL<br /><br />

| Field | Type | Description |
|--|--|--|
| name |  u8[32] | Name of the aggregator to store on-chain. |
| metadata |  u8[128] | Metadata of the aggregator to store on-chain. |
| authorWallet |  publicKey | An optional wallet for receiving kickbacks from job usage in feeds. Defaults to token vault. |
| queuePubkey |  publicKey | Pubkey of the queue the aggregator belongs to |
| oracleRequestBatchSize |  u32 | Number of oracles assigned to an update request |
| minOracleResults |  u32 | Minimum number of oracle responses required before a round is validated. |
| minJobResults |  u32 | Minimum number of job results before an oracle accepts a result |
| minUpdateDelaySeconds |  u32 | Minimum number of seconds required between aggregator rounds. |
| startAfter |  i64 | unix_timestamp for which no feed update will occur before. |
| varianceThreshold |  [SwitchboardDecimal](/api/idl/types/SwitchboardDecimal) | Change percentage required between a previous round and the current round. If variance percentage is not met, reject new oracle responses. |
| forceReportPeriod |  i64 | Number of seconds for which, even if the variance threshold is not passed, accept new responses from oracles. |
| expiration |  i64 | Timestamp when the feed is no longer needed |
| consecutiveFailureCount |  u64 | Counter for the number of consecutive failures before a feed is removed from a queue. If set to 0, failed feeds will remain on the queue. |
| nextAllowedUpdateTime |  i64 | Timestamp when the next update request will be available |
| isLocked |  bool | Flag for whether an aggregators configuration is locked for editing |
| crankPubkey |  publicKey | Optional, public key of the crank the aggregator is currently using. Event based feeds do not need a crank. |
| latestConfirmedRound |  [AggregatorRound](/api/idl/types/AggregatorRound) | Latest confirmed update request result that has been accepted as valid. |
| currentRound |  [AggregatorRound](/api/idl/types/AggregatorRound) | Oracle results from the current round of update request that has not been accepted as valid yet |
| jobPubkeysData |  publicKey[16] | List of public keys containing the job definitions for how data is sourced off-chain by oracles |
| jobHashes |  [Hash](/api/idl/types/Hash)[16] | Used to protect against malicious RPC nodes providing incorrect task definitions to oracles before fulfillment |
| jobPubkeysSize |  u32 | Number of jobs assigned to an oracle |
| jobsChecksum |  u8[32] | Used to protect against malicious RPC nodes providing incorrect task definitions to oracles before fulfillment |
| authority |  publicKey | The account delegated as the authority to for changing configs or withdrawing from a lease. |
| historyBuffer |  publicKey | Optional, public key of a history buffer account storing the last N accepted results and their timestamps. |
| ebuf |  u8[192] | Reserved |
