/// Simple coin staking module, modeled after SushiSwap's MasterChef: https://github.com/sushiswap/sushiswap/blob/archieve/canary/contracts/MasterChef.sol
module aux::stake {
    use std::signer;
    use std::table::{Table, Self};

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
    const E_INVALID_REWARD: u64 = 9;
    const E_TEST_FAILURE: u64 = 10;

    /***********/
    /* STRUCTS */
    /***********/

    struct Pools<phantom S, phantom R> has key {
        pools: Table<u64, Pool<S, R>>,
        id: u64
    }

    // TODO: rename
    struct UserInfos<phantom S, phantom R> has key {
        user_infos: Table<u64, UserInfo<S, R>>,
    }

    /// Stored at user's address once they open a staking position
    struct UserInfo<phantom S, phantom R> has store {
        amount_staked: u64,
        reward_debt: u128
    }

    struct Pool<phantom S, phantom R> has store {
        creator: address,
        start_time: u64,
        end_time: u64,
        reward_remaining: u64,
        stake: Coin<S>,
        reward: Coin<R>,
        last_update_time: u64,
        acc_reward_per_share: u128, // accumulated Coin<R> per share, times REWARD_PER_SHARE_MUL.
    }

    public entry fun create_with_signer<S, R>(
        sender: &signer,
        reward_amount: u64,
        end_time: u64, // ms
    ) acquires Pools {
        let reward = coin::withdraw<R>(sender, reward_amount);
        create<S, R>(signer::address_of(sender), reward, end_time);
    }

    // Returns the pool's ID
    public fun create<S, R>(creator: address, reward: Coin<R>, end_time: u64): u64 acquires Pools {
        let start_time = timestamp::now_microseconds();
        assert!(end_time - start_time >= MIN_DURATION_MS, E_INVALID_DURATION);
        assert!(end_time - start_time <= MAX_DURATION_MS, E_INVALID_DURATION);
        let reward_amount = coin::value(&reward);
        assert!(reward_amount != 0, E_INVALID_REWARD);
        let module_authority = authority::get_signer_self();
        if (!exists<Pools<S, R>>(@aux)) {
            move_to<Pools<S, R>>(
                &module_authority,
                Pools<S, R> {
                    pools: table::new(),
                    id: 0
                }
            )
        };
        let pools = borrow_global_mut<Pools<S, R>>(@aux);
        table::add(&mut pools.pools, pools.id,
            Pool {
                creator,
                start_time,
                end_time,
                reward_remaining: reward_amount,
                stake: coin::zero<S>(),
                reward,
                last_update_time: start_time,
                acc_reward_per_share: 0,
            }
        );
        pools.id = pools.id + 1;
        pools.id - 1
    }

    public entry fun modify_pool<S, R>(
        sender: &signer,
        id: u64,
        reward_amount: u64,
        reward_increase: bool,
        time_amount_ms: u64,
        time_increase: bool
    ) acquires Pools {
        assert!(exists<Pools<S, R>>(@aux), E_INCENTIVE_POOL_NOT_FOUND);
        let pools = borrow_global_mut<Pools<S, R>>(@aux);
        assert!(table::contains(&mut pools.pools, id), E_INCENTIVE_POOL_NOT_FOUND);
        let pool = table::borrow_mut(&mut pools.pools, id);

        let sender_addr = signer::address_of(sender);
        assert!(sender_addr == pool.creator, E_NOT_AUTHORIZED);

        let now = timestamp::now_microseconds();
        update_pool(pool, now);

        if (reward_amount > 0 && reward_increase) {
            let reward = coin::withdraw<R>(sender, reward_amount);
            coin::merge(&mut pool.reward, reward);
            pool.reward_remaining = pool.reward_remaining + reward_amount;
        } else if (reward_amount > 0 && !reward_increase) {
            assert!(pool.reward_remaining >= reward_amount, E_INVALID_REWARD);
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
        if (now <= pool.last_update_time || pool.last_update_time >= pool.end_time) {
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
    public entry fun deposit<S, R>(sender: &signer, id: u64, amount: u64) acquires Pools, UserInfos {
        assert!(amount > 0, E_INVALID_DEPOSIT_AMOUNT);
        // assert!(exists<Pool<S, R>>(@aux), E_INCENTIVE_POOL_NOT_FOUND);
        // let pool = borrow_global_mut<Pool<S, R>>(@aux);
        assert!(exists<Pools<S, R>>(@aux), E_INCENTIVE_POOL_NOT_FOUND);
        let pools = borrow_global_mut<Pools<S, R>>(@aux);
        assert!(table::contains(&mut pools.pools, id), E_INCENTIVE_POOL_NOT_FOUND);
        let pool = table::borrow_mut(&mut pools.pools, id);
        let now = timestamp::now_microseconds();
        update_pool(pool, now);

        // Deposit staked coin
        let stake = coin::withdraw<S>(sender, amount);
        coin::merge(&mut pool.stake, stake);

        // Update UserInfo
        let sender_addr = signer::address_of(sender);
        if (!exists<UserInfos<S, R>>(sender_addr)) {
            move_to(sender, UserInfos<S, R> {
                user_infos: table::new()
            })
        };
        let user_infos = borrow_global_mut<UserInfos<S, R>>(sender_addr);
        let exists = table::contains(&user_infos.user_infos, id);
        if (!exists) {
            table::add(&mut user_infos.user_infos, id, UserInfo<S, R> {
                amount_staked: amount,
                reward_debt: (amount as u128) * pool.acc_reward_per_share / REWARD_PER_SHARE_MUL
            });
        } else {
            let user_info = table::borrow_mut(&mut user_infos.user_infos, id);

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
    public entry fun withdraw<S, R>(sender: &signer, id: u64, amount: u64) acquires Pools, UserInfos {
        assert!(amount > 0, E_INVALID_DEPOSIT_AMOUNT);

        // check pool
        // assert!(exists<Pool<S, R>>(@aux), E_INCENTIVE_POOL_NOT_FOUND);
        // let pool = borrow_global_mut<Pool<S, R>>(@aux);
        assert!(exists<Pools<S, R>>(@aux), E_INCENTIVE_POOL_NOT_FOUND);
        let pools = borrow_global_mut<Pools<S, R>>(@aux);
        assert!(table::contains(&mut pools.pools, id), E_INCENTIVE_POOL_NOT_FOUND);
        let pool = table::borrow_mut(&mut pools.pools, id);

        // check user info
        let sender_addr = signer::address_of(sender);
        assert!(exists<UserInfos<S, R>>(sender_addr), E_USER_INFO_NOT_FOUND);
        let user_infos = borrow_global_mut<UserInfos<S, R>>(sender_addr);
        assert!(table::contains(&user_infos.user_infos, id), E_USER_INFO_NOT_FOUND);
        let user_info = table::borrow_mut(&mut user_infos.user_infos, id);
        assert!(user_info.amount_staked >= amount, E_INVALID_WITHDRAW_AMOUNT);

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
    public entry fun claim<S, R>(sender: &signer, id: u64) acquires Pools, UserInfos {
        // check pool
        // assert!(exists<Pool<S, R>>(@aux), E_INCENTIVE_POOL_NOT_FOUND);
        // let pool = borrow_global_mut<Pool<S, R>>(@aux);
        assert!(exists<Pools<S, R>>(@aux), E_INCENTIVE_POOL_NOT_FOUND);
        let pools = borrow_global_mut<Pools<S, R>>(@aux);
        assert!(table::contains(&mut pools.pools, id), E_INCENTIVE_POOL_NOT_FOUND);
        let pool = table::borrow_mut(&mut pools.pools, id);

        // check user info
        let sender_addr = signer::address_of(sender);
        assert!(exists<UserInfos<S, R>>(sender_addr), E_USER_INFO_NOT_FOUND);
        let user_infos = borrow_global_mut<UserInfos<S, R>>(sender_addr);
        assert!(table::contains(&user_infos.user_infos, id), E_USER_INFO_NOT_FOUND);
        let user_info = table::borrow_mut(&mut user_infos.user_infos, id);

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

    /*********/
    /* TESTS */
    /*********/

    #[test_only]
    use aux::fake_coin::{FakeCoin, ETH, USDC, Self};
    #[test_only]
    use aptos_framework::account;

    #[test_only]
    public fun setup_module_for_test(sender: &signer, aptos_framework: &signer) {
        let sender_addr = signer::address_of(sender);
        if (!account::exists_at(sender_addr)) {
            account::create_account_for_test(sender_addr);
        };
        fake_coin::init_module_for_testing(sender);
        timestamp::set_time_has_started_for_testing(aptos_framework);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1, alice = @0x123)]
    fun test_deposit_withdraw_claim(sender: &signer, aptos_framework: &signer, alice: &signer) acquires Pools, UserInfos {
        setup_module_for_test(sender, aptos_framework);
        let sender_addr = signer::address_of(sender);
        let alice_addr = signer::address_of(alice);
        if (!account::exists_at(alice_addr)) {
            account::create_account_for_test(alice_addr);
        };

        let sender_eth = 5 * 100000000;
        let alice_eth = sender_eth;
        let alice_usdc = 0;
        fake_coin::register_and_mint<USDC>(sender, 2000000 * 1000000); // 2M USDC
        fake_coin::register_and_mint<ETH>(sender, sender_eth); // 5 ETH
        fake_coin::register_and_mint<USDC>(alice, 0); // 2M USDC
        fake_coin::register_and_mint<ETH>(alice, alice_eth); // 5 ETH
        let reward_au = 2000000 * 1000000;
        let reward_remaining = reward_au;
        let reward = coin::withdraw<FakeCoin<USDC>>(sender, reward_au);

        // Incentive:
        // duration = 30 days = 30*24*3600*1000000 microseconds
        // reward = 2e14 AU ETH
        // reward per second = 77,160,493.82716049
        let duration_seconds = 30*24*3600; // 30 days
        let start_time = timestamp::now_microseconds();
        let end_time = start_time + duration_seconds * 1000000;
        let pool_id = create<FakeCoin<ETH>, FakeCoin<USDC>>(sender_addr, reward, end_time);
        let sender_usdc = 0;
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);
        {
            let pools = borrow_global_mut<Pools<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            let pool = table::borrow_mut(&mut pools.pools, pool_id);
            assert!(pool.creator == sender_addr, E_TEST_FAILURE);
            assert!(pool.start_time == start_time, E_TEST_FAILURE);
            assert!(pool.end_time == end_time, E_TEST_FAILURE);
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);
            assert!(coin::value(&pool.stake) == 0, E_TEST_FAILURE);
            assert!(coin::value(&pool.reward) == reward_au, E_TEST_FAILURE);
            assert!(pool.last_update_time == start_time, E_TEST_FAILURE);
            assert!(pool.acc_reward_per_share == 0, E_TEST_FAILURE);
        };


        // Sender stakes 100 au ETH
        deposit<FakeCoin<ETH>, FakeCoin<USDC>>(sender, pool_id, 100);
        {
            sender_eth = sender_eth - 100;
            assert!(coin::balance<FakeCoin<ETH>>(sender_addr) == sender_eth, E_TEST_FAILURE);
            let pools = borrow_global_mut<Pools<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            let pool = table::borrow_mut(&mut pools.pools, pool_id);
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);
            assert!(coin::value(&pool.stake) == 100, E_TEST_FAILURE);
            assert!(coin::value(&pool.reward) == reward_au, E_TEST_FAILURE);
            assert!(pool.last_update_time == start_time, E_TEST_FAILURE);
            assert!(pool.acc_reward_per_share == 0, E_TEST_FAILURE);
            let user_infos = borrow_global_mut<UserInfos<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            let user_info = table::borrow_mut(&mut user_infos.user_infos, pool_id);
            assert!(user_info.amount_staked == 100, E_TEST_FAILURE);
            assert!(user_info.reward_debt == 0, E_TEST_FAILURE);
        };
        // claim when no time has passed, reward amount should be 0
        claim<FakeCoin<ETH>, FakeCoin<USDC>>(sender, pool_id);
        {
            assert!(coin::balance<FakeCoin<ETH>>(sender_addr) == sender_eth, E_TEST_FAILURE);
            assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);
            let pools = borrow_global_mut<Pools<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            let pool = table::borrow_mut(&mut pools.pools, pool_id);
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);
            assert!(coin::value(&pool.stake) == 100, E_TEST_FAILURE);
            assert!(coin::value(&pool.reward) == reward_au, E_TEST_FAILURE);
            assert!(pool.last_update_time == start_time, E_TEST_FAILURE);
            assert!(pool.acc_reward_per_share == 0, E_TEST_FAILURE);
            let user_infos = borrow_global_mut<UserInfos<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            let user_info = table::borrow_mut(&mut user_infos.user_infos, pool_id);
            assert!(user_info.amount_staked == 100, E_TEST_FAILURE);
            assert!(user_info.reward_debt == 0, E_TEST_FAILURE);
        };

        // TIME: start + 1
        // fast forward 1 second and claim reward
        timestamp::fast_forward_seconds(1);
        claim<FakeCoin<ETH>, FakeCoin<USDC>>(sender, pool_id);
        {
            let pools = borrow_global_mut<Pools<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            let pool = table::borrow_mut(&mut pools.pools, pool_id);
            // let duration_reward = reward_au * 1000000 / (duration_seconds * 1000000);
            let duration_reward = 771604;
            assert!(duration_reward * duration_seconds <= reward_au, E_TEST_FAILURE);

            // let acc_reward_per_share = (duration_reward as u128) * REWARD_PER_SHARE_MUL / 100;
            let acc_reward_per_share = 7716040000000000;
            assert!(pool.acc_reward_per_share == acc_reward_per_share, E_TEST_FAILURE);
            assert!(pool.last_update_time == timestamp::now_microseconds(), E_TEST_FAILURE);

            // Sender should receive 100% of the rewards for that second
            // let sender_reward = 100 * acc_reward_per_share / REWARD_PER_SHARE_MUL;
            let sender_reward = 771604;
            sender_usdc = sender_usdc + sender_reward;
            assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);
            reward_remaining = 1999999228396;
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);

            let user_infos = borrow_global_mut<UserInfos<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            let user_info = table::borrow_mut(&mut user_infos.user_infos, pool_id);
            assert!(user_info.amount_staked == 100, E_TEST_FAILURE);
            assert!(user_info.reward_debt == (sender_reward as u128), E_TEST_FAILURE);
        };
        // TIME: start + 2
        // fast forward another second and deposit 100 more -- reward amount should be exactly the same
        timestamp::fast_forward_seconds(1);
        deposit<FakeCoin<ETH>, FakeCoin<USDC>>(sender, pool_id, 100);
        {
            sender_eth = sender_eth - 100;
            assert!(coin::balance<FakeCoin<ETH>>(sender_addr) == sender_eth, E_TEST_FAILURE);
            let pools = borrow_global_mut<Pools<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            let pool = table::borrow_mut(&mut pools.pools, pool_id);
            // check new staked amount
            assert!(coin::value(&pool.stake) == 200, E_TEST_FAILURE);
            // let duration_reward = reward_remaining_au * 1000000 / ((duration_seconds - 1) * 1000000);
            let duration_reward = 771604;
            assert!(duration_reward * duration_seconds <= reward_au, E_TEST_FAILURE);

            // let acc_reward_per_share = acc_reward_per_share + (duration_reward as u128) * REWARD_PER_SHARE_MUL / 100;
            let acc_reward_per_share = 15432080000000000;
            assert!(pool.acc_reward_per_share == acc_reward_per_share, E_TEST_FAILURE);
            assert!(pool.last_update_time == timestamp::now_microseconds(), E_TEST_FAILURE);

            // Sender should receive 100% of the rewards for that second
            // let sender_reward = 100 * acc_reward_per_share / REWARD_PER_SHARE_MUL - sender_reward_debt;
            let sender_reward = 771604;
            sender_usdc = sender_usdc + sender_reward;
            assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);
            reward_remaining = 1999998456792;
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);

            let user_infos = borrow_global_mut<UserInfos<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            let user_info = table::borrow_mut(&mut user_infos.user_infos, pool_id);
            assert!(user_info.amount_staked == 200, E_TEST_FAILURE);
            // assert!(user_info.reward_debt == (200 * acc_reward_per_share / REWARD_PER_SHARE_MUL as u128), E_TEST_FAILURE);
            assert!(user_info.reward_debt == 3086416, E_TEST_FAILURE);
        };
        // sender deposits 500
        deposit<FakeCoin<ETH>, FakeCoin<USDC>>(alice, pool_id, 500);
        {
            let alice_user_infos = borrow_global_mut<UserInfos<FakeCoin<ETH>, FakeCoin<USDC>>>(alice_addr);
            let alice_user_info = table::borrow_mut(&mut alice_user_infos.user_infos, pool_id);
            assert!(alice_user_info.amount_staked == 500, E_TEST_FAILURE);
            // assert!(user_info.reward_debt == (500 * acc_reward_per_share / REWARD_PER_SHARE_MUL as u128), E_TEST_FAILURE);
            assert!(alice_user_info.reward_debt == 7716040, E_TEST_FAILURE);
        };

        // TIME: start + 100
        timestamp::fast_forward_seconds(98);
        claim<FakeCoin<ETH>, FakeCoin<USDC>>(sender, pool_id);
        claim<FakeCoin<ETH>, FakeCoin<USDC>>(alice, pool_id);
        {
            alice_eth = alice_eth - 500;
            assert!(coin::balance<FakeCoin<ETH>>(alice_addr) == alice_eth, E_TEST_FAILURE);
            let pools = borrow_global_mut<Pools<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            let pool = table::borrow_mut(&mut pools.pools, pool_id);

            // check new staked amount
            assert!(coin::value(&pool.stake) == 700, E_TEST_FAILURE);
            // let duration_reward = reward_remaining_au * 98 * 1000000 / ((duration_seconds - 2) * 1000000);
            // let duration_reward = 75617283;
            // let acc_reward_per_share = acc_reward_per_share + (duration_reward as u128) * REWARD_PER_SHARE_MUL / 700;
            let acc_reward_per_share = 123456770000000000;
            assert!(pool.acc_reward_per_share == acc_reward_per_share, (pool.acc_reward_per_share as u64));
            assert!(timestamp::now_microseconds() == start_time + 100 * 1000000, E_TEST_FAILURE);
            assert!(pool.last_update_time == timestamp::now_microseconds(), E_TEST_FAILURE);

            // Sender should receive 100% of the rewards for that second
            // let sender_reward = 200 * acc_reward_per_share / REWARD_PER_SHARE_MUL - sender_reward_debt;
            let sender_reward = 21604938;
            sender_usdc = sender_usdc + sender_reward;
            assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);

            let sender_user_infos = borrow_global_mut<UserInfos<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            let sender_user_info = table::borrow_mut(&mut sender_user_infos.user_infos, pool_id);
            assert!(sender_user_info.amount_staked == 200, E_TEST_FAILURE);
            // assert!(user_info.reward_debt == (200 * acc_reward_per_share / REWARD_PER_SHARE_MUL as u128), E_TEST_FAILURE);
            assert!(sender_user_info.reward_debt == 24691354, E_TEST_FAILURE);

            // let alice_reward = 500 * acc_reward_per_share / REWARD_PER_SHARE_MUL - alice_reward_debt;
            let alice_reward = 54012345;
            alice_usdc = alice_usdc + alice_reward;
            assert!(coin::balance<FakeCoin<USDC>>(alice_addr) == (alice_usdc as u64), coin::balance<FakeCoin<USDC>>(alice_addr));

            let alice_user_infos = borrow_global_mut<UserInfos<FakeCoin<ETH>, FakeCoin<USDC>>>(alice_addr);
            let alice_user_info = table::borrow_mut(&mut alice_user_infos.user_infos, pool_id);
            assert!(alice_user_info.amount_staked == 500, E_TEST_FAILURE);
            // assert!(user_info.reward_debt == (500 * acc_reward_per_share / REWARD_PER_SHARE_MUL as u128), E_TEST_FAILURE);
            assert!(alice_user_info.reward_debt == 61728385, E_TEST_FAILURE);

            // let reward_remaining = reward_au - (sender_usdc + (alice_usdc as u64));
            let reward_remaining = 1999922839509;
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);
        };
        // TIME: start + 200
        timestamp::fast_forward_seconds(100);
        // sender withdraws all
        withdraw<FakeCoin<ETH>, FakeCoin<USDC>>(sender, pool_id, 200);
        {
            sender_eth = sender_eth + 200;
            assert!(coin::balance<FakeCoin<ETH>>(sender_addr) == sender_eth, E_TEST_FAILURE);
            assert!(coin::balance<FakeCoin<ETH>>(alice_addr) == alice_eth, E_TEST_FAILURE);
            let pools = borrow_global_mut<Pools<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            let pool = table::borrow_mut(&mut pools.pools, pool_id);

            // check new staked amount
            assert!(coin::value(&pool.stake) == 500, E_TEST_FAILURE);
            assert!(timestamp::now_microseconds() == start_time + 200 * 1000000, E_TEST_FAILURE);
            assert!(pool.last_update_time == timestamp::now_microseconds(), E_TEST_FAILURE);

            // let duration_reward = reward_remaining_au * 100 * 1000000 / ((duration_seconds - 100) * 1000000);
            // let duration_reward = 77160493;
            // let acc_reward_per_share = 123456770000000000 + (duration_reward as u128) * REWARD_PER_SHARE_MUL / 700;
            let acc_reward_per_share = 233686045714285714;
            assert!(pool.acc_reward_per_share == acc_reward_per_share, (pool.acc_reward_per_share as u64));

            // let sender_reward = 200 * acc_reward_per_share / REWARD_PER_SHARE_MUL - sender_reward_debt;
            let sender_reward = 22045855;
            sender_usdc = sender_usdc + sender_reward;
            assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);

            let sender_user_infos = borrow_global_mut<UserInfos<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            let sender_user_info = table::borrow_mut(&mut sender_user_infos.user_infos, pool_id);
            assert!(sender_user_info.amount_staked == 0, E_TEST_FAILURE);
            // assert!(user_info.reward_debt == (200 * acc_reward_per_share / REWARD_PER_SHARE_MUL as u128), E_TEST_FAILURE);
            assert!(sender_user_info.reward_debt == 0, (sender_user_info.reward_debt as u64));

            // All alice info is the same since she didn't claim
            assert!(coin::balance<FakeCoin<USDC>>(alice_addr) == (alice_usdc as u64), coin::balance<FakeCoin<USDC>>(alice_addr));

            let alice_user_infos = borrow_global_mut<UserInfos<FakeCoin<ETH>, FakeCoin<USDC>>>(alice_addr);
            let alice_user_info = table::borrow_mut(&mut alice_user_infos.user_infos, pool_id);
            assert!(alice_user_info.amount_staked == 500, E_TEST_FAILURE);
            // assert!(user_info.reward_debt == (500 * acc_reward_per_share / REWARD_PER_SHARE_MUL as u128), E_TEST_FAILURE);
            assert!(alice_user_info.reward_debt == 61728385, E_TEST_FAILURE);

            // reward_remaining - duration_reward
            let reward_remaining = 1999845679016;
            assert!(pool.reward_remaining == reward_remaining, pool.reward_remaining);
        };

        // TIME: start + 250
        timestamp::fast_forward_seconds(50);
        // sender deposits 500
        deposit<FakeCoin<ETH>, FakeCoin<USDC>>(sender, pool_id, 500);
        {
            sender_eth = sender_eth - 500;
            assert!(coin::balance<FakeCoin<ETH>>(sender_addr) == sender_eth, E_TEST_FAILURE);
            assert!(coin::balance<FakeCoin<ETH>>(alice_addr) == alice_eth, E_TEST_FAILURE);
            let pools = borrow_global_mut<Pools<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            let pool = table::borrow_mut(&mut pools.pools, pool_id);

            // check new staked amount
            assert!(coin::value(&pool.stake) == 1000, E_TEST_FAILURE);
            assert!(timestamp::now_microseconds() == start_time + 250 * 1000000, E_TEST_FAILURE);
            assert!(pool.last_update_time == timestamp::now_microseconds(), E_TEST_FAILURE);

            // let duration_reward = reward_remaining_au * 50 * 1000000 / ((duration_seconds - 200) * 1000000);
            // let duration_reward = 38580246;
            // let acc_reward_per_share = 233686045714285714 + (duration_reward as u128) * REWARD_PER_SHARE_MUL / 500;
            let acc_reward_per_share = 310846537714285714;
            assert!(pool.acc_reward_per_share == acc_reward_per_share, (pool.acc_reward_per_share as u64));

            // Sender should receive 0 rewards (was not staking)
            let sender_reward = 0;
            sender_usdc = sender_usdc + sender_reward;
            assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);

            let sender_user_infos = borrow_global_mut<UserInfos<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            let sender_user_info = table::borrow_mut(&mut sender_user_infos.user_infos, pool_id);
            assert!(sender_user_info.amount_staked == 500, E_TEST_FAILURE);
            // assert!(user_info.reward_debt == (500 * acc_reward_per_share / REWARD_PER_SHARE_MUL as u128), E_TEST_FAILURE);
            assert!(sender_user_info.reward_debt == 155423268, (sender_user_info.reward_debt as u64));

            // All alice info is the same since she didn't claim
            assert!(coin::balance<FakeCoin<USDC>>(alice_addr) == (alice_usdc as u64), coin::balance<FakeCoin<USDC>>(alice_addr));

            let alice_user_infos = borrow_global_mut<UserInfos<FakeCoin<ETH>, FakeCoin<USDC>>>(alice_addr);
            let alice_user_info = table::borrow_mut(&mut alice_user_infos.user_infos, pool_id);
            assert!(alice_user_info.amount_staked == 500, E_TEST_FAILURE);
            // assert!(user_info.reward_debt == (500 * acc_reward_per_share / REWARD_PER_SHARE_MUL as u128), E_TEST_FAILURE);
            assert!(alice_user_info.reward_debt == 61728385, E_TEST_FAILURE);

            // reward_remaining - duration_reward
            let reward_remaining = 1999807098770;
            assert!(pool.reward_remaining == reward_remaining, pool.reward_remaining);
        };

        // TIME: end + 250
        // fast forward past pool expiration; both stakers withdraw all
        timestamp::fast_forward_seconds(duration_seconds);
        withdraw<FakeCoin<ETH>, FakeCoin<USDC>>(sender, pool_id, 500);
        withdraw<FakeCoin<ETH>, FakeCoin<USDC>>(alice, pool_id, 500);
        {
            sender_eth = sender_eth + 500;
            alice_eth = alice_eth + 500;
            assert!(coin::balance<FakeCoin<ETH>>(sender_addr) == sender_eth, E_TEST_FAILURE);
            assert!(coin::balance<FakeCoin<ETH>>(alice_addr) == alice_eth, E_TEST_FAILURE);
            let pools = borrow_global_mut<Pools<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            let pool = table::borrow_mut(&mut pools.pools, pool_id);

            // check new staked amount
            assert!(coin::value(&pool.stake) == 0, E_TEST_FAILURE);
            assert!(timestamp::now_microseconds() == end_time + 250 * 1000000, E_TEST_FAILURE);
            assert!(pool.last_update_time == timestamp::now_microseconds(), E_TEST_FAILURE);

            // let duration_reward = reward_remaining_au;
            // let duration_reward = 1999807098770;
            // let acc_reward_per_share = 310846537714285714 + (duration_reward as u128) * REWARD_PER_SHARE_MUL / 1000;
            let acc_reward_per_share = 2000117945307714285714;
            assert!(pool.acc_reward_per_share == acc_reward_per_share, E_TEST_FAILURE);

            // let sender_reward = 500 * acc_reward_per_share / REWARD_PER_SHARE_MUL - sender_reward_debt;
            let sender_reward = 999903549385;
            sender_usdc = sender_usdc + sender_reward;
            assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);

            let sender_user_infos = borrow_global_mut<UserInfos<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            let sender_user_info = table::borrow_mut(&mut sender_user_infos.user_infos, pool_id);
            assert!(sender_user_info.amount_staked == 0, E_TEST_FAILURE);
            // assert!(user_info.reward_debt == (0 * acc_reward_per_share / REWARD_PER_SHARE_MUL as u128), E_TEST_FAILURE);
            assert!(sender_user_info.reward_debt == 0, (sender_user_info.reward_debt as u64));

            // All alice info is the same since she didn't claim
            // let alice_reward = 500 * acc_reward_per_share / REWARD_PER_SHARE_MUL - alice_reward_debt;
            let alice_reward = 999997244268;
            alice_usdc = alice_usdc + alice_reward;
            assert!(coin::balance<FakeCoin<USDC>>(alice_addr) == (alice_usdc as u64), coin::balance<FakeCoin<USDC>>(alice_addr));

            let alice_user_infos = borrow_global_mut<UserInfos<FakeCoin<ETH>, FakeCoin<USDC>>>(alice_addr);
            let alice_user_info = table::borrow_mut(&mut alice_user_infos.user_infos, pool_id);
            assert!(alice_user_info.amount_staked == 0, E_TEST_FAILURE);
            // assert!(user_info.reward_debt == (0 * acc_reward_per_share / REWARD_PER_SHARE_MUL as u128), E_TEST_FAILURE);
            assert!(alice_user_info.reward_debt == 0, E_TEST_FAILURE);

            // reward_remaining - duration_reward
            assert!(reward_au - (alice_usdc + sender_usdc) <= 1, E_TEST_FAILURE);
            let reward_remaining = 0;
            assert!(pool.reward_remaining == reward_remaining, pool.reward_remaining);
        };

    }

}