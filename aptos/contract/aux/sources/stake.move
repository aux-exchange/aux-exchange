module aux::stake {
    use std::signer;
    use std::string::String;

    use aptos_framework::coin::{Coin, Self, MintCapability, BurnCapability};
    use aptos_framework::timestamp;
    use aptos_framework::option;

    use aux::authority;


    /*************/
    /* CONSTANTS */
    /*************/
    const MIN_DURATION_MS: u64 = 3600 * 24 * 1000000; // 1 day
    const ST_COIN_DECIMALS: u8 = 8;
    // const REWARD_PERIOD_MS: u64 = 1000000; // 1 second
    const REWARD_PER_SHARE_MUL: u128 = 1000000000000; // 1e12

    /**********/
    /* ERRORS */
    /**********/
    const E_INVALID_DURATION: u64 = 1;
    const E_INCENTIVE_POOL_NOT_FOUND: u64 = 2;
    const E_INCENTIVE_POOL_EXPIRED: u64 = 3;
    const E_INVALID_DEPOSIT_AMOUNT: u64 = 4;
    const E_INTERNAL_ERROR: u64 = 5;

    /***********/
    /* STRUCTS */
    /***********/
    struct UserInfo<phantom S, phantom R> has key {
        amount_staked: u64,
        reward_debt: u128
    }

    struct St<phantom S, phantom R> {}

    // TODO: may need PUID
    struct Pool<phantom S, phantom R> has key {
        creator: address,
        start_time: u64,
        end_time: u64,
        reward_remaining: u64,
        stake: Coin<S>,
        reward: Coin<R>,
        last_update_time: u64,
        acc_reward_per_share: u128, // accumulated Coin<R> per share, times REWARD_PER_SHARE_MUL.

        // Staked coin management
        mint: MintCapability<St<S, R>>,
        burn: BurnCapability<St<S, R>>,
    }

    public entry fun create<S, R>(
        sender: &signer,
        reward_amount: u64,
        end_time: u64, // ms
        coin_name: String,
        coin_symbol: String
    ) {
        let start_time = timestamp::now_microseconds();
        assert!(end_time - start_time > MIN_DURATION_MS, E_INVALID_DURATION);
        let module_authority = authority::get_signer_self();
        let (burn, freeze, mint) = coin::initialize<St<S, R>>(
            &module_authority,
            coin_name,
            coin_symbol,
            ST_COIN_DECIMALS,
            true // monitor_supply
        );
        coin::destroy_freeze_cap(freeze);
        move_to<Pool<S, R>>(
            &module_authority,
            Pool {
                creator: signer::address_of(sender),
                start_time,
                end_time,
                reward_remaining: reward_amount,
                stake: coin::zero<S>(),
                reward: coin::withdraw<R>(sender, reward_amount),
                last_update_time: start_time,
                acc_reward_per_share: 0,
                mint,
                burn
            }
        )
    }

    fun update_pool<S, R>(pool: &mut Pool<S, R>, now: u64) {
        assert!(now <= pool.end_time, E_INCENTIVE_POOL_EXPIRED);
        if (now <= pool.last_update_time) {
            return
        };
        let st_supply = option::get_with_default(&coin::supply<St<S, R>>(), 0);
        if (st_supply == 0) {
            pool.last_update_time = now;
            return
        };
        let duration_ms = if (now <= pool.end_time) {
            now - pool.last_update_time
        } else {
            pool.end_time - pool.last_update_time
        };

        let duration_reward = (duration_ms as u128) * (pool.reward_remaining as u128) / (pool.end_time - pool.last_update_time as u128);
        pool.acc_reward_per_share = pool.acc_reward_per_share + duration_reward * REWARD_PER_SHARE_MUL / st_supply;

        pool.last_update_time = now;
    }

    fun deposit<S, R>(sender: &signer, amount: u64) acquires Pool, UserInfo {
        assert!(amount > 0, E_INVALID_DEPOSIT_AMOUNT);
        assert!(exists<Pool<S, R>>(@aux), E_INCENTIVE_POOL_NOT_FOUND);
        let pool = borrow_global_mut<Pool<S, R>>(@aux);
        let now = timestamp::now_microseconds();
        update_pool(pool, now);

        // Deposit staked coin
        let stake = coin::withdraw<S>(sender, amount);
        coin::merge(&mut pool.stake, stake);

        // Mint St coins to sender
        let sender_addr = signer::address_of(sender);
        if (!coin::is_account_registered<St<S, R>>(sender_addr)) {
            coin::register<St<S, R>>(sender);
        };
        let st = coin::mint(amount, &pool.mint);
        coin::deposit(sender_addr, st);

        // Update UserInfo
        if (!exists<UserInfo<S, R>>(sender_addr)) {
            move_to(sender, UserInfo<S, R> {
                amount_staked: amount,
                reward_debt: (amount as u128) * pool.acc_reward_per_share / REWARD_PER_SHARE_MUL
            });
        } else {
            let user_info = borrow_global_mut<UserInfo<S, R>>(sender_addr);
            assert!(user_info.amount_staked > 0, E_INTERNAL_ERROR);

            // Distribute pending rewards
            let pending_reward = (user_info.amount_staked as u128) * pool.acc_reward_per_share / REWARD_PER_SHARE_MUL - user_info.reward_debt;
            let reward = coin::extract(&mut pool.reward, (pending_reward as u64));
            coin::deposit(sender_addr, reward);

            // Update UserInfo
            user_info.amount_staked = user_info.amount_staked + amount;
            user_info.reward_debt = (user_info.amount_staked as u128) * pool.acc_reward_per_share / REWARD_PER_SHARE_MUL;
        }

        // TODO: emit event
    }

}