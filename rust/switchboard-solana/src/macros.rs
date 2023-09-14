// #[cfg(any(not(target_os = "solana"), feature = "client"))]
// #[cfg_attr(doc_cfg, doc(cfg(any(not(target_os = "solana"), feature = "client"))))]

#[macro_export]
macro_rules! cfg_client {
    ($($item:item)*) => {
        $(
            #[cfg(not(target_os = "solana"))]
            #[cfg_attr(doc_cfg, doc(cfg(not(target_os = "solana"))))]
            $item
        )*
    }
}

#[macro_export]
macro_rules! cfg_secrets {
    ($($item:item)*) => {
        $(
            #[cfg(feature = "secrets")]
            #[cfg_attr(doc_cfg, doc(cfg(feature = "secrets")))]
            $item
        )*
    }
}

#[macro_export]
macro_rules! cfg_program {
    ($($item:item)*) => {
        $(
            #[cfg(target_os = "solana")]
            #[cfg_attr(doc_cfg, doc(cfg(target_os = "solana")))]
            $item
        )*
    }
}
