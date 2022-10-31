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
        last_reward_update_time: u64,  // timestamp (microseconds) of last reward update
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
    fun update_reward<S, R>() acquires Incentive {
        assert!(exists<Incentive<S, R>>(@aux), E_INCENTIVE_NOT_FOUND);
        let incentive = borrow_global_mut<Incentive<S, R>>(@aux);
        let now = timestamp::now_microseconds();
        // let delta = now - incentive.last_reward_update_time;
        let i = 0;
        let positions = &mut incentive.positions;
        let len = vector::length(positions);
        let total_staked = incentive.total_staked;

        // iterate through all pre-existing positions
        while (i < len) {
            let pos = vector::borrow_mut(positions, i);
            if (now >= pos.next_unlock_time) {
                pos.unlocked_reward = pos.unlocked_reward + pos.locked_reward;
                pos.locked_reward = 0;
            };
            let last_unlock_time = last_unlock_time(incentive.start_time, now, incentive.unlock_seconds);
            pos.next_unlock_time = last_unlock_time + incentive.unlock_seconds * 1000000;
            let time_remaining = incentive.end_time - now;
            let (unlocked_reward, locked_reward) = if (pos.last_reward_update_time < last_unlock_time) {
                // rewards have unlocked since last update
                let unlocked_reward = pos.amount_staked / total_staked * (last_unlock_time - pos.last_reward_update_time) / time_remaining * incentive.reward_remaining;
                let locked_reward = pos.amount_staked / total_staked * (now - last_unlock_time) / time_remaining * incentive.reward_remaining;
                (unlocked_reward, locked_reward)
            } else {
                // no rewards have unlocked since last update
                let locked_reward = pos.amount_staked / total_staked * (now - pos.last_reward_update_time) / time_remaining * incentive.reward_remaining;
                (0, locked_reward)
            };
            pos.unlocked_reward = pos.unlocked_reward + unlocked_reward;
            pos.locked_reward = pos.locked_reward + locked_reward;
            pos.last_reward_update_time = now;
            incentive.reward_remaining = incentive.reward_remaining - (locked_reward + unlocked_reward);

            i = i + 1;
        }
    }

    #[test_only]
    public fun setup_module_for_test(sender: &signer) {
        deployer::deployer::create_resource_account(sender, b"stake");
        authority::init_module_for_test(&deployer::deployer::get_signer_for_address(sender, @aux));
    }

    #[test_only]
    fun create_incentive_for_test<S, R>(sender: &signer, duration_micros: u64, unlock_seconds: u64, reward: Coin<R>) {
        let start_time = timestamp::now_microseconds();
        let module_authority = authority::get_signer_self();
        move_to(&module_authority, Incentive<S, R> {
            creator: signer::address_of(sender),
            start_time,
            end_time: start_time + duration_micros,
            last_reward_update_time: start_time,  // timestamp (microseconds) of last reward update
            unlock_seconds, // length of reward unlock period (seconds)
            reward_remaining: coin::value<R>(&reward),
            max_reward_per_stake_per_second: 1,   // MAX for: total_reward / (total_time * total_staked)
            total_staked: 0,
            stake: coin::zero<S>(),
            reward: reward,
            positions: vector::empty<Position>()
        })
    }

    #[test]
    fun test_update_reward() {

    }

    fun last_unlock_time(start_time: u64, now: u64, unlock_seconds: u64): u64 {
        //
        let unlock_microseconds = (unlock_seconds as u128) * 1000000;
        ((start_time as u128) + ((now - start_time) as u128) / unlock_microseconds * unlock_microseconds as u64)
    }

}