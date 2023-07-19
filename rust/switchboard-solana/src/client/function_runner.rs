use crate::prelude::*;
use anchor_lang::solana_program::instruction::Instruction;
use anchor_lang::solana_program::message::Message;
use anchor_lang::solana_program::pubkey::Pubkey;
use hex;
use sgx_quote::Quote;
use solana_client::rpc_client::RpcClient;
use solana_sdk::commitment_config::CommitmentConfig;
use solana_sdk::signer::keypair::Keypair;
use std::env;
use std::result::Result;
use std::sync::Arc;
use switchboard_common::ChainResultInfo::Solana;
use switchboard_common::SOLFunctionResult;

#[derive(Clone)]
pub struct FunctionRunner {
    pub client: Arc<RpcClient>,

    signer_keypair: Arc<Keypair>,
    pub signer: Pubkey,

    pub function: Pubkey,
    pub function_data: Box<FunctionAccountData>,

    pub fn_request_key: Pubkey,
    pub fn_request_data: Box<FunctionRequestAccountData>,

    pub payer: Pubkey,
    pub verifier: Pubkey,
    pub reward_receiver: Pubkey,
}

impl std::fmt::Display for FunctionRunner {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "SwitchboardFunctionRunner: url: {}, signer: {}, function: {}, verifier: {}",
            self.client.url(),
            self.signer,
            self.function,
            self.verifier,
        )
    }
}

impl FunctionRunner {
    pub fn new_with_client(client: RpcClient) -> Result<Self, SwitchboardClientError> {
        let signer_keypair = generate_signer();
        let signer = signer_to_pubkey(signer_keypair.clone())?;

        let function = load_env_pubkey("FUNCTION_KEY")?;
        let function_data = *bytemuck::try_from_bytes(
            &hex::decode(env::var("FUNCTION_DATA").unwrap_or_default()).unwrap_or_default(),
        )
        .unwrap_or(&Default::default());

        let fn_request_key = load_env_pubkey("FUNCTION_REQUEST_KEY").unwrap_or_default();
        let fn_request_data = FunctionRequestAccountData::try_from_slice(
            &hex::decode(env::var("FUNCTION_REQUEST_DATA").unwrap_or_default()).unwrap_or_default(),
        )
        .unwrap_or_default();

        let payer = load_env_pubkey("PAYER")?;
        let verifier = load_env_pubkey("VERIFIER")?;
        let reward_receiver = load_env_pubkey("REWARD_RECEIVER")?;

        Ok(Self {
            client: Arc::new(client),
            signer_keypair,
            signer,
            function,
            function_data: Box::new(function_data),
            fn_request_key,
            fn_request_data: Box::new(fn_request_data),
            payer,
            verifier,
            reward_receiver,
        })
    }

    pub fn new(
        url: &str,
        commitment: Option<CommitmentConfig>,
    ) -> Result<Self, SwitchboardClientError> {
        Self::new_with_client(RpcClient::new_with_commitment(
            url,
            commitment.unwrap_or_default(),
        ))
    }

    pub fn new_from_cluster(
        cluster: Cluster,
        commitment: Option<CommitmentConfig>,
    ) -> Result<Self, SwitchboardClientError> {
        Self::new(cluster.url(), commitment)
    }

    async fn build_fn_verify_ixn(
        &self,
        mr_enclave: MrEnclave,
    ) -> Result<Instruction, SwitchboardClientError> {
        let current_time = unix_timestamp();

        let fn_data: FunctionAccountData =
            FunctionAccountData::fetch(&self.client, self.function).await?;

        let verifier_quote: VerifierAccountData =
            VerifierAccountData::fetch(&self.client, self.verifier).await?;

        let queue_data: AttestationQueueAccountData =
            crate::client::load_account(&self.client, fn_data.attestation_queue).await?;

        let verifier_permission = AttestationPermissionAccountData::get_pda(
            &queue_data.authority,
            &fn_data.attestation_queue,
            &self.verifier,
        );

        let maybe_next_allowed_timestamp = fn_data.get_next_execution_datetime();
        let next_allowed_timestamp: i64 = if maybe_next_allowed_timestamp.is_some() {
            maybe_next_allowed_timestamp.unwrap().timestamp()
        } else {
            i64::MAX
        };

        let ixn_params = FunctionVerifyParams {
            observed_time: current_time,
            next_allowed_timestamp,
            is_failure: false,
            mr_enclave,
        };

        let accounts = FunctionVerifyAccounts {
            function: self.function,
            function_enclave_signer: self.signer,
            verifier_quote: self.verifier,
            verifier_enclave_signer: verifier_quote.enclave.enclave_signer,
            verifier_permission,
            escrow_wallet: fn_data.escrow_wallet,
            escrow_token_wallet: fn_data.escrow_token_wallet,
            attestation_queue: fn_data.attestation_queue,
            receiver: self.reward_receiver,
        };
        let ixn: Instruction = accounts.get_instruction(ixn_params)?;
        Ok(ixn)
    }

    async fn build_fn_request_verify_ixn(
        &self,
        mr_enclave: MrEnclave,
    ) -> Result<Instruction, SwitchboardClientError> {
        let current_time = unix_timestamp();

        let fn_request_data: FunctionRequestAccountData =
            FunctionRequestAccountData::fetch(&self.client, self.fn_request_key).await?;

        if self.function != fn_request_data.function {
            return Err(SwitchboardClientError::CustomMessage(
                "function key mismatch".to_string(),
            ));
        }

        let fn_data: FunctionAccountData =
            FunctionAccountData::fetch(&self.client, self.function).await?;

        let verifier_quote: VerifierAccountData =
            VerifierAccountData::fetch(&self.client, self.verifier).await?;

        let queue_data: AttestationQueueAccountData =
            crate::client::load_account(&self.client, fn_data.attestation_queue).await?;

        let verifier_permission = AttestationPermissionAccountData::get_pda(
            &queue_data.authority,
            &fn_data.attestation_queue,
            &self.verifier,
        );

        let ixn_params = FunctionRequestVerifyParams {
            observed_time: current_time,
            is_failure: false,
            mr_enclave,
            request_slot: fn_request_data.active_request.request_slot,
            container_params_hash: fn_request_data.container_params_hash,
        };

        let (state_pubkey, _state_bump) =
            Pubkey::find_program_address(&[STATE_SEED], &SWITCHBOARD_ATTESTATION_PROGRAM_ID);

        let accounts = FunctionRequestVerifyAccounts {
            request: self.fn_request_key,
            function_enclave_signer: self.signer,
            token_wallet: fn_request_data.escrow,
            function: self.function,
            function_escrow: fn_data.escrow_token_wallet,
            verifier_quote: self.verifier,
            verifier_enclave_signer: verifier_quote.enclave.enclave_signer,
            verifier_permission,
            state: state_pubkey,
            attestation_queue: fn_data.attestation_queue,
            receiver: self.reward_receiver,
        };
        let ixn: Instruction = accounts.get_instruction(ixn_params)?;
        Ok(ixn)
    }

    async fn get_result(
        &self,
        mut ixs: Vec<Instruction>,
    ) -> Result<FunctionResult, SwitchboardClientError> {
        let quote_raw = Gramine::generate_quote(&self.signer.to_bytes()).unwrap();
        let quote = Quote::parse(&quote_raw).unwrap();
        let mr_enclave: MrEnclave = quote.isv_report.mrenclave.try_into().unwrap();

        let verify_ixn = if self.fn_request_key == Pubkey::default() {
            self.build_fn_verify_ixn(mr_enclave).await?
        } else {
            println!("request detected!");
            self.build_fn_request_verify_ixn(mr_enclave).await?
        };
        ixs.insert(0, verify_ixn);
        let message = Message::new(&ixs, Some(&self.payer));
        let blockhash = self.client.get_latest_blockhash().unwrap();
        let mut tx = solana_sdk::transaction::Transaction::new_unsigned(message);
        tx.partial_sign(&[self.signer_keypair.as_ref()], blockhash);

        Ok(FunctionResult {
            version: 1,
            quote: quote_raw,
            fn_key: self.function.to_bytes().into(),
            signer: self.signer.to_bytes().into(),
            fn_request_key: self.fn_request_key.to_bytes().into(),
            fn_request_hash: Vec::new(),
            chain_result_info: Solana(SOLFunctionResult {
                serialized_tx: bincode::serialize(&tx).unwrap(),
            }),
        })
    }

    pub async fn emit(&self, ixs: Vec<Instruction>) -> Result<(), SwitchboardClientError> {
        self.get_result(ixs)
            .await
            .map_err(|e| SwitchboardClientError::CustomError {
                message: "failed to run function verify".to_string(),
                source: std::sync::Arc::new(e),
            })
            .unwrap()
            .emit();

        Ok(())
    }
}

// Useful for building ixns on the client side
pub struct FunctionVerifyAccounts {
    pub function: Pubkey,
    pub function_enclave_signer: Pubkey,
    pub verifier_quote: Pubkey,
    pub verifier_enclave_signer: Pubkey,
    pub verifier_permission: Pubkey,
    pub escrow_wallet: Pubkey,
    pub escrow_token_wallet: Pubkey,
    pub receiver: Pubkey,
    pub attestation_queue: Pubkey,
}
impl FunctionVerifyAccounts {
    pub fn get_instruction(
        &self,
        params: FunctionVerifyParams,
    ) -> std::result::Result<Instruction, SwitchboardClientError> {
        let accounts = self.to_account_metas(None);
        let mut data: Vec<u8> = FunctionVerify::discriminator().try_to_vec().map_err(|_| {
            SwitchboardClientError::CustomMessage(
                "failed to get function_verify discriminator".to_string(),
            )
        })?;
        let mut param_vec: Vec<u8> = params.try_to_vec().map_err(|_| {
            SwitchboardClientError::CustomMessage(
                "failed to serialize function_verify ixn data".to_string(),
            )
        })?;
        data.append(&mut param_vec);

        let instruction =
            Instruction::new_with_bytes(SWITCHBOARD_ATTESTATION_PROGRAM_ID, &data, accounts);
        Ok(instruction)
    }
}

impl ToAccountMetas for FunctionVerifyAccounts {
    fn to_account_metas(&self, _: Option<bool>) -> Vec<AccountMeta> {
        vec![
            AccountMeta::new(self.function, false),
            AccountMeta::new_readonly(self.function_enclave_signer, true),
            AccountMeta::new_readonly(self.verifier_quote, false),
            AccountMeta::new_readonly(self.verifier_enclave_signer, true),
            AccountMeta::new_readonly(self.verifier_permission, false),
            AccountMeta::new_readonly(self.escrow_wallet, false),
            AccountMeta::new(self.escrow_token_wallet, false),
            AccountMeta::new(self.receiver, false),
            AccountMeta::new_readonly(self.attestation_queue, false),
            AccountMeta::new_readonly(anchor_spl::token::ID, false),
        ]
    }
}
pub struct FunctionRequestVerifyAccounts {
    pub request: Pubkey,
    pub function_enclave_signer: Pubkey,
    pub token_wallet: Pubkey,
    pub function: Pubkey,
    pub function_escrow: Pubkey,
    pub verifier_quote: Pubkey,
    pub verifier_enclave_signer: Pubkey,
    pub verifier_permission: Pubkey,
    pub receiver: Pubkey,
    pub state: Pubkey,
    pub attestation_queue: Pubkey,
}
impl FunctionRequestVerifyAccounts {
    pub fn get_instruction(
        &self,
        params: FunctionRequestVerifyParams,
    ) -> std::result::Result<Instruction, SwitchboardClientError> {
        let accounts = self.to_account_metas(None);
        let mut data: Vec<u8> = FunctionRequestVerify::discriminator()
            .try_to_vec()
            .map_err(|_| {
                SwitchboardClientError::CustomMessage(
                    "failed to get function_request_verify discriminator".to_string(),
                )
            })?;
        let mut param_vec: Vec<u8> = params.try_to_vec().map_err(|_| {
            SwitchboardClientError::CustomMessage(
                "failed to serialize function_request_verify ixn data".to_string(),
            )
        })?;
        data.append(&mut param_vec);

        let instruction =
            Instruction::new_with_bytes(SWITCHBOARD_ATTESTATION_PROGRAM_ID, &data, accounts);
        Ok(instruction)
    }
}

impl ToAccountMetas for FunctionRequestVerifyAccounts {
    fn to_account_metas(&self, _: Option<bool>) -> Vec<AccountMeta> {
        vec![
            AccountMeta::new(self.request, false),
            AccountMeta::new_readonly(self.function_enclave_signer, true),
            AccountMeta::new(self.token_wallet, false),
            AccountMeta::new(self.function, false),
            AccountMeta::new(self.function_escrow, false),
            AccountMeta::new_readonly(self.verifier_quote, false),
            AccountMeta::new_readonly(self.verifier_enclave_signer, true),
            AccountMeta::new_readonly(self.verifier_permission, false),
            AccountMeta::new_readonly(self.state, false),
            AccountMeta::new_readonly(self.attestation_queue, false),
            AccountMeta::new(self.receiver, false),
            AccountMeta::new_readonly(anchor_spl::token::ID, false),
        ]
    }
}
