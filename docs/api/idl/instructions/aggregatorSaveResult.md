Oracle saving result for a feed update request to an aggregator round.

## Accounts
|Name|isMut|isSigner|Description|
|--|--|--|--|
| aggregator | TRUE | FALSE |  | 
| oracle | TRUE | FALSE |  | 
| oracleAuthority | FALSE | TRUE |  | 
| oracleQueue | FALSE | FALSE |  | 
| queueAuthority | FALSE | FALSE |  | 
| feedPermission | TRUE | FALSE |  | 
| oraclePermission | FALSE | FALSE |  | 
| lease | TRUE | FALSE |  | 
| escrow | TRUE | FALSE |  | 
| tokenProgram | FALSE | FALSE | The Solana token program account. | 
| programState | FALSE | FALSE | The Switchboard [SbState](/api/idl/accounts/SbState) account. | 
| historyBuffer | TRUE | FALSE |  | 
## Params
|Field|Type|Description|
|--|--|--|
| oracleIdx |  u32 |  |
| error |  bool |  |
| value |  [BorshDecimal](/api/idl/types/BorshDecimal) |  |
| jobsChecksum |  u8[32] |  |
| minResponse |  [BorshDecimal](/api/idl/types/BorshDecimal) |  |
| maxResponse |  [BorshDecimal](/api/idl/types/BorshDecimal) |  |
| feedPermissionBump |  u8 |  |
| oraclePermissionBump |  u8 |  |
| leaseBump |  u8 |  |
| stateBump |  u8 |  |
