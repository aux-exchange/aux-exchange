/// Auto generated from github.com/aux-exchange/aux-exchange/docs/stableswap
/// don't modify by hand!
/// helpers for stable pool
module aux::router_3pool {
    const E_EMERGENCY_ABORT: u64 = 0xFFFFFF;
    fun is_not_emergency(): bool {
        false
    }
    use std::signer;

    use aptos_framework::coin;

    use aux::stable_3pool::{Self, LPBundle, bundle_melt, bundle_extract, bundle_value};

    struct LPBundleStore<phantom Coin0, phantom Coin1, phantom Coin2> has key {
        lp_bundle: LPBundle<Coin0, Coin1, Coin2>,
    }

    public entry fun deposit<Coin0, Coin1, Coin2>(sender: &signer, lp_bundle: LPBundle<Coin0, Coin1, Coin2>) acquires LPBundleStore {
        assert!(is_not_emergency(), E_EMERGENCY_ABORT);
        let sender_addr = signer::address_of(sender);
        if (!exists<LPBundleStore<Coin0, Coin1, Coin2>>(sender_addr)) {
            move_to(
                sender,
                LPBundleStore {
                    lp_bundle,
                },
            )
        } else {
            let store = borrow_global_mut<LPBundleStore<Coin0, Coin1, Coin2>>(sender_addr);
            bundle_melt(&mut store.lp_bundle, lp_bundle)
        }
    }

    public fun withdraw<Coin0, Coin1, Coin2>(sender: &signer, amount: u64): LPBundle<Coin0, Coin1, Coin2> acquires LPBundleStore {
        assert!(is_not_emergency(), E_EMERGENCY_ABORT);
        let sender_addr = signer::address_of(sender);
        bundle_extract(&mut borrow_global_mut<LPBundleStore<Coin0, Coin1, Coin2>>(sender_addr).lp_bundle, amount)
    }

    public fun balance<Coin0, Coin1, Coin2>(sender_addr: address): u64 acquires LPBundleStore {
        assert!(is_not_emergency(), E_EMERGENCY_ABORT);
        if (!exists<LPBundleStore<Coin0, Coin1, Coin2>>(sender_addr)) {
            0
        } else {
            bundle_value(&borrow_global<LPBundleStore<Coin0, Coin1, Coin2>>(sender_addr).lp_bundle)
        }
    }

    /**************************/
    /* Entry Function Wrapper */
    /**************************/

    public entry fun add_liquidity<Coin0, Coin1, Coin2>(
        sender: &signer,
        coin_0_amount: u64,
        coin_1_amount: u64,
        coin_2_amount: u64,
        min_lp_amount: u64,
    ) acquires LPBundleStore {
        assert!(is_not_emergency(), E_EMERGENCY_ABORT);
        let sender_addr = signer::address_of(sender);

        let coin_0 = if (coin_0_amount > 0) {
            coin::withdraw<Coin0>(sender, coin_0_amount)
        } else {
            coin::zero<Coin0>()
        };

        let coin_1 = if (coin_1_amount > 0) {
            coin::withdraw<Coin1>(sender, coin_1_amount)
        } else {
            coin::zero<Coin1>()
        };

        let coin_2 = if (coin_2_amount > 0) {
            coin::withdraw<Coin2>(sender, coin_2_amount)
        } else {
            coin::zero<Coin2>()
        };

        let lp_tokens = stable_3pool::add_liquidity(
            sender_addr,
            coin_0,
            coin_1,
            coin_2,
            min_lp_amount,
        );

        if (!coin::is_account_registered<stable_3pool::LP<Coin0, Coin1, Coin2>>(sender_addr)) {
            coin::register<stable_3pool::LP<Coin0, Coin1, Coin2>>(sender);
        };
        deposit(sender, lp_tokens);
    }

    public entry fun remove_liquidity_for_coin<Coin0, Coin1, Coin2>(
        sender: &signer,
        amount_0_to_withdraw: u64,
        amount_1_to_withdraw: u64,
        amount_2_to_withdraw: u64,
        lp_amount: u64,
    ) acquires LPBundleStore {
        assert!(is_not_emergency(), E_EMERGENCY_ABORT);
        let lp = withdraw<Coin0, Coin1, Coin2>(sender, lp_amount);
        let sender_addr = signer::address_of(sender);

        let (coin_0, coin_1, coin_2, lp) = stable_3pool::remove_liquidity_for_coin<Coin0, Coin1, Coin2>(
            sender_addr,
            amount_0_to_withdraw,
            amount_1_to_withdraw,
            amount_2_to_withdraw,
            lp,
        );

        if (coin::value(&coin_0) > 0) {
            if (!coin::is_account_registered<Coin0>(sender_addr)) {
                coin::register<Coin0>(sender);
            };
            coin::deposit(sender_addr, coin_0);
        } else {
            coin::destroy_zero(coin_0);
        };

        if (coin::value(&coin_1) > 0) {
            if (!coin::is_account_registered<Coin1>(sender_addr)) {
                coin::register<Coin1>(sender);
            };
            coin::deposit(sender_addr, coin_1);
        } else {
            coin::destroy_zero(coin_1);
        };

        if (coin::value(&coin_2) > 0) {
            if (!coin::is_account_registered<Coin2>(sender_addr)) {
                coin::register<Coin2>(sender);
            };
            coin::deposit(sender_addr, coin_2);
        } else {
            coin::destroy_zero(coin_2);
        };

        deposit(sender, lp);
    }

    public entry fun remove_liquidity<Coin0, Coin1, Coin2>(
        sender: &signer,
        lp_amount: u64,
    ) acquires LPBundleStore {
        assert!(is_not_emergency(), E_EMERGENCY_ABORT);
        let lp = withdraw<Coin0, Coin1, Coin2>(sender, lp_amount);
        let sender_addr = signer::address_of(sender);

        let (coin_0, coin_1, coin_2) = stable_3pool::remove_liquidity<Coin0, Coin1, Coin2>(sender_addr, lp);

        if (coin::value(&coin_0) > 0) {
            if (!coin::is_account_registered<Coin0>(sender_addr)) {
                coin::register<Coin0>(sender);
            };
            coin::deposit(sender_addr, coin_0);
        } else {
            coin::destroy_zero(coin_0);
        };

        if (coin::value(&coin_1) > 0) {
            if (!coin::is_account_registered<Coin1>(sender_addr)) {
                coin::register<Coin1>(sender);
            };
            coin::deposit(sender_addr, coin_1);
        } else {
            coin::destroy_zero(coin_1);
        };

        if (coin::value(&coin_2) > 0) {
            if (!coin::is_account_registered<Coin2>(sender_addr)) {
                coin::register<Coin2>(sender);
            };
            coin::deposit(sender_addr, coin_2);
        } else {
            coin::destroy_zero(coin_2);
        };
    }

    public entry fun swap_exact_coin_for_coin<Coin0, Coin1, Coin2>(
        sender: &signer,
        coin_0_amount: u64,
        coin_1_amount: u64,
        coin_2_amount: u64,
        out_coin_index: u8,
        min_quantity_out: u64,
    ) {
        assert!(is_not_emergency(), E_EMERGENCY_ABORT);
        let sender_addr = signer::address_of(sender);

        let coin_0 = if (coin_0_amount > 0) {
            coin::withdraw<Coin0>(sender, coin_0_amount)
        } else {
            coin::zero<Coin0>()
        };

        let coin_1 = if (coin_1_amount > 0) {
            coin::withdraw<Coin1>(sender, coin_1_amount)
        } else {
            coin::zero<Coin1>()
        };

        let coin_2 = if (coin_2_amount > 0) {
            coin::withdraw<Coin2>(sender, coin_2_amount)
        } else {
            coin::zero<Coin2>()
        };

        let (coin_0, coin_1, coin_2) = stable_3pool::swap_exact_coin_for_coin(
            sender_addr,
            coin_0,
            coin_1,
            coin_2,
            out_coin_index,
            min_quantity_out,
        );

        if (coin::value(&coin_0) > 0) {
            if (!coin::is_account_registered<Coin0>(sender_addr)) {
                coin::register<Coin0>(sender);
            };
            coin::deposit(sender_addr, coin_0);
        } else {
            coin::destroy_zero(coin_0);
        };

        if (coin::value(&coin_1) > 0) {
            if (!coin::is_account_registered<Coin1>(sender_addr)) {
                coin::register<Coin1>(sender);
            };
            coin::deposit(sender_addr, coin_1);
        } else {
            coin::destroy_zero(coin_1);
        };

        if (coin::value(&coin_2) > 0) {
            if (!coin::is_account_registered<Coin2>(sender_addr)) {
                coin::register<Coin2>(sender);
            };
            coin::deposit(sender_addr, coin_2);
        } else {
            coin::destroy_zero(coin_2);
        };
    }

    public entry fun swap_coin_for_exact_coin<Coin0, Coin1, Coin2>(
        sender: &signer,
        requested_quantity_0: u64,
        requested_quantity_1: u64,
        requested_quantity_2: u64,
        in_coin_index: u8,
        max_in_coin_amount: u64,
    ) {
        assert!(is_not_emergency(), E_EMERGENCY_ABORT);
        let sender_addr = signer::address_of(sender);

        let coin_0 = if (in_coin_index == 0) {
            coin::withdraw<Coin0>(sender, max_in_coin_amount)
        } else {
            coin::zero<Coin0>()
        };

        let coin_1 = if (in_coin_index == 1) {
            coin::withdraw<Coin1>(sender, max_in_coin_amount)
        } else {
            coin::zero<Coin1>()
        };

        let coin_2 = if (in_coin_index == 2) {
            coin::withdraw<Coin2>(sender, max_in_coin_amount)
        } else {
            coin::zero<Coin2>()
        };

        let (coin_0, coin_1, coin_2) = stable_3pool::swap_coin_for_exact_coin(
            sender_addr,
            coin_0,
            requested_quantity_0,
            coin_1,
            requested_quantity_1,
            coin_2,
            requested_quantity_2,
            in_coin_index,
        );

        if (coin::value(&coin_0) > 0) {
            if (!coin::is_account_registered<Coin0>(sender_addr)) {
                coin::register<Coin0>(sender);
            };
            coin::deposit(sender_addr, coin_0);
        } else {
            coin::destroy_zero(coin_0);
        };

        if (coin::value(&coin_1) > 0) {
            if (!coin::is_account_registered<Coin1>(sender_addr)) {
                coin::register<Coin1>(sender);
            };
            coin::deposit(sender_addr, coin_1);
        } else {
            coin::destroy_zero(coin_1);
        };

        if (coin::value(&coin_2) > 0) {
            if (!coin::is_account_registered<Coin2>(sender_addr)) {
                coin::register<Coin2>(sender);
            };
            coin::deposit(sender_addr, coin_2);
        } else {
            coin::destroy_zero(coin_2);
        };
    }

    public entry fun remove_coin<Coin0, Coin1, Coin2>(
        sender: &signer,
        amount_0_to_withdraw: u64,
        amount_1_to_withdraw: u64,
        amount_2_to_withdraw: u64,
    ) acquires LPBundleStore {
        assert!(is_not_emergency(), E_EMERGENCY_ABORT);
        let sender_addr = signer::address_of(sender);
        let lp_amount = coin::balance<stable_3pool::LP<Coin0, Coin1, Coin2>>(sender_addr);
        remove_liquidity_for_coin<Coin0, Coin1, Coin2>(
            sender,
            amount_0_to_withdraw,
            amount_1_to_withdraw,
            amount_2_to_withdraw,
            lp_amount,
        );
    }
}

