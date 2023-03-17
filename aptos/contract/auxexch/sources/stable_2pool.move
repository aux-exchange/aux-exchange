/// Auto generated from github.com/aux-exchange/aux-exchange/docs/stableswap
/// don't modify by hand!
module aux::stable_2pool {
    use std::option;
    use std::signer;
    use std::string::{Self, String};

    use aptos_std::event::{Self, EventHandle};
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use aux::authority;

    use aux::reward_distributor::{Self, RewardDistributor, RedeemToken};

    use aux::math_2pool as pool_math;
    use aux::quoter_2pool::{Self, Quoter};

    /*********************/
    /* Error Codes       */
    /*********************/

    const E_POOL_ALREADY_EXISTS: u64 = 1;
    const E_UNAUTHORIZED: u64 = 2;
    const E_AMP_ZERO: u64 = 3;
    const E_BALANCED_RESERVE_DECREASING: u64 = 4;
    const E_LP_AMOUNT_OVERFLOW: u64 = 5;
    const E_LP_AMOUNT_INCREASE_UNDERFLOW: u64 = 6;
    const E_LP_TO_MINT_OVERFLOW: u64 = 7;
    const E_LP_AMOUNT_INSUFFICIENT: u64 = 8;
    const E_WITHDRAW_AMOUNT_ALL_ZERO: u64 = 9;
    const E_WITHDRAW_BALANCED_RESERVE_UNDERFLOW: u64 = 10;
    const E_LP_BURNT_OVERFLOW: u64 = 10;
    const E_COIN_DECIMAL_TOO_LARGE: u64 = 11;
    const E_LP_TO_BURN_IS_ZERO: u64 = 12;
    const E_INVALID_OUT_COIN_INDEX: u64 = 13;
    const E_OUTPUT_COIN_UNDERFLOW: u64 = 14;
    const E_OUTPUT_COIN_INSUFFICIENT: u64 = 15;
    const E_INVALID_IN_COIN_INDEX: u64 = 16;
    const E_INPUT_COIN_UNDERFLOW: u64 = 17;
    const E_INPUT_COIN_INSUFFICIENT: u64 = 18;
    const E_AMP_TOO_LARGE: u64 = 19;
    const E_REWARD_TOKEN_AMOUNT_MISMATCH: u64 = 20;

    /// Number of Coins
    const N_COINS: u128 = 2;
    const N_COINS_U8: u8 = 2;

    /// Fee Denominator
    const FEE_DENOMINATOR: u128 = 10000000000;
    /// Min fee
    const MIN_FEE_NUMERATOR: u128 = 1000000;
    /// Max fee
    const MAX_FEE_NUMERATOR: u128 = 30000000;

    /// Balanced Reserve is stored with 18 decimals,
    /// while lp tokens only have 8 decimals.
    const BALANCED_RESERVED_TO_LP_SCALER: u128 = 10000000000;

    /// Max U64, used to check if a u128 can be safely cast into u64
    const MAX_U64: u128 = 18446744073709551615;
    const MAX_U128: u256 = (1 << 128) - 1;

    /// Lp token decimals is constant 8
    const LP_TOKEN_DECIMALS: u8 = 8;

    /// max coin decimal allowed is 8
    const MAX_COIN_DECIMAL_ALLOWED: u8 = 10;

    /// max amp
    const MAX_AMP: u128 = 2000;

    /// LP Token for the pool
    struct LP<phantom Coin0, phantom Coin1> {}

    struct LPRedeemTokenStore<phantom Coin0, phantom Coin1> has key {
        reward_token_0: RedeemToken<Coin0, LP<Coin0, Coin1>>,
        reward_token_1: RedeemToken<Coin1, LP<Coin0, Coin1>>,
    }


    /// LP Bundle combines LP Coins, and the RedeemTokens for the fees.
    /// The number of lp coins, and the number of RedeemTokens are equal, and they must be created or burned together.
    struct LPBundle<phantom Coin0, phantom Coin1> has store {
        /// Lps for the pool.
        lps: Coin<LP<Coin0, Coin1>>,
        reward_token_0: RedeemToken<Coin0, LP<Coin0, Coin1>>,
        reward_token_1: RedeemToken<Coin1, LP<Coin0, Coin1>>,
    }

    /// Pool is the struct that holds the coins, fee distributor, and information about the pool.
    /// Swap fees are moved into reward_distributor, and lps can redeem those with the redeem tokens.
    struct Pool<phantom Coin0, phantom Coin1> has key {
        /// reserve of the coin 0
        reserve_0: Coin<Coin0>,
        /// fee for coin 0
        fee_0: Coin<Coin0>,
        /// scaler_0 is used to convert the coin value to 18 decimals.
        scaler_0: u128,
        /// reward distributor for the fees in 0
        reward_distributor_0: RewardDistributor<Coin0, LP<Coin0, Coin1>>,
        /// reserve of the coin 1
        reserve_1: Coin<Coin1>,
        /// fee for coin 1
        fee_1: Coin<Coin1>,
        /// scaler_1 is used to convert the coin value to 18 decimals.
        scaler_1: u128,
        /// reward distributor for the fees in 1
        reward_distributor_1: RewardDistributor<Coin1, LP<Coin0, Coin1>>,

        /// mint capability of the lp tokens.
        lp_mint: coin::MintCapability<LP<Coin0, Coin1>>,
        /// burn capability of the lp tokens.
        lp_burn: coin::BurnCapability<LP<Coin0, Coin1>>,

        /// balanced reserve, or D.
        /// If the pool is in equilibrium (all coins have the save reserve),
        /// the sum of the all coins will have this value.
        balanced_reserve: u128,
        /// amp
        amp: u128,

        /// fee numertor.
        /// the denominator is the consant FEE_DENOMINATOR
        fee_numerator: u128,
    }

    /// SwapEvent is emitted when a swap happens.
    struct SwapEvent<phantom Coin0, phantom Coin1> has store, drop {
        sender: address,
        timestamp_microseconds: u64,


        before_reserve_0: u64,
        after_reserve_0: u64,
        fee_0: u64,
        is_coin_0_out: bool,
        amount_0_in: u64,
        amount_0_out: u64,

        before_reserve_1: u64,
        after_reserve_1: u64,
        fee_1: u64,
        is_coin_1_out: bool,
        amount_1_in: u64,
        amount_1_out: u64,

        before_balanced_reserve: u128,
        after_balanced_reserve: u128,
        amp: u128,
    }

    struct SwapEventHolder<phantom Coin0, phantom Coin1> has key {
        swap_events: EventHandle<SwapEvent<Coin0, Coin1>>,
    }

    /// AddLiquidityEvent is emitted when adding liquidity.
    struct AddLiquidityEvent<phantom Coin0, phantom Coin1> has store, drop {
        sender: address,
        timestamp_microseconds: u64,

        before_reserve_0: u64,
        after_reserve_0: u64,
        current_acc_reward_per_share_0: u128,
        before_reserve_1: u64,
        after_reserve_1: u64,
        current_acc_reward_per_share_1: u128,


        before_balanced_reserve: u128,
        after_balanced_reserve: u128,

        amp: u128,

        before_lp_coins_supply: u128,
        after_lp_coins_supply: u128,
    }

    struct AddLiquidityEventHolder<phantom Coin0, phantom Coin1> has key {
        add_liquidity_events: EventHandle<AddLiquidityEvent<Coin0, Coin1>>,
    }

    /// RemoveLiquidityEvent is emitted when the LPs unstake from the pool
    struct RemoveLiquidityEvent<phantom Coin0, phantom Coin1> has store, drop {
        sender: address,
        timestamp_microseconds: u64,

        before_reserve_0: u64,
        after_reserve_0: u64,
        fee_0: u64,
        withdraw_0: u64,
        reward_0: u64,
        before_reserve_1: u64,
        after_reserve_1: u64,
        fee_1: u64,
        withdraw_1: u64,
        reward_1: u64,


        before_balanced_reserve: u128,
        after_balanced_reserve: u128,

        amp: u128,

        before_lp_coins_supply: u128,
        after_lp_coins_supply: u128,
        lp_burnt: u64,
    }

    struct RemoveLiquidityEventHolder<phantom Coin0, phantom Coin1> has key {
        remove_liquidity_events: EventHandle<RemoveLiquidityEvent<Coin0, Coin1>>,
    }

    /// FeeMoveEvent is emitted when fees are moved from the pool into reward distributor.
    struct FeeMoveEvent<phantom Coin0, phantom Coin1> has store, drop {
        timestamp_microseconds: u64,
        reserve_0: u64,
        fee_moved_0: u64,
        before_acc_reward_per_share_0: u128,
        after_acc_reward_per_share_0: u128,
        reserve_1: u64,
        fee_moved_1: u64,
        before_acc_reward_per_share_1: u128,
        after_acc_reward_per_share_1: u128,
        balanced_reserve: u128,
        amp: u128,
    }

    struct FeeMoveEventHolder<phantom Coin0, phantom Coin1> has key {
        fee_move_events: EventHandle<FeeMoveEvent<Coin0, Coin1>>,
    }

    /**************************/
    /* Public Function        */
    /**************************/

    /// Create a new 2pool.
    public entry fun create_pool<Coin0, Coin1>(sender: &signer, fee_numerator: u128, amp: u128) {
        assert!(
            amp > 0,
            E_AMP_ZERO,
        );

        assert!(
            amp <= MAX_AMP,
            E_AMP_TOO_LARGE,
        );

        // check if any of the permutation already initialized.
        assert!(
            !exists<Pool<Coin0, Coin1>>(@aux),
            E_POOL_ALREADY_EXISTS,
        );
        assert!(
            !exists<Pool<Coin1, Coin0>>(@aux),
            E_POOL_ALREADY_EXISTS,
        );


        if (fee_numerator > MAX_FEE_NUMERATOR || fee_numerator < MIN_FEE_NUMERATOR) {
            assert!(
                signer::address_of(sender) == @aux || authority::is_signer_owner(sender),
                E_UNAUTHORIZED,
            );
        };
        let amm_signer = &authority::get_signer_self();

        // related to coin 0
        // register coin 0 for aux
        if (!coin::is_account_registered<Coin0>(@aux)) {
            coin::register<Coin0>(amm_signer);
        };
        let reward_distributor_0 = reward_distributor::create_reward_distributor<Coin0, LP<Coin0, Coin1>>(amm_signer, 0);
        // related to coin 0
        let reserve_0 = coin::zero<Coin0>();
        let fee_0 = coin::zero<Coin0>();
        let scaler_0 = pool_math::get_scaler(coin::decimals<Coin0>());

        // related to coin 1
        // register coin 1 for aux
        if (!coin::is_account_registered<Coin1>(@aux)) {
            coin::register<Coin1>(amm_signer);
        };
        let reward_distributor_1 = reward_distributor::create_reward_distributor<Coin1, LP<Coin0, Coin1>>(amm_signer, 0);
        // related to coin 1
        let reserve_1 = coin::zero<Coin1>();
        let fee_1 = coin::zero<Coin1>();
        let scaler_1 = pool_math::get_scaler(coin::decimals<Coin1>());

        let (lp_burn, lp_freeze, lp_mint) = coin::initialize<LP<Coin0, Coin1>>(
            amm_signer,
            lp_name<Coin0, Coin1>(),
            lp_symbol<Coin0, Coin1>(),
            LP_TOKEN_DECIMALS,
            true // monitor_supply
        );
        coin::destroy_freeze_cap(lp_freeze);

        coin::register<LP<Coin0, Coin1>>(amm_signer);

        // create the pool
        move_to(amm_signer, Pool<Coin0, Coin1>{
            fee_numerator,
            lp_mint,
            lp_burn,
            balanced_reserve: 0,
            amp,
            reserve_0,
            fee_0,
            scaler_0,
            reward_distributor_0,
            reserve_1,
            fee_1,
            scaler_1,
            reward_distributor_1,
        });

        move_to(amm_signer,
            SwapEventHolder<Coin0, Coin1> {
                swap_events: account::new_event_handle<SwapEvent<Coin0, Coin1>>(amm_signer),
            }
        );
        move_to(amm_signer,
            AddLiquidityEventHolder<Coin0, Coin1> {
                add_liquidity_events: account::new_event_handle<AddLiquidityEvent<Coin0, Coin1>>(amm_signer),
            }
        );
        move_to(amm_signer,
            RemoveLiquidityEventHolder<Coin0, Coin1> {
                remove_liquidity_events: account::new_event_handle<RemoveLiquidityEvent<Coin0, Coin1>>(amm_signer),
            }
        );
        move_to(amm_signer,
            FeeMoveEventHolder<Coin0, Coin1> {
                fee_move_events: account::new_event_handle<FeeMoveEvent<Coin0, Coin1>>(amm_signer),
            }
        );
    }

    /// Get the quoter from the the pool's state.
    public fun get_quoter<Coin0, Coin1>(): Quoter acquires Pool {
        let pool = borrow_global<Pool<Coin0, Coin1>>(@aux);
        let lp_supply = std::option::destroy_some(coin::supply<LP<Coin0, Coin1>>());

        quoter_2pool::new_quoter(
            pool.fee_numerator,
            pool.amp,
            pool.balanced_reserve,
            coin::value(&pool.reserve_0),
            coin::value(&pool.fee_0),
            pool.scaler_0,
            reward_distributor::get_quoter(&pool.reward_distributor_0),
            coin::value(&pool.reserve_1),
            coin::value(&pool.fee_1),
            pool.scaler_1,
            reward_distributor::get_quoter(&pool.reward_distributor_1),
            lp_supply,
        )
    }


    /// Update the A parameter of the stable curve.
    public entry fun update_amp<Coin0, Coin1>(sender: &signer, amp: u128) acquires Pool {
        assert!(
            amp > 0,
            E_AMP_ZERO,
        );

        assert!(
            amp <= MAX_AMP,
            E_AMP_TOO_LARGE,
        );
        let pool = borrow_global_mut<Pool<Coin0, Coin1>>(@aux);
        assert!(
            signer::address_of(sender) == @aux || authority::is_signer_owner(sender),
            E_UNAUTHORIZED,
        );
        pool.amp = amp;
        // update balanced reserve
        update_balanced_reserve(pool);
    }

    /// Update fee for the pool.
    public entry fun update_fee<Coin0, Coin1>(sender: &signer, fee_numerator: u128) acquires Pool {
        let pool = borrow_global_mut<Pool<Coin0, Coin1>>(@aux);
        assert!(
            signer::address_of(sender) == @aux || authority::is_signer_owner(sender),
            E_UNAUTHORIZED,
        );
        pool.fee_numerator = fee_numerator;
    }

    /// Move fee into reward distributor.
    /// This will be automatically called when adding/removing liquidity from the pool.
    public fun move_fee_into_reward_distributor<Coin0, Coin1>() acquires Pool, FeeMoveEventHolder
    {
        let pool = borrow_global_mut<Pool<Coin0, Coin1>>(@aux);
        let fee_move_event_holder = borrow_global_mut<FeeMoveEventHolder<Coin0, Coin1>>(@aux);

        // no op if there is no fee to move
        let fee_added = false;

        let reserve_0 = coin::value(&pool.reserve_0);

        let fee_moved_0 = coin::value(&pool.fee_0);
        let before_acc_reward_per_share_0 = reward_distributor::acc_reward_per_share(&pool.reward_distributor_0);
        let after_acc_reward_per_share_0 = before_acc_reward_per_share_0;
        // only merge if there is fee to move
        if (fee_moved_0> 0) {
            fee_added = true;
            reward_distributor::add_reward(&mut pool.reward_distributor_0, coin::extract_all(&mut pool.fee_0));
            after_acc_reward_per_share_0 = reward_distributor::acc_reward_per_share(&pool.reward_distributor_0);
        };

        let reserve_1 = coin::value(&pool.reserve_1);

        let fee_moved_1 = coin::value(&pool.fee_1);
        let before_acc_reward_per_share_1 = reward_distributor::acc_reward_per_share(&pool.reward_distributor_1);
        let after_acc_reward_per_share_1 = before_acc_reward_per_share_1;
        // only merge if there is fee to move
        if (fee_moved_1> 0) {
            fee_added = true;
            reward_distributor::add_reward(&mut pool.reward_distributor_1, coin::extract_all(&mut pool.fee_1));
            after_acc_reward_per_share_1 = reward_distributor::acc_reward_per_share(&pool.reward_distributor_1);
        };

        if (!fee_added) {
            return
        };

        let balanced_reserve = pool.balanced_reserve;

        // emit event
        let amp = pool.amp;
        event::emit_event<FeeMoveEvent<Coin0, Coin1>>(
            &mut fee_move_event_holder.fee_move_events,
            FeeMoveEvent<Coin0, Coin1>{
                timestamp_microseconds: timestamp::now_microseconds(),
                reserve_0,
                fee_moved_0,
                before_acc_reward_per_share_0,
                after_acc_reward_per_share_0,
                reserve_1,
                fee_moved_1,
                before_acc_reward_per_share_1,
                after_acc_reward_per_share_1,
                balanced_reserve,
                amp,
            },
        );
    }

    /// Add liquidity to the protocol.
    /// Unlike constant product amm, arbitrary amount of coins are allowed here.
    /// Note, however, imbalanced coins will result in less lp coins than balanced coins.
    /// There is no fee to add liquidity.
    public fun add_liquidity<Coin0, Coin1>(
        sender: address,
        amount_0: Coin<Coin0>,
        amount_1: Coin<Coin1>,
        min_lp_amount: u64
    ): LPBundle<Coin0, Coin1> acquires Pool, FeeMoveEventHolder, AddLiquidityEventHolder
    {
        move_fee_into_reward_distributor<Coin0, Coin1>();
        let pool = borrow_global_mut<Pool<Coin0, Coin1>>(@aux);
        let add_liquidity_events = borrow_global_mut<AddLiquidityEventHolder<Coin0, Coin1>>(@aux);

        // move the coins into reserve
        let before_reserve_0 = coin::value(&pool.reserve_0);

        coin::merge(&mut pool.reserve_0, amount_0);
        let after_reserve_0 = coin::value(&pool.reserve_0);
        // move the coins into reserve
        let before_reserve_1 = coin::value(&pool.reserve_1);

        coin::merge(&mut pool.reserve_1, amount_1);
        let after_reserve_1 = coin::value(&pool.reserve_1);

        // update balanced reserve and lp token supply
        let before_balanced_reserve = pool.balanced_reserve;
        let before_lp_coins_supply = option::destroy_some(coin::supply<LP<Coin0, Coin1>>());

        // update balanced reserve for the pool
        update_balanced_reserve(pool);

        let after_balanced_reserve = pool.balanced_reserve;
        assert!(
            before_balanced_reserve <= after_balanced_reserve,
            E_BALANCED_RESERVE_DECREASING,
        );

        // if lp token supply is 0, this is an empty pool.
        let after_lp_coins_supply = if (before_lp_coins_supply == 0) {
            after_balanced_reserve / BALANCED_RESERVED_TO_LP_SCALER
        } else {
            let new_lp_amount = ((after_balanced_reserve as u256) * (before_lp_coins_supply as u256))/(before_balanced_reserve as u256);
            assert!(
                new_lp_amount <= MAX_U128,
                E_LP_AMOUNT_OVERFLOW,
            );

            (new_lp_amount as u128)
        };

        // Need to make sure the user added enough liquidity to generate new tokens.
        assert!(
            after_lp_coins_supply > before_lp_coins_supply,
            E_LP_AMOUNT_INCREASE_UNDERFLOW,
        );

        // mint lp coins
        let lp_to_mint = after_lp_coins_supply - before_lp_coins_supply;

        assert!(
            lp_to_mint <= MAX_U64,
            E_LP_TO_MINT_OVERFLOW,
        );

        let lp_to_mint = (lp_to_mint as u64);

        assert!(
            lp_to_mint >= min_lp_amount,
            E_LP_AMOUNT_INSUFFICIENT,
        );

        let lps = coin::mint<LP<Coin0, Coin1>>(
            lp_to_mint,
            &pool.lp_mint,
        );

        // mint reward tokens
        let reward_token_0 = reward_distributor::mint(&mut pool.reward_distributor_0, lp_to_mint);
        let current_acc_reward_per_share_0 = reward_distributor::acc_reward_per_share(&pool.reward_distributor_0);
        let reward_token_1 = reward_distributor::mint(&mut pool.reward_distributor_1, lp_to_mint);
        let current_acc_reward_per_share_1 = reward_distributor::acc_reward_per_share(&pool.reward_distributor_1);

        event::emit_event<AddLiquidityEvent<Coin0, Coin1>>(
            &mut add_liquidity_events.add_liquidity_events,
            AddLiquidityEvent<Coin0, Coin1> {
                sender,
                timestamp_microseconds: timestamp::now_microseconds(),

                before_reserve_0,
                after_reserve_0,
                current_acc_reward_per_share_0,
                before_reserve_1,
                after_reserve_1,
                current_acc_reward_per_share_1,

                before_balanced_reserve,
                after_balanced_reserve,

                amp: pool.amp,

                before_lp_coins_supply,
                after_lp_coins_supply,
            }
        );

        LPBundle {
            lps,
            reward_token_0,
            reward_token_1,
        }
    }

    /// Remove coins from the pool and burn some lp bundles.
    /// There will be a fee charged on each withdrawal. If the withdrawal amount is 0, fee is 0,
    /// otherwise the fee will be the same as swap, with a 1 minimal.
    /// Fee is charged on the output amount.
    /// For example, if 10000 is requested, and fee is 1bps, the pool will dispense 10001
    /// coins from the reserve, and deposit 1 into the fee.
    /// Also, since fees that the lp earned will be dispensed at the same time, the actual out amount may be higher than requested amount.
    public fun remove_liquidity_for_coin<Coin0, Coin1>(
        sender: address,
        amount_0_to_withdraw: u64,
        amount_1_to_withdraw: u64,
        lp_bundle: LPBundle<Coin0, Coin1>
    ): (Coin<Coin0>, Coin<Coin1>, LPBundle<Coin0, Coin1>)
    acquires Pool, RemoveLiquidityEventHolder, FeeMoveEventHolder
    {
        move_fee_into_reward_distributor<Coin0, Coin1>();

        assert!(
            amount_0_to_withdraw > 0 || amount_1_to_withdraw > 0,
            E_WITHDRAW_AMOUNT_ALL_ZERO,
        );
        let pool = borrow_global_mut<Pool<Coin0, Coin1>>(@aux);
        let remove_liquidity_events = borrow_global_mut<RemoveLiquidityEventHolder<Coin0, Coin1>>(@aux);

        let before_balanced_reserve = pool.balanced_reserve;

        // calculate the new reserve
        let before_reserve_0 = coin::value(&pool.reserve_0);
        let fee_0 = 0u64;
        let after_reserve_0 = before_reserve_0;

        let coin_0 = if (amount_0_to_withdraw > 0) {
            // calculate the fee
            let fee = ((amount_0_to_withdraw as u128) * pool.fee_numerator) / FEE_DENOMINATOR;
            if (fee * FEE_DENOMINATOR < (amount_0_to_withdraw as u128) * pool.fee_numerator) {
                fee = fee + 1;
            };
            let fee = (fee as u64);

            let fee_coin_0 = coin::extract(&mut pool.reserve_0, fee);
            coin::merge(&mut pool.fee_0, fee_coin_0);

            after_reserve_0 = coin::value(&pool.reserve_0);
            fee_0 = fee;

            coin::extract(&mut pool.reserve_0, amount_0_to_withdraw)
        } else {
            coin::zero<Coin0>()
        };

        // calculate the new reserve
        let before_reserve_1 = coin::value(&pool.reserve_1);
        let fee_1 = 0u64;
        let after_reserve_1 = before_reserve_1;

        let coin_1 = if (amount_1_to_withdraw > 0) {
            // calculate the fee
            let fee = ((amount_1_to_withdraw as u128) * pool.fee_numerator) / FEE_DENOMINATOR;
            if (fee * FEE_DENOMINATOR < (amount_1_to_withdraw as u128) * pool.fee_numerator) {
                fee = fee + 1;
            };
            let fee = (fee as u64);

            let fee_coin_1 = coin::extract(&mut pool.reserve_1, fee);
            coin::merge(&mut pool.fee_1, fee_coin_1);

            after_reserve_1 = coin::value(&pool.reserve_1);
            fee_1 = fee;

            coin::extract(&mut pool.reserve_1, amount_1_to_withdraw)
        } else {
            coin::zero<Coin1>()
        };

        let before_lp_coins_supply = option::destroy_some(coin::supply<LP<Coin0, Coin1>>());

        update_balanced_reserve(pool);

        let after_balanced_reserve = pool.balanced_reserve;
        assert!(
            before_balanced_reserve > after_balanced_reserve,
            E_WITHDRAW_BALANCED_RESERVE_UNDERFLOW
        );

        let after_lp_coins_supply = (((after_balanced_reserve as u256)*(before_lp_coins_supply as u256) / (before_balanced_reserve as u256)) as u128);

        // make sure at least 1 lp coin is burned
        if (after_lp_coins_supply == before_lp_coins_supply) {
            after_lp_coins_supply = before_lp_coins_supply - 1;
        };

        let lp_burnt = (before_lp_coins_supply - after_lp_coins_supply);
        assert!(
            lp_burnt <= MAX_U64,
            E_LP_BURNT_OVERFLOW,
        );

        let lp_burnt = (lp_burnt as u64);

        let LPBundle {
            lps: lps_to_burn,
            reward_token_0,
            reward_token_1,
        } = bundle_extract(&mut lp_bundle, lp_burnt);

        coin::burn(lps_to_burn, &pool.lp_burn);
        // burn the reward 0
        let reward_coin_0 = reward_distributor::burn(&mut pool.reward_distributor_0, reward_token_0);
        let reward_0 = coin::value(&reward_coin_0);
        coin::merge(&mut coin_0, reward_coin_0);
        // burn the reward 1
        let reward_coin_1 = reward_distributor::burn(&mut pool.reward_distributor_1, reward_token_1);
        let reward_1 = coin::value(&reward_coin_1);
        coin::merge(&mut coin_1, reward_coin_1);

        event::emit_event<RemoveLiquidityEvent<Coin0, Coin1>>(
            &mut remove_liquidity_events.remove_liquidity_events,
            RemoveLiquidityEvent<Coin0, Coin1> {
                sender,
                timestamp_microseconds: timestamp::now_microseconds(),

                lp_burnt,
                before_balanced_reserve,
                after_balanced_reserve,
                before_lp_coins_supply,
                after_lp_coins_supply,
                amp: pool.amp,

                before_reserve_0,
                after_reserve_0,
                fee_0,
                withdraw_0: amount_0_to_withdraw,
                reward_0,

                before_reserve_1,
                after_reserve_1,
                fee_1,
                withdraw_1: amount_1_to_withdraw,
                reward_1,
            }
        );

        (coin_0, coin_1, lp_bundle)
    }

    /// Remove liquidity from the pool by burning lp bundles.
    /// The coins returned will follow the current ratio of the pool.
    /// There is no fee.
    public fun remove_liquidity<Coin0, Coin1>(
        sender: address,
        lp_bundle: LPBundle<Coin0, Coin1>,
    ): (Coin<Coin0>, Coin<Coin1>)
    acquires Pool, RemoveLiquidityEventHolder, FeeMoveEventHolder
    {
        move_fee_into_reward_distributor<Coin0, Coin1>();

        let LPBundle {
            reward_token_0,
            reward_token_1,
            lps: lp,
        } = lp_bundle;
        let lp_burnt = coin::value(&lp);
        assert!(
            lp_burnt > 0,
            E_LP_TO_BURN_IS_ZERO,
        );
        let pool = borrow_global_mut<Pool<Coin0, Coin1>>(@aux);
        let remove_liquidity_events = borrow_global_mut<RemoveLiquidityEventHolder<Coin0, Coin1>>(@aux);

        let before_lp_coins_supply = option::destroy_some(coin::supply<LP<Coin0, Coin1>>());
        let before_balanced_reserve = pool.balanced_reserve;

        // remove liquidity for coin 0
        let before_reserve_0 = coin::value(&pool.reserve_0);

        let withdraw_0 = (
            ((before_reserve_0 as u128) * (lp_burnt as u128))
            / before_lp_coins_supply
             as u64);
        let coin_0 = coin::extract(&mut pool.reserve_0, withdraw_0);
        let reward_coin_0 = reward_distributor::burn(&mut pool.reward_distributor_0, reward_token_0);
        let reward_0 = coin::value(&reward_coin_0);
        coin::merge(&mut coin_0, reward_coin_0);

        let after_reserve_0 = coin::value(&pool.reserve_0);
        let fee_0: u64 = 0;

        // remove liquidity for coin 1
        let before_reserve_1 = coin::value(&pool.reserve_1);

        let withdraw_1 = (
            ((before_reserve_1 as u128) * (lp_burnt as u128))
            / before_lp_coins_supply
             as u64);
        let coin_1 = coin::extract(&mut pool.reserve_1, withdraw_1);
        let reward_coin_1 = reward_distributor::burn(&mut pool.reward_distributor_1, reward_token_1);
        let reward_1 = coin::value(&reward_coin_1);
        coin::merge(&mut coin_1, reward_coin_1);

        let after_reserve_1 = coin::value(&pool.reserve_1);
        let fee_1: u64 = 0;

        // recalculate d
        update_balanced_reserve(pool);

        coin::burn(lp, &pool.lp_burn);

        let after_balanced_reserve = pool.balanced_reserve;
        let after_lp_coins_supply = option::destroy_some(coin::supply<LP<Coin0, Coin1>>());

        event::emit_event<RemoveLiquidityEvent<Coin0, Coin1>>(
            &mut remove_liquidity_events.remove_liquidity_events,
            RemoveLiquidityEvent<Coin0, Coin1> {
                sender,
                timestamp_microseconds: timestamp::now_microseconds(),

                lp_burnt,
                before_balanced_reserve,
                after_balanced_reserve,
                before_lp_coins_supply,
                after_lp_coins_supply,
                amp: pool.amp,

                before_reserve_0,
                after_reserve_0,
                fee_0,
                withdraw_0,
                reward_0,

                before_reserve_1,
                after_reserve_1,
                fee_1,
                withdraw_1,
                reward_1,
            }
        );

        (coin_0, coin_1)
    }

    /// swap coins, where output amount is decided by the input amount.
    /// for input coins, the full amount stored in the coin will be transferred to the pool.
    /// for the output coin, the amount swapped for will be added (so the output coin can contain non-zero value).
    /// output coin is identified by the index.
    public fun swap_exact_coin_for_coin<Coin0, Coin1>(
        sender: address,
        coin_0: Coin<Coin0>,
        coin_1: Coin<Coin1>,
        out_coin_index: u8,
        min_quantity_out: u64,
    ): (Coin<Coin0>, Coin<Coin1>)
    acquires Pool, SwapEventHolder
    {
        assert!(out_coin_index < N_COINS_U8, E_INVALID_OUT_COIN_INDEX);
        let pool = borrow_global_mut<Pool<Coin0, Coin1>>(@aux);
        let swap_events = borrow_global_mut<SwapEventHolder<Coin0, Coin1>>(@aux);

        let amp = pool.amp;
        let before_balanced_reserve = pool.balanced_reserve;

        // calculate the amount in for coin 0
        let before_reserve_0 = coin::value(&pool.reserve_0);

        let is_coin_0_out = out_coin_index == 0;

        let amount_0_in = 0u64;
        let amount_0_out = 0u64;
        let fee_0 = 0u64;

        if (out_coin_index != 0) {
            amount_0_in = coin::value(&coin_0);
            coin::merge(&mut pool.reserve_0, coin::extract_all(&mut coin_0));
        };

        let after_reserve_0 = coin::value(&pool.reserve_0);
        let after_reserve_0_scaled = (after_reserve_0 as u128) * pool.scaler_0;

        // calculate the amount in for coin 1
        let before_reserve_1 = coin::value(&pool.reserve_1);

        let is_coin_1_out = out_coin_index == 1;

        let amount_1_in = 0u64;
        let amount_1_out = 0u64;
        let fee_1 = 0u64;

        if (out_coin_index != 1) {
            amount_1_in = coin::value(&coin_1);
            coin::merge(&mut pool.reserve_1, coin::extract_all(&mut coin_1));
        };

        let after_reserve_1 = coin::value(&pool.reserve_1);
        let after_reserve_1_scaled = (after_reserve_1 as u128) * pool.scaler_1;

        // calculate the scaled output coin value
        let new_x = pool_math::calculate_x(
            after_reserve_0_scaled,
            after_reserve_1_scaled,
            out_coin_index,
            amp,
            before_balanced_reserve,
        ) + 1;

        // if coin 0 is the output, update it.
        if (is_coin_0_out) {
            after_reserve_0 = ((new_x / pool.scaler_0) as u64);
            // make sure reserve after swap is not truncated.
            if (new_x % pool.scaler_0 > 0) {
                after_reserve_0 = after_reserve_0 + 1;
            };
            assert!(before_reserve_0 > after_reserve_0, E_OUTPUT_COIN_UNDERFLOW);

            // the value the pool will dispense
            let diff = before_reserve_0 - after_reserve_0;

            // fee is charged on the amount the user receives.
            let fee_amount = ((diff as u128) * pool.fee_numerator)/(FEE_DENOMINATOR + pool.fee_numerator);
            if (fee_amount * (FEE_DENOMINATOR + pool.fee_numerator) < (diff as u128) * pool.fee_numerator) {
                fee_amount = fee_amount + 1;
            };
            fee_0 = (fee_amount as u64);
            // amount the user will receive
            amount_0_out = diff - fee_0;

            assert!(amount_0_out > 0, E_OUTPUT_COIN_UNDERFLOW);
            assert!(amount_0_out >= min_quantity_out, E_OUTPUT_COIN_INSUFFICIENT);

            let out_coin = coin::extract(&mut pool.reserve_0, amount_0_out);
            coin::merge(&mut coin_0, out_coin);
            let fee_coin = coin::extract(&mut pool.reserve_0, fee_0);
            coin::merge(&mut pool.fee_0, fee_coin);
        };

        // if coin 1 is the output, update it.
        if (is_coin_1_out) {
            after_reserve_1 = ((new_x / pool.scaler_1) as u64);
            // make sure reserve after swap is not truncated.
            if (new_x % pool.scaler_1 > 0) {
                after_reserve_1 = after_reserve_1 + 1;
            };
            assert!(before_reserve_1 > after_reserve_1, E_OUTPUT_COIN_UNDERFLOW);

            // the value the pool will dispense
            let diff = before_reserve_1 - after_reserve_1;

            // fee is charged on the amount the user receives.
            let fee_amount = ((diff as u128) * pool.fee_numerator)/(FEE_DENOMINATOR + pool.fee_numerator);
            if (fee_amount * (FEE_DENOMINATOR + pool.fee_numerator) < (diff as u128) * pool.fee_numerator) {
                fee_amount = fee_amount + 1;
            };
            fee_1 = (fee_amount as u64);
            // amount the user will receive
            amount_1_out = diff - fee_1;

            assert!(amount_1_out > 0, E_OUTPUT_COIN_UNDERFLOW);
            assert!(amount_1_out >= min_quantity_out, E_OUTPUT_COIN_INSUFFICIENT);

            let out_coin = coin::extract(&mut pool.reserve_1, amount_1_out);
            coin::merge(&mut coin_1, out_coin);
            let fee_coin = coin::extract(&mut pool.reserve_1, fee_1);
            coin::merge(&mut pool.fee_1, fee_coin);
        };

        update_balanced_reserve(pool);
        let after_balanced_reserve = pool.balanced_reserve;
        assert!(after_balanced_reserve >= before_balanced_reserve, E_BALANCED_RESERVE_DECREASING);

        event::emit_event<SwapEvent<Coin0, Coin1>>(
            &mut swap_events.swap_events,
            SwapEvent<Coin0, Coin1>{
                sender,
                timestamp_microseconds: timestamp::now_microseconds(),

                before_reserve_0,
                after_reserve_0,
                fee_0,
                is_coin_0_out,
                amount_0_in,
                amount_0_out,

                before_reserve_1,
                after_reserve_1,
                fee_1,
                is_coin_1_out,
                amount_1_in,
                amount_1_out,

                before_balanced_reserve,
                after_balanced_reserve,
                amp,
            },
        );

        (coin_0, coin_1)
    }

    /// swap coins, where input amount is decided by the requested output amount.
    /// for the output coins, the amount swapped for will be added (so the output coin can contain non-zero value).
    /// for the input coin, the amount necessary is deducted.
    /// input coin is identified by the index.
    public fun swap_coin_for_exact_coin<Coin0, Coin1>(
        sender: address,
        coin_0: Coin<Coin0>,
        requested_quantity_0: u64,
        coin_1: Coin<Coin1>,
        requested_quantity_1: u64,
        in_coin_index: u8,
    ): (Coin<Coin0>, Coin<Coin1>)
    acquires Pool, SwapEventHolder
    {
        assert!(in_coin_index < N_COINS_U8, E_INVALID_IN_COIN_INDEX);
        let pool = borrow_global_mut<Pool<Coin0, Coin1>>(@aux);
        let swap_events = borrow_global_mut<SwapEventHolder<Coin0, Coin1>>(@aux);

        let amp = pool.amp;
        let before_balanced_reserve = pool.balanced_reserve;

        // process coin 0
        let before_reserve_0 = coin::value(&pool.reserve_0);

        let is_coin_0_out = in_coin_index != 0;

        let amount_0_in = 0u64;
        let amount_0_out = 0u64;
        let fee_0 = 0u64;

        if (is_coin_0_out && requested_quantity_0 > 0) {
            // calculate fee.
            // fee is based on the amount user receives.
            let fee = (pool.fee_numerator * (requested_quantity_0 as u128))/FEE_DENOMINATOR;
            if (fee * FEE_DENOMINATOR < pool.fee_numerator * (requested_quantity_0 as u128)) {
                fee = fee + 1;
            };
            let fee = (fee as u64);
            let fee_coin = coin::extract(&mut pool.reserve_0, fee);
            coin::merge(&mut pool.fee_0, fee_coin);
            coin::merge(&mut coin_0, coin::extract(&mut pool.reserve_0, requested_quantity_0));
            amount_0_out = requested_quantity_0;
            fee_0 = fee;
        };

        let after_reserve_0 = coin::value(&pool.reserve_0);
        let after_reserve_0_scaled = (after_reserve_0 as u128) * pool.scaler_0;

        // process coin 1
        let before_reserve_1 = coin::value(&pool.reserve_1);

        let is_coin_1_out = in_coin_index != 1;

        let amount_1_in = 0u64;
        let amount_1_out = 0u64;
        let fee_1 = 0u64;

        if (is_coin_1_out && requested_quantity_1 > 0) {
            // calculate fee.
            // fee is based on the amount user receives.
            let fee = (pool.fee_numerator * (requested_quantity_1 as u128))/FEE_DENOMINATOR;
            if (fee * FEE_DENOMINATOR < pool.fee_numerator * (requested_quantity_1 as u128)) {
                fee = fee + 1;
            };
            let fee = (fee as u64);
            let fee_coin = coin::extract(&mut pool.reserve_1, fee);
            coin::merge(&mut pool.fee_1, fee_coin);
            coin::merge(&mut coin_1, coin::extract(&mut pool.reserve_1, requested_quantity_1));
            amount_1_out = requested_quantity_1;
            fee_1 = fee;
        };

        let after_reserve_1 = coin::value(&pool.reserve_1);
        let after_reserve_1_scaled = (after_reserve_1 as u128) * pool.scaler_1;

        // get the new reserve for the input coin
        let new_x = pool_math::calculate_x(
            after_reserve_0_scaled,
            after_reserve_1_scaled,
            in_coin_index,
            amp,
            before_balanced_reserve,
        ) + 1;

        if (in_coin_index == 0) {
            after_reserve_0 = ((new_x / pool.scaler_0) as u64);
            // make sure new reserve is not round down
            if (new_x % pool.scaler_0 > 0) {
                after_reserve_0 = after_reserve_0 + 1;
            };
            assert!(after_reserve_0 > before_reserve_0, E_INPUT_COIN_UNDERFLOW);
            amount_0_in = after_reserve_0 - before_reserve_0;
            assert!(amount_0_in <= coin::value(&coin_0), E_INPUT_COIN_INSUFFICIENT);
            coin::merge(&mut pool.reserve_0, coin::extract(&mut coin_0, amount_0_in));
        };

        if (in_coin_index == 1) {
            after_reserve_1 = ((new_x / pool.scaler_1) as u64);
            // make sure new reserve is not round down
            if (new_x % pool.scaler_1 > 0) {
                after_reserve_1 = after_reserve_1 + 1;
            };
            assert!(after_reserve_1 > before_reserve_1, E_INPUT_COIN_UNDERFLOW);
            amount_1_in = after_reserve_1 - before_reserve_1;
            assert!(amount_1_in <= coin::value(&coin_1), E_INPUT_COIN_INSUFFICIENT);
            coin::merge(&mut pool.reserve_1, coin::extract(&mut coin_1, amount_1_in));
        };

        update_balanced_reserve(pool);

        let after_balanced_reserve = pool.balanced_reserve;
        assert!(after_balanced_reserve >= before_balanced_reserve, E_BALANCED_RESERVE_DECREASING);

        event::emit_event<SwapEvent<Coin0, Coin1>>(
            &mut swap_events.swap_events,
            SwapEvent<Coin0, Coin1>{
                sender,
                timestamp_microseconds: timestamp::now_microseconds(),

                before_reserve_0,
                after_reserve_0,
                fee_0,
                is_coin_0_out,
                amount_0_in,
                amount_0_out,

                before_reserve_1,
                after_reserve_1,
                fee_1,
                is_coin_1_out,
                amount_1_in,
                amount_1_out,

                before_balanced_reserve,
                after_balanced_reserve,
                amp,
            },
        );

        (coin_0, coin_1)
    }

    #[test_only]
    /// during test it may be desired to reset the pool - for example, a pool with coin X, Y is created,
    /// but need to do something with coin Y, X. This will destroy the pool, but the LP token will still
    /// exists.
    public fun delete_pool_in_test<Coin0, Coin1>() acquires Pool {
        let Pool {
            amp: _,
            balanced_reserve: _,
            fee_numerator: _,
            lp_burn,
            lp_mint,

            scaler_0: _,
            reserve_0,
            fee_0,
            reward_distributor_0,

            scaler_1: _,
            reserve_1,
            fee_1,
            reward_distributor_1,
        } = move_from<Pool<Coin0, Coin1>>(@aux);

        coin::deposit(@aux, reserve_0);
        coin::deposit(@aux, fee_0);
        coin::deposit(@aux, reward_distributor::destroy_for_test(reward_distributor_0));

        coin::deposit(@aux, reserve_1);
        coin::deposit(@aux, fee_1);
        coin::deposit(@aux, reward_distributor::destroy_for_test(reward_distributor_1));

        coin::destroy_mint_cap(lp_mint);
        coin::destroy_burn_cap(lp_burn);
    }

    /*********************/
    /* LPBundle          */
    /*********************/

    /// extract amount from the bundle.
    public fun bundle_extract<Coin0, Coin1>(lp: &mut LPBundle<Coin0, Coin1>, amount: u64): LPBundle<Coin0, Coin1> {
        LPBundle {
            reward_token_0: reward_distributor::token_extract(&mut lp.reward_token_0, amount),
            reward_token_1: reward_distributor::token_extract(&mut lp.reward_token_1, amount),
            lps: coin::extract(&mut lp.lps, amount),
        }
    }

    /// detach reward tokens from lp coins.
    /// **note**: to redeem lp coins from the pool, reward tokens must be reattached to the lp coins.
    public fun bundle_detach_reward<Coin0, Coin1>(
        lp: LPBundle<Coin0, Coin1>,
    ): (
        Coin<LP<Coin0, Coin1>>,
        RedeemToken<Coin0, LP<Coin0, Coin1>>,
        RedeemToken<Coin1, LP<Coin0, Coin1>>,
    ) {
        let LPBundle {
            reward_token_0,
            reward_token_1,
            lps,
        } = lp;
        (lps, reward_token_0, reward_token_1)
    }

    /// attach reward token to lp coins so they can be redeemed from the pool.
    /// the value contained in the reward token must exactly match the value
    /// contained in the lp coins.
    public fun bundle_attach_reward<Coin0, Coin1>(
        lps: Coin<LP<Coin0, Coin1>>,
        reward_token_0: RedeemToken<Coin0, LP<Coin0, Coin1>>,
        reward_token_1: RedeemToken<Coin1, LP<Coin0, Coin1>>,
    ): LPBundle<Coin0, Coin1> {
        assert!(
            coin::value(&lps) == reward_distributor::token_value(&reward_token_0),
            E_REWARD_TOKEN_AMOUNT_MISMATCH
        );
        assert!(
            coin::value(&lps) == reward_distributor::token_value(&reward_token_1),
            E_REWARD_TOKEN_AMOUNT_MISMATCH
        );

        LPBundle {
            lps,
            reward_token_0,
            reward_token_1,
        }
    }

    /// check if the reward token is fungible.
    public fun bundle_is_fungible<Coin0, Coin1>(
        l: &LPBundle<Coin0, Coin1>,
        r: &LPBundle<Coin0, Coin1>,
    ): bool {
        if (!reward_distributor::is_fungible(&l.reward_token_0, &r.reward_token_0)) {
            return false
        };
        if (!reward_distributor::is_fungible(&l.reward_token_1, &r.reward_token_1)) {
            return false
        };

        true
    }

    /// merge lp token bundle into another bundle.
    /// the reward tokens must be fungile.
    public fun bundle_merge<Coin0, Coin1>(
        l: &mut LPBundle<Coin0, Coin1>,
        r: LPBundle<Coin0, Coin1>,
    ) {
        let LPBundle {
            lps,
            reward_token_0,
            reward_token_1,
        } = r;

        coin::merge(&mut l.lps, lps);

        reward_distributor::token_merge(&mut l.reward_token_0, reward_token_0);
        reward_distributor::token_merge(&mut l.reward_token_1, reward_token_1);
    }

    /// melt lp token bundle into another bundle
    public fun bundle_melt<Coin0, Coin1>(
        l: &mut LPBundle<Coin0, Coin1>,
        r: LPBundle<Coin0, Coin1>,
    ) {
        let LPBundle {
            lps,
            reward_token_0,
            reward_token_1,
        } = r;

        coin::merge(&mut l.lps, lps);

        reward_distributor::token_melt(&mut l.reward_token_0, reward_token_0);
        reward_distributor::token_melt(&mut l.reward_token_1, reward_token_1);
    }

    public fun bundle_value<Coin0, Coin1>(lp_bundle: &LPBundle<Coin0, Coin1>): u64 {
        coin::value(&lp_bundle.lps)
    }

    public fun update_balanced_reserve<Coin0, Coin1>(pool: &mut Pool<Coin0, Coin1>) {
        let scaler_0 = pool.scaler_0;
        let reserve_0_unscaled = coin::value(&pool.reserve_0);
        let reserve_0 = (reserve_0_unscaled as u128) * scaler_0;

        let scaler_1 = pool.scaler_1;
        let reserve_1_unscaled = coin::value(&pool.reserve_1);
        let reserve_1 = (reserve_1_unscaled as u128) * scaler_1;

        pool.balanced_reserve = pool_math::calculate_d(
            reserve_0,
            reserve_1,
            pool.amp
        );
    }

    fun lp_name<Coin0, Coin1>(): String {
        let name = string::utf8(b"");

        let coin_name_0 = coin::name<Coin0>();
        let end_0 = min_u64(string::length(&coin_name_0), 15);
        string::append(&mut name, string::sub_string(&coin_name_0, 0, end_0));
        string::append(&mut name, string::utf8(b"/"));

        let coin_name_1 = coin::name<Coin1>();
        let end_1 = min_u64(string::length(&coin_name_1), 15);
        string::append(&mut name, string::sub_string(&coin_name_1, 0, end_1));

        string::sub_string(&name, 0, min_u64(string::length(&name), 10))
    }

    fun lp_symbol<Coin0, Coin1>(): String {
        let symbol = string::utf8(b"");

        let coin_symbol_0 = coin::symbol<Coin0>();
        let end_0 = min_u64(string::length(&coin_symbol_0), 3);
        string::append(&mut symbol, string::sub_string(&coin_symbol_0, 0, end_0));
        string::append(&mut symbol, string::utf8(b"/"));

        let coin_symbol_1 = coin::symbol<Coin1>();
        let end_1 = min_u64(string::length(&coin_symbol_1), 3);
        string::append(&mut symbol, string::sub_string(&coin_symbol_1, 0, end_1));

        string::sub_string(&symbol, 0, min_u64(string::length(&symbol), 10))
    }

    fun min_u64(l: u64, r: u64): u64 {
        if (l>r) {
            r
        } else {
            l
        }
    }

    public fun pool_exists<Coin0, Coin1>(): bool {
        exists<Pool<Coin0, Coin1>>(@aux)
    }

    #[test_only]
    public fun print_pool<Coin0, Coin1>() acquires Pool {
        std::debug::print(borrow_global<Pool<Coin0, Coin1>>(@aux));
    }
}
