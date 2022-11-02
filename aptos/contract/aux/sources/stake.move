module aux::stake {
    use std::signer;
    use std::timestamp;
    use std::vector;

    use aptos_framework::coin::{Self, Coin};

    use aux::authority;

    /**********/
    /* ERRORS */
    /**********/
    const E_INCENTIVE_NOT_FOUND: u64 = 1;
    const E_INTERNAL_ERROR: u64 = 2;
    const E_TEST_FAILURE: u64 = 3;

    /*************/
    /* CONSTANTS */
    /*************/
    const MIN_UNLOCK_SECONDS: u64 = 60;


    /// TODO:
    /// - handle rewards < 0 (either aggregate rewards or ensure params are such that reward amount cannot be < 0)


    ///
    /// State Machine:
    /// - On stake:
    ///     - Update reward + sender position
    ///         - for each reward position:
    ///             - if now > next_unlock_time: move locked reward to unlocked reward
    ///             - update next_unlock_time
    ///                 - (start_time + [(now - start_time) / (unlock_seconds * 1e6) * (unlock_seconds * 1e6) + (unlock_seconds * 1e6)]
    ///             - if last_reward_update_time < last_unlock_time:
    ///                 - check max reward per stake per second
    ///                 - unlocked reward = user_stake / total_stake * (last_unlock_time - last_reward_update_time) / total_time * total_reward
    ///                 - locked reward = user_stake / total_stake * (now - last_unlock_time) / total_time * total_reward
    ///             - add unlocked reward to unlocked_reward
    ///             - add locked reward to locked_reward
    ///             - update last_reward_update_time
    ///             - deduct (locked_reward + unlocked_reward) from reward_remaining
    ///             - if position address == sender address: update amount_staked
    ///         - if new sender, create new position
    ///         - merge staked
    ///         - update total_staked
    /// - On unstake (same as stake):
    ///     - Update reward + sender position
    /// - On claim:
    ///     - For sender's reward position:
    ///         - update reward
    ///         - transfer unlocked reward of reward coin to sender
    ///         - set unlocked reward to 0
    ///         - update next_unlock_time
    /// - On update reward:
    ///     - for each reward position:
    ///         - if now > next_unlock_time: move locked reward to unlocked reward
    ///         - update next_unlock_time
    ///             - (start_time + [(now - start_time) / (unlock_seconds * 1e6) * (unlock_seconds * 1e6) + (unlock_seconds * 1e6)]
    ///         - if last_reward_update_time < last_unlock_time:
    ///             - check max reward per stake per second
    ///             - unlocked reward = user_stake / total_stake * (last_unlock_time - last_reward_update_time) / total_time * total_reward
    ///             - locked reward = user_stake / total_stake * (now - last_unlock_time) / total_time * total_reward
    ///         - add unlocked reward to unlocked_reward
    ///         - add locked reward to locked_reward
    ///         - update last_reward_update_time
    ///         - deduct (locked_reward + unlocked_reward) from reward_remaining
    ///

    ///
    /// Example
    /// StakeCoin = aux::LP<APT, USDC>
    /// RewardCoin = APT
    /// reward_per_stake =
    ///

    struct Position has store {
        owner: address,
        amount_staked: u64,
        locked_reward: u64,
        unlocked_reward: u64,
        next_unlock_time: u64,
        last_reward_update_time: u64
    }

    struct St<phantom StakeCoin> has store {}

    struct Incentive<phantom StakeCoin, phantom RewardCoin> has key {
        creator: address,
        start_time: u64,
        end_time: u64,
        // next_unlock_time: u64,
        // reward_per_stake: u64,
        // last_reward_update_time: u64,  // timestamp (microseconds) of last reward update
        unlock_seconds: u64, // length of reward unlock period (seconds)
        reward_remaining: u64,
        max_reward_per_stake_per_second: u64,   // MAX for: total_reward / (total_time * total_staked)
        total_staked: u64,
        stake: Coin<StakeCoin>,
        reward: Coin<RewardCoin>,
        positions: vector<Position>


        // address creator;            // 1st slot
        // address token;              // 2nd slot
        // address rewardToken;        // 3rd slot
        // uint32 endTime;             // 3rd slot
        // uint256 rewardPerLiquidity; // 4th slot
        // uint32 lastRewardTime;      // 5th slot
        // uint112 rewardRemaining;    // 5th slot
        // uint112 liquidityStaked;    // 5th slot

    }

    /// - On stake:
    ///     - Update reward + sender position
    ///         - for each reward position:
    ///             - if now > next_unlock_time: move locked reward to unlocked reward
    ///             - update next_unlock_time
    ///                 - (start_time + [(now - start_time) / (unlock_seconds * 1e6) * (unlock_seconds * 1e6) + (unlock_seconds * 1e6)]
    ///             - if last_reward_update_time < last_unlock_time:
    ///                 - check max reward per stake per second
    ///                 - unlocked reward = user_stake / total_stake * (last_unlock_time - last_reward_update_time) / total_time * total_reward
    ///                 - locked reward = user_stake / total_stake * (now - last_unlock_time) / total_time * total_reward
    ///             - add unlocked reward to unlocked_reward
    ///             - add locked reward to locked_reward
    ///             - update last_reward_update_time
    ///             - deduct (locked_reward + unlocked_reward) from reward_remaining
    ///             - if position address == sender address: update amount_staked
    ///         - if new sender, create new position
    ///         - merge staked
    ///         - update total_staked
    fun stake<S, R>(sender: &signer, amount: u64) acquires Incentive {
        let incentive = borrow_global_mut<Incentive<S, R>>(@aux);
        let stake = coin::withdraw<S>(sender, amount);
        // coin::merge(&mut incentive.stake, stake);
        // incentive.total_staked = incentive.total_staked + amount;
        update_reward(incentive, true, signer::address_of(sender), stake);
        std::debug::print<u64>(&3);
    }

    // struct StakingVault<phantom StakeCoin, phantom RewardCoin> {
    //     owner:
    // }

    /// - On update reward:
    ///     - for each reward position:
    ///         - if now > next_unlock_time: move locked reward to unlocked reward
    ///         - update next_unlock_time
    ///             - (start_time + [(now - start_time) / (unlock_seconds * 1e6) * (unlock_seconds * 1e6) + (unlock_seconds * 1e6)]
    ///         - if last_reward_update_time < last_unlock_time:
    ///             - check max reward per stake per second
    ///             - unlocked reward = user_stake / total_stake * (last_unlock_time - last_reward_update_time) / time_remaining * reward_remaining
    ///             - locked reward = user_stake / total_stake * (now - last_unlock_time) / time_remaining * reward_remaining
    ///         - add unlocked reward to unlocked_reward
    ///         - add locked reward to locked_reward
    ///         - update last_reward_update_time
    ///         - deduct (locked_reward + unlocked_reward) from reward_remaining
    ///         - if update_stake:
    ///             - if position address == staker address: update amount_staked
    fun update_reward<S, R>(incentive: &mut Incentive<S, R>, update_stake: bool, staker: address, stake: Coin<S>) {
        let now = timestamp::now_microseconds();
        // let delta = now - incentive.last_reward_update_time;
        let i = 0;
        let positions = &mut incentive.positions;
        let len = vector::length(positions);
        let total_staked = incentive.total_staked;
        let unlock_microseconds = incentive.unlock_seconds * 1000000;
        let last_unlock_time = last_unlock_time(incentive.start_time, now, incentive.unlock_seconds);

        // iterate through all pre-existing positions
        let total_staked_check = 0;
        let staker_exists = false;
        while (i < len) {
            let pos = vector::borrow_mut(positions, i);
            if (now >= pos.next_unlock_time) {
                pos.unlocked_reward = pos.unlocked_reward + pos.locked_reward;
                pos.locked_reward = 0;
            };
            pos.next_unlock_time = last_unlock_time + unlock_microseconds;
            let reward_denom = (total_staked * (incentive.end_time - pos.last_reward_update_time) as u128);
            let (unlocked_reward, locked_reward) = if (pos.last_reward_update_time < last_unlock_time) {
                std::debug::print<u64>(&1);
                std::debug::print<u64>(&pos.last_reward_update_time);
                std::debug::print<u64>(&last_unlock_time);
                std::debug::print<u64>(&pos.amount_staked);
                std::debug::print<u64>(&total_staked);
                std::debug::print<u128>(&reward_denom);
                std::debug::print<u64>(&incentive.reward_remaining);
                // rewards have unlocked since last update
                let unlocked_reward = ((pos.amount_staked as u128)  * (last_unlock_time - pos.last_reward_update_time as u128) * (incentive.reward_remaining as u128) / reward_denom as u64);
                std::debug::print<u64>(&unlocked_reward);
                let locked_reward = ((pos.amount_staked as u128) * (now - last_unlock_time as u128) * (incentive.reward_remaining as u128) / reward_denom as u64);
                (unlocked_reward, locked_reward)
            } else {
                std::debug::print<u64>(&2);
                // no rewards have unlocked since last update
                let locked_reward = ((pos.amount_staked as u128) * (now - pos.last_reward_update_time as u128) * (incentive.reward_remaining as u128) / reward_denom as u64);
                (0, locked_reward)
            };
            pos.unlocked_reward = pos.unlocked_reward + unlocked_reward;
            pos.locked_reward = pos.locked_reward + locked_reward;
            pos.last_reward_update_time = now;
            incentive.reward_remaining = incentive.reward_remaining - (locked_reward + unlocked_reward);

            if (update_stake && pos.owner == staker) {
                let amount_staked = coin::value(&stake);
                pos.amount_staked = pos.amount_staked + amount_staked;
                staker_exists = true;
            };
            total_staked_check = total_staked_check + pos.amount_staked;

            i = i + 1;
        };
        if (update_stake) {
            let amount_staked = coin::value(&stake);
            if (!staker_exists) {
                vector::push_back(&mut incentive.positions, Position {
                    owner: staker,
                    amount_staked,
                    locked_reward: 0,
                    unlocked_reward: 0,
                    next_unlock_time: now + unlock_microseconds,
                    last_reward_update_time: now
                });
                total_staked_check = total_staked_check + amount_staked;
            };
            coin::merge(&mut incentive.stake, stake);
            incentive.total_staked = incentive.total_staked + amount_staked;
        } else {
            coin::destroy_zero<S>(stake);
        };
        assert!(total_staked_check == incentive.total_staked, E_INTERNAL_ERROR);
        assert!(total_staked_check == coin::value(&incentive.stake), E_INTERNAL_ERROR);
    }

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


    #[test_only]
    fun create_incentive_for_test<S, R>(sender: &signer, duration_micros: u64, unlock_seconds: u64, reward: Coin<R>) {
        let start_time = timestamp::now_microseconds();
        let module_authority = authority::get_signer_self();
        move_to(&module_authority, Incentive<S, R> {
            creator: signer::address_of(sender),
            start_time,
            end_time: start_time + duration_micros,
            // last_reward_update_time: start_time,  // timestamp (microseconds) of last reward update
            unlock_seconds, // length of reward unlock period (seconds)
            reward_remaining: coin::value<R>(&reward),
            max_reward_per_stake_per_second: 1,   // MAX for: total_reward / (total_time * total_staked)
            total_staked: 0,
            stake: coin::zero<S>(),
            reward: reward,
            positions: vector::empty<Position>()
        })
    }

    #[test_only]
    fun days_to_micros(days: u64): u64 {
        days * 24 * 3600 * 1000000
    }

    #[test_only]
    fun days_to_seconds(days: u64): u64 {
        days * 24 * 3600
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1, alice = @0x123)]
    fun test_update_reward(sender: &signer, aptos_framework: &signer, alice: &signer) acquires Incentive {
        setup_module_for_test(sender, aptos_framework);

        // 90 day duration
        // 1 day unlock
        fake_coin::register_and_mint<USDC>(sender, 2000000 * 1000000); // 2M USDC
        fake_coin::register_and_mint<ETH>(sender, 5 * 100000000); // 5 ETH
        let reward_au = 2000000 * 1000000;
        let reward = coin::withdraw<FakeCoin<USDC>>(sender, 2000000 * 1000000);

        // Incentive:
        // duration = 30 days = 30*24*3600*1000000 microseconds
        // reward = 2e14 AU ETH
        // reward per second = 77,160,493.82716049
        let duration_seconds = 30*24*3600;
        create_incentive_for_test<FakeCoin<ETH>, FakeCoin<USDC>>(sender, days_to_micros(30), days_to_seconds(1), reward);
        {
            let incentive = borrow_global_mut<Incentive<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            assert!(incentive.total_staked == 0, E_TEST_FAILURE);
            assert!(incentive.creator == signer::address_of(sender), E_TEST_FAILURE);
            assert!(incentive.start_time == timestamp::now_microseconds(), E_TEST_FAILURE);
            assert!(incentive.end_time == timestamp::now_microseconds() + duration_seconds * 1000000, E_TEST_FAILURE);
            // assert!(incentive.last_reward_update_time == timestamp::now_microseconds() * 1000000, E_TEST_FAILURE);
            assert!(incentive.unlock_seconds == 24*3600, E_TEST_FAILURE);
            assert!(incentive.reward_remaining == reward_au, E_TEST_FAILURE);
            assert!(incentive.max_reward_per_stake_per_second == 1, E_TEST_FAILURE);
            assert!(coin::value(&incentive.reward) == reward_au, E_TEST_FAILURE);
            assert!(vector::length(&incentive.positions) == 0, E_TEST_FAILURE);
        };

        // Sender stakes 100 au ETH
        stake<FakeCoin<ETH>, FakeCoin<USDC>>(sender, 100);
        {
            let incentive = borrow_global_mut<Incentive<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            assert!(incentive.total_staked == 100, E_TEST_FAILURE);
            assert!(vector::length(&incentive.positions) == 1, E_TEST_FAILURE);
            let pos = vector::borrow(&incentive.positions, 0);
            assert!(pos.owner == signer::address_of(sender), E_TEST_FAILURE);
            assert!(pos.amount_staked == 100, E_TEST_FAILURE);
            assert!(pos.locked_reward == 0, E_TEST_FAILURE);
            assert!(pos.unlocked_reward == 0, E_TEST_FAILURE);
            assert!(pos.last_reward_update_time == timestamp::now_microseconds(), E_TEST_FAILURE);

            // fast forward half unlock period and update reward
            timestamp::fast_forward_seconds(86400 / 2);
            update_reward(incentive, false, @0x0, coin::zero<FakeCoin<ETH>>());

            // full amount should be locked
            assert!(vector::length(&incentive.positions) == 1, E_TEST_FAILURE);
            let pos = vector::borrow(&incentive.positions, 0);
            // remaining_reward * (86400/2 % unlock_seconds)  / remaining_seconds;
            let expected_locked_reward = 33333333333;
            let expected_unlocked_reward = 0;
            std::debug::print<u64>(&expected_locked_reward);
            std::debug::print<u64>(&expected_unlocked_reward);
            assert!(pos.owner == signer::address_of(sender), E_TEST_FAILURE);
            assert!(pos.amount_staked == 100, E_TEST_FAILURE);
            std::debug::print<u64>(&pos.locked_reward);
            std::debug::print<u64>(&pos.unlocked_reward);
            assert!(pos.locked_reward == expected_locked_reward, E_TEST_FAILURE);
            assert!(pos.unlocked_reward == expected_unlocked_reward, E_TEST_FAILURE);
            assert!(pos.last_reward_update_time == timestamp::now_microseconds(), E_TEST_FAILURE);

            // fast forward full unlock period and update reward
            timestamp::fast_forward_seconds(86400 / 2);
            update_reward(incentive, false, @0x0, coin::zero<FakeCoin<ETH>>());

            // full amount should be unlocked
            assert!(vector::length(&incentive.positions) == 1, E_TEST_FAILURE);
            let pos = vector::borrow(&incentive.positions, 0);
            let expected_locked_reward = 0;
            // 33333333333 + (remaining_reward * 86400/2 / (incentive_duration - 86400/2));
            let expected_unlocked_reward = 33333333333 + 33333333333;
            std::debug::print<u64>(&expected_locked_reward);
            std::debug::print<u64>(&expected_unlocked_reward);
            assert!(pos.owner == signer::address_of(sender), E_TEST_FAILURE);
            assert!(pos.amount_staked == 100, E_TEST_FAILURE);
            std::debug::print<u64>(&pos.locked_reward);
            std::debug::print<u64>(&pos.unlocked_reward);
            assert!(pos.locked_reward == expected_locked_reward, E_TEST_FAILURE);
            assert!(pos.unlocked_reward == expected_unlocked_reward, E_TEST_FAILURE);
            assert!(pos.last_reward_update_time == timestamp::now_microseconds(), E_TEST_FAILURE);
        };


        // fast forward half unlock period and stake another 100 au ETH
        timestamp::fast_forward_seconds(86400 / 2);
        stake<FakeCoin<ETH>, FakeCoin<USDC>>(sender, 100);

        // same amount should be unlocked; additional half reward period should be locked
        {
            let incentive = borrow_global_mut<Incentive<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            assert!(vector::length(&incentive.positions) == 1, E_TEST_FAILURE);
            let pos = vector::borrow(&incentive.positions, 0);
            // 100 * remaining_reward * (86400/2 % unlock_seconds)  / (remaining_seconds * 200);
            let expected_locked_reward = 33333333333;
            // 33333333333 + (remaining_reward * 86400/2 / (incentive_duration - 86400/2));
            let expected_unlocked_reward = 33333333333 + 33333333333;
            std::debug::print<u64>(&expected_locked_reward);
            std::debug::print<u64>(&expected_unlocked_reward);
            assert!(pos.owner == signer::address_of(sender), E_TEST_FAILURE);
            assert!(pos.amount_staked == 200, E_TEST_FAILURE);
            std::debug::print<u64>(&pos.locked_reward);
            std::debug::print<u64>(&pos.unlocked_reward);
            assert!(pos.locked_reward == expected_locked_reward, E_TEST_FAILURE);
            assert!(pos.unlocked_reward == expected_unlocked_reward, E_TEST_FAILURE);
            assert!(pos.last_reward_update_time == timestamp::now_microseconds(), E_TEST_FAILURE);

            // fast forward half unlock period and update reward
            timestamp::fast_forward_seconds(86400 / 2);
            update_reward(incentive, false, @0x0, coin::zero<FakeCoin<ETH>>());

            // Two full reward periods of rewards should be unlocked, 0 locked
            let incentive = borrow_global_mut<Incentive<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            assert!(vector::length(&incentive.positions) == 1, E_TEST_FAILURE);
            let pos = vector::borrow(&incentive.positions, 0);
            // 100 * remaining_reward * (86400/2 % unlock_seconds)  / (remaining_seconds * 200);
            let expected_locked_reward = 0;
            // 33333333333 + (remaining_reward * 86400/2 / (incentive_duration - 86400/2));
            let expected_unlocked_reward = 2 * (33333333333 + 33333333333);
            std::debug::print<u64>(&expected_locked_reward);
            std::debug::print<u64>(&expected_unlocked_reward);
            assert!(pos.owner == signer::address_of(sender), E_TEST_FAILURE);
            assert!(pos.amount_staked == 200, E_TEST_FAILURE);
            std::debug::print<u64>(&pos.locked_reward);
            std::debug::print<u64>(&pos.unlocked_reward);
            assert!(pos.locked_reward == expected_locked_reward, E_TEST_FAILURE);
            assert!(pos.unlocked_reward == expected_unlocked_reward, E_TEST_FAILURE);
            assert!(pos.last_reward_update_time == timestamp::now_microseconds(), E_TEST_FAILURE);
        };

        // Alice stakes 500 au ETH
        // TODO: register alice account and give her some money
        // stake<FakeCoin<ETH>, FakeCoin<USDC>>(alice, 500);

    }

    fun last_unlock_time(start_time: u64, now: u64, unlock_seconds: u64): u64 {
        //
        let unlock_microseconds = (unlock_seconds as u128) * 1000000;
        ((start_time as u128) + ((now - start_time) as u128) / unlock_microseconds * unlock_microseconds as u64)
    }

}