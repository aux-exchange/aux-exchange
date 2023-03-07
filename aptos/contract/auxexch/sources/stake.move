/// Simple coin staking module, modeled after SushiSwap's MasterChef: https://github.com/sushiswap/sushiswap/blob/archieve/canary/contracts/MasterChef.sol
///
/// Explanation of lazy reward update mechanism
/// ===========================================
/// **NOTE** this explanation ignores the REWARD_PER_SHARE_MUL, but the mechanism is the same.
///
/// Let's say a pool was initialized with the following parameters:
/// - reward = 1000 r (reward)
/// - time = 5000 s (seconds)
///
/// The following events occur:
///
///        duration_0  duration_1   ------ duration_2 -------
///        /        \ /         \ /                           \
///       |==========|===========|=============================|>
/// time: 0          1000        2000                          5000
///       |          |           |                             |
///       Alice      Bob         Bob                           Bob + Alice
///       stakes     stakes      stakes                        withdraw
///       100        100         100                           all
///
/// The **pool state** over time looks like this:
/// ---------------------------------------------
///     reward_duration_0 = 1000s / 5000s * 1000r
///                       = 200r
///     acc_reward_per_share(time=1000) = reward_duration_0 / 100 shares
///                                     = 2 r/share
///
///     reward_duration_1 = 1000s / 4000s * 800r
///                       = 200r
///     acc_reward_per_share(time=2000) = reward_duration_0 / 100 shares +
///                                       reward_duration_2 / 200 shares
///                                     = 2 + 200r / 200 shares
///                                     = 3 r/share
///
///     reward_duration_2 = 3000s / 3000s * 600r
///                       = 600r
///     acc_reward_per_share(time=5000) = reward_duration_0 / 100 shares +
///                                       reward_duration_2 / 200 shares +
///                                       duration_reward_3 / 300 shares
///                                     = 2 + 1 + 600r / 300 shares
///                                     = 5 r/share
///
/// Alice's state over time looks like this:
/// ----------------------------------------
///     stake(time=0) = 100
///
/// Alice's stake remained constant over the reward duration.
/// Given this, we would expect Alice's reward at time 5000 to be:
///     reward(time=5000) = 100 shares * reward_duration_0 / 100 shares +
///                         100 shares * reward_duration_1 / 200 shares +
///                         100 shares * reward_duration_2 / 300 shares
///                       = 100 shares * (reward_duration_0 / 100 shares +
///                                       reward_duration_1 / 200 shares +
///                                       reward_duration_2 / 300 shares)
/// which is equivalent to how it's actually calculated:
///     reward(time=5000) = stake(time=0) * (acc_reward_per_share(time=5000) - acc_reward_per_share(time=0))
///                       = 100 shares * acc_reward_per_share(time=5000)
///                       = 100 shares * 5
///                       = 500r
///
/// Bob's state over time looks like:
/// ---------------------------------
///     stake(time=1000) = 100
///
/// Bob updated his stake at time 2000, which forced him to receive his pending reward.
/// We would expect his reward to be:
///     reward(time=2000) = 100 shares * reward_duration_1 / 100 shares
/// which can be rewritten as:
///     reward(time=2000) = 100 shares * (reward_duration_0 / 100 shares +
///                                       reward_duration_1 / 200 shares)
///                         - 100 shares * reward_duration_0 / 100 shares
///                       = 100 shares * (acc_reward_per_share(time=2000) - acc_reward_per_share(time=1000))
///                       = 100 shares * (3 r/s - 2 r/s) = 100r
/// which is equivalent to how it's actually calculated:
///      reward(time=2000) = stake(time=1000) * (acc_reward_per_share(time=2000) - acc_reward_per_share(time=1000))
///
/// Now, Bob's state is updated to:
///     stake(time=2000) = 200
///
/// When Bob collects his reward at time 5000, we would expect it to be:
///     reward(time=5000) = 200 shares * (reward_duration_2 / 300 shares)
/// which can be rewritten as:
///     reward(time=5000) = 200 shares * (reward_duration_0 / 100 shares +
///                                       reward_duration_1 / 200 shares +
///                                       reward_duration_2 / 300 shares)
///                         - 200 shares * (reward_duration_0 / 100 shares +
///                                         reward_duration_1 / 200 shares)
///                       = 200 shares * (acc_reward_per_share(time=5000) - acc_reward_per_share(time=2000))
///                       = 200 shares * (5 r/s - 3 r/s) = 400r
/// which is equivalent to how it's actually calculated:
///      reward(time=5000) = stake(time=3000) * (acc_reward_per_share(time=5000) - acc_reward_per_share(time=2000))
///
module aux::stake {
    use std::signer;
    use std::string;
    use std::option;

    use aptos_framework::coin::{Coin, Self};
    use aptos_framework::timestamp;
    use aptos_framework::event::{EventHandle, Self};
    use aptos_framework::account;

    use aux::authority;


    /*************/
    /* CONSTANTS */
    /*************/
    const MIN_DURATION_US: u64 = 3600 * 24 * 1000000; // 1 day
    const MAX_DURATION_US: u64 = 3600 * 24 * 365 * 1000000; // 1 year
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
    const E_CANNOT_DELETE_POOL: u64 = 11;
    const E_POOL_ALREADY_EXISTS: u64 = 12;

    /***********/
    /* STRUCTS */
    /***********/

    /// Wrapped staked coin type, used to rehyptohecate staked coins to support "double dip" rewards
    struct St<phantom S> {}
    struct StInfo<phantom S> has key {
        burn: coin::BurnCapability<St<S>>,
        mint: coin::MintCapability<St<S>>
    }

    /// Stored at user's address once they open a staking position
    struct UserPosition<phantom S, phantom R> has key, store {
        amount_staked: u64,
        last_acc_reward_per_share: u128
        // From MasterChef:
        // We do some fancy math here. Basically, any point in time, the amount of reward
        // entitled to a user but is pending to be distributed is:
        //
        //   pending reward = user.amount_staked * (pool.acc_reward_per_share - user.last_acc_reward_per_share)
        //
        // Whenever a user deposits/withdraws staked coins to a pool or claims their reward, here's what happens:
        //   1. The pool's `acc_reward_per_share` (and `last_reward_time`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount_staked` gets updated.
        //   4. User's `last_acc_reward_per_share` gets updated.
    }

    struct Pool<phantom S, phantom R> has key, store {
        authority: address,
        start_time: u64,
        end_time: u64,
        reward_remaining: u64,
        stake: Coin<S>,
        reward: Coin<R>,
        last_update_time: u64,
        acc_reward_per_share: u128,  // accumulated Coin<R> per share, times REWARD_PER_SHARE_MUL.

        // stake coin management
        burn: coin::BurnCapability<St<S>>,
        mint: coin::MintCapability<St<S>>,

        // events
        create_pool_events: EventHandle<CreatePoolEvent<S, R>>,
        deposit_events: EventHandle<DepositEvent<S, R>>,
        withdraw_events: EventHandle<WithdrawEvent<S, R>>,
        modify_pool_events: EventHandle<ModifyPoolEvent<S, R>>,
        claim_events: EventHandle<ClaimEvent<S, R>>,
    }

    struct CreatePoolEvent<phantom S, phantom R> has store, drop {
        authority: address,
        start_time: u64,
        end_time: u64,
        reward_amount: u64,
        timestamp: u64
    }

    struct DepositEvent<phantom S, phantom R> has store, drop {
        user: address,
        deposit_amount: u64,
        user_reward_amount: u64,
        user_amount_staked: u64,
        total_amount_staked: u64,
        reward_remaining: u64,
        acc_reward_per_share: u128,
        timestamp: u64
    }

    struct WithdrawEvent<phantom S, phantom R> has store, drop {
        user: address,
        withdraw_amount: u64,
        user_reward_amount: u64,
        user_amount_staked: u64,
        total_amount_staked: u64,
        reward_remaining: u64,
        acc_reward_per_share: u128,
        timestamp: u64
    }

    struct ClaimEvent<phantom S, phantom R> has store, drop {
        user: address,
        reward_amount: u64,
        total_amount_staked: u64,
        reward_remaining: u64,
        acc_reward_per_share: u128,
        timestamp: u64
    }

    struct ModifyPoolEvent<phantom S, phantom R> has store, drop {
        authority: address,
        start_time: u64,
        end_time: u64,
        reward_remaining: u64,
        total_amount_staked: u64,
        acc_reward_per_share: u128,
        timestamp: u64
    }

    /*******************/
    /* ENTRY FUNCTIONS */
    /*******************/

    /// Entry function to create a new incentive pool for `S` staked coin and `R` reward coin
    /// `reward_amount` will be transferred from `sender` to the pool
    /// `end_time` should be specified as microseconds from the UNIX epoch
    public entry fun create<S, R>(
        sender: &signer,
        reward_amount: u64,
        duration_us: u64, // us
    ) acquires StInfo {
        // Only one pool can exist per stake coin. To double dip, a pool must be created for St<S>
        assert!(!exists<Pool<S, R>>(@aux), E_POOL_ALREADY_EXISTS);
        let start_time = timestamp::now_microseconds();
        assert!(duration_us >= MIN_DURATION_US, E_INVALID_DURATION);
        assert!(duration_us <= MAX_DURATION_US, E_INVALID_DURATION);
        let end_time = start_time + duration_us;
        assert!(reward_amount != 0, E_INVALID_REWARD);
        let module_authority = authority::get_signer_self();
        let reward = coin::withdraw<R>(sender, reward_amount);
        let authority = signer::address_of(sender);

        // Create Coin
        let (mint, burn) =
            if (coin::is_coin_initialized<St<S>>()) {
                assert!(exists<StInfo<S>>(@aux), E_POOL_ALREADY_EXISTS);
                let StInfo {
                    mint,
                    burn
                } = move_from<StInfo<S>>(@aux);
                (mint, burn)
            } else {
                let name = string::utf8(b"");
                let stake_coin_name = coin::name<S>();
                let name_len = string::length(&stake_coin_name);
                let end = if (name_len > 30) {
                    30
                } else {
                    name_len
                };
                string::append(&mut name, string::utf8(b"St"));
                string::append(&mut name, string::sub_string(&stake_coin_name, 0, end));
                let symbol = string::utf8(b"");
                let stake_coin_symbol = coin::symbol<S>();
                let symbol_len = string::length(&stake_coin_symbol);
                let end = if (symbol_len > 8) {
                    8
                } else {
                    symbol_len
                };
                string::append(&mut symbol, string::utf8(b"st"));
                string::append(&mut symbol, string::sub_string(&stake_coin_symbol, 0, end));
                let (burn, freeze, mint) = coin::initialize<St<S>>(
                    &module_authority,
                    name,
                    symbol,
                    coin::decimals<S>(),
                    true // monitor_supply
                );
                coin::destroy_freeze_cap(freeze);
                (mint, burn)
            };
        if (!coin::is_account_registered<St<S>>(@aux)) {
            coin::register<St<S>>(&module_authority);
        };
        let pool = Pool {
                authority,
                start_time,
                end_time,
                reward_remaining: reward_amount,
                stake: coin::zero<S>(),
                reward,
                last_update_time: start_time,
                acc_reward_per_share: 0,
                burn,
                mint,
                create_pool_events: account::new_event_handle<CreatePoolEvent<S, R>>(&module_authority),
                deposit_events: account::new_event_handle<DepositEvent<S, R>>(&module_authority),
                withdraw_events: account::new_event_handle<WithdrawEvent<S, R>>(&module_authority),
                modify_pool_events: account::new_event_handle<ModifyPoolEvent<S, R>>(&module_authority),
                claim_events: account::new_event_handle<ClaimEvent<S, R>>(&module_authority),
        };
        event::emit_event<CreatePoolEvent<S, R>>(
            &mut pool.create_pool_events,
            CreatePoolEvent {
                authority: authority,
                start_time,
                end_time,
                reward_amount,
                timestamp: start_time
            }
        );
        move_to<Pool<S, R>>(
            &module_authority,
            pool
        )
    }

    /// Delete an expired and empty incentive pool.
    public entry fun delete_empty_pool<S, R>(
        sender: &signer,
    ) acquires Pool {
        assert!(exists<Pool<S, R>>(@aux), E_INCENTIVE_POOL_NOT_FOUND);
        let pool = move_from<Pool<S, R>>(@aux);
        let now = timestamp::now_microseconds();
        update_pool(&mut pool, now);

        let sender_addr = signer::address_of(sender);
        assert!(sender_addr == pool.authority, E_NOT_AUTHORIZED);
        assert!(pool.reward_remaining == 0, E_CANNOT_DELETE_POOL);
        // checking stake == 0 ensures all pending rewards have been claimed
        assert!(coin::value(&(pool.stake)) == 0, E_CANNOT_DELETE_POOL);
        assert!(now >= pool.end_time, E_CANNOT_DELETE_POOL);

        // Ensure supply of stake coin is 0 (all has been burned via redemptions)
        assert!(*option::borrow(&coin::supply<St<S>>()) == 0, E_CANNOT_DELETE_POOL);

        let Pool {
            authority: _,
            start_time: _,
            end_time: _,
            reward_remaining: _,
            stake,
            reward,
            last_update_time: _,
            acc_reward_per_share: _,  // accumulated Coin<R> per share, times REWARD_PER_SHARE_MUL.
            mint,
            burn,
            deposit_events,
            create_pool_events,
            claim_events,
            modify_pool_events,
            withdraw_events
        } = pool;

        let module_authority = authority::get_signer_self();
        move_to(&module_authority, StInfo<S> { mint, burn});
        // coin::destroy_mint_cap(mint);
        // coin::destroy_burn_cap(burn);

        event::destroy_handle<DepositEvent<S, R>>(deposit_events);
        event::destroy_handle<CreatePoolEvent<S, R>>(create_pool_events);
        event::destroy_handle<ClaimEvent<S, R>>(claim_events);
        event::destroy_handle<ModifyPoolEvent<S, R>>(modify_pool_events);
        event::destroy_handle<WithdrawEvent<S, R>>(withdraw_events);

        coin::destroy_zero(stake);

        // There may be a single AU of reward remaining
        if (coin::value(&reward) > 0) {
            coin::deposit(sender_addr, reward);
        } else {
            coin::destroy_zero(reward);
        };
    }

    /// Modify the incentive pool authority.
    /// Only the pool's current authority can modify the authority.
    public entry fun modify_authority<S, R>(
        sender: &signer,
        new_authority: address
    ) acquires Pool {
        assert!(exists<Pool<S, R>>(@aux), E_INCENTIVE_POOL_NOT_FOUND);
        let pool = borrow_global_mut<Pool<S, R>>(@aux);

        let sender_addr = signer::address_of(sender);
        assert!(sender_addr == pool.authority, E_NOT_AUTHORIZED);
        let now = timestamp::now_microseconds();
        update_pool(pool, now);

        pool.authority = new_authority;

        event::emit_event<ModifyPoolEvent<S, R>>(
            &mut pool.modify_pool_events,
            ModifyPoolEvent {
                authority: pool.authority,
                start_time: pool.start_time,
                end_time: pool.end_time,
                reward_remaining: pool.reward_remaining,
                total_amount_staked: coin::value(&pool.stake),
                acc_reward_per_share: pool.acc_reward_per_share,
                timestamp: now
            }
        );
    }

    /// End reward early by removing all remaining reward from the pool.
    /// Can only be called by stake pool authority.
    public entry fun end_reward_early<S, R>(
        sender: &signer,
    ) acquires Pool {
        assert!(exists<Pool<S, R>>(@aux), E_INCENTIVE_POOL_NOT_FOUND);
        let pool = borrow_global_mut<Pool<S, R>>(@aux);

        let sender_addr = signer::address_of(sender);
        assert!(sender_addr == pool.authority, E_NOT_AUTHORIZED);

        let now = timestamp::now_microseconds();
        update_pool(pool, now);

        // transfer remaining reward to sender
        let reward = coin::extract(&mut pool.reward, pool.reward_remaining);
        if (!coin::is_account_registered<R>(sender_addr)) {
            coin::register<R>(sender);
        };
        coin::deposit(sender_addr, reward);
        pool.reward_remaining = 0;
        pool.end_time = now;

        event::emit_event<ModifyPoolEvent<S, R>>(
            &mut pool.modify_pool_events,
            ModifyPoolEvent {
                authority: pool.authority,
                start_time: pool.start_time,
                end_time: pool.end_time,
                reward_remaining: pool.reward_remaining,
                total_amount_staked: coin::value(&pool.stake),
                acc_reward_per_share: pool.acc_reward_per_share,
                timestamp: now
            }
        );
    }

    /// Modify incentive pool parameters.
    /// Only the pool's authority can modify parameters.
    public entry fun modify_pool<S, R>(
        sender: &signer,
        reward_amount: u64,
        reward_increase: bool,
        time_amount_us: u64,
        time_increase: bool,
    ) acquires Pool {
        assert!(exists<Pool<S, R>>(@aux), E_INCENTIVE_POOL_NOT_FOUND);
        let pool = borrow_global_mut<Pool<S, R>>(@aux);

        let sender_addr = signer::address_of(sender);
        assert!(sender_addr == pool.authority, E_NOT_AUTHORIZED);

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

        if (time_amount_us > 0 && time_increase) {
            // If the pool has expired, start the reward period from now
            if (now >= pool.end_time) {
                pool.start_time = now;
                pool.end_time = now + time_amount_us;
            } else {
                pool.end_time = pool.end_time + time_amount_us;
            }
        } else if (time_amount_us > 0 && !time_increase) {
            assert!(time_amount_us < pool.end_time, E_INVALID_DURATION);
            pool.end_time = pool.end_time - time_amount_us;
            assert!(pool.end_time > now, E_INVALID_DURATION);
        };
        // If any reward remains undistributed, the end time must be in the
        // future so that the remaining reward can be distributed
        if (pool.reward_remaining > 0) {
            assert!(pool.end_time > now, E_INVALID_DURATION);
        };
        if (pool.end_time > now) {
            assert!(pool.end_time - pool.start_time <= MAX_DURATION_US, E_INVALID_DURATION);
            assert!(pool.end_time - pool.start_time >= MIN_DURATION_US, E_INVALID_DURATION);
        };

        event::emit_event<ModifyPoolEvent<S, R>>(
            &mut pool.modify_pool_events,
            ModifyPoolEvent {
                authority: pool.authority,
                start_time: pool.start_time,
                end_time: pool.end_time,
                reward_remaining: pool.reward_remaining,
                total_amount_staked: coin::value(&pool.stake),
                acc_reward_per_share: pool.acc_reward_per_share,
                timestamp: now
            }
        );
    }

    /// Deposit stake coin to the incentive pool to start earning rewards.
    /// All pending rewards will be transferred to `sender`.
    public entry fun deposit<S, R>(sender: &signer, amount: u64) acquires Pool, UserPosition {
        assert!(amount > 0, E_INVALID_DEPOSIT_AMOUNT);
        assert!(exists<Pool<S, R>>(@aux), E_INCENTIVE_POOL_NOT_FOUND);
        let pool = borrow_global_mut<Pool<S, R>>(@aux);
        let now = timestamp::now_microseconds();
        update_pool(pool, now);

        // Deposit staked coin
        let stake = coin::withdraw<S>(sender, amount);
        coin::merge(&mut pool.stake, stake);

        // Update UserPosition
        let sender_addr = signer::address_of(sender);
        let deposit_event = if (!exists<UserPosition<S, R>>(sender_addr)) {
            move_to(sender, UserPosition<S, R> {
                amount_staked: amount,
                last_acc_reward_per_share: pool.acc_reward_per_share
            });
            DepositEvent<S, R> {
                user: sender_addr,
                deposit_amount: amount,
                user_reward_amount: 0,
                user_amount_staked: amount,
                total_amount_staked: coin::value(&pool.stake),
                reward_remaining: pool.reward_remaining,
                acc_reward_per_share: pool.acc_reward_per_share,
                timestamp: now
            }
        } else {
            let user_pos = borrow_global_mut<UserPosition<S, R>>(sender_addr);

            // Distribute pending rewards
            let pending_reward = distribute_pending_rewards(sender, user_pos, pool);

            // Update UserPosition
            user_pos.amount_staked = user_pos.amount_staked + amount;
            user_pos.last_acc_reward_per_share = pool.acc_reward_per_share;

            DepositEvent {
                user: sender_addr,
                deposit_amount: amount,
                user_reward_amount: (pending_reward as u64),
                user_amount_staked: user_pos.amount_staked,
                total_amount_staked: coin::value(&pool.stake),
                reward_remaining: pool.reward_remaining,
                acc_reward_per_share: pool.acc_reward_per_share,
                timestamp: now
            }
        };

        // Mint and deposit st coins
        let st_coin = coin::mint(amount, &pool.mint);
        if (!coin::is_account_registered<St<S>>(sender_addr)) {
            coin::register<St<S>>(sender);
        };
        coin::deposit(sender_addr, st_coin);
        assert!(*option::borrow(&coin::supply<St<S>>()) == (coin::value(&pool.stake) as u128), E_INTERNAL_ERROR);

        event::emit_event<DepositEvent<S, R>>(
            &mut pool.deposit_events,
            deposit_event
        );
    }

    /// Withdraw stake coin from the incentive pool.
    /// All pending rewards will be transferred to `sender`.
    public entry fun withdraw<S, R>(sender: &signer, amount: u64) acquires Pool, UserPosition {
        assert!(amount > 0, E_INVALID_WITHDRAW_AMOUNT);

        // check pool
        assert!(exists<Pool<S, R>>(@aux), E_INCENTIVE_POOL_NOT_FOUND);
        let pool = borrow_global_mut<Pool<S, R>>(@aux);

        // check user info
        let sender_addr = signer::address_of(sender);
        assert!(exists<UserPosition<S, R>>(sender_addr), E_USER_INFO_NOT_FOUND);
        let user_pos = borrow_global_mut<UserPosition<S, R>>(sender_addr);
        assert!(user_pos.amount_staked >= amount, E_INVALID_WITHDRAW_AMOUNT);

        // withdraw and burn st coins
        let st_coin = coin::withdraw<St<S>>(sender, amount);
        coin::burn(st_coin, &pool.burn);

        // update pool
        let now = timestamp::now_microseconds();
        update_pool(pool, now);

        // Distribute pending rewards
        let pending_reward = distribute_pending_rewards(sender, user_pos, pool);

        // Withdraw staked coin
        user_pos.amount_staked = user_pos.amount_staked - amount;
        user_pos.last_acc_reward_per_share = pool.acc_reward_per_share;
        let unstake = coin::extract(&mut pool.stake, amount);
        coin::deposit(sender_addr, unstake);

        assert!(*option::borrow(&coin::supply<St<S>>()) == (coin::value(&pool.stake) as u128), E_INTERNAL_ERROR);

        event::emit_event<WithdrawEvent<S, R>>(
            &mut pool.withdraw_events,
            WithdrawEvent<S, R> {
                user: sender_addr,
                withdraw_amount: amount,
                user_reward_amount: (pending_reward as u64),
                user_amount_staked: user_pos.amount_staked,
                total_amount_staked: coin::value(&pool.stake),
                reward_remaining: pool.reward_remaining,
                acc_reward_per_share: pool.acc_reward_per_share,
                timestamp: now
            }
        );
    }

    /// Claim staking rewards without modifying staking position
    public entry fun claim<S, R>(sender: &signer) acquires Pool, UserPosition {
        // check pool
        assert!(exists<Pool<S, R>>(@aux), E_INCENTIVE_POOL_NOT_FOUND);
        let pool = borrow_global_mut<Pool<S, R>>(@aux);

        // check user info
        let sender_addr = signer::address_of(sender);
        assert!(exists<UserPosition<S, R>>(sender_addr), E_USER_INFO_NOT_FOUND);
        let user_pos = borrow_global_mut<UserPosition<S, R>>(sender_addr);

        // update pool
        let now = timestamp::now_microseconds();
        update_pool(pool, now);

        // Distribute pending rewards
        let pending_reward = distribute_pending_rewards(sender, user_pos, pool);

        event::emit_event<ClaimEvent<S, R>>(
            &mut pool.claim_events,
            ClaimEvent<S, R> {
                user: sender_addr,
                reward_amount: (pending_reward as u64),
                total_amount_staked: coin::value(&pool.stake),
                reward_remaining: pool.reward_remaining,
                acc_reward_per_share: pool.acc_reward_per_share,
                timestamp: now
            }
        );
    }

    /*********************/
    /* PRIVATE FUNCTIONS */
    /*********************/

    fun update_pool<S, R>(pool: &mut Pool<S, R>, now: u64) {
        if (now <= pool.last_update_time || pool.last_update_time >= pool.end_time) {
            return
        };
        let total_stake = coin::value(&pool.stake);
        if (total_stake == 0) {
            pool.last_update_time = now;
            return
        };
        let duration_us = if (now <= pool.end_time) {
            now - pool.last_update_time
        } else {
            pool.end_time - pool.last_update_time
        };

        // total reward since last pool update
        let duration_reward = (duration_us as u128) * (pool.reward_remaining as u128) / (pool.end_time - pool.last_update_time as u128);
        // add reward_per_share since last update to acc_reward_per_share
        pool.acc_reward_per_share = pool.acc_reward_per_share + duration_reward * REWARD_PER_SHARE_MUL / (total_stake as u128);
        pool.reward_remaining = pool.reward_remaining - (duration_reward as u64);
        // the real balance of the reward coin should always be >= the virtual remaining balance
        assert!(coin::value(&pool.reward) >= pool.reward_remaining, E_INTERNAL_ERROR);

        pool.last_update_time = now;

    }

    /// Distribute pending rewards (returns reward amount)
    fun distribute_pending_rewards<S, R>(user: &signer, user_pos: &mut UserPosition<S, R>, pool: &mut Pool<S, R>): u64 {
        let new_reward_num = (user_pos.amount_staked as u128) * (pool.acc_reward_per_share - user_pos.last_acc_reward_per_share);
        let pending_reward = new_reward_num / REWARD_PER_SHARE_MUL;
        let reward = coin::extract(&mut pool.reward, (pending_reward as u64));
        let user_addr = signer::address_of(user);
        coin::deposit(user_addr, reward);
        if (!coin::is_account_registered<R>(user_addr)) {
            coin::register<R>(user);
        };
        user_pos.last_acc_reward_per_share = pool.acc_reward_per_share;
        (pending_reward as u64)
    }


    /*********/
    /* TESTS */
    /*********/

    #[test_only]
    use aux::fake_coin::{FakeCoin, ETH, USDC, Self};

    #[test_only]
    public fun setup_module_for_test(sender: &signer, aptos_framework: &signer) {
        let sender_addr = signer::address_of(sender);
        if (!account::exists_at(sender_addr)) {
            account::create_account_for_test(sender_addr);
        };
        fake_coin::init_module_for_testing(sender);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::fast_forward_seconds(1000);
    }

    #[expected_failure(abort_code = E_INVALID_REWARD)]
    #[test(sender = @0x5e7c3, aptos_framework = @0x1, alice = @0x123)]
    fun test_cannot_remove_pending_rewards(sender: &signer, aptos_framework: &signer, alice: &signer) acquires Pool, UserPosition, StInfo {
        setup_module_for_test(sender, aptos_framework);
        let alice_addr = signer::address_of(alice);
        if (!account::exists_at(alice_addr)) {
            account::create_account_for_test(alice_addr);
        };

        let sender_eth = 5 * 100000000;
        let alice_eth = sender_eth;
        fake_coin::register_and_mint<USDC>(sender, 2000000 * 1000000); // 2M USDC
        fake_coin::register_and_mint<ETH>(sender, sender_eth); // 5 ETH
        fake_coin::register_and_mint<USDC>(alice, 0); // 2M USDC
        fake_coin::register_and_mint<ETH>(alice, alice_eth); // 5 ETH
        let reward_au = 2000000 * 1000000;

        let duration_seconds = 30*24*3600; // 30 days
        create<FakeCoin<ETH>, FakeCoin<USDC>>(sender, reward_au, duration_seconds * 1000000);

        deposit<FakeCoin<ETH>, FakeCoin<USDC>>(alice, 100);

        // fast forward so alice accrues rewards
        timestamp::fast_forward_seconds(10);
        modify_pool<FakeCoin<ETH>, FakeCoin<USDC>>(sender, 2000000 * 1000000, false, 0, false);
    }

    #[expected_failure(abort_code = E_NOT_AUTHORIZED)]
    #[test(sender = @0x5e7c3, aptos_framework = @0x1, alice = @0x123)]
    fun test_cannot_modify_pool_if_not_authority(sender: &signer, aptos_framework: &signer, alice: &signer) acquires Pool, StInfo {
        setup_module_for_test(sender, aptos_framework);
        let alice_addr = signer::address_of(alice);
        if (!account::exists_at(alice_addr)) {
            account::create_account_for_test(alice_addr);
        };

        let sender_eth = 5 * 100000000;
        let alice_eth = sender_eth;
        fake_coin::register_and_mint<USDC>(sender, 2000000 * 1000000); // 2M USDC
        fake_coin::register_and_mint<ETH>(sender, sender_eth); // 5 ETH
        fake_coin::register_and_mint<USDC>(alice, 0); // 2M USDC
        fake_coin::register_and_mint<ETH>(alice, alice_eth); // 5 ETH
        let reward_au = 2000000 * 1000000;

        let duration_seconds = 30*24*3600; // 30 days
        create<FakeCoin<ETH>, FakeCoin<USDC>>(sender, reward_au, duration_seconds * 1000000);


        modify_pool<FakeCoin<ETH>, FakeCoin<USDC>>(alice, 2000000 * 1000000, false, 0, false);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1, alice = @0x123)]
    fun test_modify_authority(sender: &signer, aptos_framework: &signer, alice: &signer) acquires StInfo, Pool {
        setup_module_for_test(sender, aptos_framework);
        let alice_addr = signer::address_of(alice);
        if (!account::exists_at(alice_addr)) {
            account::create_account_for_test(alice_addr);
        };

        let sender_eth = 5 * 100000000;
        let alice_eth = sender_eth;
        fake_coin::register_and_mint<USDC>(sender, 2000000 * 1000000); // 2M USDC
        fake_coin::register_and_mint<ETH>(sender, sender_eth); // 5 ETH
        fake_coin::register_and_mint<USDC>(alice, 0); // 2M USDC
        fake_coin::register_and_mint<ETH>(alice, alice_eth); // 5 ETH
        let reward_au = 2000000 * 1000000;

        let duration_seconds = 30*24*3600; // 30 days
        create<FakeCoin<ETH>, FakeCoin<USDC>>(sender, reward_au, duration_seconds * 1000000);

        modify_authority<FakeCoin<ETH>, FakeCoin<USDC>>(sender, alice_addr);
        modify_pool<FakeCoin<ETH>, FakeCoin<USDC>>(alice, 2000000 * 1000000, false, 0, false);
    }

    #[expected_failure(abort_code = E_NOT_AUTHORIZED)]
    #[test(sender = @0x5e7c3, aptos_framework = @0x1, alice = @0x123)]
    fun test_cannot_modify_authority_if_not_authority(sender: &signer, aptos_framework: &signer, alice: &signer) acquires StInfo, Pool {
        setup_module_for_test(sender, aptos_framework);
        let alice_addr = signer::address_of(alice);
        if (!account::exists_at(alice_addr)) {
            account::create_account_for_test(alice_addr);
        };

        let sender_eth = 5 * 100000000;
        let alice_eth = sender_eth;
        fake_coin::register_and_mint<USDC>(sender, 2000000 * 1000000); // 2M USDC
        fake_coin::register_and_mint<ETH>(sender, sender_eth); // 5 ETH
        fake_coin::register_and_mint<USDC>(alice, 0); // 2M USDC
        fake_coin::register_and_mint<ETH>(alice, alice_eth); // 5 ETH
        let reward_au = 2000000 * 1000000;

        // Incentive:
        // duration = 30 days = 30*24*3600*1000000 microseconds
        // reward = 2e14 AU ETH
        // reward per second = 77,160,493.82716049
        let duration_seconds = 30*24*3600; // 30 days
        create<FakeCoin<ETH>, FakeCoin<USDC>>(sender, reward_au, duration_seconds * 1000000);

        modify_authority<FakeCoin<ETH>, FakeCoin<USDC>>(alice, alice_addr);
    }


    #[expected_failure(abort_code = E_NOT_AUTHORIZED)]
    #[test(sender = @0x5e7c3, aptos_framework = @0x1, alice = @0x123)]
    fun test_cannot_delete_pool_if_not_authority(sender: &signer, aptos_framework: &signer, alice: &signer) acquires StInfo, Pool {
        setup_module_for_test(sender, aptos_framework);
        let alice_addr = signer::address_of(alice);
        if (!account::exists_at(alice_addr)) {
            account::create_account_for_test(alice_addr);
        };

        let sender_eth = 5 * 100000000;
        let alice_eth = sender_eth;
        fake_coin::register_and_mint<USDC>(sender, 2000000 * 1000000); // 2M USDC
        fake_coin::register_and_mint<ETH>(sender, sender_eth); // 5 ETH
        fake_coin::register_and_mint<USDC>(alice, 0); // 2M USDC
        fake_coin::register_and_mint<ETH>(alice, alice_eth); // 5 ETH
        let reward_au = 2000000 * 1000000;

        // Incentive:
        // duration = 30 days = 30*24*3600*1000000 microseconds
        // reward = 2e14 AU ETH
        // reward per second = 77,160,493.82716049
        let duration_seconds = 30*24*3600; // 30 days
        create<FakeCoin<ETH>, FakeCoin<USDC>>(sender, reward_au, duration_seconds * 1000000);

        delete_empty_pool<FakeCoin<ETH>, FakeCoin<USDC>>(alice);
    }

    #[expected_failure(abort_code = E_CANNOT_DELETE_POOL)]
    #[test(sender = @0x5e7c3, aptos_framework = @0x1, alice = @0x123)]
    fun test_cannot_delete_pool_with_pending_rewards(sender: &signer, aptos_framework: &signer, alice: &signer) acquires StInfo, Pool, UserPosition {
        setup_module_for_test(sender, aptos_framework);
        let alice_addr = signer::address_of(alice);
        if (!account::exists_at(alice_addr)) {
            account::create_account_for_test(alice_addr);
        };

        let sender_eth = 5 * 100000000;
        let alice_eth = sender_eth;
        fake_coin::register_and_mint<USDC>(sender, 2000000 * 1000000); // 2M USDC
        fake_coin::register_and_mint<ETH>(sender, sender_eth); // 5 ETH
        fake_coin::register_and_mint<USDC>(alice, 0); // 2M USDC
        fake_coin::register_and_mint<ETH>(alice, alice_eth); // 5 ETH
        let reward_au = 2000000 * 1000000;

        // Incentive:
        // duration = 30 days = 30*24*3600*1000000 microseconds
        // reward = 2e14 AU ETH
        // reward per second = 77,160,493.82716049
        let duration_seconds = 30*24*3600; // 30 days
        create<FakeCoin<ETH>, FakeCoin<USDC>>(sender, reward_au, duration_seconds * 1000000);

        deposit<FakeCoin<ETH>, FakeCoin<USDC>>(alice, 100);
        // fast forward so alice accrues rewards
        timestamp::fast_forward_seconds(10);

        delete_empty_pool<FakeCoin<ETH>, FakeCoin<USDC>>(sender);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1, alice = @0x123)]
    fun test_delete_pool(sender: &signer, aptos_framework: &signer, alice: &signer) acquires StInfo, Pool, UserPosition {
        setup_module_for_test(sender, aptos_framework);
        let alice_addr = signer::address_of(alice);
        if (!account::exists_at(alice_addr)) {
            account::create_account_for_test(alice_addr);
        };

        let sender_eth = 5 * 100000000;
        let alice_eth = sender_eth;
        fake_coin::register_and_mint<USDC>(sender, 2000000 * 1000000); // 2M USDC
        fake_coin::register_and_mint<ETH>(sender, sender_eth); // 5 ETH
        fake_coin::register_and_mint<USDC>(alice, 0); // 2M USDC
        fake_coin::register_and_mint<ETH>(alice, alice_eth); // 5 ETH
        let reward_au = 2000000 * 1000000;

        // Incentive:
        // duration = 30 days = 30*24*3600*1000000 microseconds
        // reward = 2e14 AU ETH
        // reward per second = 77,160,493.82716049
        let duration_seconds = 30*24*3600; // 30 days
        create<FakeCoin<ETH>, FakeCoin<USDC>>(sender, reward_au / 2, duration_seconds * 1000000);

        deposit<FakeCoin<ETH>, FakeCoin<USDC>>(alice, 100);
        // fast forward so alice accrues rewards
        timestamp::fast_forward_seconds(10);
        end_reward_early<FakeCoin<ETH>, FakeCoin<USDC>>(sender);
        withdraw<FakeCoin<ETH>, FakeCoin<USDC>>(alice, 100);

        delete_empty_pool<FakeCoin<ETH>, FakeCoin<USDC>>(sender);

        // try creating same type of pool again
        create<FakeCoin<ETH>, FakeCoin<USDC>>(sender, reward_au / 2, duration_seconds * 1000000);
    }


    #[expected_failure(abort_code = E_POOL_ALREADY_EXISTS)]
    #[test(sender = @0x5e7c3, aptos_framework = @0x1, alice = @0x123)]
    fun test_cannot_create_duplicate_pool(sender: &signer, aptos_framework: &signer, alice: &signer) acquires StInfo {
        setup_module_for_test(sender, aptos_framework);
        let sender_addr = signer::address_of(sender);
        let alice_addr = signer::address_of(alice);
        if (!account::exists_at(alice_addr)) {
            account::create_account_for_test(alice_addr);
        };

        let sender_eth = 5 * 100000000;
        let alice_eth = sender_eth;
        fake_coin::register_and_mint<USDC>(sender, 2000000 * 1000000); // 2M USDC
        fake_coin::register_and_mint<ETH>(sender, sender_eth); // 5 ETH
        fake_coin::register_and_mint<USDC>(alice, 2000000 * 1000000); // 2M USDC
        fake_coin::register_and_mint<ETH>(alice, alice_eth); // 5 ETH
        let reward_au = 2000000 * 1000000;

        // Incentive:
        // duration = 30 days = 30*24*3600*1000000 microseconds
        // reward = 2e14 AU ETH
        // reward per second = 77,160,493.82716049
        let duration_seconds = 30*24*3600; // 30 days
        create<FakeCoin<ETH>, FakeCoin<USDC>>(sender, reward_au, duration_seconds * 1000000);
        let sender_usdc = 0;
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);
        create<FakeCoin<ETH>, FakeCoin<USDC>>(alice, reward_au, duration_seconds * 1000000);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1, alice = @0x123)]
    fun test_double_dip(sender: &signer, aptos_framework: &signer, alice: &signer) acquires StInfo, Pool, UserPosition {
        setup_module_for_test(sender, aptos_framework);
        let sender_addr = signer::address_of(sender);
        let alice_addr = signer::address_of(alice);
        if (!account::exists_at(alice_addr)) {
            account::create_account_for_test(alice_addr);
        };

        let sender_eth = 5 * 100000000;
        let alice_eth = sender_eth;
        fake_coin::register_and_mint<USDC>(sender, 2000000 * 1000000); // 2M USDC
        fake_coin::register_and_mint<ETH>(sender, sender_eth); // 5 ETH
        fake_coin::register_and_mint<USDC>(alice, 2000000 * 1000000); // 2M USDC
        fake_coin::register_and_mint<ETH>(alice, alice_eth); // 5 ETH
        let reward_au = 2000000 * 1000000;

        // Incentive:
        // duration = 30 days = 30*24*3600*1000000 microseconds
        let start_time = timestamp::now_microseconds();
        let duration_seconds = 30*24*3600; // 30 days
        create<FakeCoin<ETH>, FakeCoin<USDC>>(sender, reward_au, duration_seconds * 1000000);
        let sender_usdc = 0;
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);
        create<St<FakeCoin<ETH>>, FakeCoin<USDC>>(alice, reward_au, duration_seconds * 1000000);
        let alice_usdc = 0;
        assert!(coin::balance<FakeCoin<USDC>>(alice_addr) == alice_usdc, E_TEST_FAILURE);


        // Sender stakes 100 au ETH
        deposit<FakeCoin<ETH>, FakeCoin<USDC>>(sender, 100);
        {
            sender_eth = sender_eth - 100;
            assert!(coin::balance<FakeCoin<ETH>>(sender_addr) == sender_eth, E_TEST_FAILURE);
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            assert!(pool.reward_remaining == reward_au, E_TEST_FAILURE);
            assert!(coin::value(&pool.stake) == 100, E_TEST_FAILURE);
            assert!(coin::value(&pool.reward) == reward_au, E_TEST_FAILURE);
            assert!(pool.last_update_time == start_time, E_TEST_FAILURE);
            assert!(pool.acc_reward_per_share == 0, E_TEST_FAILURE);
            let user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            assert!(user_pos.amount_staked == 100, E_TEST_FAILURE);
            assert!(user_pos.last_acc_reward_per_share == 0, E_TEST_FAILURE);
            assert!(coin::balance<St<FakeCoin<ETH>>>(sender_addr) == 100, E_TEST_FAILURE);
            assert!(*option::borrow(&coin::supply<St<FakeCoin<ETH>>>()) == 100, E_TEST_FAILURE);
        };

        deposit<St<FakeCoin<ETH>>, FakeCoin<USDC>>(sender, 100);
        {
            assert!(coin::balance<St<FakeCoin<ETH>>>(sender_addr) == 0, E_TEST_FAILURE);
            let pool = borrow_global_mut<Pool<St<FakeCoin<ETH>>, FakeCoin<USDC>>>(@aux);
            assert!(pool.reward_remaining == reward_au, E_TEST_FAILURE);
            assert!(coin::value(&pool.stake) == 100, E_TEST_FAILURE);
            assert!(coin::value(&pool.reward) == reward_au, E_TEST_FAILURE);
            assert!(pool.last_update_time == start_time, E_TEST_FAILURE);
            assert!(pool.acc_reward_per_share == 0, E_TEST_FAILURE);
            let user_pos = borrow_global_mut<UserPosition<St<FakeCoin<ETH>>, FakeCoin<USDC>>>(sender_addr);
            assert!(user_pos.amount_staked == 100, E_TEST_FAILURE);
            assert!(user_pos.last_acc_reward_per_share == 0, E_TEST_FAILURE);
            assert!(coin::balance<St<St<FakeCoin<ETH>>>>(sender_addr) == 100, E_TEST_FAILURE);
            assert!(*option::borrow(&coin::supply<St<St<FakeCoin<ETH>>>>()) == 100, E_TEST_FAILURE);
        };

    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1, alice = @0x123)]
    fun test_deposit_withdraw_claim(sender: &signer, aptos_framework: &signer, alice: &signer) acquires StInfo, Pool, UserPosition {
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

        // Incentive:
        // duration = 30 days = 30*24*3600*1000000 microseconds
        // reward = 2e14 AU ETH
        // reward per second = 77,160,493.82716049
        let duration_seconds = 30*24*3600; // 30 days
        let start_time = timestamp::now_microseconds();
        let end_time = start_time + duration_seconds * 1000000;
        create<FakeCoin<ETH>, FakeCoin<USDC>>(sender, reward_au, duration_seconds * 1000000);

        let sender_usdc = 0;
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);
        {
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            assert!(pool.authority == sender_addr, E_TEST_FAILURE);
            assert!(pool.start_time == start_time, E_TEST_FAILURE);
            assert!(pool.end_time == end_time, E_TEST_FAILURE);
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);
            assert!(coin::value(&pool.stake) == 0, E_TEST_FAILURE);
            assert!(coin::value(&pool.reward) == reward_au, E_TEST_FAILURE);
            assert!(pool.last_update_time == start_time, E_TEST_FAILURE);
            assert!(pool.acc_reward_per_share == 0, E_TEST_FAILURE);
        };


        // Sender stakes 100 au ETH
        deposit<FakeCoin<ETH>, FakeCoin<USDC>>(sender, 100);
        {
            sender_eth = sender_eth - 100;
            assert!(coin::balance<FakeCoin<ETH>>(sender_addr) == sender_eth, E_TEST_FAILURE);
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);
            assert!(coin::value(&pool.stake) == 100, E_TEST_FAILURE);
            assert!(coin::value(&pool.reward) == reward_au, E_TEST_FAILURE);
            assert!(pool.last_update_time == start_time, E_TEST_FAILURE);
            assert!(pool.acc_reward_per_share == 0, E_TEST_FAILURE);
            let user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            assert!(user_pos.amount_staked == 100, E_TEST_FAILURE);
            assert!(user_pos.last_acc_reward_per_share == 0, E_TEST_FAILURE);
            assert!(coin::balance<St<FakeCoin<ETH>>>(sender_addr) == 100, E_TEST_FAILURE);
            assert!(*option::borrow(&coin::supply<St<FakeCoin<ETH>>>()) == 100, E_TEST_FAILURE);
        };
        // claim when no time has passed, reward amount should be 0
        claim<FakeCoin<ETH>, FakeCoin<USDC>>(sender);
        {
            assert!(coin::balance<FakeCoin<ETH>>(sender_addr) == sender_eth, E_TEST_FAILURE);
            assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);
            assert!(coin::value(&pool.stake) == 100, E_TEST_FAILURE);
            assert!(coin::value(&pool.reward) == reward_au, E_TEST_FAILURE);
            assert!(pool.last_update_time == start_time, E_TEST_FAILURE);
            assert!(pool.acc_reward_per_share == 0, E_TEST_FAILURE);
            let user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            assert!(user_pos.amount_staked == 100, E_TEST_FAILURE);
            assert!(user_pos.last_acc_reward_per_share == 0, E_TEST_FAILURE);
            assert!(coin::balance<St<FakeCoin<ETH>>>(sender_addr) == 100, E_TEST_FAILURE);
            assert!(*option::borrow(&coin::supply<St<FakeCoin<ETH>>>()) == 100, E_TEST_FAILURE);
        };

        // TIME: start + 1
        // fast forward 1 second and claim reward
        timestamp::fast_forward_seconds(1);
        claim<FakeCoin<ETH>, FakeCoin<USDC>>(sender);
        {
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
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

            let user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            assert!(user_pos.amount_staked == 100, E_TEST_FAILURE);
            assert!(user_pos.last_acc_reward_per_share == pool.acc_reward_per_share, E_TEST_FAILURE);
            assert!(coin::balance<St<FakeCoin<ETH>>>(sender_addr) == 100, E_TEST_FAILURE);
            assert!(*option::borrow(&coin::supply<St<FakeCoin<ETH>>>()) == 100, E_TEST_FAILURE);
        };
        // TIME: start + 2
        // fast forward another second and deposit 100 more -- reward amount should be exactly the same
        timestamp::fast_forward_seconds(1);
        deposit<FakeCoin<ETH>, FakeCoin<USDC>>(sender, 100);
        {
            sender_eth = sender_eth - 100;
            assert!(coin::balance<FakeCoin<ETH>>(sender_addr) == sender_eth, E_TEST_FAILURE);
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
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
            let sender_reward = 771604;
            sender_usdc = sender_usdc + sender_reward;
            assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);
            reward_remaining = 1999998456792;
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);

            let user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            assert!(user_pos.amount_staked == 200, E_TEST_FAILURE);
            assert!(user_pos.last_acc_reward_per_share == pool.acc_reward_per_share, E_TEST_FAILURE);
            assert!(coin::balance<St<FakeCoin<ETH>>>(sender_addr) == 200, E_TEST_FAILURE);
            assert!(*option::borrow(&coin::supply<St<FakeCoin<ETH>>>()) == 200, E_TEST_FAILURE);
        };
        // alice deposits 500
        deposit<FakeCoin<ETH>, FakeCoin<USDC>>(alice, 500);
        {
            let alice_user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(alice_addr);
            assert!(alice_user_pos.amount_staked == 500, E_TEST_FAILURE);
            assert!(alice_user_pos.last_acc_reward_per_share == 15432080000000000, E_TEST_FAILURE);
        };

        // TIME: start + 100
        timestamp::fast_forward_seconds(98);
        claim<FakeCoin<ETH>, FakeCoin<USDC>>(sender);
        claim<FakeCoin<ETH>, FakeCoin<USDC>>(alice);
        {
            alice_eth = alice_eth - 500;
            assert!(coin::balance<FakeCoin<ETH>>(alice_addr) == alice_eth, E_TEST_FAILURE);
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);

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
            let sender_reward = 21604938;
            sender_usdc = sender_usdc + sender_reward;
            assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);

            let sender_user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            assert!(sender_user_pos.amount_staked == 200, E_TEST_FAILURE);
            assert!(sender_user_pos.last_acc_reward_per_share == pool.acc_reward_per_share, E_TEST_FAILURE);

            let alice_reward = 54012345;
            alice_usdc = alice_usdc + alice_reward;
            assert!(coin::balance<FakeCoin<USDC>>(alice_addr) == (alice_usdc as u64), coin::balance<FakeCoin<USDC>>(alice_addr));

            let alice_user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(alice_addr);
            assert!(alice_user_pos.amount_staked == 500, E_TEST_FAILURE);
            assert!(alice_user_pos.last_acc_reward_per_share == pool.acc_reward_per_share, E_TEST_FAILURE);

            // let reward_remaining = reward_au - (sender_usdc + (alice_usdc as u64));
            let reward_remaining = 1999922839509;
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);
        };
        // TIME: start + 200
        timestamp::fast_forward_seconds(100);
        // sender withdraws all
        withdraw<FakeCoin<ETH>, FakeCoin<USDC>>(sender, 200);
        {
            sender_eth = sender_eth + 200;
            assert!(coin::balance<FakeCoin<ETH>>(sender_addr) == sender_eth, E_TEST_FAILURE);
            assert!(coin::balance<FakeCoin<ETH>>(alice_addr) == alice_eth, E_TEST_FAILURE);
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);

            // check new staked amount
            assert!(coin::value(&pool.stake) == 500, E_TEST_FAILURE);
            assert!(timestamp::now_microseconds() == start_time + 200 * 1000000, E_TEST_FAILURE);
            assert!(pool.last_update_time == timestamp::now_microseconds(), E_TEST_FAILURE);

            // let duration_reward = reward_remaining_au * 100 * 1000000 / ((duration_seconds - 100) * 1000000);
            // let duration_reward = 77160493;
            // let acc_reward_per_share = 123456770000000000 + (duration_reward as u128) * REWARD_PER_SHARE_MUL / 700;
            let acc_reward_per_share = 233686045714285714;
            assert!(pool.acc_reward_per_share == acc_reward_per_share, (pool.acc_reward_per_share as u64));

            let sender_reward = 22045855;
            sender_usdc = sender_usdc + sender_reward;
            assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);

            let sender_user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            assert!(sender_user_pos.amount_staked == 0, E_TEST_FAILURE);
            assert!(sender_user_pos.last_acc_reward_per_share == pool.acc_reward_per_share, E_TEST_FAILURE);

            // All alice info is the same since she didn't claim
            assert!(coin::balance<FakeCoin<USDC>>(alice_addr) == (alice_usdc as u64), coin::balance<FakeCoin<USDC>>(alice_addr));

            let alice_user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(alice_addr);
            assert!(alice_user_pos.amount_staked == 500, E_TEST_FAILURE);
            assert!(alice_user_pos.last_acc_reward_per_share == 123456770000000000, E_TEST_FAILURE);

            // reward_remaining - duration_reward
            let reward_remaining = 1999845679016;
            assert!(pool.reward_remaining == reward_remaining, pool.reward_remaining);
        };

        // TIME: start + 250
        timestamp::fast_forward_seconds(50);
        // sender deposits 500
        deposit<FakeCoin<ETH>, FakeCoin<USDC>>(sender, 500);
        {
            sender_eth = sender_eth - 500;
            assert!(coin::balance<FakeCoin<ETH>>(sender_addr) == sender_eth, E_TEST_FAILURE);
            assert!(coin::balance<FakeCoin<ETH>>(alice_addr) == alice_eth, E_TEST_FAILURE);
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);

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

            let sender_user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            assert!(sender_user_pos.amount_staked == 500, E_TEST_FAILURE);
            assert!(sender_user_pos.last_acc_reward_per_share == pool.acc_reward_per_share, (sender_user_pos.last_acc_reward_per_share as u64));

            // All alice info is the same since she didn't claim
            assert!(coin::balance<FakeCoin<USDC>>(alice_addr) == (alice_usdc as u64), coin::balance<FakeCoin<USDC>>(alice_addr));

            let alice_user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(alice_addr);
            assert!(alice_user_pos.amount_staked == 500, E_TEST_FAILURE);
            assert!(alice_user_pos.last_acc_reward_per_share == 123456770000000000, E_TEST_FAILURE);

            // reward_remaining - duration_reward
            let reward_remaining = 1999807098770;
            assert!(pool.reward_remaining == reward_remaining, pool.reward_remaining);
        };

        // TIME: end + 250
        // fast forward past pool expiration; both stakers withdraw all
        timestamp::fast_forward_seconds(duration_seconds);
        withdraw<FakeCoin<ETH>, FakeCoin<USDC>>(sender, 500);
        withdraw<FakeCoin<ETH>, FakeCoin<USDC>>(alice, 500);
        {
            sender_eth = sender_eth + 500;
            alice_eth = alice_eth + 500;
            assert!(coin::balance<FakeCoin<ETH>>(sender_addr) == sender_eth, E_TEST_FAILURE);
            assert!(coin::balance<FakeCoin<ETH>>(alice_addr) == alice_eth, E_TEST_FAILURE);
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);

            // check new staked amount
            assert!(coin::value(&pool.stake) == 0, E_TEST_FAILURE);
            assert!(timestamp::now_microseconds() == end_time + 250 * 1000000, E_TEST_FAILURE);
            assert!(pool.last_update_time == timestamp::now_microseconds(), E_TEST_FAILURE);

            // let duration_reward = reward_remaining_au;
            // let duration_reward = 1999807098770;
            // let acc_reward_per_share = 310846537714285714 + (duration_reward as u128) * REWARD_PER_SHARE_MUL / 1000;
            let acc_reward_per_share = 2000117945307714285714;
            assert!(pool.acc_reward_per_share == acc_reward_per_share, E_TEST_FAILURE);

            let sender_reward = 999903549385;
            sender_usdc = sender_usdc + sender_reward;
            assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);

            let sender_user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            assert!(sender_user_pos.amount_staked == 0, E_TEST_FAILURE);
            assert!(sender_user_pos.last_acc_reward_per_share == pool.acc_reward_per_share, E_TEST_FAILURE);

            // All alice info is the same since she didn't claim
            let alice_reward = 999997244268;
            alice_usdc = alice_usdc + alice_reward;
            assert!(coin::balance<FakeCoin<USDC>>(alice_addr) == (alice_usdc as u64), coin::balance<FakeCoin<USDC>>(alice_addr));

            let alice_user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(alice_addr);
            assert!(alice_user_pos.amount_staked == 0, E_TEST_FAILURE);
            assert!(alice_user_pos.last_acc_reward_per_share == pool.acc_reward_per_share, E_TEST_FAILURE);

            // reward_remaining - duration_reward
            assert!(reward_au - (alice_usdc + sender_usdc) <= 1, E_TEST_FAILURE);
            let reward_remaining = 0;
            assert!(pool.reward_remaining == reward_remaining, pool.reward_remaining);
        };

    }
    #[expected_failure(abort_code = E_INVALID_REWARD)]
    #[test(sender = @0x5e7c3, aptos_framework = @0x1, alice = @0x123)]
    fun test_cannot_remove_excess_reward(sender: &signer, aptos_framework: &signer, alice: &signer) acquires StInfo, Pool, UserPosition {
        setup_module_for_test(sender, aptos_framework);
        let sender_addr = signer::address_of(sender);
        let alice_addr = signer::address_of(alice);
        if (!account::exists_at(alice_addr)) {
            account::create_account_for_test(alice_addr);
        };

        let sender_eth = 5 * 100000000;
        let alice_eth = sender_eth;
        let _alice_usdc = 0;
        fake_coin::register_and_mint<USDC>(sender, 2000000 * 1000000); // 2M USDC
        fake_coin::register_and_mint<ETH>(sender, sender_eth); // 5 ETH
        fake_coin::register_and_mint<USDC>(alice, 0); // 2M USDC
        fake_coin::register_and_mint<ETH>(alice, alice_eth); // 5 ETH
        let reward_au = 2000000 * 1000000;
        let reward_remaining = reward_au;

        // Incentive:
        // duration = 30 days = 30*24*3600*1000000 microseconds
        // reward = 2e14 AU ETH
        // reward per second = 77,160,493.82716049
        let duration_seconds = 30*24*3600; // 30 days
        let start_time = timestamp::now_microseconds();
        let end_time = start_time + duration_seconds * 1000000;
        create<FakeCoin<ETH>, FakeCoin<USDC>>(sender, reward_au, duration_seconds * 1000000);

        let sender_usdc = 0;
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);
        {
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            assert!(pool.authority == sender_addr, E_TEST_FAILURE);
            assert!(pool.start_time == start_time, E_TEST_FAILURE);
            assert!(pool.end_time == end_time, E_TEST_FAILURE);
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);
            assert!(coin::value(&pool.stake) == 0, E_TEST_FAILURE);
            assert!(coin::value(&pool.reward) == reward_au, E_TEST_FAILURE);
            assert!(pool.last_update_time == start_time, E_TEST_FAILURE);
            assert!(pool.acc_reward_per_share == 0, E_TEST_FAILURE);
        };

        // Sender stakes 100 au ETH
        deposit<FakeCoin<ETH>, FakeCoin<USDC>>(sender, 100);
        {
            sender_eth = sender_eth - 100;
            assert!(coin::balance<FakeCoin<ETH>>(sender_addr) == sender_eth, E_TEST_FAILURE);
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);
            assert!(coin::value(&pool.stake) == 100, E_TEST_FAILURE);
            assert!(coin::value(&pool.reward) == reward_au, E_TEST_FAILURE);
            assert!(pool.last_update_time == start_time, E_TEST_FAILURE);
            assert!(pool.acc_reward_per_share == 0, E_TEST_FAILURE);
            let user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            assert!(user_pos.amount_staked == 100, E_TEST_FAILURE);
            assert!(user_pos.last_acc_reward_per_share == 0, E_TEST_FAILURE);
            assert!(coin::balance<St<FakeCoin<ETH>>>(sender_addr) == 100, E_TEST_FAILURE);
            assert!(*option::borrow(&coin::supply<St<FakeCoin<ETH>>>()) == 100, E_TEST_FAILURE);
        };

        // TIME: start + 1
        // fast forward 1 second and claim reward
        timestamp::fast_forward_seconds(100);
        // confirm cannot remove more than remaining reward
        reward_remaining = 1999922839600;
        modify_pool<FakeCoin<ETH>, FakeCoin<USDC>>(sender, reward_remaining + 1, false, 0, false);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1, alice = @0x123)]
    fun test_modify_pool(sender: &signer, aptos_framework: &signer, alice: &signer) acquires StInfo, Pool, UserPosition {
        setup_module_for_test(sender, aptos_framework);
        let sender_addr = signer::address_of(sender);
        let alice_addr = signer::address_of(alice);
        if (!account::exists_at(alice_addr)) {
            account::create_account_for_test(alice_addr);
        };

        let sender_eth = 5 * 100000000;
        let alice_eth = sender_eth;
        let alice_usdc = 0;
        fake_coin::register_and_mint<USDC>(sender, 3000000 * 1000000); // 2M USDC
        fake_coin::register_and_mint<ETH>(sender, sender_eth); // 5 ETH
        fake_coin::register_and_mint<USDC>(alice, 0); // 2M USDC
        fake_coin::register_and_mint<ETH>(alice, alice_eth); // 5 ETH
        let reward_au = 2000000 * 1000000;
        let reward_remaining = reward_au;

        // Incentive:
        // duration = 30 days = 30*24*3600*1000000 microseconds
        // reward = 2e14 AU ETH
        // reward per second = 77,160,493.82716049
        let duration_seconds = 30*24*3600; // 30 days
        let start_time = timestamp::now_microseconds();
        let end_time = start_time + duration_seconds * 1000000;
        create<FakeCoin<ETH>, FakeCoin<USDC>>(sender, reward_au, duration_seconds * 1000000);

        let sender_usdc = 1000000 * 1000000;
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);
        {
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            assert!(pool.authority == sender_addr, E_TEST_FAILURE);
            assert!(pool.start_time == start_time, E_TEST_FAILURE);
            assert!(pool.end_time == end_time, E_TEST_FAILURE);
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);
            assert!(coin::value(&pool.stake) == 0, E_TEST_FAILURE);
            assert!(coin::value(&pool.reward) == reward_au, E_TEST_FAILURE);
            assert!(pool.last_update_time == start_time, E_TEST_FAILURE);
            assert!(pool.acc_reward_per_share == 0, E_TEST_FAILURE);
        };

        // Sender stakes 100 au ETH
        deposit<FakeCoin<ETH>, FakeCoin<USDC>>(sender, 100);
        {
            sender_eth = sender_eth - 100;
            assert!(coin::balance<FakeCoin<ETH>>(sender_addr) == sender_eth, E_TEST_FAILURE);
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);
            assert!(coin::value(&pool.stake) == 100, E_TEST_FAILURE);
            assert!(coin::value(&pool.reward) == reward_au, E_TEST_FAILURE);
            assert!(pool.last_update_time == start_time, E_TEST_FAILURE);
            assert!(pool.acc_reward_per_share == 0, E_TEST_FAILURE);
            let user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            assert!(user_pos.amount_staked == 100, E_TEST_FAILURE);
            assert!(user_pos.last_acc_reward_per_share == 0, E_TEST_FAILURE);
            assert!(coin::balance<St<FakeCoin<ETH>>>(sender_addr) == 100, E_TEST_FAILURE);
            assert!(*option::borrow(&coin::supply<St<FakeCoin<ETH>>>()) == 100, E_TEST_FAILURE);
        };

        // TIME: start + 100
        // fast forward 100 second and modify reward
        timestamp::fast_forward_seconds(100);
        // add $1M to reward
        modify_pool<FakeCoin<ETH>, FakeCoin<USDC>>(sender, 1000000 * 1000000, true, 0, false);

        // Alice stakes 100 after pool is modified
        deposit<FakeCoin<ETH>, FakeCoin<USDC>>(alice, 100);
        {
            sender_usdc = sender_usdc - 1000000*1000000;
            assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);
            alice_eth = alice_eth - 100;
            assert!(coin::balance<FakeCoin<ETH>>(alice_addr) == alice_eth, E_TEST_FAILURE);
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);

            // reward + update time changed; all other values should stay the same
            assert!(coin::value(&pool.reward) == 3000000 * 1000000, E_TEST_FAILURE);
            assert!(pool.authority == sender_addr, E_TEST_FAILURE);
            assert!(pool.start_time == start_time, E_TEST_FAILURE);
            assert!(pool.end_time == end_time, E_TEST_FAILURE);
            assert!(coin::value(&pool.stake) == 200, E_TEST_FAILURE);
            // let duration_reward = 100 * reward_au * 1000000 / (duration_seconds * 1000000);
            // let duration_reward = 77160493;
            // let acc_reward_per_share = (duration_reward as u128) * REWARD_PER_SHARE_MUL / 100;
            let acc_reward_per_share = 771604930000000000;
            assert!(pool.acc_reward_per_share == acc_reward_per_share, (pool.acc_reward_per_share as u64));
            assert!(pool.last_update_time == timestamp::now_microseconds(), E_TEST_FAILURE);

            // reward_remaining = 2e12 - duration_reward + new_reward
            // reward_remaining = 1999922839507 + 1000000000000;
            reward_remaining = 2999922839507;
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);

            // sender received 0 because they didn't claim
            let sender_reward = 0;
            sender_usdc = sender_usdc + sender_reward;
            assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);


            let user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            assert!(user_pos.amount_staked == 100, E_TEST_FAILURE);
            // sender reward debt is equivalent to duration reward for the last duration
            assert!(user_pos.last_acc_reward_per_share == 0, (user_pos.last_acc_reward_per_share as u64));
            assert!(coin::balance<St<FakeCoin<ETH>>>(sender_addr) == 100, E_TEST_FAILURE);
            assert!(*option::borrow(&coin::supply<St<FakeCoin<ETH>>>()) == 200, E_TEST_FAILURE);
        };
        // TIME: start + 200
        // fast forward 100 second and claim reward
        timestamp::fast_forward_seconds(100);
        claim<FakeCoin<ETH>, FakeCoin<USDC>>(sender);
        claim<FakeCoin<ETH>, FakeCoin<USDC>>(alice);
        {
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);

            // reward + update time changed; all other values should stay the same
            assert!(coin::value(&pool.stake) == 200, E_TEST_FAILURE);
            // let duration_reward = 100 * remaining_reward * 1000000 / ((duration_seconds - 100) * 1000000);
            // let duration_reward = 115742229;
            // let acc_reward_per_share = 771604930000000000 + (duration_reward as u128) * REWARD_PER_SHARE_MUL / 200;
            let acc_reward_per_share = 1350316075000000000;
            assert!(pool.acc_reward_per_share == acc_reward_per_share, (pool.acc_reward_per_share as u64));
            assert!(pool.last_update_time == timestamp::now_microseconds(), E_TEST_FAILURE);

            // reward_remaining = 2999922839507 - duration_reward;
            reward_remaining = 2999807097278;
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);

            // sender receives the full reward for the duration during the lower rate
            // + 1/2 of the reward for the duration during the higher rate
            let sender_reward = 77160493 + 115742229 / 2;
            sender_usdc = sender_usdc + sender_reward;
            assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);

            let user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            assert!(user_pos.amount_staked == 100, E_TEST_FAILURE);
            assert!(user_pos.last_acc_reward_per_share == pool.acc_reward_per_share, (user_pos.last_acc_reward_per_share as u64));
            assert!(coin::balance<St<FakeCoin<ETH>>>(sender_addr) == 100, E_TEST_FAILURE);
            assert!(*option::borrow(&coin::supply<St<FakeCoin<ETH>>>()) == 200, E_TEST_FAILURE);

            // alice receives 1/2 of the reward for the duration during the higher rate
            let alice_reward = 115742229 / 2;
            alice_usdc = alice_usdc + alice_reward;
            assert!(coin::balance<FakeCoin<USDC>>(alice_addr) == alice_usdc, coin::balance<FakeCoin<USDC>>(alice_addr));

            let alice_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(alice_addr);
            assert!(alice_pos.amount_staked == 100, E_TEST_FAILURE);
            assert!(alice_pos.last_acc_reward_per_share == pool.acc_reward_per_share, (alice_pos.last_acc_reward_per_share as u64));


        };
        // TIME: end + 100
        timestamp::fast_forward_seconds(duration_seconds);
        claim<FakeCoin<ETH>, FakeCoin<USDC>>(sender);
        claim<FakeCoin<ETH>, FakeCoin<USDC>>(alice);
        {
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            assert!(coin::value(&pool.reward) <= 1, E_TEST_FAILURE);

            // reward + update time changed; all other values should stay the same
            assert!(coin::value(&pool.stake) == 200, E_TEST_FAILURE);
            // let duration_reward = remaining_reward;
            // let duration_reward = 2999807097278;
            // let acc_reward_per_share = 1350316075000000000 + (duration_reward as u128) * REWARD_PER_SHARE_MUL / 200;
            let acc_reward_per_share = 15000385802465000000000;
            assert!(pool.acc_reward_per_share == acc_reward_per_share, E_TEST_FAILURE);
            assert!(pool.last_update_time == timestamp::now_microseconds(), E_TEST_FAILURE);

            // reward_remaining = 2999807097278 - duration_reward;
            reward_remaining = 0;
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);

            // sender receives 1/2 of duration reward
            let sender_reward = 2999807097278 / 2;
            sender_usdc = sender_usdc + sender_reward;
            assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);

            let user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            assert!(user_pos.amount_staked == 100, E_TEST_FAILURE);
            // sender reward debt is equivalent to duration reward for the last duration
            assert!(user_pos.last_acc_reward_per_share == pool.acc_reward_per_share, (user_pos.last_acc_reward_per_share as u64));
            assert!(coin::balance<St<FakeCoin<ETH>>>(sender_addr) == 100, E_TEST_FAILURE);
            assert!(*option::borrow(&coin::supply<St<FakeCoin<ETH>>>()) == 200, E_TEST_FAILURE);

            // alice receives 1/2 of duration reward
            let alice_reward = 2999807097278 / 2;
            alice_usdc = alice_usdc + alice_reward;
            assert!(coin::balance<FakeCoin<USDC>>(alice_addr) == alice_usdc, coin::balance<FakeCoin<USDC>>(alice_addr));

            let alice_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(alice_addr);
            assert!(alice_pos.amount_staked == 100, E_TEST_FAILURE);
            // sender reward debt is equivalent to duration reward for the last duration
            assert!(alice_pos.last_acc_reward_per_share == pool.acc_reward_per_share, (alice_pos.last_acc_reward_per_share as u64));
        };
        withdraw<FakeCoin<ETH>, FakeCoin<USDC>>(sender, 100);
        sender_eth = sender_eth + 100;
        assert!(coin::balance<FakeCoin<ETH>>(sender_addr) == sender_eth, E_TEST_FAILURE);
        withdraw<FakeCoin<ETH>, FakeCoin<USDC>>(alice, 100);
        alice_eth = alice_eth + 100;
        assert!(coin::balance<FakeCoin<ETH>>(alice_addr) == alice_eth, E_TEST_FAILURE);

        // add $1M and 30 more days to reward
        modify_pool<FakeCoin<ETH>, FakeCoin<USDC>>(sender, 1000000 * 1000000, true, duration_seconds * 1000000, true);
        {
            sender_usdc = sender_usdc - 1000000*1000000;
            assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);

            // reward + update time changed; all other values should stay the same
            assert!(coin::value(&pool.reward) == 1000000 * 1000000 + 1, coin::value(&pool.reward));
            assert!(pool.authority == sender_addr, E_TEST_FAILURE);
            assert!(pool.start_time == timestamp::now_microseconds(), E_TEST_FAILURE);
            assert!(pool.end_time == timestamp::now_microseconds() + duration_seconds * 1000000, E_TEST_FAILURE);
            assert!(coin::value(&pool.stake) == 0, E_TEST_FAILURE);
            let acc_reward_per_share = 15000385802465000000000;
            assert!(pool.acc_reward_per_share == acc_reward_per_share, E_TEST_FAILURE);
            assert!(pool.last_update_time == timestamp::now_microseconds(), E_TEST_FAILURE);
            assert!(pool.reward_remaining == 1000000*1000000, E_TEST_FAILURE);

            let user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            assert!(user_pos.amount_staked == 0, E_TEST_FAILURE);
            // sender reward debt is equivalent to duration reward for the last duration
            assert!(user_pos.last_acc_reward_per_share == pool.acc_reward_per_share, E_TEST_FAILURE);
            assert!(coin::balance<St<FakeCoin<ETH>>>(sender_addr) == 0, E_TEST_FAILURE);
            assert!(*option::borrow(&coin::supply<St<FakeCoin<ETH>>>()) == 0, E_TEST_FAILURE);
        };
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1, alice = @0x123)]
    fun test_end_reward_early(sender: &signer, aptos_framework: &signer, alice: &signer) acquires StInfo, Pool, UserPosition {
        setup_module_for_test(sender, aptos_framework);
        let sender_addr = signer::address_of(sender);
        let alice_addr = signer::address_of(alice);
        if (!account::exists_at(alice_addr)) {
            account::create_account_for_test(alice_addr);
        };

        let sender_eth = 5 * 100000000;
        let alice_eth = sender_eth;
        fake_coin::register_and_mint<USDC>(sender, 3000000 * 1000000); // 3M USDC
        fake_coin::register_and_mint<ETH>(sender, sender_eth); // 5 ETH
        fake_coin::register_and_mint<USDC>(alice, 0); // 0 USDC
        fake_coin::register_and_mint<ETH>(alice, alice_eth); // 5 ETH
        let reward_au = 2000000 * 1000000;
        let reward_remaining = reward_au;

        // Incentive:
        // duration = 30 days = 30*24*3600*1000000 microseconds
        // reward = 2e14 AU USDC
        // reward per second = 77,160,493.82716049
        let duration_seconds = 30*24*3600; // 30 days
        let start_time = timestamp::now_microseconds();
        let end_time = start_time + duration_seconds * 1000000;
        create<FakeCoin<ETH>, FakeCoin<USDC>>(sender, reward_au, duration_seconds * 1000000);

        let sender_usdc = 1000000 * 1000000; // 1M = 3M - 2M
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);
        {
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            assert!(pool.authority == sender_addr, E_TEST_FAILURE);
            assert!(pool.start_time == start_time, E_TEST_FAILURE);
            assert!(pool.end_time == end_time, E_TEST_FAILURE);
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);
            assert!(coin::value(&pool.stake) == 0, E_TEST_FAILURE);
            assert!(coin::value(&pool.reward) == reward_au, E_TEST_FAILURE);
            assert!(pool.last_update_time == start_time, E_TEST_FAILURE);
            assert!(pool.acc_reward_per_share == 0, E_TEST_FAILURE);
        };

        // Sender stakes 100 au ETH
        deposit<FakeCoin<ETH>, FakeCoin<USDC>>(sender, 100);
        {
            sender_eth = sender_eth - 100;
            assert!(coin::balance<FakeCoin<ETH>>(sender_addr) == sender_eth, E_TEST_FAILURE);
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            assert!(pool.reward_remaining == reward_remaining, E_TEST_FAILURE);
            assert!(coin::value(&pool.stake) == 100, E_TEST_FAILURE);
            assert!(coin::value(&pool.reward) == reward_au, E_TEST_FAILURE);
            assert!(pool.last_update_time == start_time, E_TEST_FAILURE);
            assert!(pool.acc_reward_per_share == 0, E_TEST_FAILURE);
            let user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            assert!(user_pos.amount_staked == 100, E_TEST_FAILURE);
            assert!(user_pos.last_acc_reward_per_share == 0, E_TEST_FAILURE);
            assert!(coin::balance<St<FakeCoin<ETH>>>(sender_addr) == 100, E_TEST_FAILURE);
            assert!(*option::borrow(&coin::supply<St<FakeCoin<ETH>>>()) == 100, E_TEST_FAILURE);
        };

        // TIME: start + 100
        // fast forward 100 second and modify reward
        timestamp::fast_forward_seconds(100);
        // add $1M to reward
        end_reward_early<FakeCoin<ETH>, FakeCoin<USDC>>(sender);
        {
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);
            let acc_reward_per_share = 771604930000000000; // 77,160,493 * 1e12 / 100
            assert!(pool.acc_reward_per_share == acc_reward_per_share, (pool.acc_reward_per_share as u64));
            assert!(pool.last_update_time == timestamp::now_microseconds(), E_TEST_FAILURE);
            reward_remaining = 1999922839507; // 2e12 - 77,160,493
            sender_usdc = sender_usdc + reward_remaining;
            std::debug::print<u64>(&sender_usdc);
            assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, coin::balance<FakeCoin<USDC>>(sender_addr));
            assert!(pool.reward_remaining == 0, E_TEST_FAILURE);
            assert!(coin::value(&pool.reward) == reward_au - reward_remaining, E_TEST_FAILURE);
            assert!(pool.authority == sender_addr, E_TEST_FAILURE);
            assert!(pool.start_time == start_time, E_TEST_FAILURE);
            assert!(pool.end_time == timestamp::now_microseconds(), E_TEST_FAILURE);
            assert!(coin::value(&pool.stake) == 100, E_TEST_FAILURE);
        };

        // TIME: start + 100
        // withdraw stake
        withdraw<FakeCoin<ETH>, FakeCoin<USDC>>(sender, 100);
        {
            let pool = borrow_global_mut<Pool<FakeCoin<ETH>, FakeCoin<USDC>>>(@aux);

            let sender_reward = 77160493;
            sender_usdc = sender_usdc + sender_reward;
            assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == sender_usdc, E_TEST_FAILURE);
            // reward + update time changed; all other values should stay the same
            assert!(coin::value(&pool.stake) == 0, E_TEST_FAILURE);
            sender_eth = sender_eth + 100;
            assert!(coin::balance<FakeCoin<ETH>>(sender_addr) == sender_eth, E_TEST_FAILURE);

            let user_pos = borrow_global_mut<UserPosition<FakeCoin<ETH>, FakeCoin<USDC>>>(sender_addr);
            assert!(user_pos.amount_staked == 0, E_TEST_FAILURE);
            assert!(user_pos.last_acc_reward_per_share == pool.acc_reward_per_share, (user_pos.last_acc_reward_per_share as u64));
            assert!(coin::balance<St<FakeCoin<ETH>>>(sender_addr) == 0, E_TEST_FAILURE);
            assert!(*option::borrow(&coin::supply<St<FakeCoin<ETH>>>()) == 0, E_TEST_FAILURE);
        };
    }

    #[expected_failure(abort_code = E_INVALID_DURATION)]
    #[test(sender = @0x5e7c3, aptos_framework = @0x1, alice = @0x123)]
    fun test_cannot_end_pool_before_now(sender: &signer, aptos_framework: &signer, alice: &signer) acquires StInfo, Pool, UserPosition {
        setup_module_for_test(sender, aptos_framework);
        let alice_addr = signer::address_of(alice);
        if (!account::exists_at(alice_addr)) {
            account::create_account_for_test(alice_addr);
        };

        let sender_eth = 5 * 100000000;
        let alice_eth = sender_eth;
        fake_coin::register_and_mint<USDC>(sender, 2000000 * 1000000); // 2M USDC
        fake_coin::register_and_mint<ETH>(sender, sender_eth); // 5 ETH
        fake_coin::register_and_mint<USDC>(alice, 0); // 2M USDC
        fake_coin::register_and_mint<ETH>(alice, alice_eth); // 5 ETH
        let reward_au = 2000000 * 1000000;

        let duration_seconds = 30*24*3600; // 30 days
        create<FakeCoin<ETH>, FakeCoin<USDC>>(sender, reward_au, duration_seconds * 1000000);

        deposit<FakeCoin<ETH>, FakeCoin<USDC>>(alice, 100);

        // fast forward so alice accrues rewards
        timestamp::fast_forward_seconds(10);
        modify_pool<FakeCoin<ETH>, FakeCoin<USDC>>(sender, 0, false, duration_seconds * 1000000, false);
    }
}