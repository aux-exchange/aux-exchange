/// Auto generated from github.com/aux-exchange/aux-exchange/docs/stableswap
/// don't modify by hand!
/// helpers for stable pool
module aux::router_2pool {
    use std::signer;

    use aptos_framework::coin;

    use aux::stable_2pool::{Self, LPBundle, LP, bundle_detach_reward, bundle_attach_reward};
    use aux::reward_distributor::{Self, RedeemToken};

    /*******************************/
    /* LPRewardTokenStore related  */
    /*******************************/

    struct LPRewardTokenStore<phantom Coin0, phantom Coin1> has key {
        reward_token_0: RedeemToken<Coin0, LP<Coin0, Coin1>>,
        reward_token_1: RedeemToken<Coin1, LP<Coin0, Coin1>>,
    }

    public entry fun deposit<Coin0, Coin1>(sender: &signer, lp_bundle: LPBundle<Coin0, Coin1>) acquires LPRewardTokenStore {
        let (lps,
            reward_token_0,
            reward_token_1,
        ) = bundle_detach_reward(lp_bundle);
        let sender_addr = signer::address_of(sender);
        if (!exists<LPRewardTokenStore<Coin0, Coin1>>(sender_addr)) {
            move_to(
                sender,
                LPRewardTokenStore {
                    reward_token_0,
                    reward_token_1,
                },
            )
        } else {
            let store = borrow_global_mut<LPRewardTokenStore<Coin0, Coin1>>(sender_addr);
            reward_distributor::token_melt(&mut store.reward_token_0, reward_token_0);
            reward_distributor::token_melt(&mut store.reward_token_1, reward_token_1);
        };
        if (!coin::is_account_registered<LP<Coin0, Coin1>>(sender_addr)) {
            coin::register<LP<Coin0, Coin1>>(sender);
        };
        coin::deposit(sender_addr, lps);
    }

    public fun withdraw<Coin0, Coin1>(sender: &signer, amount: u64): LPBundle<Coin0, Coin1> acquires LPRewardTokenStore {
        let sender_addr = signer::address_of(sender);
        let lps = coin::withdraw<LP<Coin0, Coin1>>(sender, amount);
        let reward_store = borrow_global_mut<LPRewardTokenStore<Coin0, Coin1>>(sender_addr);

        let reward_token_0 = reward_distributor::token_extract(&mut reward_store.reward_token_0, amount);
        let reward_token_1 = reward_distributor::token_extract(&mut reward_store.reward_token_1, amount);
        bundle_attach_reward(
            lps,
            reward_token_0,
            reward_token_1,
        )
    }

    public fun balance<Coin0, Coin1>(sender_addr: address): u64 acquires LPRewardTokenStore {
        if (!exists<LPRewardTokenStore<Coin0, Coin1>>(sender_addr)) {
            0
        } else {
            reward_distributor::token_value(&borrow_global<LPRewardTokenStore<Coin0, Coin1>>(sender_addr).reward_token_0)
        }
    }

    /**************************/
    /* Entry Function Wrapper */
    /**************************/

    public entry fun create_pool<Coin0, Coin1>(sender: &signer, fee_numerator: u128, amp: u128) {
        stable_2pool::create_pool<Coin0, Coin1>(sender, fee_numerator, amp);
    }

    public entry fun update_amp<Coin0, Coin1>(sender: &signer, amp: u128) {
        stable_2pool::update_amp<Coin0, Coin1>(sender, amp);
    }

    public entry fun update_fee<Coin0, Coin1>(sender: &signer, fee_numerator: u128) {
        stable_2pool::update_fee<Coin0, Coin1>(sender, fee_numerator);
    }

    /// Add liquidity to the protocol.
    /// Unlike constant product amm, arbitrary amount of coins are allowed here.
    /// Note, however, imbalanced coins will result in less lp coins than balanced coins.
    /// There is no fee to add liquidity.
    public entry fun add_liquidity<Coin0, Coin1>(
        sender: &signer,
        coin_0_amount: u64,
        coin_1_amount: u64,
        min_lp_amount: u64,
    ) acquires LPRewardTokenStore {
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


        let lp_tokens = stable_2pool::add_liquidity(
            sender_addr,
            coin_0,
            coin_1,
            min_lp_amount,
        );

        if (!coin::is_account_registered<stable_2pool::LP<Coin0, Coin1>>(sender_addr)) {
            coin::register<stable_2pool::LP<Coin0, Coin1>>(sender);
        };
        deposit(sender, lp_tokens);
    }

    /// Remove coins from the pool and burn some lp bundles.
    /// There will be a fee charged on each withdrawal. If the withdrawal amount is 0, fee is 0,
    /// otherwise the fee will be the same as swap, with a 1 minimal.
    /// Fee is charged on the output amount.
    /// For example, if 10000 is requested, and fee is 1bps, the pool will dispense 10001
    /// coins from the reserve, and deposit 1 into the fee.
    /// Also, since fees that the lp earned will be dispensed at the same time, the actual out amount may be higher than requested amount.
    public entry fun remove_liquidity_for_coin<Coin0, Coin1>(
        sender: &signer,
        amount_0_to_withdraw: u64,
        amount_1_to_withdraw: u64,
        lp_amount: u64,
    ) acquires LPRewardTokenStore {
        let lp = withdraw<Coin0, Coin1>(sender, lp_amount);
        let sender_addr = signer::address_of(sender);

        let (coin_0, coin_1, lp) = stable_2pool::remove_liquidity_for_coin<Coin0, Coin1>(
            sender_addr,
            amount_0_to_withdraw,
            amount_1_to_withdraw,
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

        deposit(sender, lp);
    }

    /// Remove liquidity from the pool by burning lp bundles.
    /// The coins returned will follow the current ratio of the pool.
    /// There is no fee.
    public entry fun remove_liquidity<Coin0, Coin1>(
        sender: &signer,
        lp_amount: u64,
    ) acquires LPRewardTokenStore {
        let lp = withdraw<Coin0, Coin1>(sender, lp_amount);
        let sender_addr = signer::address_of(sender);

        let (coin_0, coin_1) = stable_2pool::remove_liquidity<Coin0, Coin1>(
            sender_addr,
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
    }

    /// swap coins, where output amount is decided by the input amount.
    /// for input coins, the full amount will be transferred to the pool.
    /// for the output coin, the amount will be ignored.
    /// output coin is identified by the index.
    public entry fun swap_exact_coin_for_coin<Coin0, Coin1>(
        sender: &signer,
        coin_0_amount: u64,
        coin_1_amount: u64,
        out_coin_index: u8,
        min_quantity_out: u64,
    ) {
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

        let (coin_0, coin_1) = stable_2pool::swap_exact_coin_for_coin(
            sender_addr,
            coin_0,
            coin_1,
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
    }

    /// swap coins, where input amount is decided by the requested output amount.
    /// input coin is identified by the index.
    public entry fun swap_coin_for_exact_coin<Coin0, Coin1>(
        sender: &signer,
        requested_quantity_0: u64,
        requested_quantity_1: u64,
        in_coin_index: u8,
        max_in_coin_amount: u64,
    ) {
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

        let (coin_0, coin_1) = stable_2pool::swap_coin_for_exact_coin(
            sender_addr,
            coin_0,
            requested_quantity_0,
            coin_1,
            requested_quantity_1,
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
    }

    /// remove_coin is similar to `remove_liquidity_for_coin`, however,
    /// this entry function will take all the current balance of the user's lp amount,
    /// instead of asking the amount to be passed in.
    public entry fun remove_coin<Coin0, Coin1>(
        sender: &signer,
        amount_0_to_withdraw: u64,
        amount_1_to_withdraw: u64,
    ) acquires LPRewardTokenStore {
        let sender_addr = signer::address_of(sender);
        let lp_amount = coin::balance<stable_2pool::LP<Coin0, Coin1>>(sender_addr);
        remove_liquidity_for_coin<Coin0, Coin1>(
            sender,
            amount_0_to_withdraw,
            amount_1_to_withdraw,
            lp_amount,
        );
    }
}
