/// Simple coin staking module, modeled after SushiSwap's MasterChef: https://github.com/sushiswap/sushiswap/blob/archieve/canary/contracts/MasterChef.sol
module aux::stake {
    use std::signer;

    use aptos_framework::coin::{Coin, Self};
    use aptos_framework::timestamp;

    use aux::authority;


    /*************/
    /* CONSTANTS */
    /*************/
    const MIN_DURATION_MS: u64 = 3600 * 24 * 1000000; // 1 day
    const MAX_DURATION_MS: u64 = 3600 * 24 * 365 * 1000000; // 1 year
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
    const E_USER_INFO_NOT_FOUND: u64 = 6;
    const E_INVALID_WITHDRAW_AMOUNT: u64 = 7;
    const E_NOT_AUTHORIZED: u64 = 8;
    const E_INVALID_UPDATE_REWARD: u64 = 9;

    /***********/
    /* STRUCTS */
    /***********/

    /// Stored at user's address once they open a staking position
    struct UserInfo<phantom S, phantom R> has key {
        amount_staked: u64,
        reward_debt: u128
    }

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
    }

    public entry fun create<S, R>(
        sender: &signer,
        reward_amount: u64,
        end_time: u64, // ms
    ) {
        let start_time = timestamp::now_microseconds();
        assert!(end_time - start_time >= MIN_DURATION_MS, E_INVALID_DURATION);
        assert!(end_time - start_time <= MAX_DURATION_MS, E_INVALID_DURATION);
        let module_authority = authority::get_signer_self();
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
            }
        )
    }

    public entry fun modify_pool<S, R>(
        sender: &signer,
        reward_amount: u64,
        reward_increase: bool,
        time_amount_ms: u64,
        time_increase: bool
    ) acquires Pool {
        assert!(exists<Pool<S, R>>(@aux), E_INCENTIVE_POOL_NOT_FOUND);
        let pool = borrow_global_mut<Pool<S, R>>(@aux);

        let sender_addr = signer::address_of(sender);
        assert!(sender_addr == pool.creator, E_NOT_AUTHORIZED);

        let now = timestamp::now_microseconds();
        update_pool(pool, now);

        if (reward_amount > 0 && reward_increase) {
            let reward = coin::withdraw<R>(sender, reward_amount);
            coin::merge(&mut pool.reward, reward);
            pool.reward_remaining = pool.reward_remaining + reward_amount;
        } else if (reward_amount > 0 && !reward_increase) {
            assert!(pool.reward_remaining >= reward_amount, E_INVALID_UPDATE_REWARD);
            let reward = coin::extract(&mut pool.reward, reward_amount);
            if (!coin::is_account_registered<R>(sender_addr)) {
                coin::register<R>(sender);
            };
            coin::deposit(sender_addr, reward);
            pool.reward_remaining = pool.reward_remaining - reward_amount;
            if (pool.reward_remaining == 0) {
                pool.end_time = now;
            }
        };
        // the real balance of the reward coin should always be >= the virtual remaining balance
        assert!(coin::value(&pool.reward) >= pool.reward_remaining, E_INTERNAL_ERROR);

        if (time_amount_ms > 0 && time_increase) {
            // If the pool has expired, start the reward period from now
            if (now >= pool.end_time) {
                pool.start_time = now;
                pool.end_time = now + time_amount_ms;
            } else {
                pool.end_time = pool.end_time + time_amount_ms;
            }
        // TODO: should we allow this?
        } else if (time_amount_ms > 0 && !time_increase) {
            assert!(time_amount_ms < pool.end_time, E_INVALID_DURATION);
            pool.end_time = pool.end_time - time_amount_ms;
            assert!(pool.end_time > now, E_INVALID_DURATION);
        };
        assert!(pool.end_time - pool.start_time <= MAX_DURATION_MS, E_INVALID_DURATION);
        assert!(pool.end_time - pool.start_time >= MIN_DURATION_MS, E_INVALID_DURATION);

        // TODO: emit event
    }

    public entry fun update_pool<S, R>(pool: &mut Pool<S, R>, now: u64) {
        assert!(pool.last_update_time < pool.end_time, E_INCENTIVE_POOL_EXPIRED);
        if (now <= pool.last_update_time) {
            return
        };
        let total_stake = coin::value(&pool.stake);
        if (total_stake == 0) {
            pool.last_update_time = now;
            return
        };
        let duration_ms = if (now <= pool.end_time) {
            now - pool.last_update_time
        } else {
            pool.end_time - pool.last_update_time
        };

        let duration_reward = (duration_ms as u128) * (pool.reward_remaining as u128) / (pool.end_time - pool.last_update_time as u128);
        pool.acc_reward_per_share = pool.acc_reward_per_share + duration_reward * REWARD_PER_SHARE_MUL / (total_stake as u128);
        pool.reward_remaining = pool.reward_remaining - (duration_reward as u64);
        // the real balance of the reward coin should always be >= the virtual remaining balance
        assert!(coin::value(&pool.reward) >= pool.reward_remaining, E_INTERNAL_ERROR);

        pool.last_update_time = now;
    }

    /// Deposit stake coin to the incentive pool to start earning rewards
    public entry fun deposit<S, R>(sender: &signer, amount: u64) acquires Pool, UserInfo {
        assert!(amount > 0, E_INVALID_DEPOSIT_AMOUNT);
        assert!(exists<Pool<S, R>>(@aux), E_INCENTIVE_POOL_NOT_FOUND);
        let pool = borrow_global_mut<Pool<S, R>>(@aux);
        let now = timestamp::now_microseconds();
        update_pool(pool, now);

        // Deposit staked coin
        let stake = coin::withdraw<S>(sender, amount);
        coin::merge(&mut pool.stake, stake);

        // Update UserInfo
        let sender_addr = signer::address_of(sender);
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
            if (!coin::is_account_registered<R>(sender_addr)) {
                coin::register<R>(sender);
            };
            coin::deposit(sender_addr, reward);

            // Update UserInfo
            user_info.amount_staked = user_info.amount_staked + amount;
            user_info.reward_debt = (user_info.amount_staked as u128) * pool.acc_reward_per_share / REWARD_PER_SHARE_MUL;
        }

        // TODO: emit event
    }

    /// Withdraw stake coin from the incentive pool
    public entry fun withdraw<S, R>(sender: &signer, amount: u64) acquires Pool, UserInfo {
        assert!(amount > 0, E_INVALID_DEPOSIT_AMOUNT);

        // check pool
        assert!(exists<Pool<S, R>>(@aux), E_INCENTIVE_POOL_NOT_FOUND);
        let pool = borrow_global_mut<Pool<S, R>>(@aux);

        // check user info
        let sender_addr = signer::address_of(sender);
        assert!(exists<UserInfo<S, R>>(sender_addr), E_USER_INFO_NOT_FOUND);
        let user_info = borrow_global_mut<UserInfo<S, R>>(sender_addr);
        assert!(user_info.amount_staked > amount, E_INVALID_WITHDRAW_AMOUNT);

        // update pool
        let now = timestamp::now_microseconds();
        update_pool(pool, now);

        // Distribute pending rewards
        let pending_reward = (user_info.amount_staked as u128) * pool.acc_reward_per_share / REWARD_PER_SHARE_MUL - user_info.reward_debt;
        let reward = coin::extract(&mut pool.reward, (pending_reward as u64));
        if (!coin::is_account_registered<R>(sender_addr)) {
            coin::register<R>(sender);
        };
        coin::deposit(sender_addr, reward);

        // Withdraw staked coin
        user_info.amount_staked = user_info.amount_staked - amount;
        user_info.reward_debt = (user_info.amount_staked as u128) * pool.acc_reward_per_share / REWARD_PER_SHARE_MUL;
        let unstake = coin::extract(&mut pool.stake, amount);
        coin::deposit(sender_addr, unstake);

        // TODO: emit withdraw event
    }

    /// Claim staking rewards without modifying staking position
    public entry fun claim<S, R>(sender: &signer) acquires Pool, UserInfo {
        // check pool
        assert!(exists<Pool<S, R>>(@aux), E_INCENTIVE_POOL_NOT_FOUND);
        let pool = borrow_global_mut<Pool<S, R>>(@aux);

        // check user info
        let sender_addr = signer::address_of(sender);
        assert!(exists<UserInfo<S, R>>(sender_addr), E_USER_INFO_NOT_FOUND);
        let user_info = borrow_global_mut<UserInfo<S, R>>(sender_addr);

        // update pool
        let now = timestamp::now_microseconds();
        update_pool(pool, now);

        // Distribute pending rewards
        let pending_reward = (user_info.amount_staked as u128) * pool.acc_reward_per_share / REWARD_PER_SHARE_MUL - user_info.reward_debt;
        let reward = coin::extract(&mut pool.reward, (pending_reward as u64));
        coin::deposit(sender_addr, reward);
        if (!coin::is_account_registered<R>(sender_addr)) {
            coin::register<R>(sender);
        };
        user_info.reward_debt = (user_info.amount_staked as u128) * pool.acc_reward_per_share / REWARD_PER_SHARE_MUL;

        // TODO: emit claim event
    }

}