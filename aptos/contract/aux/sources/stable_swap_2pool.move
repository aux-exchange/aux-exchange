module aux::stable_swap_2pool {
    use std::error;
    use std::string::{Self, String};
    use std::option;

    use aptos_std::event::{Self, EventHandle};
    use aptos_framework::type_info;
    use aptos_framework::signer;
    use aptos_framework::coin;
    use aptos_framework::managed_coin;
    use aptos_framework::timestamp;
    use aptos_framework::account;

    use aux::authority;
    use aux::uint256::{
        Self,
        underlying_mul_to_uint256 as mul256,
        multiply_underlying as mul128,
        divide_underlying as div128,
        add_underlying as add128,
        add,
        subtract as sub,
        divide as div,
        multiply as mul,
        underlying_overflow as ovfl
    };

    const MIN_LIQUIDITY: u64 = 1000;
    const LP_TOKEN_DECIMALS: u8 = 8;

    // Minimum ramp time for A in microseconds, currently set to 1 day
    const MIN_RAMP_TIME: u64 = 86400000000;

    const EPOOL_ALREADY_EXISTS: u64 = 1;
    const EPOOL_NOT_FOUND: u64 = 2;
    const ETYPE_ARGS_WRONG_ORDER: u64 = 3;
    const EPOOL_LIMIT_PRICE_VIOLATED: u64 = 4;
    const EMIN_LIQUIDITY_NOT_REACHED: u64 = 5;
    const EPOOL_NOT_EMPTY: u64 = 6;
    const EINSUFFICIENT_MIN_QUANTITY: u64 = 7;
    const EREMOVE_LIQUIDITY_UNDERFLOW: u64 = 8;
    const EOPERATION_OVERFLOW: u64 = 9;
    const EINSUFFICIENT_MAX_QUANTITY: u64 = 12;
    const EINVALID_FEE: u64 = 13;
    const EINVALID_AMM_RATIO: u64 = 14;
    const EPOOL_FROZEN: u64 = 15;
    const EINSUFFICIENT_INPUT_AMOUNT: u64 = 16;
    const EINSUFFICIENT_LIQUIDITY: u64 = 17;
    const EINSUFFICIENT_OUTPUT_AMOUNT: u64 = 18;
    const EDEDUCT_FEE_UNDERFLOW: u64 = 19;
    const ED_INVARIANT_BROKEN: u64 = 20;
    const EADD_LIQUIDITY_UNDERFLOW: u64 = 21;
    const EMIN_RAMP_TIME_UNREACHED: u64 = 22;
    const EINSUFFICIENT_RAMP_A_TIME: u64 = 23;
    const EA_ZERO: u64 = 24;

    struct Pool<phantom X, phantom Y> has key {
        // When frozen, no pool operations are permitted.
        frozen: bool,
    
        timestamp: u64, // The timestamp last time the pool state was changed, this is NOT the current timestamp
        fee_bps: u64,

        // Events 
        swap_events: EventHandle<SwapEvent>,
        add_liquidity_events: EventHandle<AddLiquidityEvent>,
        remove_liquidity_events: EventHandle<RemoveLiquidityEvent>,
        ramp_A_events: EventHandle<RampAEvent>,
        stop_ramp_A_events: EventHandle<StopRampAEvent>,

        // Pool state

        // Atomic units of x coin in the pool.
        x_reserve: coin::Coin<X>,

        // Atomic units of y coin in the pool.
        y_reserve: coin::Coin<Y>,

        // LP token handling.
        lp_mint: coin::MintCapability<LP<X, Y>>,
        lp_burn: coin::BurnCapability<LP<X, Y>>,

        // Start amplification factor for this period
        start_A: u128,

        // Target amplification factor for this period
        target_A: u128,

        // Start timestamp for this period
        start_A_ts: u64,

        // End timestamp for this period
        end_A_ts: u64,

        // D: sum of balanced pool token amount
        current_D: u128,
    }

    struct LP<phantom X, phantom Y> has store, drop {}

    struct SwapEvent has store, drop {
        sender_addr: address,
        timestamp: u64,
        in_coin_type: String,
        out_coin_type: String,
        in_reserve: u64,
        out_reserve: u64,
        in_au: u64,
        out_au: u64,
        fee_bps: u64
    }

    struct AddLiquidityEvent has store, drop {
        timestamp: u64,
        x_coin_type: String,    // TODO: should we just put the pool type here?
        y_coin_type: String,
        x_added_au: u64,
        y_added_au: u64,
        lp_minted_au: u64,
    }

    struct RemoveLiquidityEvent has store, drop {
        timestamp: u64,
        x_coin_type: String,    // TODO: should we just put the pool type here?
        y_coin_type: String,
        x_removed_au: u64,
        y_removed_au: u64,
        lp_burned_au: u64,
    }

    struct RampAEvent has store, drop {
        timestamp: u64,
        x_coin_type: String,    // TODO: should we just put the pool type here?
        y_coin_type: String,
        target_A: u128,
        end_A_ts: u64
    }

    struct StopRampAEvent has store, drop {
        timestamp: u64,
        x_coin_type: String,    // TODO: should we just put the pool type here?
        y_coin_type: String,
        current_A: u128
    }


    /*******************/
    /* ENTRY FUNCTIONS */
    /*******************/

    /// Creates an empty pool for coins of type X and Y. Charge the given basis
    /// point fee on swaps.
    public entry fun create_pool<X, Y>(sender: &signer, fee_bps: u64, start_A: u128) {
        assert!(fee_bps <= 10000, error::invalid_argument(EINVALID_FEE));
        assert!(!exists<Pool<X, Y>>(@aux), error::already_exists(EPOOL_ALREADY_EXISTS));
        assert!(!exists<Pool<Y, X>>(@aux), error::already_exists(ETYPE_ARGS_WRONG_ORDER));

        // The signer must own one of the coins or be the aux authority.
        let x_type = type_info::type_of<X>();
        let y_type = type_info::type_of<Y>();
        let sender_address = signer::address_of(sender);
        if (type_info::account_address(&x_type) != sender_address && 
            type_info::account_address(&y_type) != sender_address) {
            // Asserts that sender has the authority for @aux.
            authority::get_signer(sender);
        };

        let amm_signer = &authority::get_signer_self();

        assert!(!coin::is_coin_initialized<LP<X,Y>>(), EPOOL_ALREADY_EXISTS);

        let (lp_burn, lp_freeze, lp_mint) = coin::initialize<LP<X, Y>>(
            amm_signer,
            lp_name<X, Y>(),
            lp_symbol<X, Y>(),
            LP_TOKEN_DECIMALS,
            true // monitor_supply
        );
        coin::destroy_freeze_cap(lp_freeze);
        if (!coin::is_account_registered<X>(@aux)) {
            coin::register<X>(amm_signer);
        };
        if (!coin::is_account_registered<Y>(@aux)) {
            coin::register<Y>(amm_signer);
        };
        if (!coin::is_account_registered<LP<X, Y>>(@aux)) {
            coin::register<LP<X,Y>>(amm_signer);
        };

        let now = timestamp::now_microseconds();

        let pool = Pool<X, Y> {
            frozen: false,
            timestamp: now,
            fee_bps,
            swap_events: account::new_event_handle<SwapEvent>(amm_signer),
            add_liquidity_events: account::new_event_handle<AddLiquidityEvent>(amm_signer),
            remove_liquidity_events: account::new_event_handle<RemoveLiquidityEvent>(amm_signer),
            ramp_A_events: account::new_event_handle<RampAEvent>(amm_signer),
            stop_ramp_A_events: account::new_event_handle<StopRampAEvent>(amm_signer),
            x_reserve: coin::zero(),
            y_reserve: coin::zero(),
            lp_mint,
            lp_burn,
            start_A,
            target_A: start_A,
            start_A_ts: now,
            end_A_ts: now,
            current_D: 0
        };
        move_to(amm_signer, pool);
    }

    /// Swap exact amount of input coin for variable amount of output coin
    public entry fun swap_exact_coin_for_coin<CoinIn, CoinOut>(
        sender: &signer,
        au_in: u64,
        min_au_out: u64,
    ) acquires Pool {
        let in = coin::withdraw<CoinIn>(sender, au_in);
        let out = coin::zero();
        coin_swap_exact_coin_for_coin(
            sender,
            &mut in,
            &mut out,
            au_in,
            min_au_out,
        );
        let sender_address = signer::address_of(sender);
        coin::deposit<CoinOut>(sender_address, out);
        coin::deposit<CoinIn>(sender_address, in);
    }

    /// Swaps at most max_in_au of CoinIn for exactly exact_out_au of CoinOut.
    /// Fails if this cannot be done.
    public entry fun swap_coin_for_exact_coin<CoinIn, CoinOut>(
        sender: &signer,
        max_in_au: u64,
        exact_out_au: u64,
    ) acquires Pool {
        let in = coin::withdraw<CoinIn>(sender, max_in_au);
        let out = coin::zero();
        coin_swap_coin_for_exact_coin(
            sender,
            &mut in,
            &mut out,
            max_in_au,
            exact_out_au
        );
        let sender_address = signer::address_of(sender);
        coin::deposit<CoinIn>(sender_address, in);
        coin::deposit<CoinOut>(sender_address, out);
    }

    /// Adds exactly x_au, y_au to the pool. The added liquidity must be in the
    /// exact ratio of the pool. No rounding is performed. Fails if this
    /// condition is violated.
    public entry fun add_liquidity<X, Y>(
        sender: &signer,
        x_au: u64,
        y_au: u64
    ) acquires Pool {
        let user_x = coin::withdraw<X>(sender, x_au);
        let user_y = coin::withdraw<Y>(sender, y_au);
        let lp = coin_add_liquidity(user_x, user_y);
        let sender_address = signer::address_of(sender);
        if (!coin::is_account_registered<LP<X, Y>>(sender_address)) {
            coin::register<LP<X, Y>>(sender);
        };
        coin::deposit(sender_address, lp);
    }

    /// Adds exactly x_au, y_au to the pool. The added liquidity must be in the
    /// exact ratio of the pool. No rounding is performed. Fails if this
    /// condition is violated.
    /// Add liquidity up to x_au and y_au. The LP tokens received must be at
    /// most max_slippage_bps lower than LP x (x_debited / x_reserve) or 
    /// LP x (y_debited / y_reserve).
    public fun coin_add_liquidity<X, Y>(
        user_x: coin::Coin<X>,
        user_y: coin::Coin<Y>,
    ): coin::Coin<LP<X, Y>> acquires Pool {
        assert_pool<X, Y>();
        let pool = borrow_global_mut<Pool<X, Y>>(@aux);
        assert!(!pool.frozen, EPOOL_FROZEN);

        let x_reserve = coin::value(&pool.x_reserve);
        let y_reserve = coin::value(&pool.y_reserve);
        let pool_lp_au = option::get_with_default(
            &coin::supply<LP<X, Y>>(), 
            0
        );
        let is_new_pool = x_reserve == 0 || y_reserve == 0;

        let lp = calculate_lp_token_exact(
            x_reserve,
            y_reserve,
            pool_lp_au,
            coin::value(&user_x),
            coin::value(&user_y),
            compute_A(pool.start_A, pool.target_A, pool.start_A_ts, pool.end_A_ts, timestamp::now_microseconds()),
        );

        transfer_tokens_and_mint_after_adding_liquidity(
            pool, is_new_pool, user_x, user_y, (lp as u64)
        )
    }


    /// remove_liquidity removes lp_au from the Amm in a way that satisfies
    /// the current pool ratio as closely as possible. Any rounding keeps
    /// remaining assets in the pool. Returns the (x, y) native
    /// quantities removed from the Amm.
    public entry fun remove_liquidity<X, Y>(
        sender: &signer,
        lp_au: u64,
    ) acquires Pool {
        let lp = coin::withdraw<LP<X, Y>>(sender, lp_au);
        let (x, y) = coin_remove_liquidity(lp);
        let sender_address = signer::address_of(sender);
        coin::deposit(sender_address, x);
        coin::deposit(sender_address, y);
    }

    /// Ramp_A would onramp A from current_A to a new future_A that finishes the on ramp process at future_time
    public entry fun ramp_A<X, Y>(sender: &signer, target_A: u128, end_A_ts: u64) acquires Pool {
        // Asserts that sender has the authority for @aux.
        authority::get_signer(sender);
        // Asserts the pool exists
        assert_pool<X, Y>();
        let pool = borrow_global_mut<Pool<X, Y>>(@aux);
        // Asserts pool not frozen
        assert!(!pool.frozen, EPOOL_FROZEN);

        let now = timestamp::now_microseconds();
        let current_A = compute_A(pool.start_A, pool.target_A, pool.start_A_ts,pool.end_A_ts, now);
        // Asserts the previous ramp of A has lasted at least MIN_RAMP_TIME
        assert!(timestamp::now_microseconds() >= pool.start_A_ts + MIN_RAMP_TIME, EMIN_RAMP_TIME_UNREACHED);
        // Asserts future_A_ts is not set too close
        assert!(end_A_ts >= now + MIN_RAMP_TIME, EINSUFFICIENT_RAMP_A_TIME);
        // Ensure A is strictly positive
        assert!(target_A > 0, EA_ZERO);

        pool.start_A = current_A;
        pool.target_A = target_A;
        pool.start_A_ts = now;
        pool.end_A_ts = end_A_ts;
        // Output event
        event::emit_event<RampAEvent>(
            &mut pool.ramp_A_events,
            RampAEvent {
                timestamp: now,
                x_coin_type: type_info::type_name<X>(),
                y_coin_type: type_info::type_name<Y>(),
                end_A_ts: end_A_ts,
                target_A: target_A
            }
        );
        pool.timestamp = now;
    }

    /// Stop_ramp_A 
    public entry fun stop_ramp_A<X, Y>(sender: &signer) acquires Pool {
        // Asserts that sender has the authority for @aux.
        authority::get_signer(sender);
        // Asserts the pool exists
        assert_pool<X, Y>();
        let pool = borrow_global_mut<Pool<X, Y>>(@aux);
        // Asserts pool not frozen
        assert!(!pool.frozen, EPOOL_FROZEN);

        let now = timestamp::now_microseconds();
        let current_A = compute_A(pool.start_A, pool.target_A, pool.start_A_ts,pool.end_A_ts, now);

        pool.start_A = current_A;
        pool.target_A = current_A;
        pool.start_A_ts = now;
        pool.end_A_ts = now;

        // Output event
        event::emit_event<StopRampAEvent>(
            &mut pool.stop_ramp_A_events,
            StopRampAEvent {
                timestamp: now,
                current_A: current_A,
                x_coin_type: type_info::type_name<X>(),
                y_coin_type: type_info::type_name<Y>(),
            }
        );
        pool.timestamp = now;
    }
    

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    public fun test_ramp_A(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);

        setup_pool_for_test(sender, 0, 10000, 10000, 85);

        timestamp::fast_forward_seconds(86400);

        ramp_A<AuxCoin, AuxTestCoin>(sender, 100, timestamp::now_microseconds() + MIN_RAMP_TIME);

        let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);

        assert!(pool.start_A == 85, 0);
        assert!(pool.target_A == 100, 0);
        assert!(pool.start_A_ts == timestamp::now_microseconds(), pool.start_A_ts);
        assert!(pool.end_A_ts == timestamp::now_microseconds() + MIN_RAMP_TIME, 0);
    }
    
    #[test(sender = @0x5e7c3, aptos_framework = @0x1, alice = @0x42)]
    #[expected_failure(abort_code = 1003)]
    public fun test_ramp_A_should_abort(sender: &signer, aptos_framework: &signer, alice: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);

        setup_pool_for_test(sender, 0, 10000, 10000, 85);

        timestamp::fast_forward_seconds(86400);

        ramp_A<AuxCoin, AuxTestCoin>(alice, 100, timestamp::now_microseconds() + MIN_RAMP_TIME);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1, alice = @0x42)]
    public fun test_stop_ramp_A(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);

        setup_pool_for_test(sender, 0, 10000, 10000, 85);

        timestamp::fast_forward_seconds(86400);
        ramp_A<AuxCoin, AuxTestCoin>(sender, 100, timestamp::now_microseconds() + MIN_RAMP_TIME);
        timestamp::fast_forward_seconds(30000);

        stop_ramp_A<AuxCoin, AuxTestCoin>(sender);

        let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);

        assert!(pool.start_A == 90, 0);
        assert!(pool.target_A == 90, 0);
        assert!(pool.start_A_ts == timestamp::now_microseconds(), pool.start_A_ts);
        assert!(pool.end_A_ts == timestamp::now_microseconds(), 0);
    }

    /// Removes lp_au from the Amm in a way that satisfies
    /// the current pool ratio as closely as possible. Any rounding keeps
    /// remaining assets in the pool. Returns the (x, y) native
    /// quantities removed from the Amm.
    public fun coin_remove_liquidity<X, Y>(
        lp: coin::Coin<LP<X, Y>>,
    ): (coin::Coin<X>, coin::Coin<Y>) acquires Pool {
        assert_pool<X, Y>();
        let pool = borrow_global_mut<Pool<X, Y>>(@aux);
        assert!(!pool.frozen, EPOOL_FROZEN);

        let x_reserve = coin::value(&pool.x_reserve);
        let y_reserve = coin::value(&pool.y_reserve);
        let lp_au = coin::value(&lp);
        let pool_lp_au = option::get_with_default(&coin::supply<LP<X, Y>>(), 0);

        let dx = ((lp_au as u128) * (x_reserve as u128)) / pool_lp_au;
        let dy = ((lp_au as u128) * (y_reserve as u128)) / pool_lp_au;

        assert!(dx != 0, error::invalid_state(EREMOVE_LIQUIDITY_UNDERFLOW));
        assert!(dy != 0, error::invalid_state(EREMOVE_LIQUIDITY_UNDERFLOW));

        let x = coin::extract<X>(&mut pool.x_reserve, (dx as u64));
        let y = coin::extract<Y>(&mut pool.y_reserve, (dy as u64));
        coin::burn(lp, &pool.lp_burn);

        let now = timestamp::now_microseconds();
        event::emit_event<RemoveLiquidityEvent>(
            &mut pool.remove_liquidity_events,
            RemoveLiquidityEvent {
                timestamp: now,
                x_coin_type: type_info::type_name<X>(),
                y_coin_type: type_info::type_name<Y>(),
                x_removed_au: (dx as u64),
                y_removed_au: (dy as u64),
                lp_burned_au: lp_au
            }
        );
        pool.timestamp = now;
        let current_A = compute_A(pool.start_A, pool.target_A, pool.start_A_ts, pool.end_A_ts, timestamp::now_microseconds());
        pool.current_D =  compute_d_curve_standard(coin::value(&pool.x_reserve), coin::value(&pool.y_reserve), current_A);
        (x, y)
    }

    fun min_u64(l: u64, r: u64): u64 {
        if (l>r) {
            r
        } else {
            l
        }
    }
    
    /// Returns the canonical name of the LP token for the X-Y pool. We're
    /// limited to 32 bytes, so take the first 14 bytes of each coin's name.
    public fun lp_name<X, Y>(): string::String {
        let name = string::utf8(b"");
        let coin_name_x = coin::name<X>();
        let coin_name_y = coin::name<Y>();
        let end = min_u64(string::length(&coin_name_x), 14);
        string::append(&mut name, string::sub_string(&coin_name_x, 0, end));
        string::append(&mut name, string::utf8(b"/"));
        let end = min_u64(string::length(&coin_name_y), 14);
        string::append(&mut name, string::sub_string(&coin_name_y, 0, end));
        name
    }

    /// Returns the canonical symbol of the LP token for the X-Y pool. We're
    /// limited to 10 bytes, so take the first 3 bytes of each coin's symbol
    public fun lp_symbol<X, Y>(): string::String {
        let symbol = string::utf8(b"");
        let coin_symbol_x = coin::symbol<X>();
        let coin_symbol_y = coin::symbol<Y>();
        let end = min_u64(string::length(&coin_symbol_x), 3);
        string::append(&mut symbol, string::sub_string(&coin_symbol_x, 0, end));
        string::append(&mut symbol, string::utf8(b"/"));
        let end = min_u64(string::length(&coin_symbol_y), 3);
        string::append(&mut symbol, string::sub_string(&coin_symbol_y, 0, end));
        symbol
    }

    /// Removes all liquidity from the pool as the global authority if the pool
    /// is already drained of all liquidity besides the minimum LP buffer. Note
    /// that the minimum LP buffer does not correspond to a real position since
    /// it was effectively burned to add initial liquidity to the pool.
    public entry fun reset_pool<X, Y>(sender: &signer) acquires Pool {
        assert_pool<X, Y>();

        let pool = borrow_global_mut<Pool<X, Y>>(@aux);
        assert!(!pool.frozen, EPOOL_FROZEN);

        let pool_lp_au = option::get_with_default(&coin::supply<LP<X, Y>>(), 0);

        assert!(
            pool_lp_au  == (MIN_LIQUIDITY as u128),
            error::invalid_argument(EPOOL_NOT_EMPTY),
        );

        let amm_signer = &authority::get_signer(sender);

        remove_liquidity<X, Y>(amm_signer, MIN_LIQUIDITY);
    }

    /********************/
    /* PUBLIC FUNCTIONS */
    /********************/

    public fun amm_address(): address {
        @aux
    }

    public fun pool_exists<X, Y>(): bool {
        exists<Pool<X, Y>>(@aux)
    }

    public fun x_au<X, Y>(): u64 acquires Pool {
        let pool = borrow_global<Pool<X, Y>>(@aux);
        coin::value(&pool.x_reserve)
    }

    public fun y_au<X, Y>(): u64 acquires Pool {
        let pool = borrow_global<Pool<X, Y>>(@aux);
        coin::value(&pool.y_reserve)
    }

    /// Performs a swap and returns (atomic units CoinOut received, atomic units
    /// CoinIn spent).
    /// 
    /// See comments for swap_exact_coin_for_coin.
    public fun coin_swap_exact_coin_for_coin<CoinIn, CoinOut>(
        sender: &signer,
        user_in: &mut coin::Coin<CoinIn>,
        user_out: &mut coin::Coin<CoinOut>,
        au_in: u64,
        min_au_out: u64,
    ): (u64, u64) acquires Pool {
        let now = timestamp::now_microseconds();

        let (au_out, au_in, _, _) = if (exists<Pool<CoinIn, CoinOut>>(@aux)) {
            let pool = borrow_global_mut<Pool<CoinIn, CoinOut>>(@aux);
            assert!(!pool.frozen, EPOOL_FROZEN);

            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let current_A = compute_A(pool.start_A, pool.target_A, pool.start_A_ts, pool.end_A_ts, timestamp::now_microseconds());
            // Update pool balances
            let au_out = get_amount_out(au_in, x_reserve, y_reserve, pool.fee_bps, current_A);
            assert!(au_out >= min_au_out, EINSUFFICIENT_MIN_QUANTITY);
           
            // transfer tokens
            let in = coin::extract<CoinIn>(user_in, au_in);
            coin::merge<CoinIn>(&mut pool.x_reserve, in);
            let out = coin::extract<CoinOut>(&mut pool.y_reserve, au_out);
            coin::merge<CoinOut>(user_out, out);

            event::emit_event<SwapEvent>(
                &mut pool.swap_events,
                SwapEvent {
                    sender_addr: signer::address_of(sender),
                    timestamp: now,
                    in_coin_type: type_info::type_name<CoinIn>(),
                    out_coin_type: type_info::type_name<CoinOut>(),
                    in_au: au_in,
                    out_au: au_out,
                    fee_bps: pool.fee_bps,
                    in_reserve: x_reserve,
                    out_reserve: y_reserve,
                }
            );

            let new_x_reserve = coin::value(&pool.x_reserve);
            let new_y_reserve = coin::value(&pool.y_reserve);
            let new_d = compute_d_curve_standard(new_x_reserve, new_y_reserve, current_A);
            pool.current_D = new_d;
            pool.timestamp = now;
            (au_out, au_in, new_y_reserve, new_x_reserve)
        } else if (exists<Pool<CoinOut, CoinIn>>(@aux)) {
            let pool = borrow_global_mut<Pool<CoinOut, CoinIn>>(@aux);
            assert!(!pool.frozen, EPOOL_FROZEN);

            let current_A = compute_A(pool.start_A, pool.target_A, pool.start_A_ts, pool.end_A_ts, timestamp::now_microseconds());
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);

            // Update pool balances
            let au_out = get_amount_out(au_in, y_reserve, x_reserve, pool.fee_bps, current_A);
            assert!(au_out >= min_au_out, EINSUFFICIENT_MIN_QUANTITY);

            // transfer tokens
            let in = coin::extract<CoinIn>(user_in, au_in);
            coin::merge<CoinIn>(&mut pool.y_reserve, in);
            let out = coin::extract<CoinOut>(&mut pool.x_reserve, au_out);
            coin::merge<CoinOut>(user_out, out);

            event::emit_event<SwapEvent>(
                &mut pool.swap_events,
                SwapEvent {
                    sender_addr: signer::address_of(sender),
                    timestamp: now,
                    in_coin_type: type_info::type_name<CoinIn>(),
                    out_coin_type: type_info::type_name<CoinOut>(),
                    in_au: au_in,
                    out_au: au_out,
                    fee_bps: pool.fee_bps,
                    in_reserve: y_reserve,
                    out_reserve: x_reserve
                }
            );
            
            let new_x_reserve = coin::value(&pool.x_reserve);
            let new_y_reserve = coin::value(&pool.y_reserve);
            let new_d = compute_d_curve_standard(new_x_reserve, new_y_reserve, current_A);
            pool.current_D = new_d;
            pool.timestamp = now;
            (au_out, au_in, new_x_reserve, new_y_reserve)
        } else {
            abort(EPOOL_NOT_FOUND)
        };

        (au_out, au_in)
    }

    /// Performs a swap and returns (atomic units CoinOut received, atomic units
    /// CoinIn spent).
    /// 
    /// See comments for swap_coin_for_exact_coin. 
    public fun coin_swap_coin_for_exact_coin<CoinIn, CoinOut>(
        sender: &signer,
        user_in: &mut coin::Coin<CoinIn>,
        user_out: &mut coin::Coin<CoinOut>,
        max_au_in: u64,
        au_out: u64,
    ): (u64, u64) acquires Pool {
        let now = timestamp::now_microseconds();

        let (au_out, au_in, _, _) = if (exists<Pool<CoinIn, CoinOut>>(@aux)) {
            let pool = borrow_global_mut<Pool<CoinIn, CoinOut>>(@aux);
            let current_A = compute_A(pool.start_A, pool.target_A, pool.start_A_ts, pool.end_A_ts, timestamp::now_microseconds());
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);

            let au_in = get_amount_in(au_out, x_reserve, y_reserve, pool.fee_bps, current_A);

            assert!(au_in <= max_au_in, EINSUFFICIENT_MAX_QUANTITY);

            let in = coin::extract<CoinIn>(user_in, au_in);
            coin::merge<CoinIn>(&mut pool.x_reserve, in);
            let out = coin::extract<CoinOut>(&mut pool.y_reserve, au_out);
            coin::merge<CoinOut>(user_out, out);

            event::emit_event<SwapEvent>(
                &mut pool.swap_events,
                SwapEvent {
                    sender_addr: signer::address_of(sender),
                    timestamp: now,
                    in_coin_type: type_info::type_name<CoinIn>(),
                    out_coin_type: type_info::type_name<CoinOut>(),
                    in_au: au_in,
                    out_au: au_out,
                    fee_bps: pool.fee_bps,
                    in_reserve: x_reserve,
                    out_reserve: y_reserve
                }
            );

            let new_x_reserve = coin::value(&pool.x_reserve);
            let new_y_reserve = coin::value(&pool.y_reserve);
            let new_d = compute_d_curve_standard(new_x_reserve, new_y_reserve, current_A);
            pool.current_D = new_d;
            pool.timestamp = now;
            (au_out, au_in, new_y_reserve, new_x_reserve)
        } else if (exists<Pool<CoinOut, CoinIn>>(@aux)) {
            let pool = borrow_global_mut<Pool<CoinOut, CoinIn>>(@aux);
            let current_A = compute_A(pool.start_A, pool.target_A, pool.start_A_ts, pool.end_A_ts, timestamp::now_microseconds());
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let au_in = get_amount_in(au_out, y_reserve, x_reserve, pool.fee_bps, current_A);
            assert!(au_in <= max_au_in, EINSUFFICIENT_MAX_QUANTITY);

            let in = coin::extract<CoinIn>(user_in, au_in);
            coin::merge<CoinIn>(&mut pool.y_reserve, in);
            let out = coin::extract<CoinOut>(&mut pool.x_reserve, au_out);
            coin::merge<CoinOut>(user_out, out);

            event::emit_event<SwapEvent>(
                &mut pool.swap_events,
                SwapEvent {
                    sender_addr: signer::address_of(sender),
                    timestamp: now,
                    in_coin_type: type_info::type_name<CoinIn>(),
                    out_coin_type: type_info::type_name<CoinOut>(),
                    in_au: au_in,
                    out_au: au_out,
                    fee_bps: pool.fee_bps,
                    in_reserve: y_reserve,
                    out_reserve: x_reserve
                }
            );

            let new_x_reserve = coin::value(&pool.x_reserve);
            let new_y_reserve = coin::value(&pool.y_reserve);
            let new_d = compute_d_curve_standard(new_x_reserve, new_y_reserve, current_A);
            pool.current_D = new_d;
            pool.timestamp = now;
            (au_out, au_in, new_x_reserve, new_y_reserve)
        } else {
            abort(EPOOL_NOT_FOUND)
        };

        (au_out, au_in)
    }

    /// Returns au of output token received for au of input token
    public fun au_out<CoinIn, CoinOut>(au_in: u64): u64 acquires Pool {
        if (exists<Pool<CoinIn, CoinOut>>(@aux)) {
            let pool = borrow_global<Pool<CoinIn, CoinOut>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            get_amount_out(
                au_in, 
                x_reserve, 
                y_reserve, 
                pool.fee_bps,
                compute_A(pool.start_A, pool.target_A, pool.start_A_ts, pool.end_A_ts, timestamp::now_microseconds())
            )
        } else if (exists<Pool<CoinOut, CoinIn>>(@aux)) {
            let pool = borrow_global<Pool<CoinOut, CoinIn>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            get_amount_out(au_in, y_reserve, x_reserve, pool.fee_bps, 
            compute_A(pool.start_A, pool.target_A, pool.start_A_ts, pool.end_A_ts, timestamp::now_microseconds()))
        } else {
            abort(EPOOL_NOT_FOUND)
        }
    }

    /// Returns au of input token required to receive au of output token
    public fun au_in<CoinIn, CoinOut>(au_out: u64): u64 acquires Pool {
        if (exists<Pool<CoinIn, CoinOut>>(@aux)) {
            let pool = borrow_global<Pool<CoinIn, CoinOut>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            get_amount_in(au_out, x_reserve, y_reserve, pool.fee_bps, 
            compute_A(pool.start_A, pool.target_A, pool.start_A_ts, pool.end_A_ts, timestamp::now_microseconds()))
        } else if (exists<Pool<CoinOut, CoinIn>>(@aux)) {
            let pool = borrow_global<Pool<CoinOut, CoinIn>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            get_amount_in(au_out, y_reserve, x_reserve, pool.fee_bps, 
            compute_A(pool.start_A, pool.target_A, pool.start_A_ts, pool.end_A_ts, timestamp::now_microseconds()))
        } else {
            abort(EPOOL_NOT_FOUND)
        }
    }


    /*********************/
    /* PRIVATE FUNCTIONS */
    /*********************/

    fun assert_pool<X, Y>() {
        assert!(!exists<Pool<Y, X>>(@aux), error::invalid_argument(ETYPE_ARGS_WRONG_ORDER));
        assert!(exists<Pool<X, Y>>(@aux), error::not_found(EPOOL_NOT_FOUND));
    }

    fun transfer_tokens_and_mint_after_adding_liquidity<X, Y>(
        pool: &mut Pool<X,Y>, 
        is_new_pool: bool, 
        dx: coin::Coin<X>, 
        dy: coin::Coin<Y>, 
        liquidity_au: u64,
    ): coin::Coin<LP<X, Y>> {
        let dx_value = coin::value(&dx);
        let dy_value = coin::value(&dy);

        if (is_new_pool) {
            if (liquidity_au > MIN_LIQUIDITY) {
                liquidity_au = liquidity_au - MIN_LIQUIDITY;
                // Permanently lock the first MIN_LIQUIDITY tokens
                let locked = coin::mint<LP<X, Y>>(
                    MIN_LIQUIDITY,
                    &pool.lp_mint, 
                );
                if (!coin::is_account_registered<LP<X, Y>>(@aux)) {
                    coin::register<LP<X, Y>>(&authority::get_signer_self());
                };
                coin::deposit<LP<X, Y>>(@aux, locked);
            } else {
                abort(EMIN_LIQUIDITY_NOT_REACHED)
            }
        };
        coin::merge<X>(&mut pool.x_reserve, dx);
        coin::merge<Y>(&mut pool.y_reserve, dy);

        let lp = coin::mint<LP<X,Y>>(
            liquidity_au,
            &pool.lp_mint,
        );

        let now = timestamp::now_microseconds();
        event::emit_event<AddLiquidityEvent>(
            &mut pool.add_liquidity_events,
            AddLiquidityEvent {
                timestamp: now,
                x_coin_type: type_info::type_name<X>(),
                y_coin_type: type_info::type_name<Y>(),
                x_added_au: dx_value,
                y_added_au: dy_value,
                lp_minted_au: liquidity_au
            }
        );
        pool.timestamp = now;
        lp
    }

   

    /// Returns the LP tokens given the AMM state.
    /// x_reserve is current amount of X in the pool
    /// y_reserve is current amount of Y in the pool
    /// lp_reserve is current amount of LP tokens in the pool
    /// x_au is intend to add amount in the pool
    /// y_au is intend to add amount in the pool
    public fun calculate_lp_token_exact(x_reserve: u64, y_reserve: u64, lp_reserve: u128,  x_au: u64, y_au: u64, current_A: u128): u128 {
        assert!(x_au != 0, error::invalid_argument(EINVALID_AMM_RATIO));
        assert!(y_au != 0, error::invalid_argument(EINVALID_AMM_RATIO));
        
        let d0 = compute_d_curve_standard(x_reserve, y_reserve, current_A);
        // we don't worry about overflow here since we need to store it as u128 anyway, if it overflows, then no way to prevent the inaccuracy
        let new_x = x_reserve + x_au;
        let new_y = y_reserve + y_au;
        let d1 = compute_d_curve_standard(new_x, new_y, current_A);
        assert!(d1 >= d0, ED_INVARIANT_BROKEN);
        if (lp_reserve == 0) {
            // add to empty pool
            return d1
        };
        let res = div128(mul256(lp_reserve, (d1 - d0)), d0);
        assert!(!ovfl(res), EOPERATION_OVERFLOW);
        assert!(!uint256::is_zero(&res), EADD_LIQUIDITY_UNDERFLOW);
        uint256::downcast(res)
    }

    // This is a strict improvement over compute_D (deprecated) which reduce (minimizes) overflow risks
    // Invariant:  A * sum(x_i) * n**n + D = A * D * n**n + D**(n+1) / (n**n * prod(x_i))
    // The ultimate correct iterative formula is    D^3/2xy + 4A(x+y) 
    //                                           ----------------------- 
    //                                              3D^2/4xy + 4A - 1
    // D_P = D^3 / 4xy, -----> (D_P * 2 + 4A(x+y)) * D
    //                        ---------------------------
    //                          3 * D_P + (4A - 1) * D
    fun compute_d_curve_standard(x: u64, y: u64, current_A: u128) : u128 {
        let x_u128 = (x as u128);
        let y_u128 = (y as u128);
        let sum = x_u128 + y_u128;
        if (sum == 0) return 0;
        let ann = mul256(current_A, (4 as u128));
        let const1 = mul128(ann, x_u128 + y_u128); // 4A(x+y)
        let const2 = sub(ann, uint256::new(0, 1)); // 4A-1
        let d = uint256::new(0, sum);
        let idx = 0;
        while (idx < 256) {
            let d_prod = d;
            d_prod = div128(mul(d_prod, d), x_u128 * 2);
            d_prod = div128(mul(d_prod, d), y_u128 * 2);
            let prev_d = d;
            d = div(
                    mul(
                        add(
                            mul128(d_prod, (2 as u128)), 
                            const1), 
                        d
                    ), 
                    add(
                        mul128(d_prod, (3 as u128)),
                        mul(
                            const2,
                            d
                        )
                    )
                );
            // Early stop if already solved
            let diff;
            if (uint256::greater(prev_d, d)){
                diff = sub(prev_d, d);
            }else{
                diff = sub(d, prev_d);
            };
            if (uint256::less(diff, uint256::new(0, 2))){
                break
            };
        };
        assert!(!ovfl(d), EOPERATION_OVERFLOW);
        uint256::downcast(d) 
    }

    #[test]
    fun test_compute_d_curve_standard() {
        // Real solution: ~399.633
        assert!(compute_d_curve_standard(100, 300, 90)==399, (compute_d_curve_standard(100, 300, 90) as u64));
        // ~75236
        assert!(compute_d_curve_standard(101010, 200, 50)==75235, (compute_d_curve_standard(101010, 200, 50) as u64));
        // ~500
        assert!(compute_d_curve_standard(100, 400, 1000)==499, (compute_d_curve_standard(100, 400, 1000) as u64));
        // ~20148
        assert!(compute_d_curve_standard(10074, 10074, 50)==20148, (compute_d_curve_standard(10074, 10074, 50) as u64));
        // ~300
        assert!(compute_d_curve_standard(100, 200, 1000)==299, (compute_d_curve_standard(100, 200, 1000) as u64));
        // Initial state
        assert!(compute_d_curve_standard(0, 0, 85)==0, 0);
    } 


    /// Compute A
    public fun compute_A(initial_A: u128, target_A: u128, start_A_ts: u64, end_A_ts: u64, current_ts: u64) : u128 {
        if (current_ts < end_A_ts) {
            let time_range = end_A_ts  - start_A_ts;
            let time_delta = current_ts - start_A_ts;
            if (target_A >= initial_A) {
                // do a linear ramp up from initial_A
                let diff = target_A - initial_A;
                let current_A = add128(div128(mul256(diff, (time_delta as u128)), (time_range as u128)), initial_A);
                assert!(!ovfl(current_A), EOPERATION_OVERFLOW);
                // if A even overflow, then nothing can be done (which is very unlikly since A is normally small number)
                return uint256::downcast(current_A)
            }else{
                // do a linear ramp down from initial_A
                let diff = initial_A - target_A;
                let current_A = sub(uint256::new(0, initial_A), div128(mul256(diff, (time_delta as u128)), (time_range as u128)));
                assert!(!ovfl(current_A), EOPERATION_OVERFLOW);
                return uint256::downcast(current_A)
            }
        }else{
            return target_A
        }
    }

    #[test]
    fun test_compute_A() {
        // A's decimal is 6
        // time is unix microsecond, so 0s, 10s, 7s
        // 85 + 5 * 0.7 = 88.5
        assert!(compute_A(85000000, 90000000, 0, 10000000, 7000000) == 88500000, (compute_A(85000000, 90000000, 0, 10, 7) as u64));
        assert!(compute_A(85000000, 90000000, 0, 10000000, 10000000) == 90000000,0);
        assert!(compute_A(85000000, 90000000, 0, 10000000, 0) == 85000000,0);   
    }

    // Given current stable pool's condition (fixed D), and amount_in X (in au), return maximum possible amount out of Y (in au)
    public fun get_amount_out(amount_in: u64, reserve_in: u64, reserve_out: u64, fee_bps: u64, current_A: u128): u64 {
        // Swapping x -> y
        assert!(amount_in > 0, EINSUFFICIENT_INPUT_AMOUNT);
        assert!(reserve_in > 0 && reserve_out > 0, EINSUFFICIENT_LIQUIDITY);
        // Curve first do the "swap", then deduct fee https://github.com/curvefi/curve-contract/blob/master/contracts/pools/aave/StableSwapAave.vy#L536
        let new_x = reserve_in + amount_in;
        let current_D = compute_d_curve_standard(reserve_in, reserve_out, current_A);
        let new_y = get_y_iterative_curve(new_x, current_A, current_D);

        let y_out = reserve_out - (new_y as u64);
        // If the output is smaller than the minimum reprensentable decimal of a coin, then we output 0, e.g. if USDC 6 decimal, we send 0.000001 USDC, i.e. 1 aUSDC, fee_bps = 5, 1 * 9995 / 10000 = 0, since with 6 decimal, the output amount underflows
        let y_out_with_fee = div128(mul256((y_out as u128), ((10000 - fee_bps) as u128)), (10000 as u128));
        assert!(!uint256::is_zero(&y_out_with_fee), EDEDUCT_FEE_UNDERFLOW);
        assert!(!ovfl(y_out_with_fee), EOPERATION_OVERFLOW);
        (uint256::downcast(y_out_with_fee) as u64)
    }

    // Given current stable pool's condition, and amount_out Y (in au), return minimum possible amount in of X (in au)
    public fun get_amount_in(amount_out: u64, reserve_in: u64, reserve_out: u64, fee_bps: u64, current_A: u128): u64 {
        // Swapping x -> y
        assert!(amount_out > 0, EINSUFFICIENT_OUTPUT_AMOUNT);
        assert!(reserve_in > 0 && reserve_out > 0 && amount_out < reserve_out, EINSUFFICIENT_LIQUIDITY);
        let amount_out_with_fee = div128(mul256((amount_out as u128), (10000 as u128)), ((10000 - fee_bps) as u128));
        assert!(!ovfl(amount_out_with_fee), EOPERATION_OVERFLOW);
        let new_y = reserve_out - (uint256::downcast(amount_out_with_fee) as u64);
        let current_D = compute_d_curve_standard(reserve_in, reserve_out, current_A);
        // By symmetry can use same function to solve for x
        let new_x = get_y_iterative_curve(new_y, current_A, current_D);
        let x_in = (new_x as u64) - reserve_in;
        x_in
    }

    #[test]
    fun test_get_amount_in(){
        // perfect balance pool, including fee so pay a bit more than 10000, 30x, 30y 
        assert!(get_amount_in(10000, 300000, 300000, 5, 85)==10006, (get_amount_in(10000, 300000, 300000, 5, 85) as u64));
        
        // ask same amount out, since amount in is more expensive priced by the pool, less amount_in is required
        assert!(get_amount_in(10000, 250000, 300000, 5, 85)==9995, (get_amount_in(10000, 250000, 300000, 5, 85) as u64));

        assert!(get_amount_in(10000, 200000, 300000, 5, 85)==9981, (get_amount_in(10000, 200000, 300000, 5, 85) as u64));

        assert!(get_amount_in(10000, 150000, 300000, 5, 85)==9958, (get_amount_in(10000, 150000, 300000, 5, 85) as u64));

        assert!(get_amount_in(10000, 100000, 300000, 5, 85)==9912, (get_amount_in(10000, 100000, 300000, 5, 85) as u64));

        assert!(get_amount_in(10000, 100000, 200000, 5, 85)==9961, (get_amount_in(10000, 100000, 200000, 5, 85) as u64));

        // with same pool, the more amount_out, the more amount_in required
        assert!(get_amount_in(10000, 300000, 300000, 5, 85)==10006, (get_amount_in(10000, 300000, 300000, 5, 85) as u64));

        assert!(get_amount_in(20000, 300000, 300000, 5, 85)==20017, (get_amount_in(20000, 300000, 300000, 5, 85) as u64));

        assert!(get_amount_in(30000, 300000, 300000, 5, 85)==30032, (get_amount_in(30000, 300000, 300000, 5, 85) as u64));

        assert!(get_amount_in(40000, 300000, 300000, 5, 85)==40051, (get_amount_in(40000, 300000, 300000, 5, 85) as u64));

        // A decreases, more slippagge, so for same amount_out, need more amount_in
        assert!(get_amount_in(40000, 300000, 300000, 5, 80)==40053, (get_amount_in(40000, 300000, 300000, 5, 80) as u64));
        assert!(get_amount_in(40000, 300000, 300000, 5, 75)==40056, (get_amount_in(40000, 300000, 300000, 5, 75) as u64));
        assert!(get_amount_in(40000, 300000, 300000, 5, 70)==40058, (get_amount_in(40000, 300000, 300000, 5, 70) as u64));
        
        assert!(get_amount_in(40000, 300000, 300000, 5, 1)==41898, (get_amount_in(40000, 300000, 300000, 5, 1) as u64));
    }

    #[test]
    fun test_get_amount_out(){
        // 1 x, 30x, 30y
        assert!(get_amount_out(10000, 300000, 300000, 5, 85)==9994, (get_amount_out(10000, 300000, 300000, 5, 85) as u64));

         // ask same amount in, since amount in is more expensive priced by the pool, more amount_out
        assert!(get_amount_out(10000, 250000, 300000, 5, 85)==10004, (get_amount_out(10000, 250000, 300000, 5, 85) as u64));

        assert!(get_amount_out(10000, 200000, 300000, 5, 85)==10018, (get_amount_out(10000, 200000, 300000, 5, 85) as u64));

        assert!(get_amount_out(10000, 150000, 300000, 5, 85)==10041, (get_amount_out(10000, 150000, 300000, 5, 85) as u64));

        assert!(get_amount_out(10000, 100000, 300000, 5, 85)==10088, (get_amount_out(10000, 100000, 300000, 5, 85) as u64));

        assert!(get_amount_out(10000, 100000, 200000, 5, 85)==10038, (get_amount_out(10000, 100000, 200000, 5, 85) as u64));

        // with same pool, the more amount_in, the more amount_out
        assert!(get_amount_out(10000, 300000, 300000, 5, 85)==9994, (get_amount_out(10000, 300000, 300000, 5, 85) as u64));

        assert!(get_amount_out(20000, 300000, 300000, 5, 85)==19983, (get_amount_out(20000, 300000, 300000, 5, 85) as u64));

        assert!(get_amount_out(30000, 300000, 300000, 5, 85)==29968, (get_amount_out(30000, 300000, 300000, 5, 85) as u64));

        assert!(get_amount_out(40000, 300000, 300000, 5, 85)==39949, (get_amount_out(40000, 300000, 300000, 5, 85) as u64));

        // Other fixed, Smaller A, more splippage, so less amount_out
        assert!(get_amount_out(40000, 300000, 300000, 5, 80)==39947, (get_amount_out(40000, 300000, 300000, 5, 80) as u64));
        assert!(get_amount_out(40000, 300000, 300000, 5, 75)==39945, (get_amount_out(40000, 300000, 300000, 5, 75) as u64));
        assert!(get_amount_out(40000, 300000, 300000, 5, 70)==39942, (get_amount_out(40000, 300000, 300000, 5, 70) as u64));

        // Extreme case, this is right, with smaller A, same amount_in, less amount_out due to larger slippage
        assert!(get_amount_out(40000, 300000, 300000, 5, 1)==38266, (get_amount_out(40000, 300000, 300000, 5, 1) as u64));
    }

    // Given current reserves, a fixed D, compute new reserve y required to maintain the stable invariant
    // A special case where n=2:
    // 16Axy^2 + (16x^2A - 4x(4A-1)D)y - D^3 = 0
    // Simplify more, we get:
    // y^2 + (x - \frac{(4A-1)D}{4A})y = \frac{D^3}{16Ax}
    // note this is an equation in form of y^2 + by + c = 0
    // The iterative update func is y = y - \frac{2y+b}{y^2+by+c} = \frac{y^2+c}{2y+b}
    // Reference: https://github.com/curvefi/curve-contract/blob/master/contracts/pools/aave/StableSwapAave.vy#L523
    fun get_y_iterative_curve(x: u64, current_A: u128, d: u128) : u128 {
        let x_u256 = uint256::new(0, (x as u128));
        // Compute b
        let b_right = div128(mul128(uint256::new(0, 4 * current_A - 1), d), 4 * current_A);
        let b;
        let b_negative;
        if (uint256::less(x_u256, b_right)){
            b = sub(b_right, x_u256);
            b_negative = true;
        }else{
            b = sub(x_u256, b_right);
            b_negative = false;
        };
        // Compute c
        let d_u256 = uint256::new(0, d);
        // let c_negative = true;
        let c = div(mul(mul(d_u256, d_u256), d_u256), mul128(x_u256, 16 * current_A));

        let idx = 0;
        let y_u256 = uint256::new(0, d);
        while (idx < 256){
            // y = (y^2 + c) /  (2y + b)
            let nominator = add(mul(y_u256, y_u256), c);
            let denominator;
            if (b_negative) {
                denominator = sub(mul128(y_u256, (2 as u128)), b);
            }else{
                denominator = add(mul128(y_u256, (2 as u128)), b);
            };
            let prev_y = y_u256;
            y_u256 = div(nominator, denominator);
            // Early stop if already solved
            let diff;
            if (uint256::greater(prev_y, y_u256)){
                diff = sub(prev_y, y_u256);
            }else{
                diff = sub(y_u256, prev_y);
            };
            if (uint256::less(diff, uint256::new(0, 2))){
                break
            };
            idx = idx + 1;
        };
        assert!(!ovfl(y_u256), EOPERATION_OVERFLOW);
        uint256::downcast(y_u256)
    }

    #[test]
    fun test_get_y() {
        // 27417.770813395968
        // get_y_use_equation is removed since it has higher overflow risks
        // let result = get_y_use_equation(1, 60, 8000);
        // assert!(result == 27417, (get_y_use_equation(1, 60, 8000) as u64));
        assert!(get_y_iterative_curve(1, 60, 7999) == 27412, (get_y_iterative_curve(1, 60, 7999) as u64));
        assert!(get_y_iterative_curve(1, 60, 8000) == 27417, (get_y_iterative_curve(1, 60, 8000) as u64));
        assert!(get_y_iterative_curve(1, 60, 8001) == 27422, (get_y_iterative_curve(1, 60, 8001) as u64));
    }

     /*********/
    /* TESTS */
    /*********/

    #[test_only]
    use aux::util;

    #[test_only]
    use aux::aux_coin::{AuxCoin, AuxTestCoin};

    #[test_only]
    const ETEST_FAILED: u64 = 0xFA113D;

    #[test_only]
    public fun setup_module_for_test(sender: &signer) {
        deployer::deployer::create_resource_account(sender, b"amm");
        authority::init_module_for_test(&deployer::deployer::get_signer_for_address(sender, @aux));
    }


    #[test_only]
    const INITIAL_LP_TOKENS: u128 = 216227766;

    // #[test_only]
    // use aptos_framework::managed_coin;

    #[test(sender = @0x5e7c3)]
    public entry fun test_lp_name(sender: &signer) {
        setup_module_for_test(sender);

        aux::aux_coin::initialize_aux_coin(sender);
        aux::aux_coin::initialize_aux_test_coin(sender);
        let name: vector<u8> = vector[65, 117, 120, 67, 111, 105, 110, 47, 65, 117, 120, 84, 101, 115, 116, 67, 111, 105, 110];
        // 'AuxCoin/AuxTestCoin'
        assert!(*string::bytes(&lp_name<AuxCoin, AuxTestCoin>()) == name, ETEST_FAILED);
    }

    #[test_only]
    public fun destroy_pool_for_test<X, Y>() acquires Pool {
        let pool = move_from<Pool<X, Y>>(@aux);
        let Pool {
            frozen: _,
            timestamp: _,
            fee_bps: _,

            // Events 
            swap_events,
            add_liquidity_events,
            remove_liquidity_events,
            ramp_A_events,
            stop_ramp_A_events,

            x_reserve,
            y_reserve,
            lp_mint,
            lp_burn,

            start_A: _,

            // Target amplification factor for this period
            target_A: _,

            // Start timestamp for this period
            start_A_ts: _,

            // End timestamp for this period
            end_A_ts: _,

            // D: sum of balanced pool token amount
            current_D: _,
            
        } = pool;
        event::destroy_handle<SwapEvent>(swap_events);
        event::destroy_handle<AddLiquidityEvent>(add_liquidity_events);
        event::destroy_handle<RemoveLiquidityEvent>(remove_liquidity_events);
        event::destroy_handle<RampAEvent>(ramp_A_events);
        event::destroy_handle<StopRampAEvent>(stop_ramp_A_events);

        let x = coin::extract_all(&mut x_reserve); 
        coin::deposit(@aux, x);
        coin::destroy_zero(x_reserve);

        let y = coin::extract_all(&mut y_reserve);
        coin::deposit(@aux, y);
        coin::destroy_zero(y_reserve);

        coin::destroy_mint_cap(lp_mint);
        coin::destroy_burn_cap(lp_burn);
    }

    #[test(sender = @0x5e7c3)]
    public entry fun test_lp_symbol(sender: &signer) {
        setup_module_for_test(sender);

        aux::aux_coin::initialize_aux_coin(sender);
        aux::aux_coin::initialize_aux_test_coin(sender);
        let symbol: vector<u8> = vector[65, 85, 88, 47, 88, 85, 65];
        // 'AUX/XUA'
        assert!(*string::bytes(&lp_symbol<AuxCoin, AuxTestCoin>()) == symbol, ETEST_FAILED);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    public fun test_create_pool(sender: &signer, aptos_framework: &signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let signer_addr = signer::address_of(sender);
        account::create_account_for_test(signer_addr);
        setup_module_for_test(sender);
        let resource_account_addr = util::create_resource_account_addr(signer_addr, b"amm");
        assert!(resource_account_addr == @aux, ETEST_FAILED);

        aux::aux_coin::initialize_aux_coin(sender);
        aux::aux_coin::initialize_aux_test_coin(sender);
        create_pool<AuxCoin, AuxTestCoin>(sender, 0, 85);
        assert!(exists<Pool<AuxCoin, AuxTestCoin>>(
            resource_account_addr), aptos_framework::error::not_found(ETEST_FAILED));
        // reverse pair should not exist
        assert!(!exists<Pool<AuxTestCoin, AuxCoin>>(
            resource_account_addr), aptos_framework::error::not_found(ETEST_FAILED));
        // other pairs should not exist
        assert!(!exists<Pool<AuxTestCoin, AuxTestCoin>>(
            resource_account_addr), aptos_framework::error::not_found(ETEST_FAILED));
        assert!(!exists<Pool<AuxCoin, AuxCoin>>(
            resource_account_addr), aptos_framework::error::not_found(ETEST_FAILED));
    }

    #[test_only]
    fun one_time_setup(sender: &signer, sender_init_x: u64, sender_init_y: u64) {
        let sender_addr = signer::address_of(sender);
        if (!account::exists_at(sender_addr)) {
            account::create_account_for_test(sender_addr);
        };
        setup_module_for_test(sender);
        assert!(signer::address_of(&authority::get_signer(sender)) == @aux, ETEST_FAILED);
        aux::aux_coin::initialize_aux_coin(sender);
        aux::aux_coin::initialize_aux_test_coin(sender);

        util::maybe_register_coin<AuxCoin>(sender);
        util::maybe_register_coin<AuxTestCoin>(sender);
        assert!(coin::is_account_registered<AuxCoin>(sender_addr), ETEST_FAILED);
        assert!(coin::is_account_registered<AuxTestCoin>(sender_addr), ETEST_FAILED);

        managed_coin::mint<AuxCoin>(&authority::get_signer(sender), sender_addr, sender_init_x);
        managed_coin::mint<AuxTestCoin>(&authority::get_signer(sender), sender_addr, sender_init_y);
    } 

    #[test_only]
    fun setup_pool_for_test(sender: &signer, fee_bps: u64, sender_init_x: u64, sender_init_y: u64, current_A: u128) {
        one_time_setup(sender, sender_init_x, sender_init_y);
        create_pool<AuxCoin, AuxTestCoin>(sender, fee_bps, current_A);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    public fun test_add_initial_liquidity(sender: &signer, aptos_framework: &signer) acquires Pool {
        use aux::fake_coin::{init_module_for_testing, register_and_mint, BTC, FakeCoin};
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let sender_addr = signer::address_of(sender);
        if (!account::exists_at(sender_addr)) {
            account::create_account_for_test(sender_addr);
        };
        init_module_for_testing(sender);
        assert!(signer::address_of(&authority::get_signer(sender)) == @aux, ETEST_FAILED);
        aux::aux_coin::initialize_aux_coin(sender);

        util::maybe_register_coin<AuxCoin>(sender);
        assert!(coin::is_account_registered<AuxCoin>(sender_addr), ETEST_FAILED);

        managed_coin::mint<AuxCoin>(&authority::get_signer(sender), sender_addr, 1000000000);

        register_and_mint<BTC>(sender, 200000000);

        create_pool<AuxCoin, FakeCoin<BTC>>(sender, 0, 85);

        {
            let pool = borrow_global<Pool<AuxCoin, FakeCoin<BTC>>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, FakeCoin<BTC>>>(), 0);
            assert!(x_reserve == 0, ETEST_FAILED);
            assert!(y_reserve == 0, ETEST_FAILED);
            assert!(pool_lp_au == 0, ETEST_FAILED);
        };
        let _ = sender_addr;
        add_liquidity<AuxCoin, FakeCoin<BTC>>(sender, 200000, 200000000);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    public fun test_add_liquidity(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let sender_addr = signer::address_of(sender);

        setup_pool_for_test(sender, 0, 10000, 10000, 85);

        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 0, ETEST_FAILED);
            assert!(y_reserve == 0, ETEST_FAILED);
            assert!(pool_lp_au == 0, ETEST_FAILED);
        };
        let _ = sender_addr;
        add_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 4000);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 1000, ETEST_FAILED);
            assert!(y_reserve == 4000, ETEST_FAILED);
            assert!(pool_lp_au == 4991, (pool_lp_au as u64));
        };
        assert!(coin::balance<AuxCoin>(sender_addr) == 9000, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 6000, ETEST_FAILED);
        assert!(coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == (4991 - MIN_LIQUIDITY as u64),
                (4991 - MIN_LIQUIDITY as u64));

        // adding same coin amounts doubles liquidity
        add_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 4000);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 2000, ETEST_FAILED);
            assert!(y_reserve == 8000, ETEST_FAILED);
            assert!(pool_lp_au == 9983, (pool_lp_au as u64));
        };
        assert!(coin::balance<AuxCoin>(sender_addr) == 8000, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 2000, ETEST_FAILED);
        assert!(coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == (9983 - MIN_LIQUIDITY as u64),
                coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr));
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    public fun test_add_liquidity_small(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let sender_addr = signer::address_of(sender);

        setup_pool_for_test(sender, 0, 10000, 10000, 85);

        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 0, ETEST_FAILED);
            assert!(y_reserve == 0, ETEST_FAILED);
            assert!(pool_lp_au == 0, ETEST_FAILED);
        };
        let _ = sender_addr;
        add_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 1000);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 1000, ETEST_FAILED);
            assert!(y_reserve == 1000, ETEST_FAILED);
            assert!(pool_lp_au == 2000, (pool_lp_au as u64));
        };
        assert!(coin::balance<AuxCoin>(sender_addr) == 9000, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 9000, ETEST_FAILED);
        assert!(coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == (2000 - MIN_LIQUIDITY as u64),
                (2000 - MIN_LIQUIDITY as u64));
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1, liquidity_provider = @0x12345)]
    fun test_reset_pool(sender: &signer, aptos_framework: &signer, liquidity_provider: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);

        setup_pool_for_test(sender, 0, 10000, 10000, 85);

        let lp_addr = signer::address_of(liquidity_provider);
        account::create_account_for_test(lp_addr);
        util::maybe_register_coin<AuxCoin>(liquidity_provider);
        util::maybe_register_coin<AuxTestCoin>(liquidity_provider);
        assert!(coin::is_account_registered<AuxCoin>(lp_addr), ETEST_FAILED);
        assert!(coin::is_account_registered<AuxTestCoin>(lp_addr), ETEST_FAILED);

        managed_coin::mint<AuxCoin>(&authority::get_signer(sender), lp_addr, 10000);
        managed_coin::mint<AuxTestCoin>(&authority::get_signer(sender), lp_addr, 10000);

        add_liquidity<AuxCoin, AuxTestCoin>(liquidity_provider, 1000, 4000);

        assert!(
            coin::balance<LP<AuxCoin, AuxTestCoin>>(lp_addr) == 3991,
            coin::balance<LP<AuxCoin, AuxTestCoin>>(lp_addr)
        );

        assert!(
            coin::balance<LP<AuxCoin, AuxTestCoin>>(@aux) == 1000,
            coin::balance<LP<AuxCoin, AuxTestCoin>>(@aux)
        );

        remove_liquidity<AuxCoin, AuxTestCoin>(liquidity_provider, 3991);

        reset_pool<AuxCoin, AuxTestCoin>(sender);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let sender_addr = signer::address_of(sender);

        setup_pool_for_test(sender, 0, 10000, 10000, 85);

        add_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 4000);

        // swap X for Y
        assert!(coin::balance<AuxCoin>(sender_addr) == 9000, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 6000, ETEST_FAILED);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            assert!(x_reserve == 1000, ETEST_FAILED);
            assert!(y_reserve == 4000, ETEST_FAILED);
        };
        let au_out = au_out<AuxCoin, AuxTestCoin>(2);
        assert!(au_out == 4, au_out);
        swap_exact_coin_for_coin<AuxCoin, AuxTestCoin>(sender, 2, 3);
        assert!(coin::balance<AuxCoin>(sender_addr) == 8998, coin::balance<AuxCoin>(sender_addr));
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 6004, coin::balance<AuxTestCoin>(sender_addr));
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            assert!(x_reserve == 1002, x_reserve);
            assert!(y_reserve == 3996, y_reserve);
        };

        // test swap in the other direction: swap Y for X
        let au_out = au_out<AuxTestCoin, AuxCoin>(7);
        assert!(au_out == 9, au_out);
        swap_exact_coin_for_coin<AuxTestCoin, AuxCoin>(sender, 7, 8);
        assert!(coin::balance<AuxCoin>(sender_addr) == 9007, coin::balance<AuxCoin>(sender_addr));
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 5997, coin::balance<AuxTestCoin>(sender_addr));
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            assert!(x_reserve == 993, x_reserve);
            assert!(y_reserve == 4003, y_reserve);
        };
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_remove_liquidity(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let sender_addr = signer::address_of(sender);
        setup_pool_for_test(sender, 0, 10000, 10000, 85);

        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 0, ETEST_FAILED);
            assert!(y_reserve == 0, ETEST_FAILED);
            assert!(pool_lp_au == 0, ETEST_FAILED);
        };
        add_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 4000);
        assert!(coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == 3991,
                coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr));
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 1000, ETEST_FAILED);
            assert!(y_reserve == 4000, ETEST_FAILED);
            assert!(pool_lp_au == (3991 + MIN_LIQUIDITY as u128), (pool_lp_au as u64));
        };
        assert!(coin::balance<AuxCoin>(sender_addr) == 9000, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 6000, ETEST_FAILED);
        // remove all liquidity
        remove_liquidity<AuxCoin, AuxTestCoin>(sender, 3991);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 201, x_reserve);
            assert!(y_reserve == 802, y_reserve);
            assert!(pool_lp_au == 1000, (pool_lp_au as u64));
        };
        assert!(coin::balance<AuxCoin>(sender_addr) == 9799, coin::balance<AuxCoin>(sender_addr));
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 9198, coin::balance<AuxTestCoin>(sender_addr) );
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_and_remove_liquidity(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let sender_addr = signer::address_of(sender);
        setup_pool_for_test(sender, 0, 10000, 10000, 85);

        add_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 4000);
        assert!(coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == 3991,
                coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr));

        // unlike constant product, stable swap outputs less when pool is imbalanced
        swap_exact_coin_for_coin<AuxCoin, AuxTestCoin>(sender, 1, 2);
        assert!(coin::balance<AuxCoin>(sender_addr) == 8999, coin::balance<AuxCoin>(sender_addr));
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 6003, coin::balance<AuxTestCoin>(sender_addr));
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 1001, x_reserve);
            assert!(y_reserve == 3997, y_reserve);
            assert!(pool_lp_au == 4991, (pool_lp_au as u64));
        };
        remove_liquidity<AuxCoin, AuxTestCoin>(sender, 1000);
        assert!(coin::balance<AuxCoin>(sender_addr) == 9199, coin::balance<AuxCoin>(sender_addr));
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 6803, coin::balance<AuxTestCoin>(sender_addr));
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 801, x_reserve);
            assert!(y_reserve == 3197, y_reserve);
            assert!(pool_lp_au == 3991, (pool_lp_au as u64));
        };
    }

    // Test error cases
    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    #[expected_failure(abort_code = 0x80001)]
    fun test_cannot_create_duplicate_pool(sender: &signer, aptos_framework: &signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let signer_addr = signer::address_of(sender);
        account::create_account_for_test(signer_addr);
        setup_module_for_test(sender);
        aux::aux_coin::initialize_aux_coin(sender);
        aux::aux_coin::initialize_aux_test_coin(sender);

        create_pool<AuxCoin, AuxTestCoin>(sender, 0, 85);
        create_pool<AuxCoin, AuxTestCoin>(sender, 0, 85);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    #[expected_failure(abort_code = 0x80003)]
    fun test_cannot_create_duplicate_reverse_pool(sender: &signer, aptos_framework: &signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let signer_addr = signer::address_of(sender);
        account::create_account_for_test(signer_addr);
        setup_module_for_test(sender);
        aux::aux_coin::initialize_aux_coin(sender);
        aux::aux_coin::initialize_aux_test_coin(sender);

        create_pool<AuxCoin, AuxTestCoin>(sender, 0, 85);
        create_pool<AuxTestCoin, AuxCoin>(sender, 0, 85);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    #[expected_failure(abort_code = 0x10003)]
    fun test_type_args_wrong_order(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        setup_pool_for_test(sender, 0, 10000, 10000, 85);

        // wrong order
        add_liquidity<AuxTestCoin, AuxCoin>(sender, 1, 10);
    }

    #[test(sender = @0x5e7c3, aux = @aux)]
    public fun test_lp_name_regression(sender: &signer/*, aux: &signer*/) {
        use aux::fake_coin::{init_module_for_testing, USDC, BTC, FakeCoin};
        let signer_addr = signer::address_of(sender);
        account::create_account_for_test(signer_addr);

        init_module_for_testing(sender);
        lp_name<FakeCoin<USDC>, FakeCoin<BTC>>();
        lp_symbol<FakeCoin<USDC>, FakeCoin<BTC>>();
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_add_liquidity_remove_liquidity(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let sender_addr = signer::address_of(sender);

        setup_pool_for_test(sender, 0, 10000, 10000, 85);
        let aux_bal = coin::balance<AuxCoin>(sender_addr);
        let test_bal = coin::balance<AuxTestCoin>(sender_addr);

        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 0, ETEST_FAILED);
            assert!(y_reserve == 0, ETEST_FAILED);
            assert!(pool_lp_au == 0, ETEST_FAILED);
        };

        let _ = sender_addr;
        add_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 4000);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 1000, ETEST_FAILED);
            assert!(y_reserve == 4000, ETEST_FAILED);
            assert!(pool_lp_au == 4991, (pool_lp_au as u64));
        };
        aux_bal = aux_bal - 1000;
        test_bal = test_bal - 4000;
        assert!(coin::balance<AuxCoin>(sender_addr) == aux_bal, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == test_bal, ETEST_FAILED);
        assert!(coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == (4991 - MIN_LIQUIDITY as u64),
                ETEST_FAILED);

        // Exact remove_liquidity.
        remove_liquidity<AuxCoin, AuxTestCoin>(sender, 50);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 990, x_reserve);
            assert!(y_reserve == 3960, y_reserve);
            assert!(pool_lp_au == 4941, (pool_lp_au as u64));
        };
        aux_bal = aux_bal + 10;
        test_bal = test_bal + 40;
        assert!(coin::balance<AuxCoin>(sender_addr) == aux_bal, coin::balance<AuxCoin>(sender_addr));
        assert!(coin::balance<AuxTestCoin>(sender_addr) == test_bal, coin::balance<AuxTestCoin>(sender_addr));
        assert!(coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == (4941 - MIN_LIQUIDITY as u64),
                ETEST_FAILED);

        // Rounded remove_liquidity
        remove_liquidity<AuxCoin, AuxTestCoin>(sender, 17);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 987, x_reserve);
            assert!(y_reserve == 3947, y_reserve);
            assert!(pool_lp_au == 4924, (pool_lp_au as u64));
        };
        aux_bal = aux_bal + 3;
        test_bal = test_bal + 13;
        assert!(coin::balance<AuxCoin>(sender_addr) == aux_bal, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == test_bal, ETEST_FAILED);
        assert!(coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == (4924 - MIN_LIQUIDITY as u64),
                ETEST_FAILED);

        // Total remove_liquidity
        remove_liquidity<AuxCoin, AuxTestCoin>(sender, 4924 - MIN_LIQUIDITY);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 201, x_reserve);
            assert!(y_reserve == 802, y_reserve);
            assert!(pool_lp_au == (MIN_LIQUIDITY as u128), 1);
        };
    }

    #[test_only]
    struct SwapHelperInput has drop {
        fee_bps: u64,
        exact_in: bool,
        x_in_y_out: bool,
        init_x: u64,
        init_y: u64,
        au_in: u64,
        au_out: u64,
        expected_au_in: u64,
        expected_au_out: u64,
        use_limit: bool,
        limit_num: u64,
        limit_denom: u64
    }

    #[test_only]
    fun test_swap_helper<AuxCoin, AuxTestCoin, CoinIn, CoinOut>(
        sender: &signer, 
        aptos_framework: &signer,
        input: &SwapHelperInput
    ) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        if (!account::exists_at(signer::address_of(sender))) {
            one_time_setup(sender, 200000000, 200000000);
        };
        create_pool<AuxCoin, AuxTestCoin>(sender, input.fee_bps, 85);
        add_liquidity<AuxCoin, AuxTestCoin>(sender, input.init_x, input.init_y);
        let lp_tokens = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
        let in = coin::withdraw<CoinIn>(sender, input.au_in);
        let out = coin::zero();

        let (actual_au_out, actual_au_in) = if (input.exact_in) {
            coin_swap_exact_coin_for_coin<CoinIn, CoinOut>(
                sender, 
                &mut in,
                &mut out,
                input.au_in, 
                input.au_out, 
            )
        } else {
            coin_swap_coin_for_exact_coin<CoinIn, CoinOut>(
                sender, 
                &mut in,
                &mut out,
                input.au_in, 
                input.au_out,
            )
        };
        coin::deposit<CoinIn>(signer::address_of(sender), in);
        coin::deposit<CoinOut>(signer::address_of(sender), out);
        assert!(actual_au_out == input.expected_au_out, (actual_au_out as u64));
        assert!(actual_au_in == input.expected_au_in, (actual_au_in as u64));
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            if (input.x_in_y_out) {
                assert!(x_reserve == input.init_x + actual_au_in, 1);
                assert!(y_reserve == input.init_y - actual_au_out, 1);
            } else {
                assert!(x_reserve == input.init_x - actual_au_out, 1);
                assert!(y_reserve == input.init_y + actual_au_in, 1);
            };
            assert!(pool_lp_au == lp_tokens, 1);
        };
        destroy_pool_for_test<AuxCoin, AuxTestCoin>();
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_exact_coin_for_coin_no_fee(sender: &signer, aptos_framework: &signer) acquires Pool {
        let input = SwapHelperInput {
            fee_bps: 0,
            exact_in: true,
            init_x: 10000,
            init_y: 20000,
            au_in: 1000,
            au_out: 1000,
            expected_au_in: 1000,
            expected_au_out: 1006,
            x_in_y_out: true,
            use_limit: false,
            limit_num: 0,
            limit_denom: 0
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
        input.init_x = 20000;
        input.init_y = 10000;
        input.x_in_y_out = false;

        test_swap_helper<AuxTestCoin, AuxCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_exact_coin_for_coin_with_fee(sender: &signer, aptos_framework: &signer) acquires Pool {
        // With Fee
        let input = SwapHelperInput {
            fee_bps: 30,
            exact_in: true,
            init_x: 10000,
            init_y: 20000,
            au_in: 1000,
            au_out: 1000,
            expected_au_in: 1000,
            expected_au_out: 1002,
            x_in_y_out: true,
            use_limit: false,
            limit_num: 0,
            limit_denom: 0
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
        input.init_x = 20000;
        input.init_y = 10000;
        input.x_in_y_out = false;

        test_swap_helper<AuxTestCoin, AuxCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_coin_for_exact_coin_no_fee(sender: &signer, aptos_framework: &signer) acquires Pool {
        // X in Y out
        let input = SwapHelperInput {
            fee_bps: 0,
            exact_in: false,
            init_x: 10000,
            init_y: 20000,
            au_in: 1818,
            au_out: 1818,
            expected_au_in: 1810,
            expected_au_out: 1818,
            x_in_y_out: true,
            use_limit: false,
            limit_num: 0,
            limit_denom: 0
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);

        // Y in X out
        input.init_x = 20000;
        input.init_y = 10000;
        input.x_in_y_out = false;
        test_swap_helper<AuxTestCoin, AuxCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_x_for_exact_y_no_fee_check_rounding(sender: &signer, aptos_framework: &signer) acquires Pool {
        let input = SwapHelperInput {
            fee_bps: 0,
            exact_in: false,
            init_x: 2000000,
            init_y: 200000000,
            au_in: 87960059,
            au_out: 100000000,
            expected_au_in: 87960059,
            expected_au_out: 100000000,
            x_in_y_out: true,
            use_limit: false,
            limit_num: 0,
            limit_denom: 0
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_coin_for_exact_coin_with_fee(sender: &signer, aptos_framework: &signer) acquires Pool {
        // X in Y out
        let input = SwapHelperInput {
            fee_bps: 30,
            exact_in: false,
            init_x: 10000,
            init_y: 20000,
            au_in: 1811,
            au_out: 1813,
            expected_au_in: 1810,
            expected_au_out: 1813,
            // final_x: 11000,
            // final_y: 18187 
            x_in_y_out: true,
            use_limit: false,
            limit_num: 0,
            limit_denom: 0
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);

        // Y in X out
        input.init_x = 20000;
        input.init_y = 10000;
        input.x_in_y_out = false;
        test_swap_helper<AuxTestCoin, AuxCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_exact_coin_for_coin_with_min_no_fee(sender: &signer, aptos_framework: &signer) acquires Pool {
        let input = SwapHelperInput {
            fee_bps: 0,
            exact_in: true,
            init_x: 10000,
            init_y: 10000,
            au_in: 100,
            au_out: 99,
            expected_au_in: 100,
            expected_au_out: 101,
            x_in_y_out: true,
            use_limit: false,
            limit_num: 0,
            limit_denom: 0
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
        input.x_in_y_out = false;
        test_swap_helper<AuxTestCoin, AuxCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }

    #[expected_failure]
    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_exact_coin_for_coin_binding_constraint_no_fee(sender: &signer, aptos_framework: &signer) acquires Pool {
        let input = SwapHelperInput {
            fee_bps: 0,
            exact_in: true,
            init_x: 1000,
            init_y: 1000,
            au_in: 10,
            au_out: 10,
            expected_au_in: 10,
            expected_au_out: 9,
            x_in_y_out: true,
            use_limit: false,
            limit_num: 0,
            limit_denom: 0
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
        input.x_in_y_out = false;
        test_swap_helper<AuxTestCoin, AuxCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }

    #[expected_failure]
    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_cannot_circumvent_fees(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);

        setup_pool_for_test(sender, 30, 2000000, 2000000, 85);

        add_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 1000);
        let i = 0;
        let y_received_1 = 0;
        let x_spent = 0;
        let in = coin::withdraw<AuxCoin>(sender, 150000);
        let out = coin::zero();
        while (i < 100) {
            let (y, _) = coin_swap_exact_coin_for_coin<AuxCoin, AuxTestCoin>(
                sender,
                &mut in,
                &mut out,
                100,
                0,
            );
            y_received_1 = y_received_1 + y;
            x_spent = x_spent + 100;
            i = i+1;
        };
        coin::deposit(signer::address_of(sender), in);
        coin::deposit(signer::address_of(sender), out);
        destroy_pool_for_test<AuxCoin, AuxTestCoin>();

        setup_pool_for_test(sender, 30, 2000000, 2000000, 85);

        add_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 4000);
        let in = coin::withdraw<AuxCoin>(sender, 150000);
        let out = coin::zero();
        let (y_received_2, _) = coin_swap_exact_coin_for_coin<AuxCoin, AuxTestCoin>(
            sender,
            &mut in,
            &mut out,
            x_spent,
            0,
        );
        coin::deposit(signer::address_of(sender), in);
        coin::deposit(signer::address_of(sender), out);
        // let (y_received_2, _) = coin_swap_exact_coin_for_coin<AuxCoin, AuxTestCoin>(sender, x_spent, 0, false, 0, 0);

        assert!(y_received_1 <= y_received_2, 1);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    public fun test_add_liquidity_with_slippage_tolerance(
        sender: &signer, 
        aptos_framework: &signer
    ) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let sender_addr = signer::address_of(sender);
        setup_pool_for_test(sender, 0, 10000, 10000, 85);

        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 0, ETEST_FAILED);
            assert!(y_reserve == 0, ETEST_FAILED);
            assert!(pool_lp_au == 0, ETEST_FAILED);
        };

        let _ = sender_addr;
        add_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 4001);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 1000, ETEST_FAILED);
            assert!(y_reserve == 4001, ETEST_FAILED);
            assert!(pool_lp_au == 4992, (pool_lp_au as u64));
        };
        assert!(coin::balance<AuxCoin>(sender_addr) == 9000, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 5999, ETEST_FAILED);
        assert!(coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == 3992,
                coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) );

        add_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 4000);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 2000, x_reserve);
            assert!(y_reserve == 8001, y_reserve);
            assert!(pool_lp_au == 9984, (pool_lp_au as u64));
        };

        let sender_x = coin::balance<AuxCoin>(sender_addr);
        let sender_y = coin::balance<AuxTestCoin>(sender_addr);
        let sender_lp = coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr);
        assert!(sender_x == 8000, sender_x);
        assert!(sender_y == 1999, sender_y);
        assert!(sender_lp == 8984, sender_lp);
    }


    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    public fun test_stable_curve_frax(
        sender: &signer, 
        aptos_framework: &signer
    ) acquires Pool {
        // emulate https://curve.fi/fraxusdc
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let decimal = 1000000;
        let sender_addr = signer::address_of(sender);
        setup_pool_for_test(sender, 4, 10000000 * decimal, 10000000 * decimal, 1500);

        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 0, ETEST_FAILED);
            assert!(y_reserve == 0, ETEST_FAILED);
            assert!(pool_lp_au == 0, ETEST_FAILED);
        }; 

        let _ = sender_addr;
        add_liquidity<AuxCoin, AuxTestCoin>(sender, 2000000 * decimal, 4000000 * decimal);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 2000000000000, x_reserve);
            assert!(y_reserve == 4000000000000, y_reserve);
            assert!(pool_lp_au == 5999875049458, (pool_lp_au as u64));
        };
        assert!(coin::balance<AuxCoin>(sender_addr) == 8000000000000, coin::balance<AuxCoin>(sender_addr));
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 6000000000000, coin::balance<AuxTestCoin>(sender_addr));
        assert!(coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == 5999875048458,
                coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) );

        swap_exact_coin_for_coin<AuxCoin, AuxTestCoin>(sender, 1000 * decimal, 0);

        assert!(coin::balance<AuxCoin>(sender_addr) == 7999000 * decimal, coin::balance<AuxCoin>(sender_addr));
        // 1000 -> 999.88
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 6000999880830, coin::balance<AuxTestCoin>(sender_addr));

        swap_exact_coin_for_coin<AuxTestCoin, AuxCoin>(sender, 1000 * decimal, 0);

        // 1000 -> 999.32
        assert!(coin::balance<AuxCoin>(sender_addr) == 7999999319250, coin::balance<AuxCoin>(sender_addr));
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 5999999880830, coin::balance<AuxTestCoin>(sender_addr));
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    public fun test_stable_curve_steth(
        sender: &signer, 
        aptos_framework: &signer
    ) acquires Pool {
        // emulate https://curve.fi/steth
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let decimal = 1000000000000000000;
        let sender_addr = signer::address_of(sender);
        setup_pool_for_test(sender, 4, 10 * decimal, 10 * decimal, 50);

        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 0, ETEST_FAILED);
            assert!(y_reserve == 0, ETEST_FAILED);
            assert!(pool_lp_au == 0, ETEST_FAILED);
        }; 

        let _ = sender_addr;
        add_liquidity<AuxCoin, AuxTestCoin>(sender, 5 * decimal, 7 * decimal);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 5000000000000000000, x_reserve);
            assert!(y_reserve ==  7000000000000000000, y_reserve);
            assert!(pool_lp_au == 11998303403661143595, (pool_lp_au as u64));
        };
        assert!(coin::balance<AuxCoin>(sender_addr) == 5000000000000000000, coin::balance<AuxCoin>(sender_addr));
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 3000000000000000000, coin::balance<AuxTestCoin>(sender_addr));
        assert!(coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == 11998303403661142595,
                coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) );

        swap_exact_coin_for_coin<AuxCoin, AuxTestCoin>(sender, 1 * decimal / 100000, 0);

        assert!(coin::balance<AuxCoin>(sender_addr) == 4999990000000000000, coin::balance<AuxCoin>(sender_addr));
        // 1 -> 1.003
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 3000010030928245545, coin::balance<AuxTestCoin>(sender_addr));

        swap_exact_coin_for_coin<AuxTestCoin, AuxCoin>(sender, 1 * decimal / 100000, 0);

        // 1 -> 0.996
        assert!(coin::balance<AuxCoin>(sender_addr) == 4999999961193377144, coin::balance<AuxCoin>(sender_addr));
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 3000000030928245545, coin::balance<AuxTestCoin>(sender_addr));
    }

        
}