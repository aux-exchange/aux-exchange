module aux::stake {
    use std::simple_map::SimpleMap;
    use std::timestamp;

    use aptos_framework::coin::Coin;

    /**********/
    /* ERRORS */
    /**********/
    const E_INCENTIVE_NOT_FOUND: u64 = 1;

    /*************/
    /* CONSTANTS */
    /*************/
    const MIN_UNLOCK_SECONDS: u64 = 60;


    ///
    /// State Machine:
    /// - On stake:
    ///     - Update reward + sender position
    ///         - snapshot total LP
    ///         - get time delta since last reward update
    ///         - for each reward position:
    ///             - if now > next_unlock_time: move locked reward to unlocked reward
    ///             - update next_unlock_time
    ///                 - (start_time + [(now - start_time) / (unlock_seconds * 1e6) * (unlock_seconds * 1e6) + (unlock_seconds * 1e6)]
    ///             - reward = user_stake / total_stake * delta / total_time * total_reward
    ///             - add reward to locked reward
    ///             - deduct reward from reward_remaining
    ///             - if position address == sender address: update amount_staked
    ///         - update last reward update
    ///         - update total_staked
    /// - On unstake (same as stake):
    ///     - Update reward + sender position
    ///     - update next_unlock_time
    /// - On claim:
    ///     - For sender's reward position:
    ///         - if now > next_unlock_time: move locked reward to unlocked reward
    ///         - transfer unlocked reward of reward coin to sender
    ///         - set unlocked reward to 0
    ///         - update next_unlock_time
    ///
    /// NOTES:
    /// - next_reward_time can only be updated if every position is updated at the same time to reflect the unlock

    ///
    /// Example
    /// StakeCoin = aux::LP<APT, USDC>
    /// RewardCoin = APT
    /// reward_per_stake =
    ///

    struct Position has store {
        amount_staked: u64,
        locked_reward: u64,
        unlocked_reward: u64,
        next_unlock_time: u64
    }

    struct St<phantom StakeCoin> has store {}

    struct Incentive<phantom StakeCoin, phantom RewardCoin> has key {
        creator: address,
        start_time: u64,
        end_time: u64,
        // next_unlock_time: u64,
        // reward_per_stake: u64,
        last_reward_update_time: u64,  // timestamp (microseconds) of last reward update
        unlock_seconds: u128, // length of reward unlock period (seconds)
        reward_remaining: u64,
        max_reward_per_stake_per_second: u64,   // MAX for: total_reward / (total_time * total_staked)
        coins_staked: u64,
        stake: Coin<StakeCoin>,
        reward: Coin<RewardCoin>,
        positions: SimpleMap<address, Position>


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

    fun update_reward<S, R>() acquires Incentive {
       //
       assert!(exists<Incentive<S, R>>(@aux), E_INCENTIVE_NOT_FOUND);
       let incentive = borrow_global_mut<Incentive<S, R>>(@aux);
       let now = timestamp::now_microseconds();
       let delta = now - incentive.last_reward_update_time;
    }

}