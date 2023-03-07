module aux::amm {
    use std::string::{Self, String};
    use std::option;

    use aptos_std::event::{Self, EventHandle};
    use aptos_framework::type_info;
    use aptos_framework::account::{Self};
    use aptos_framework::signer;
    use aptos_framework::coin;
    use aptos_framework::timestamp;

    use aux::authority;
    use aux::vault;

    use aux::uint256::{
        Uint256,
        is_zero,
        add,
        underlying_mul_to_uint256 as mul256,
        downcast as to128,
        divide_underlying as div128,
        divide as div,
        less as lt,
    };

    const MIN_LIQUIDITY: u64 = 1000;
    const LP_TOKEN_DECIMALS: u8 = 8;

    const EPOOL_ALREADY_EXISTS: u64 = 1;
    const EPOOL_NOT_FOUND: u64 = 2;
    const ETYPE_ARGS_WRONG_ORDER: u64 = 3;
    const EPOOL_LIMIT_PRICE_VIOLATED: u64 = 4;
    const EMIN_LIQUIDITY_NOT_REACHED: u64 = 5;
    const EPOOL_NOT_EMPTY: u64 = 6;
    const EINSUFFICIENT_MIN_QUANTITY: u64 = 7;
    const EREMOVE_LIQUIDITY_UNDERFLOW: u64 = 8;
    const EOPERATION_OVERFLOW: u64 = 9;
    const ECONSTANT_PRODUCT: u64 = 10;
    const EVIOLATED_LIMIT_PRICE: u64 = 11;
    const EINSUFFICIENT_MAX_QUANTITY: u64 = 12;
    const EINVALID_FEE: u64 = 13;
    const EPOOL_FROZEN: u64 = 14;
    const EINVALID_AMM_RATIO: u64 = 15;
    const EINSUFFICIENT_INPUT_AMOUNT: u64 = 16;
    const EINSUFFICIENT_LIQUIDITY: u64 = 17;
    const EADD_LIQUIDITY_UNDERFLOW: u64 = 18;
    const EINSUFFICIENT_OUTPUT_AMOUNT: u64 = 19;
    const EUNAUTHORIZED: u64 = 20;
    const EINVALID_POOL: u64 = 21;

    struct LP<phantom X, phantom Y> has store, drop {}

    struct Pool<phantom X, phantom Y> has key {
        // When frozen, no pool operations are permitted.
        frozen: bool,

        timestamp: u64,
        fee_bps: u64,

        // Events
        swap_events: EventHandle<SwapEvent>,
        add_liquidity_events: EventHandle<AddLiquidityEvent>,
        remove_liquidity_events: EventHandle<RemoveLiquidityEvent>,

        // Actual balances of the pool.
        x_reserve: coin::Coin<X>,
        y_reserve: coin::Coin<Y>,

        // LP token handling.
        lp_mint: coin::MintCapability<LP<X, Y>>,
        lp_burn: coin::BurnCapability<LP<X, Y>>,
    }

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

    /// FlashSwap intentionally has no capabilities: it is neither key / store nor drop.
    ///
    /// This requires any holder of a FlashSwap object to return / destroy the FlashSwap struct
    /// instance as part of their tx. The only way to do this is by repaying the borrowed amount.
    struct FlashSwap<phantom RepayCoinType, phantom BorrowCoinType> {
        in_au: u64,
        out_au: u64,
    }

    /*******************/
    /* ENTRY FUNCTIONS */
    /*******************/

    /// Creates an empty pool for coins of type X and Y. Charge the given basis
    /// point fee on swaps.
    public entry fun create_pool<X, Y>(sender: &signer, fee_bps: u64) {
        // The fee can be adjusted later, but for permissionless creation, stick
        // to common fees. @aux can use any fee.
        if (fee_bps < 10 || fee_bps > 30) {
            assert!(authority::is_signer_owner(sender), EINVALID_FEE);
        };

        assert!(!exists<Pool<X, Y>>(@aux), EPOOL_ALREADY_EXISTS);
        assert!(!exists<Pool<Y, X>>(@aux), EPOOL_ALREADY_EXISTS);
        assert!(!coin::is_coin_initialized<LP<X,Y>>(), EPOOL_ALREADY_EXISTS);
        assert!(type_info::type_name<X>() != type_info::type_name<Y>(), EINVALID_POOL);

        let amm_signer = &authority::get_signer_self();
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

        let pool = Pool<X, Y> {
            frozen: false,
            timestamp: timestamp::now_microseconds(),
            fee_bps: fee_bps,
            swap_events: account::new_event_handle<SwapEvent>(amm_signer),
            add_liquidity_events: account::new_event_handle<AddLiquidityEvent>(amm_signer),
            remove_liquidity_events: account::new_event_handle<RemoveLiquidityEvent>(amm_signer),
            x_reserve: coin::zero(),
            y_reserve: coin::zero(),
            lp_mint: lp_mint,
            lp_burn: lp_burn,
        };
        move_to(amm_signer, pool);
    }

    public entry fun update_fee<X, Y>(sender: &signer, fee_bps: u64) acquires Pool {
        assert!(fee_bps <= 10000, EINVALID_FEE);
        assert!(exists<Pool<X, Y>>(@aux), EPOOL_NOT_FOUND);
        assert!(
            authority::is_signer_owner(sender) || signer::address_of(sender) == @aux,
            EUNAUTHORIZED,
        );
        borrow_global_mut<Pool<X, Y>>(@aux).fee_bps = fee_bps;
    }

    /// Swap exact amount of input coin for variable amount of output coin
    public entry fun swap_exact_coin_for_coin_with_signer<CoinIn, CoinOut>(
        sender: &signer,
        au_in: u64,
        min_au_out: u64,
    ) acquires Pool {
        let in = coin::withdraw<CoinIn>(sender, au_in);
        let out = coin::zero();
        swap_exact_coin_for_coin_mut(
            signer::address_of(sender),
            &mut in,
            &mut out,
            au_in,
            min_au_out,
            false,
            0,
            0,
        );
        let sender_address = signer::address_of(sender);
        coin::deposit<CoinIn>(sender_address, in);
        if (!coin::is_account_registered<CoinOut>(sender_address)) {
            coin::register<CoinOut>(sender);
        };
        coin::deposit<CoinOut>(sender_address, out);
    }

    /// Swaps at most max_in_au of CoinIn for exactly exact_out_au of CoinOut.
    /// Fails if this cannot be done.
    public entry fun swap_coin_for_exact_coin_with_signer<CoinIn, CoinOut>(
        sender: &signer,
        max_in_au: u64,
        exact_out_au: u64,
    ) acquires Pool {
        let in = coin::withdraw<CoinIn>(sender, max_in_au);
        let out = coin::zero();
        swap_coin_for_exact_coin_mut(
            signer::address_of(sender),
            &mut in,
            &mut out,
            max_in_au,
            exact_out_au,
            false,
            0,
            0,
        );
        let sender_address = signer::address_of(sender);
        coin::deposit<CoinIn>(sender_address, in);
        if (!coin::is_account_registered<CoinOut>(sender_address)) {
            coin::register<CoinOut>(sender);
        };
        coin::deposit<CoinOut>(sender_address, out);
    }

    /// Swaps exactly au_in of CoinIn for CoinOut up to a maximum marginal price
    /// of max_out_per_in_au_numerator / max_out_per_in_au_denominator CoinOut
    /// per CoinIn. Fails if this cannot be done.
    ///
    /// For example, sender wants to swap up to 1 BTC for USDC with a maximum
    /// marginal price of 0.00005 BTC per USDC. In this example, au_in = 1 BTC
    /// in atomic units and max_in_per_out_au = 0.00005 BTC in atomic units,
    /// expressed as a fraction using the numerator and denominator parameters.
    public entry fun swap_exact_coin_for_coin_limit<CoinIn, CoinOut>(
        sender: &signer,
        au_in: u64,
        max_out_per_in_au_numerator: u128,
        max_out_per_in_au_denominator: u128,
    ) acquires Pool {
        let in = coin::withdraw<CoinIn>(sender, au_in);
        let out = coin::zero();
        swap_exact_coin_for_coin_mut(
            signer::address_of(sender),
            &mut in,
            &mut out,
            au_in,
            0,
            true,
            max_out_per_in_au_numerator,
            max_out_per_in_au_denominator
        );
        let sender_address = signer::address_of(sender);
        coin::deposit<CoinOut>(sender_address, out);
        coin::deposit<CoinIn>(sender_address, in);
    }

    /// Swaps at most max_in_au of CoinIn for exactly exact_out_au CoinOut up to
    /// a maximum marginal price of max_out_per_in_au_numerator /
    /// max_out_per_in_au_denominator CoinOut per CoinIn. Fails if this cannot
    /// be done.
    public entry fun swap_coin_for_exact_coin_limit<CoinIn, CoinOut>(
        sender: &signer,
        max_in_au: u64,
        max_in_per_out_au_numerator: u128,
        max_in_per_out_au_denominator: u128,
        exact_out_au: u64,
    ) acquires Pool {
        let in = coin::withdraw<CoinIn>(sender, max_in_au);
        let out = coin::zero();
        swap_coin_for_exact_coin_mut(
            signer::address_of(sender),
            &mut in,
            &mut out,
            max_in_au,
            exact_out_au,
            true,
            max_in_per_out_au_numerator,
            max_in_per_out_au_denominator,
        );
        let sender_address = signer::address_of(sender);
        coin::deposit<CoinIn>(sender_address, in);
        coin::deposit<CoinOut>(sender_address, out);
    }

    /// Add liquidity up to x_au and y_au. The LP tokens received must be at
    /// most max_slippage_bps lower than LP x (x_debited / x_reserve) or
    /// LP x (y_debited / y_reserve).
    public entry fun add_liquidity<X, Y>(
        sender: &signer,
        x_au: u64,
        y_au: u64,
        max_slippage_bps: u64,
    ) acquires Pool {
        let user_x = coin::withdraw<X>(sender, x_au);
        let user_y = coin::withdraw<Y>(sender, y_au);
        let lp = coin_add_liquidity(&mut user_x, &mut user_y, max_slippage_bps);
        let sender_address = signer::address_of(sender);
        if (!coin::is_account_registered<LP<X, Y>>(sender_address)) {
            coin::register<LP<X, Y>>(sender);
        };
        coin::deposit(sender_address, lp);
        coin::deposit(sender_address, user_x);
        coin::deposit(sender_address, user_y);
    }

    public entry fun add_liquidity_with_aux_account<X, Y>(
        sender: &signer,
        x_au: u64,
        y_au: u64,
        max_slippage_bps: u64,
    ) acquires Pool {
        let user_x = vault::withdraw_coin<X>(sender, x_au);
        let user_y = vault::withdraw_coin<Y>(sender, y_au);

        let lp = coin_add_liquidity(&mut user_x, &mut user_y, max_slippage_bps);
        let sender_address = signer::address_of(sender);
        if (!coin::is_account_registered<LP<X, Y>>(sender_address)) {
            coin::register<LP<X, Y>>(sender);
        };
        vault::deposit_coin(sender_address, lp);
        vault::deposit_coin(sender_address, user_x);
        vault::deposit_coin(sender_address, user_y);
    }

    public entry fun remove_liquidity_with_aux_account<X, Y>(
        sender: &signer,
        lp_au: u64,
    ) acquires Pool {
        let lp = vault::withdraw_coin<LP<X, Y>>(sender, lp_au);
        let (x, y) = coin_remove_liquidity(lp);
        let sender_address = signer::address_of(sender);
        vault::deposit_coin(sender_address, x);
        vault::deposit_coin(sender_address, y);
    }

    /// Adds exactly x_au, y_au to the pool. The added liquidity must be in the
    /// exact ratio of the pool. No rounding is performed. Fails if this
    /// condition is violated.
    public entry fun add_exact_liquidity<X, Y>(
        sender: &signer,
        x_au: u64,
        y_au: u64,
    ) acquires Pool {
        let user_x = coin::withdraw<X>(sender, x_au);
        let user_y = coin::withdraw<Y>(sender, y_au);
        let lp = coin_add_exact_liquidity(user_x, user_y);
        let sender_address = signer::address_of(sender);
        if (!coin::is_account_registered<LP<X, Y>>(sender_address)) {
            coin::register<LP<X, Y>>(sender);
        };
        coin::deposit(sender_address, lp);
    }

    /// Add up to max_x_au, max_y_au. This function succeeds if the user receives
    /// at least min_lp_au LP tokens, the pool contains at least the provided
    /// quantity of X and Y tokens after the user adds, and the pool has issued
    /// at most the quantity of LP token after the user add. This allows the user
    /// to enforce slippage tolerance.
    ///
    /// For example, say the pool contains 99 LP tokens, 990 X, and 9900 Y. The
    /// user would like to LP up to (10 X, 100 Y). Based on the user's current
    /// understanding of the AMM state, they expect to receive 1 LP token out of
    /// 100 total tokens, representing a stake in 1000 X and 10000 Y. They can
    /// specify:
    ///
    ///  max_x_au = 10
    ///  max_y_au = 100
    ///  min_lp_au = 1
    ///  max_pool_lp_au = 100
    ///  min_pool_x_au = 1000
    ///  min_pool_y_au = 10000
    ///
    /// If the pool state is consistent with the user's understanding, the LP
    /// will succeed.
    ///
    /// To improve fill rate, the user may wish to relax some of the constraints.
    /// For example, if the user is willing to accept some slippage between their
    /// understanding of the pool state and the executed quantity, they can specify:
    ///
    ///  max_x_au = 10
    ///  max_y_au = 100
    ///  min_lp_au = 1
    ///  max_pool_lp_au = 100
    ///  min_pool_x_au = 999
    ///  min_pool_y_au = 9999
    ///
    /// With the above parameters, they will accept any situation in which their
    /// stake is at least 1%, and the X and Y quantities have dropped by at most
    /// 10 bps relative to their off-chain understanding.
    ///
    /// Note that the user may specify zero for the limit quantities to disable
    /// any limit check.
    public entry fun add_approximate_liquidity<X, Y>(
        sender: &signer,
        max_x_au: u64,
        max_y_au: u64,
        min_lp_au: u64,
        max_pool_lp_au: u128,
        min_pool_x_au: u64,
        min_pool_y_au: u64,
    ) acquires Pool {
        let user_x = coin::withdraw<X>(sender, max_x_au);
        let user_y = coin::withdraw<Y>(sender, max_y_au);
        let lp = coin_add_approximate_liquidity(
            &mut user_x,
            &mut user_y,
            max_x_au,
            max_y_au,
            min_lp_au,
            max_pool_lp_au,
            min_pool_x_au,
            min_pool_y_au,
        );
        let sender_address = signer::address_of(sender);
        if (!coin::is_account_registered<LP<X, Y>>(sender_address)) {
            coin::register<LP<X, Y>>(sender);
        };
        coin::deposit(sender_address, lp);
        coin::deposit(sender_address, user_x);
        coin::deposit(sender_address, user_y);
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

    /// Removes all liquidity from the pool as the global authority if the pool
    /// is already drained of all liquidity besides the minimum LP buffer. Note
    /// that the minimum LP buffer does not correspond to a real position since
    /// it was effectively burned to add initial liquidity to the pool.
    public entry fun reset_pool<X, Y>(sender: &signer) acquires Pool {
        assert!(exists<Pool<X, Y>>(@aux), EPOOL_NOT_FOUND);

        let pool = borrow_global_mut<Pool<X, Y>>(@aux);
        assert!(!pool.frozen, EPOOL_FROZEN);

        let pool_lp_au = option::get_with_default(&coin::supply<LP<X, Y>>(), 0);

        assert!(
            pool_lp_au == (MIN_LIQUIDITY as u128),
            EPOOL_NOT_EMPTY,
        );

        let amm_signer = &authority::get_signer(sender);

        remove_liquidity<X, Y>(amm_signer, MIN_LIQUIDITY);
    }

    /********************/
    /* PUBLIC FUNCTIONS */
    /********************/

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
                pool.fee_bps
            )
        } else if (exists<Pool<CoinOut, CoinIn>>(@aux)) {
            let pool = borrow_global<Pool<CoinOut, CoinIn>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            get_amount_out(au_in, y_reserve, x_reserve, pool.fee_bps)
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
            get_amount_in(au_out, x_reserve, y_reserve, pool.fee_bps)
        } else if (exists<Pool<CoinOut, CoinIn>>(@aux)) {
            let pool = borrow_global<Pool<CoinOut, CoinIn>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            get_amount_in(au_out, y_reserve, x_reserve, pool.fee_bps)
        } else {
            abort(EPOOL_NOT_FOUND)
        }
    }

    /// Adds exactly x_au, y_au to the pool. The added liquidity must be in the
    /// exact ratio of the pool. No rounding is performed. Fails if this
    /// condition is violated.
    public fun coin_add_exact_liquidity<X, Y>(
        user_x: coin::Coin<X>,
        user_y: coin::Coin<Y>,
    ): coin::Coin<LP<X, Y>> acquires Pool {
        assert!(exists<Pool<X, Y>>(@aux), EPOOL_NOT_FOUND);
        let pool = borrow_global_mut<Pool<X, Y>>(@aux);
        assert!(!pool.frozen, EPOOL_FROZEN);

        let x_reserve = coin::value(&pool.x_reserve);
        let y_reserve = coin::value(&pool.y_reserve);
        let pool_lp_au = option::get_with_default(&coin::supply<LP<X, Y>>(), 0);

        let is_new_pool = x_reserve == 0 || y_reserve == 0;

        let lp_tokens = calculate_lp_token_exact(
            x_reserve,
            y_reserve,
            pool_lp_au,
            coin::value(&user_x),
            coin::value(&user_y),
        );

        transfer_tokens_and_mint_after_adding_liquidity(
            pool, is_new_pool, user_x, user_y, lp_tokens
        )
    }

    /// Add liquidity up to x_au and y_au. The LP tokens received must be at
    /// most max_slippage_bps lower than LP x (x_debited / x_reserve) or
    /// LP x (y_debited / y_reserve).
    public fun coin_add_liquidity<X, Y>(
        user_x: &mut coin::Coin<X>,
        user_y: &mut coin::Coin<Y>,
        max_slippage_bps: u64,
    ): coin::Coin<LP<X, Y>> acquires Pool {
        let pool = borrow_global_mut<Pool<X, Y>>(@aux);
        assert!(!pool.frozen, EPOOL_FROZEN);
        let x_reserve = coin::value(&pool.x_reserve);
        let y_reserve = coin::value(&pool.y_reserve);
        let pool_lp_au = option::get_with_default(
            &coin::supply<LP<X, Y>>(),
            0
        );
        let x_au = coin::value(user_x);
        let y_au = coin::value(user_y);
        let (lp, dx, dy) = calculate_approximate_liquidity(
            x_reserve,
            y_reserve,
            pool_lp_au,
            x_au,
            y_au,
            0, // Allow any quantity of LP. Enforce slippage below.
        );

        // check slippage only if pool is not empty
        if (x_reserve != 0 || y_reserve != 0) {
            // Compute LP amount implied by only dx or dy.
            // lp = dx * pool_lp_au / x_reserve
            let lp_dx = to128(div128(mul256((dx as u128), pool_lp_au), (x_reserve as u128)));
            let lp_dy = to128(div128(mul256((dy as u128), pool_lp_au), (y_reserve as u128)));
            // lp >= (1 - slippage) * {lp_dx, lp_dy}
            assert!((lp as u128) * 10000 >= (lp_dx as u128) * ((10000 - max_slippage_bps) as u128), EVIOLATED_LIMIT_PRICE);
            assert!((lp as u128) * 10000 >= (lp_dy as u128) * ((10000 - max_slippage_bps) as u128), EVIOLATED_LIMIT_PRICE);
        };

        let user_dx = coin::extract(user_x, dx);
        let user_dy = coin::extract(user_y, dy);

        transfer_tokens_and_mint_after_adding_liquidity(
            pool, x_reserve == 0 || y_reserve == 0, user_dx, user_dy, lp
        )
    }


    /// Add up to max_x_au, max_y_au. This function succeeds if the user receives
    /// at least min_lp_au LP tokens, the pool contains at least the provided
    /// quantity of X and Y tokens after the user adds, and the pool has issued
    /// at most the quantity of LP token after the user add. This allows the user
    /// to enforce slippage tolerance.
    ///
    /// For example, say the pool contains 99 LP tokens, 990 X, and 9900 Y. The
    /// user would like to LP up to (10 X, 100 Y). Based on the user's current
    /// understanding of the AMM state, they expect to receive 1 LP token out of
    /// 100 total tokens, representing a stake in 1000 X and 10000 Y. They can
    /// specify:
    ///
    ///  max_x_au = 10
    ///  max_y_au = 100
    ///  min_lp_au = 1
    ///  max_pool_lp_au = 100
    ///  min_pool_x_au = 1000
    ///  min_pool_y_au = 10000
    ///
    /// If the pool state is consistent with the user's understanding, the LP
    /// will succeed.
    ///
    /// To improve fill rate, the user may wish to relax some of the constraints.
    /// For example, if the user is willing to accept some slippage between their
    /// understanding of the pool state and the executed quantity, they can specify:
    ///
    ///  max_x_au = 10
    ///  max_y_au = 100
    ///  min_lp_au = 1
    ///  max_pool_lp_au = 100
    ///  min_pool_x_au = 999
    ///  min_pool_y_au = 9999
    ///
    /// With the above parameters, they will accept any situation in which their
    /// stake is at least 1%, and the X and Y quantities have dropped by at most
    /// 10 bps relative to their off-chain understanding.
    ///
    /// Note that the user may specify zero for the limit quantities to disable
    /// any limit check.
    public fun coin_add_approximate_liquidity<X, Y>(
        user_x: &mut coin::Coin<X>,
        user_y: &mut coin::Coin<Y>,
        max_x_au: u64,
        max_y_au: u64,
        min_lp_au: u64,
        max_pool_lp_au: u128,
        min_pool_x_au: u64,
        min_pool_y_au: u64,
    ): coin::Coin<LP<X, Y>> acquires Pool {
        assert!(exists<Pool<X, Y>>(@aux), EPOOL_NOT_FOUND);
        let pool = borrow_global_mut<Pool<X, Y>>(@aux);
        assert!(!pool.frozen, EPOOL_FROZEN);

        let x_reserve = coin::value(&pool.x_reserve);
        let y_reserve = coin::value(&pool.y_reserve);
        let pool_lp_au = option::get_with_default(&coin::supply<LP<X, Y>>(), 0);

        let is_new_pool = x_reserve == 0 || y_reserve == 0;
        let (lp, dx, dy) = calculate_approximate_liquidity(
            x_reserve,
            y_reserve,
            pool_lp_au,
            max_x_au,
            max_y_au,
            min_lp_au,
        );

        assert!(max_pool_lp_au == 0 || pool_lp_au + (lp as u128) <= max_pool_lp_au, EINSUFFICIENT_MIN_QUANTITY);
        assert!(x_reserve + dx >= min_pool_x_au, EINSUFFICIENT_MIN_QUANTITY);
        assert!(y_reserve + dy >= min_pool_y_au, EINSUFFICIENT_MIN_QUANTITY);

        let extract_dx = coin::extract<X>(user_x, dx);
        let extract_dy = coin::extract<Y>(user_y, dy);

        transfer_tokens_and_mint_after_adding_liquidity(
            pool,
            is_new_pool,
            extract_dx,
            extract_dy,
            lp
        )
    }

    /// Removes lp_au from the Amm in a way that satisfies
    /// the current pool ratio as closely as possible. Any rounding keeps
    /// remaining assets in the pool. Returns the (x, y) native
    /// quantities removed from the Amm.
    public fun coin_remove_liquidity<X, Y>(
        lp: coin::Coin<LP<X, Y>>,
    ): (coin::Coin<X>, coin::Coin<Y>) acquires Pool {
        assert!(exists<Pool<X, Y>>(@aux), EPOOL_NOT_FOUND);
        let pool = borrow_global_mut<Pool<X, Y>>(@aux);
        assert!(!pool.frozen, EPOOL_FROZEN);

        let x_reserve = coin::value(&pool.x_reserve);
        let y_reserve = coin::value(&pool.y_reserve);
        let lp_au = coin::value(&lp);
        let pool_lp_au = option::get_with_default(&coin::supply<LP<X, Y>>(), 0);

        let dx = ((lp_au as u128) * (x_reserve as u128)) / pool_lp_au;
        let dy = ((lp_au as u128) * (y_reserve as u128)) / pool_lp_au;

        assert!(dx != 0, EREMOVE_LIQUIDITY_UNDERFLOW);
        assert!(dy != 0, EREMOVE_LIQUIDITY_UNDERFLOW);

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
        (x, y)
    }

    public fun swap_exact_coin_for_coin<CoinIn, CoinOut>(
        sender_addr: address,
        coin_in: coin::Coin<CoinIn>,
        coin_out: coin::Coin<CoinOut>,
        au_in: u64,
        min_au_out: u64,
        use_limit_price: bool,
        max_out_per_in_au_numerator: u128,
        max_out_per_in_au_denominator: u128,
    ): (coin::Coin<CoinOut>, coin::Coin<CoinIn>) acquires Pool {
        swap_exact_coin_for_coin_mut(
            sender_addr,
            &mut coin_in,
            &mut coin_out,
            au_in,
            min_au_out,
            use_limit_price,
            max_out_per_in_au_numerator,
            max_out_per_in_au_denominator
        );
        (coin_out, coin_in)
    }
    public fun swap_coin_for_exact_coin<CoinIn, CoinOut>(
        sender_addr: address,
        coin_in: coin::Coin<CoinIn>,
        coin_out: coin::Coin<CoinOut>,
        max_au_in: u64,
        au_out: u64,
        use_limit_price: bool,
        max_in_per_out_au_numerator: u128,
        max_in_per_out_au_denominator: u128,
    ): (coin::Coin<CoinOut>, coin::Coin<CoinIn>) acquires Pool {
        swap_coin_for_exact_coin_mut(
            sender_addr,
            &mut coin_in,
            &mut coin_out,
            max_au_in,
            au_out,
            use_limit_price,
            max_in_per_out_au_numerator,
            max_in_per_out_au_denominator
        );
        (coin_out, coin_in)

    }


    /// Performs a swap and returns (atomic units CoinOut received, atomic units
    /// CoinIn spent). Debits from user_in and merges to user_out.
    ///
    /// See comments for swap_exact_coin_for_coin.
    public fun swap_exact_coin_for_coin_mut<CoinIn, CoinOut>(
        sender_addr: address,
        coin_in: &mut coin::Coin<CoinIn>,
        coin_out: &mut coin::Coin<CoinOut>,
        au_in: u64,
        min_au_out: u64,
        use_limit_price: bool,
        max_out_per_in_au_numerator: u128,
        max_out_per_in_au_denominator: u128,
    ): (u64, u64) acquires Pool {
        let now = timestamp::now_microseconds();

        let (au_out, au_in, reserve_out, reserve_in) = if (exists<Pool<CoinIn, CoinOut>>(@aux)) {
            let pool = borrow_global_mut<Pool<CoinIn, CoinOut>>(@aux);
            assert!(!pool.frozen, EPOOL_FROZEN);

            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);

            if (use_limit_price) {
                let max_amount_in = amount_in_limit(
                    max_out_per_in_au_numerator,
                    max_out_per_in_au_denominator,
                    x_reserve,
                    y_reserve,
                    pool.fee_bps
                );
                if (max_amount_in == 0) {
                    return (0, 0)
                };
                if (max_amount_in < au_in) {
                    au_in = max_amount_in
                };
            };

            // Update pool balances
            let au_out = get_amount_out(au_in, x_reserve, y_reserve, pool.fee_bps);
            assert!(au_out >= min_au_out, EINSUFFICIENT_MIN_QUANTITY);

            // transfer tokens
            let in = coin::extract<CoinIn>(coin_in, au_in);
            coin::merge<CoinIn>(&mut pool.x_reserve, in);
            let out = coin::extract<CoinOut>(&mut pool.y_reserve, au_out);
            coin::merge<CoinOut>(coin_out, out);

            let old_product = (x_reserve as u128) * (y_reserve as u128);
            let new_product = ((x_reserve + au_in) as u128) * ((y_reserve - au_out) as u128);
            assert!(new_product >= old_product, ECONSTANT_PRODUCT);

            event::emit_event<SwapEvent>(
                &mut pool.swap_events,
                SwapEvent {
                    sender_addr,
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
            pool.timestamp = now;
            (au_out, au_in, y_reserve - au_out, x_reserve + au_in)
        } else if (exists<Pool<CoinOut, CoinIn>>(@aux)) {
            let pool = borrow_global_mut<Pool<CoinOut, CoinIn>>(@aux);
            assert!(!pool.frozen, EPOOL_FROZEN);

            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);

            if (use_limit_price) {
                let max_amount_in = amount_in_limit(
                    max_out_per_in_au_numerator,
                    max_out_per_in_au_denominator,
                    y_reserve,
                    x_reserve,
                    pool.fee_bps
                );
                if (max_amount_in == 0) {
                    return (0, 0)
                };
                if (max_amount_in < au_in) {
                    au_in = max_amount_in
                };
            };

            // Update pool balances
            let au_out = get_amount_out(au_in, y_reserve, x_reserve, pool.fee_bps);
            assert!(au_out >= min_au_out, EINSUFFICIENT_MIN_QUANTITY);

            // transfer tokens
            let in = coin::extract<CoinIn>(coin_in, au_in);
            coin::merge<CoinIn>(&mut pool.y_reserve, in);
            let out = coin::extract<CoinOut>(&mut pool.x_reserve, au_out);
            coin::merge<CoinOut>(coin_out, out);

            let old_product = (x_reserve as u128) * (y_reserve as u128);
            let new_product = ((y_reserve + au_in) as u128) * ((x_reserve - au_out) as u128);
            assert!(new_product >= old_product, ECONSTANT_PRODUCT);

            event::emit_event<SwapEvent>(
                &mut pool.swap_events,
                SwapEvent {
                    sender_addr,
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
            pool.timestamp = now;
            (au_out, au_in, x_reserve - au_out, y_reserve + au_in)
        } else {
            abort(EPOOL_NOT_FOUND)
        };

        if (use_limit_price) {
            if (max_out_per_in_au_numerator / max_out_per_in_au_denominator > 0) {
                assert!((reserve_out / reserve_in as u128) >= max_out_per_in_au_numerator / max_out_per_in_au_denominator, EVIOLATED_LIMIT_PRICE);
            } else {
                assert!((reserve_in / reserve_out as u128) <= max_out_per_in_au_denominator / max_out_per_in_au_numerator, EVIOLATED_LIMIT_PRICE);
            };
        };

        (au_out, au_in)
    }

    /// Performs a swap and returns (atomic units CoinOut received, atomic units
    /// CoinIn spent). Debits from coin_in and credits to coin_out.
    ///
    /// See comments for swap_coin_for_exact_coin.
    public fun swap_coin_for_exact_coin_mut<CoinIn, CoinOut>(
        sender_addr: address,
        coin_in: &mut coin::Coin<CoinIn>,
        coin_out: &mut coin::Coin<CoinOut>,
        max_au_in: u64,
        au_out: u64,
        use_limit_price: bool,
        max_in_per_out_au_numerator: u128,
        max_in_per_out_au_denominator: u128,
    ): (u64, u64) acquires Pool {
        let now = timestamp::now_microseconds();

        let (au_out, au_in, reserve_out, reserve_in) = if (exists<Pool<CoinIn, CoinOut>>(@aux)) {
            let pool = borrow_global_mut<Pool<CoinIn, CoinOut>>(@aux);
            assert!(!pool.frozen, EPOOL_FROZEN);

            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);

            if (use_limit_price) {
                let limit_amount_in = amount_in_limit(
                    max_in_per_out_au_denominator,
                    max_in_per_out_au_numerator,
                    x_reserve,
                    y_reserve,
                    pool.fee_bps
                );
                if (limit_amount_in == 0) {
                    return (0, 0)
                };
                let limit_amount_out = get_amount_out(
                    limit_amount_in,
                    x_reserve,
                    y_reserve,
                    pool.fee_bps
                );
                if (limit_amount_out == 0) {
                    return (0, 0)
                };
                if (limit_amount_out < au_out) {
                    au_out = limit_amount_out
                };
            };
            let au_in = get_amount_in(au_out, x_reserve, y_reserve, pool.fee_bps);
            assert!(au_in <= max_au_in, EINSUFFICIENT_MAX_QUANTITY);

            let in = coin::extract<CoinIn>(coin_in, au_in);
            coin::merge<CoinIn>(&mut pool.x_reserve, in);
            let out = coin::extract<CoinOut>(&mut pool.y_reserve, au_out);
            coin::merge<CoinOut>(coin_out, out);

            let old_product = (x_reserve as u128) * (y_reserve as u128);
            let new_product = ((x_reserve + au_in) as u128) * ((y_reserve - au_out) as u128);
            assert!(new_product >= old_product, ECONSTANT_PRODUCT);

            event::emit_event<SwapEvent>(
                &mut pool.swap_events,
                SwapEvent {
                    sender_addr,
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
            pool.timestamp = now;
            (au_out, au_in, y_reserve - au_out, x_reserve + au_in)
        } else if (exists<Pool<CoinOut, CoinIn>>(@aux)) {
            let pool = borrow_global_mut<Pool<CoinOut, CoinIn>>(@aux);
            assert!(!pool.frozen, EPOOL_FROZEN);

            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);

            if (use_limit_price) {
                let limit_amount_in = amount_in_limit(
                    max_in_per_out_au_denominator,
                    max_in_per_out_au_numerator,
                    y_reserve,
                    x_reserve,
                    pool.fee_bps
                );
                if (limit_amount_in == 0) {
                    return (0, 0)
                };
                let limit_amount_out = get_amount_out(limit_amount_in, y_reserve, x_reserve, pool.fee_bps);
                if (limit_amount_out == 0) {
                    return (0, 0)
                };
                if (limit_amount_out < au_out) {
                    au_out = limit_amount_out
                };
            };

            let au_in = get_amount_in(au_out, y_reserve, x_reserve, pool.fee_bps);
            assert!(au_in <= max_au_in, EINSUFFICIENT_MAX_QUANTITY);

            let in = coin::extract<CoinIn>(coin_in, au_in);
            coin::merge<CoinIn>(&mut pool.y_reserve, in);
            let out = coin::extract<CoinOut>(&mut pool.x_reserve, au_out);
            coin::merge<CoinOut>(coin_out, out);

            let old_product = (x_reserve as u128) * (y_reserve as u128);
            let new_product = ((y_reserve + au_in) as u128) * ((x_reserve - au_out) as u128);
            assert!(new_product >= old_product, ECONSTANT_PRODUCT);

            event::emit_event<SwapEvent>(
                &mut pool.swap_events,
                SwapEvent {
                    sender_addr,
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
            pool.timestamp = now;
            (au_out, au_in, x_reserve - au_out, y_reserve + au_in)
        } else {
            abort(EPOOL_NOT_FOUND)
        };

        if (use_limit_price) {
            if ( max_in_per_out_au_numerator / max_in_per_out_au_denominator > 0) {
                assert!((reserve_in / reserve_out as u128) <=  max_in_per_out_au_numerator / max_in_per_out_au_denominator, EVIOLATED_LIMIT_PRICE);
            } else {
                assert!((reserve_out / reserve_in as u128) >= max_in_per_out_au_denominator /  max_in_per_out_au_numerator, EVIOLATED_LIMIT_PRICE);
            };
        };
        (au_out, au_in)
    }


    /// Repays a flash swap. This is the only way to destroy the FlashSwap
    /// object.
    public fun coin_repay<InCoinType, OutCoinType>(
        sender: &signer,
        user_in: &mut coin::Coin<InCoinType>,
        flash_swap: FlashSwap<InCoinType, OutCoinType>,
    ) acquires Pool {
        let FlashSwap { in_au, out_au } = flash_swap;
        // figure out which pool it was and emit a swap event
        // (not very ergonomic, but easier than passing swap_events around with the loan)
        let now = timestamp::now_microseconds();
        if (exists<Pool<InCoinType, OutCoinType>>(@aux)) {
            let pool = borrow_global_mut<Pool<InCoinType, OutCoinType>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            pool.frozen = false;
            let in = coin::extract<InCoinType>(user_in, in_au);
            coin::merge<InCoinType>(&mut pool.x_reserve, in);
            event::emit_event<SwapEvent>(
                &mut pool.swap_events,
                SwapEvent {
                    sender_addr: signer::address_of(sender),
                    timestamp: now,
                    in_coin_type: type_info::type_name<InCoinType>(),
                    out_coin_type: type_info::type_name<OutCoinType>(),
                    in_au,
                    out_au,
                    fee_bps: pool.fee_bps,
                    in_reserve: x_reserve,  // initial reserves
                    out_reserve: y_reserve + out_au
                }
            );
            pool.timestamp = now;
        } else if (exists<Pool<OutCoinType, InCoinType>>(@aux)) {
            let pool = borrow_global_mut<Pool<OutCoinType, InCoinType>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            pool.frozen = false;
            let in = coin::extract<InCoinType>(user_in, in_au);
            coin::merge<InCoinType>(&mut pool.y_reserve, in);
            event::emit_event<SwapEvent>(
                &mut pool.swap_events,
                SwapEvent {
                    sender_addr: signer::address_of(sender),
                    timestamp: now,
                    in_coin_type: type_info::type_name<InCoinType>(),
                    out_coin_type: type_info::type_name<OutCoinType>(),
                    in_au,
                    out_au,
                    fee_bps: pool.fee_bps,
                    in_reserve: y_reserve,  // initial reserves
                    out_reserve: x_reserve + out_au
                }
            );
            pool.timestamp = now;
        };
    }

    /// Repays a flash swap. This is the only way to destroy the FlashSwap
    /// object.
    public fun repay<InCoinType, OutCoinType>(
        sender: &signer,
        flash_swap: FlashSwap<InCoinType, OutCoinType>,
    ) acquires Pool {
        let in = coin::withdraw<InCoinType>(sender, flash_swap.in_au);
        coin_repay(
            sender,
            &mut in,
            flash_swap,
        );
        coin::destroy_zero<InCoinType>(in);
    }

    /// Performs a swap of au_in CoinIn for at least min_au_out of CoinOut. The
    /// user does not have to own au_in CoinIn at the time of the flash swap.
    /// Returns a FlashSwap object that must be destroyed via the above repay
    /// function, which deducts the balance of CoinIn.
    public fun coin_flash_swap<CoinIn, CoinOut>(
        user_out: &mut coin::Coin<CoinOut>,
        au_in: u64,
        min_au_out: u64,
    ): FlashSwap<CoinIn, CoinOut> acquires Pool {
        let (au_in, au_out, out_coin) = if (exists<Pool<CoinIn, CoinOut>>(@aux)) {
            let pool = borrow_global_mut<Pool<CoinIn, CoinOut>>(@aux);
            assert!(!pool.frozen, EPOOL_FROZEN);
            pool.frozen = true;
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);

            let au_out = get_amount_out(au_in, x_reserve, y_reserve, pool.fee_bps);
            assert!(au_out >= min_au_out, EINSUFFICIENT_MIN_QUANTITY);
            let old_product = (x_reserve as u128) * (y_reserve as u128);
            let new_product = ((x_reserve + au_in) as u128) * ((y_reserve - au_out) as u128);
            assert!(new_product >= old_product, ECONSTANT_PRODUCT);
            (au_in, au_out, &mut pool.y_reserve)
        } else if(exists<Pool<CoinOut, CoinIn>>(@aux)) {
            let pool = borrow_global_mut<Pool<CoinOut, CoinIn>>(@aux);
            assert!(!pool.frozen, EPOOL_FROZEN);
            pool.frozen = true;
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);

            let au_out = get_amount_out(au_in, y_reserve, x_reserve, pool.fee_bps);
            assert!(au_out >= min_au_out, EINSUFFICIENT_MIN_QUANTITY);
            let old_product = (x_reserve as u128) * (y_reserve as u128);
            let new_product = ((x_reserve - au_out) as u128) * ((y_reserve + au_in) as u128);
            assert!(new_product >= old_product, ECONSTANT_PRODUCT);
            (au_in, au_out, &mut pool.x_reserve)
        } else {
            abort(EPOOL_NOT_FOUND)
        };
        let out = coin::extract<CoinOut>(out_coin, au_out);
        coin::merge<CoinOut>(user_out, out);
        FlashSwap<CoinIn, CoinOut> { in_au: au_in, out_au: au_out }
    }

    /// Performs a swap of au_in CoinIn for at least min_au_out of CoinOut. The
    /// user does not have to own au_in CoinIn at the time of the flash swap.
    /// Returns a FlashSwap object that must be destroyed via the above repay
    /// function, which deducts the balance of CoinIn.
    public fun flash_swap<CoinIn, CoinOut>(
        sender: &signer,
        au_in: u64,
        min_au_out: u64,
    ): FlashSwap<CoinIn, CoinOut> acquires Pool {
        let out = coin::zero();
        let swap = coin_flash_swap<CoinIn, CoinOut>(
            &mut out,
            au_in,
            min_au_out,
        );
        coin::deposit<CoinOut>(signer::address_of(sender), out);
        swap
    }

    /*********************/
    /* PRIVATE FUNCTIONS */
    /*********************/

    fun min_u64(l: u64, r: u64): u64 {
        if (l>r) {
            r
        } else {
            l
        }
    }

    /// Returns the canonical name of the LP token for the X-Y pool. We're
    /// limited to 32 bytes, so take the first 14 bytes of each coin's name.
    fun lp_name<X, Y>(): string::String {
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
    fun lp_symbol<X, Y>(): string::String {
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
    fun calculate_lp_token_exact(
        x_reserve: u64,
        y_reserve: u64,
        lp_reserve: u128,
        x_au: u64,
        y_au: u64,
    ): u64 {
        assert!(x_au != 0, EINVALID_AMM_RATIO);
        assert!(y_au != 0, EINVALID_AMM_RATIO);

        // When the Amm is empty, any amount is valid. Otherwise, enforce exact ratios.
        let lp_tokens: u128;
        if (x_reserve != 0 && y_reserve != 0) {
            // amm.x_au / amm.y_au == x_au / y_au => amm.x_au * y_au == amm.y_au * x_au
            assert!(
                (x_reserve as u128) * (y_au as u128) == (x_au as u128) * (y_reserve as u128),
                EINVALID_AMM_RATIO
            );
            lp_tokens = to128(div128(mul256((x_au as u128), lp_reserve), (x_reserve as u128)));
        } else {
            lp_tokens = integer_square_root(mul256((x_au as u128), (y_au as u128)));
        };

        assert!(lp_tokens != 0, EADD_LIQUIDITY_UNDERFLOW);

        (lp_tokens as u64)
    }

    /// add_approximate_liquidity add_liquiditys up to the given quantities of
    /// x_au and y_au. The resulting amount added may not conform to the exact
    /// ratio of the Amm. The function will either fail or provide the user with
    /// at least the specified quantity of LP token. Returns (LP received, x
    /// added, y added) in native units. Any rounding that occurs in the
    /// approximation benefits the pool.
    fun calculate_approximate_liquidity(
        x_reserve: u64,
        y_reserve: u64,
        lp_reserve: u128,
        max_x_au: u64,
        max_y_au: u64,
        minimum_lp_au: u64
    ): (u64, u64, u64) {
        assert!(max_x_au != 0, EINVALID_AMM_RATIO);
        assert!(max_y_au != 0, EINVALID_AMM_RATIO);

        let max_x_amm_y = (max_x_au as u128) * (y_reserve as u128);
        let max_y_amm_x = (max_y_au as u128) * (x_reserve as u128);

        let (lp, x, y) = if (max_x_amm_y == max_y_amm_x) {
            // exact match the ratio
            (calculate_lp_token_exact(x_reserve, y_reserve, lp_reserve, max_x_au, max_y_au), max_x_au, max_y_au)
        } else if (max_x_amm_y > max_y_amm_x) {
            // y is most binding, so compute quantity x as a function of available y.
            let x_required = max_y_amm_x / (y_reserve as u128);
            let x_required_remainder = max_y_amm_x % (y_reserve as u128);

            if (x_required_remainder != 0) {
                // Rounding up the least binding amount violates the budget.
                assert!((x_required as u64) < max_x_au, EINVALID_AMM_RATIO);
                x_required = x_required + 1;
            };

            let lp_x = to128(div128(mul256(x_required, lp_reserve), (x_reserve as u128)));
            let lp_y = to128(div128(mul256((max_y_au as u128), lp_reserve), (y_reserve as u128)));

            (if (lp_x > lp_y) (lp_y as u64) else (lp_x as u64), (x_required as u64), max_y_au)
        } else {
            // x is most binding, so compute quantity y as a function of available x.
            let y_required = max_x_amm_y / (x_reserve as u128);
            let y_required_remainder = max_x_amm_y % (x_reserve as u128);

            if (y_required_remainder != 0) {
                // Rounding up the least binding amount violates the budget.
                assert!((y_required as u64) < max_y_au, EINVALID_AMM_RATIO);
                y_required = y_required + 1;
            };

            let lp_x = to128(div128(mul256((max_x_au as u128), lp_reserve), (x_reserve as u128)));
            let lp_y = to128(div128(mul256(y_required, lp_reserve), (y_reserve as u128)));

            (if (lp_x > lp_y) (lp_y as u64) else (lp_x as u64), max_x_au, (y_required as u64))
        };

        assert!(lp >= minimum_lp_au, EINSUFFICIENT_MIN_QUANTITY);
        assert!(lp > 0, EINSUFFICIENT_MIN_QUANTITY);

        (lp, x, y)
    }

    fun get_amount_out(
        amount_in: u64,
        reserve_in: u64,
        reserve_out: u64,
        fee_bps: u64
    ): u64 {
        // Swapping x -> y
        //
        // dx_f = dx(1-fee)
        //
        // (x + dx_f)*(y - dy) = x*y
        //
        // dy = y * dx_f / (x + dx_f)
        assert!(amount_in > 0, EINSUFFICIENT_INPUT_AMOUNT);
        assert!(reserve_in > 0 && reserve_out > 0, EINSUFFICIENT_LIQUIDITY);
        let amount_in_with_fee = (amount_in as u128) * ((10000 - fee_bps) as u128);
        let numerator = to128(mul256(amount_in_with_fee, (reserve_out as u128)));
        let denominator = ((reserve_in as u128) * 10000) + amount_in_with_fee;
        ((numerator / denominator) as u64)
    }

    fun get_amount_in(
        amount_out: u64,
        reserve_in: u64,
        reserve_out: u64,
        fee_bps: u64
    ): u64 {
        // Swapping x -> y
        //
        // dx_f = dx(1-fee)
        //
        // (x + dx_f)*(y - dy) = x*y
        // (x + dx_f) = x*y / (y - dy)
        // dx_f = x * y / (y - dy) - x(y - dy)/(y- dy)
        // dx_f = (xy - xy + x dy)/(y - dy)
        // dx_f = (x * dy) / (y - dy)
        // dx = x * dy / ((y - dy)*(1-f))
        assert!(amount_out > 0, EINSUFFICIENT_OUTPUT_AMOUNT);
        assert!(reserve_in > 0 && reserve_out > 0, EINSUFFICIENT_LIQUIDITY);
        let numerator = (reserve_in as u128) * (amount_out as u128) * 10000;
        let denominator = ((reserve_out - amount_out) as u128) * ((10000 - fee_bps) as u128);
        ((numerator + denominator - 1) / denominator as u64)
    }

    // Returns the amount of input coin (coin added to pool) that would achieve
    // the provided limit price of OutputCoin/InputCoin
    fun amount_in_limit(
        limit_out_per_in_num: u128,
        limit_out_per_in_denom: u128,
        reserve_in: u64,
        reserve_out: u64,
        _fee_bps: u64
    ): u64 {
        // Approximation (ignores fees)
        //
        // x in -> y out
        // p = limit price of input coin (y/x)
        // q = amount x added to pool to achieve limit price (p)
        // f = (10000 + fee_bps) / 10000
        //
        // p = y / x
        //   = x*y / x^2
        //   = k / x^2
        //   = k / (x + q)^2
        //
        // q = sqrt(k / p) - x

        let inside_root = div128(
            mul256(
                (reserve_in as u128) * (reserve_out as u128),
                limit_out_per_in_denom
            ),
            limit_out_per_in_num
        );
        let left = integer_square_root(inside_root);
        if (left < (reserve_in as u128)) {
            0
        } else {
            ((left - (reserve_in as u128)) as u64)
        }
    }

    /// integer_square_root returns the floor of the square root of the input.
    fun integer_square_root(s: Uint256): u128 {
        // let x0 = s / 2;
        let x0 = div128(s,2);
        if (!is_zero(&x0)) {
            // let x1 = (x0 + s/x0) / 2;
            let x1 = div128(add(x0, div(s,x0)), 2);
            while (lt(x1,x0)) {
                x0 = x1;
                // x1 = (x0 + s/x0) / 2;
                x1 = div128(add(x0, div(s,x0)), 2);
            };
            s = x0;
        };
        to128(s)
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

    #[test_only]
    use aptos_framework::managed_coin;

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

            x_reserve,
            y_reserve,
            lp_mint,
            lp_burn,
        } = pool;
        event::destroy_handle<SwapEvent>(swap_events);
        event::destroy_handle<AddLiquidityEvent>(add_liquidity_events);
        event::destroy_handle<RemoveLiquidityEvent>(remove_liquidity_events);

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
        create_pool<AuxCoin, AuxTestCoin>(sender, 0);
        assert!(exists<Pool<AuxCoin, AuxTestCoin>>(
            resource_account_addr), ETEST_FAILED);
        // reverse pair should not exist
        assert!(!exists<Pool<AuxTestCoin, AuxCoin>>(
            resource_account_addr), ETEST_FAILED);
        // other pairs should not exist
        assert!(!exists<Pool<AuxTestCoin, AuxTestCoin>>(
            resource_account_addr), ETEST_FAILED);
        assert!(!exists<Pool<AuxCoin, AuxCoin>>(
            resource_account_addr), ETEST_FAILED);
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
    fun setup_pool_for_test(sender: &signer, fee_bps: u64, sender_init_x: u64, sender_init_y: u64) {
        one_time_setup(sender, sender_init_x, sender_init_y);
        create_pool<AuxCoin, AuxTestCoin>(sender, fee_bps);
    }

    #[test_only]
    use aux::fake_coin::{init_module_for_testing, register_and_mint, BTC, FakeCoin, USDC};

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    public fun test_add_initial_liquidity_exact(sender: &signer, aptos_framework: &signer) acquires Pool {
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

        create_pool<AuxCoin, FakeCoin<BTC>>(sender, 0);

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
        add_exact_liquidity<AuxCoin, FakeCoin<BTC>>(sender, 200000, 200000000);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    public fun test_add_initial_liquidity_approximate(sender: &signer, aptos_framework: &signer) acquires Pool {
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

        create_pool<AuxCoin, FakeCoin<BTC>>(sender, 10);

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
        add_liquidity<AuxCoin, FakeCoin<BTC>>(sender, 200000, 200000000, 0);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    public fun test_add_exact_liquidity(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let sender_addr = signer::address_of(sender);

        setup_pool_for_test(sender, 0, 10000, 10000);

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
        add_exact_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 4000);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 1000, ETEST_FAILED);
            assert!(y_reserve == 4000, ETEST_FAILED);
            assert!(pool_lp_au == 2000, ETEST_FAILED);
        };
        assert!(coin::balance<AuxCoin>(sender_addr) == 9000, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 6000, ETEST_FAILED);
        assert!(coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == (2000 - MIN_LIQUIDITY as u64),
                ETEST_FAILED);

        // adding same coin amounts doubles liquidity
        add_exact_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 4000);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 2000, ETEST_FAILED);
            assert!(y_reserve == 8000, ETEST_FAILED);
            assert!(pool_lp_au == 2000 * 2, ETEST_FAILED);
        };
        assert!(coin::balance<AuxCoin>(sender_addr) == 8000, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 2000, ETEST_FAILED);
        assert!(coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == (2000 * 2 - MIN_LIQUIDITY as u64),
                coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr));
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1, liquidity_provider = @0x12345)]
    fun test_reset_pool(sender: &signer, aptos_framework: &signer, liquidity_provider: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);

        setup_pool_for_test(sender, 0, 10000, 10000);

        let lp_addr = signer::address_of(liquidity_provider);
        account::create_account_for_test(lp_addr);
        util::maybe_register_coin<AuxCoin>(liquidity_provider);
        util::maybe_register_coin<AuxTestCoin>(liquidity_provider);
        assert!(coin::is_account_registered<AuxCoin>(lp_addr), ETEST_FAILED);
        assert!(coin::is_account_registered<AuxTestCoin>(lp_addr), ETEST_FAILED);

        managed_coin::mint<AuxCoin>(&authority::get_signer(sender), lp_addr, 10000);
        managed_coin::mint<AuxTestCoin>(&authority::get_signer(sender), lp_addr, 10000);

        add_exact_liquidity<AuxCoin, AuxTestCoin>(liquidity_provider, 1000, 4000);

        assert!(
            coin::balance<LP<AuxCoin, AuxTestCoin>>(lp_addr) == 1000,
            ETEST_FAILED
        );

        assert!(
            coin::balance<LP<AuxCoin, AuxTestCoin>>(@aux) == 1000,
            ETEST_FAILED
        );

        remove_liquidity<AuxCoin, AuxTestCoin>(liquidity_provider, 1000);

        reset_pool<AuxCoin, AuxTestCoin>(sender);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let sender_addr = signer::address_of(sender);

        setup_pool_for_test(sender, 0, 10000, 10000);

        add_exact_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 4000);

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
        assert!(au_out == 7, ETEST_FAILED);
        swap_exact_coin_for_coin_with_signer<AuxCoin, AuxTestCoin>(sender, 2, 7);
        assert!(coin::balance<AuxCoin>(sender_addr) == 8998, coin::balance<AuxCoin>(sender_addr));
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 6007, ETEST_FAILED);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            assert!(x_reserve == 1002, ETEST_FAILED);
            assert!(y_reserve == 3993, ETEST_FAILED);
        };

        // test swap in the other direction: swap Y for X
        // We get less X out for the same amount of Y, due to rounding errors working in favor of the pool
        let au_out = au_out<AuxTestCoin, AuxCoin>(7);
        assert!(au_out == 1, ETEST_FAILED);
        swap_exact_coin_for_coin_with_signer<AuxTestCoin, AuxCoin>(sender, 7, 1);
        assert!(coin::balance<AuxCoin>(sender_addr) == 8999, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 6000, ETEST_FAILED);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            assert!(x_reserve == 1001, ETEST_FAILED);
            assert!(y_reserve == 4000, ETEST_FAILED);
        };
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_update_fee(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let sender_addr = signer::address_of(sender);

        setup_pool_for_test(sender, 0, 100000000, 100000000);

        add_exact_liquidity<AuxCoin, AuxTestCoin>(sender, 10000000, 40000000);

        // swap X for Y
        assert!(coin::balance<AuxCoin>(sender_addr) == 90000000, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 60000000, ETEST_FAILED);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            assert!(x_reserve == 10000000, ETEST_FAILED);
            assert!(y_reserve == 40000000, ETEST_FAILED);
        };
        let au_out = au_out<AuxCoin, AuxTestCoin>(2);
        assert!(au_out == 7, ETEST_FAILED);
        swap_exact_coin_for_coin_with_signer<AuxCoin, AuxTestCoin>(sender, 20000, 70000);
        assert!(coin::balance<AuxCoin>(sender_addr) == 89980000, coin::balance<AuxCoin>(sender_addr));
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 60079840, coin::balance<AuxTestCoin>(sender_addr));
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            assert!(x_reserve == 10020000, x_reserve);
            assert!(y_reserve == 39920160, y_reserve);
        };

        // test swap in the other direction: swap Y for X
        // We get less X out for the same amount of Y, due to rounding errors working in favor of the pool
        let au_out = au_out<AuxTestCoin, AuxCoin>(7);
        assert!(au_out == 1, ETEST_FAILED);
        update_fee<AuxCoin, AuxTestCoin>(sender, 33);
        swap_exact_coin_for_coin_with_signer<AuxTestCoin, AuxCoin>(sender, 70000, 10000);
        assert!(coin::balance<AuxCoin>(sender_addr) == 89997481, coin::balance<AuxCoin>(sender_addr));
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 60009840, coin::balance<AuxTestCoin>(sender_addr));
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            assert!(x_reserve == 10002519, x_reserve);
            assert!(y_reserve == 39990160, y_reserve);
        };
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_remove_liquidity(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let sender_addr = signer::address_of(sender);
        setup_pool_for_test(sender, 0, 10000, 10000);

        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 0, ETEST_FAILED);
            assert!(y_reserve == 0, ETEST_FAILED);
            assert!(pool_lp_au == 0, ETEST_FAILED);
        };
        add_exact_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 4000);
        assert!(coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == 1000,
                ETEST_FAILED);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 1000, ETEST_FAILED);
            assert!(y_reserve == 4000, ETEST_FAILED);
            assert!(pool_lp_au == 2000, ETEST_FAILED);
        };
        assert!(coin::balance<AuxCoin>(sender_addr) == 9000, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 6000, ETEST_FAILED);
        // remove all liquidity
        remove_liquidity<AuxCoin, AuxTestCoin>(sender, 1000);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 500, ETEST_FAILED);
            assert!(y_reserve == 2000, ETEST_FAILED);
            assert!(pool_lp_au == 1000, ETEST_FAILED);
        };
        assert!(coin::balance<AuxCoin>(sender_addr) == 9500, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 8000, ETEST_FAILED);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_and_remove_liquidity(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let sender_addr = signer::address_of(sender);
        setup_pool_for_test(sender, 0, 10000, 10000);

        add_exact_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 4000);
        assert!(coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == 1000,
                ETEST_FAILED);

        // ratio 1, 10 => 2, 5
        swap_exact_coin_for_coin_with_signer<AuxCoin, AuxTestCoin>(sender, 1, 3);
        assert!(coin::balance<AuxCoin>(sender_addr) == 8999, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 6003, ETEST_FAILED);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 1001, ETEST_FAILED);
            assert!(y_reserve == 3997, ETEST_FAILED);
            assert!(pool_lp_au == 2000, ETEST_FAILED);
        };
        // remove ratio 1, 5
        remove_liquidity<AuxCoin, AuxTestCoin>(sender, 1000);
        assert!(coin::balance<AuxCoin>(sender_addr) == 9499, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 8001, coin::balance<AuxTestCoin>(sender_addr));
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 501, ETEST_FAILED);
            assert!(y_reserve == 1999, ETEST_FAILED);
            assert!(pool_lp_au == 1000, ETEST_FAILED);
        };
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_flash_swap(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let sender_addr = signer::address_of(sender);
        setup_pool_for_test(sender, 0, 10000, 10000);

        add_exact_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 4000);

        // ratio 1, 10 => 2, 5
        let flash_swap = flash_swap<AuxCoin, AuxTestCoin>(sender, 2, 7);
        assert!(coin::balance<AuxCoin>(sender_addr) == 9000, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 6007, coin::balance<AuxTestCoin>(sender_addr)/*ETEST_FAILED*/);
        repay(sender, flash_swap);
    }

    // Test error cases
    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    #[expected_failure(abort_code = EPOOL_ALREADY_EXISTS)]
    fun test_cannot_create_duplicate_pool(sender: &signer, aptos_framework: &signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let signer_addr = signer::address_of(sender);
        account::create_account_for_test(signer_addr);
        setup_module_for_test(sender);
        aux::aux_coin::initialize_aux_coin(sender);
        aux::aux_coin::initialize_aux_test_coin(sender);

        create_pool<AuxCoin, AuxTestCoin>(sender, 0);
        create_pool<AuxCoin, AuxTestCoin>(sender, 0);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    #[expected_failure(abort_code = EPOOL_ALREADY_EXISTS)]
    fun test_cannot_create_duplicate_reverse_pool(sender: &signer, aptos_framework: &signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let signer_addr = signer::address_of(sender);
        account::create_account_for_test(signer_addr);
        setup_module_for_test(sender);
        aux::aux_coin::initialize_aux_coin(sender);
        aux::aux_coin::initialize_aux_test_coin(sender);

        create_pool<AuxCoin, AuxTestCoin>(sender, 0);
        create_pool<AuxTestCoin, AuxCoin>(sender, 0);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    #[expected_failure(abort_code = EPOOL_NOT_FOUND)]
    fun test_pool_not_found(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        setup_pool_for_test(sender, 0, 10000, 10000);

        // wrong order
        add_exact_liquidity<AuxTestCoin, AuxCoin>(sender, 1, 10);
    }

    #[test(sender = @0x5e7c3, aux = @aux)]
    public fun test_lp_name_regression(sender: &signer/*, aux: &signer*/) {
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

        setup_pool_for_test(sender, 0, 10000, 10000);
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
        add_exact_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 4000);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 1000, ETEST_FAILED);
            assert!(y_reserve == 4000, ETEST_FAILED);
            assert!(pool_lp_au == 2000, ETEST_FAILED);
        };
        aux_bal = aux_bal - 1000;
        test_bal = test_bal - 4000;
        assert!(coin::balance<AuxCoin>(sender_addr) == aux_bal, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == test_bal, ETEST_FAILED);
        assert!(coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == (2000 - MIN_LIQUIDITY as u64),
                ETEST_FAILED);

        // Exact remove_liquidity.
        remove_liquidity<AuxCoin, AuxTestCoin>(sender, 50);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 975, 1);
            assert!(y_reserve == 3900, 1);
            assert!(pool_lp_au == 1950, (pool_lp_au as u64));
        };
        aux_bal = aux_bal + 25;
        test_bal = test_bal + 100;
        assert!(coin::balance<AuxCoin>(sender_addr) == aux_bal, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == test_bal, ETEST_FAILED);
        assert!(coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == (1950 - MIN_LIQUIDITY as u64),
                ETEST_FAILED);

        // Rounded remove_liquidity
        remove_liquidity<AuxCoin, AuxTestCoin>(sender, 17);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 967, 1);
            assert!(y_reserve == 3866, 1);
            assert!(pool_lp_au == 1933, 1);
        };
        aux_bal = aux_bal + 8;
        test_bal = test_bal + 34;
        assert!(coin::balance<AuxCoin>(sender_addr) == aux_bal, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == test_bal, ETEST_FAILED);
        assert!(coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == (1933 - MIN_LIQUIDITY as u64),
                ETEST_FAILED);

        // Total remove_liquidity
        remove_liquidity<AuxCoin, AuxTestCoin>(sender, 1933 - MIN_LIQUIDITY);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 501, x_reserve);
            assert!(y_reserve == 2000, y_reserve);
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
        limit_num: u128,
        limit_denom: u128
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
        create_pool<AuxCoin, AuxTestCoin>(sender, input.fee_bps);
        add_exact_liquidity<AuxCoin, AuxTestCoin>(sender, input.init_x, input.init_y);
        let lp_tokens = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
        let in = coin::withdraw<CoinIn>(sender, input.au_in);
        let out = coin::zero();

        let (actual_au_out, actual_au_in) = if (input.exact_in) {
            swap_exact_coin_for_coin_mut<CoinIn, CoinOut>(
                signer::address_of(sender),
                &mut in,
                &mut out,
                input.au_in,
                input.au_out,
                input.use_limit,
                input.limit_num,
                input.limit_denom
            )
        } else {
            swap_coin_for_exact_coin_mut<CoinIn, CoinOut>(
                signer::address_of(sender),
                &mut in,
                &mut out,
                input.au_in,
                input.au_out,
                input.use_limit,
                input.limit_num,
                input.limit_denom
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
            expected_au_out: 1818,
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
            expected_au_out: 1813,
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
            au_in: 1500,
            au_out: 1818,
            expected_au_in: 1000,
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
            au_in: 2000000,
            au_out: 100000000,
            expected_au_in: 2000000,
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
            au_in: 1500,
            au_out: 1813,
            expected_au_in: 1000,
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
    fun test_swap_exact_coin_for_coin_limit_binding_quantity_no_fee(sender: &signer, aptos_framework: &signer) acquires Pool {
        // X in Y out
        let input = SwapHelperInput {
            fee_bps: 0,
            exact_in: true,
            x_in_y_out: true,
            init_x: 10000,
            init_y: 10000,
            au_in: 1000,
            au_out: 0,
            use_limit: true,
            limit_num: 1,
            limit_denom: 2,
            expected_au_in: 1000,
            expected_au_out: 909
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);

        // Y in X out
        input.x_in_y_out = false;
        test_swap_helper<AuxTestCoin, AuxCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_exact_coin_for_coin_limit_binding_quantity_with_fee(sender: &signer, aptos_framework: &signer) acquires Pool {
        // X in Y out
        let input = SwapHelperInput {
            fee_bps: 30,
            exact_in: true,
            x_in_y_out: true,
            init_x: 10000,
            init_y: 10000,
            au_in: 1000,
            au_out: 0,
            use_limit: true,
            limit_num: 1,
            limit_denom: 2,
            expected_au_in: 1000,
            expected_au_out: 906
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);

        // Y in X out
        input.x_in_y_out = false;
        test_swap_helper<AuxTestCoin, AuxCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_exact_coin_for_coin_limit_binding_price_no_fee(sender: &signer, aptos_framework: &signer) acquires Pool {
        // X in Y out

        // initially: y / x == 4
        // limit so it doesn't fall below 3
        let input = SwapHelperInput {
            fee_bps: 0,
            exact_in: true,
            x_in_y_out: true,
            init_x: 10000,
            init_y: 40000,
            au_in: 10000,
            au_out: 0,
            use_limit: true,
            limit_num: 3,
            limit_denom: 1,
            expected_au_in: 1547,
            expected_au_out: 5358
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);

        // Y in X out
        input.x_in_y_out = false;
        input.init_x = 40000;
        input.init_y = 10000;
        test_swap_helper<AuxTestCoin, AuxCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_exact_coin_for_coin_limit_bad_price(sender: &signer, aptos_framework: &signer) acquires Pool {
        // X in Y out

        // initially: y / x == 4
        // limit so it doesn't fall below 3
        let input = SwapHelperInput {
            fee_bps: 0,
            exact_in: true,
            x_in_y_out: true,
            init_x: 10000,
            init_y: 40000,
            au_in: 10000,
            au_out: 0,
            use_limit: true,
            limit_num: 4,
            limit_denom: 1,
            expected_au_in: 0,
            expected_au_out: 0
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);

        // Y in X out
        input.x_in_y_out = false;
        input.init_x = 40000;
        input.init_y = 10000;
        test_swap_helper<AuxTestCoin, AuxCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_exact_coin_for_coin_limit_binding_price_no_fee_2(sender: &signer, aptos_framework: &signer) acquires Pool {

        // initially: y / x == 1
        // limit so it doesn't fall below 1/2
        let input = SwapHelperInput {
            fee_bps: 0,
            exact_in: true,
            x_in_y_out: true,
            init_x: 10000,
            init_y: 10000,
            au_in: 100000,
            au_out: 0,
            use_limit: true,
            limit_num: 1,
            limit_denom: 2,
            expected_au_in: 4142,
            expected_au_out: 2928
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);

        // Y in X out
        input.x_in_y_out = false;
        test_swap_helper<AuxTestCoin, AuxCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_exact_coin_for_coin_limit_binding_price_with_fee(sender: &signer, aptos_framework: &signer) acquires Pool {
        // initially: y / x == 4
        // limit so it doesn't fall below 3
        let input = SwapHelperInput {
            fee_bps: 30,
            exact_in: true,
            x_in_y_out: true,
            init_x: 10000,
            init_y: 40000,
            au_in: 10000,
            au_out: 0,
            use_limit: true,
            limit_num: 3,
            limit_denom: 1,
            expected_au_in: 1547,
            expected_au_out: 5345
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);

        // Y in X out
        input.x_in_y_out = false;
        input.init_x = 40000;
        input.init_y = 10000;
        test_swap_helper<AuxTestCoin, AuxCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_exact_coin_for_coin_limit_binding_price_with_fee_2(sender: &signer, aptos_framework: &signer) acquires Pool {

        // initially: y / x == 1
        // limit so it doesn't fall below 1/2
        let input = SwapHelperInput {
            fee_bps: 30,
            exact_in: true,
            x_in_y_out: true,
            init_x: 10000,
            init_y: 10000,
            au_in: 100000,
            au_out: 0,
            use_limit: true,
            limit_num: 1,
            limit_denom: 2,
            expected_au_in: 4142,
            expected_au_out: 2922
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);

        // Y in X out
        input.x_in_y_out = false;
        test_swap_helper<AuxTestCoin, AuxCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_coin_for_exact_coin_limit_binding_quantity_no_fee(sender: &signer, aptos_framework: &signer) acquires Pool {
        // X in Y out
        let input = SwapHelperInput {
            fee_bps: 0,
            exact_in: false,
            x_in_y_out: true,
            init_x: 10000,
            init_y: 10000,
            au_in: 1100,
            au_out: 909,
            use_limit: true,
            limit_num: 2,
            limit_denom: 1,
            expected_au_in: 1000,
            expected_au_out: 909,
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);

        // Y in X out
        input.x_in_y_out = false;
        test_swap_helper<AuxTestCoin, AuxCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_coin_for_exact_coin_limit_binding_quantity_with_fee(sender: &signer, aptos_framework: &signer) acquires Pool {
        // X in Y out
        let input = SwapHelperInput {
            fee_bps: 30,
            exact_in: false,
            x_in_y_out: true,
            init_x: 10000,
            init_y: 10000,
            au_in: 1100,
            au_out: 906,
            use_limit: true,
            limit_num: 2,
            limit_denom: 1,
            expected_au_in: 1000,
            expected_au_out: 906
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);

        // Y in X out
        input.x_in_y_out = false;
        test_swap_helper<AuxTestCoin, AuxCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }


    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_coin_for_exact_coin_limit_binding_price_no_fee(sender: &signer, aptos_framework: &signer) acquires Pool {
        // X in Y out

        // initially: y / x == 1/4
        // limit so it doesn't rise above 1/3
        let input = SwapHelperInput {
            fee_bps: 0,
            exact_in: false,
            x_in_y_out: true,
            init_x: 10000,
            init_y: 40000,
            au_in: 2000,
            au_out: 10000,
            use_limit: true,
            limit_num: 1,   // in/out numerator
            limit_denom: 3, // in/out denominator
            expected_au_in: 1547,
            expected_au_out: 5358
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);

        // Y in X out
        input.x_in_y_out = false;
        input.init_x = 40000;
        input.init_y = 10000;
        test_swap_helper<AuxTestCoin, AuxCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_coin_for_exact_coin_limit_bad_price(sender: &signer, aptos_framework: &signer) acquires Pool {
        // X in Y out

        // initially: y / x == 1/4
        // limit so it doesn't rise above 1/4 (expected output is (0, 0))
        let input = SwapHelperInput {
            fee_bps: 0,
            exact_in: false,
            x_in_y_out: true,
            init_x: 10000,
            init_y: 40000,
            au_in: 2000,
            au_out: 10000,
            use_limit: true,
            limit_num: 1,   // in/out numerator
            limit_denom: 4, // in/out denominator
            expected_au_in: 0,
            expected_au_out: 0
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);

        // Y in X out
        input.x_in_y_out = false;
        input.init_x = 40000;
        input.init_y = 10000;
        test_swap_helper<AuxTestCoin, AuxCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_coin_for_exact_coin_limit_binding_price_no_fee_2(sender: &signer, aptos_framework: &signer) acquires Pool {

        // initially: y / x == 1
        // limit so it doesn't rise above 2
        let input = SwapHelperInput {
            fee_bps: 0,
            exact_in: false,
            x_in_y_out: true,
            init_x: 10000,
            init_y: 10000,
            au_in: 5000,
            au_out: 5000,
            use_limit: true,
            limit_num: 2,
            limit_denom: 1,
            expected_au_in: 4141,
            expected_au_out: 2928
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);

        // Y in X out
        input.x_in_y_out = false;
        test_swap_helper<AuxTestCoin, AuxCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_coin_for_exact_coin_limit_binding_price_with_fee(sender: &signer, aptos_framework: &signer) acquires Pool {
        // X in Y out

        // initially: y / x == 1/4
        // limit so it doesn't rise above 1/3
        let input = SwapHelperInput {
            fee_bps: 30,
            exact_in: false,
            x_in_y_out: true,
            init_x: 10000,
            init_y: 40000,
            au_in: 2000,
            au_out: 10000,
            use_limit: true,
            limit_num: 1,
            limit_denom: 3,
            expected_au_in: 1547,
            expected_au_out: 5345
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);

        // Y in X out
        input.x_in_y_out = false;
        input.init_x = 40000;
        input.init_y = 10000;
        test_swap_helper<AuxTestCoin, AuxCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_coin_for_exact_coin_limit_binding_price_with_fee_2(sender: &signer, aptos_framework: &signer) acquires Pool {

        // initially: y / x == 1
        // limit so it doesn't rise above 2
        let input = SwapHelperInput {
            fee_bps: 30,
            exact_in: false,
            x_in_y_out: true,
            init_x: 10000,
            init_y: 10000,
            au_in: 5000,
            au_out: 5000,
            use_limit: true,
            limit_num: 2,
            limit_denom: 1,
            expected_au_in: 4141,
            expected_au_out: 2922
        };
        test_swap_helper<AuxCoin, AuxTestCoin, AuxCoin, AuxTestCoin>(sender, aptos_framework, &input);

        // Y in X out
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
            expected_au_out: 99,
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
    fun test_weird(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let sender_addr = signer::address_of(sender);

        setup_pool_for_test(sender, 0, 100000000000, 100000000000);

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
        add_exact_liquidity<AuxCoin, AuxTestCoin>(sender, 50000000, 20000000000);
        let init_aux = coin::balance<AuxCoin>(sender_addr);
        let init_test = coin::balance<AuxTestCoin>(sender_addr);
        add_approximate_liquidity<AuxCoin, AuxTestCoin>(sender, 1000000, 400000000, 0, 0, 0, 20500000000);
        assert!(coin::balance<AuxCoin>(sender_addr) == init_aux - 1000000, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == init_test - 400000000, ETEST_FAILED);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            assert!(x_reserve == 51000000, x_reserve);
        };
    }

    #[expected_failure]
    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_cannot_circumvent_fees(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);

        setup_pool_for_test(sender, 30, 2000000, 2000000);

        add_exact_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 1000);
        let i = 0;
        let y_received_1 = 0;
        let x_spent = 0;
        let in = coin::withdraw<AuxCoin>(sender, 150000);
        let out = coin::zero();
        while (i < 100) {
            let (y, _) = swap_exact_coin_for_coin_mut<AuxCoin, AuxTestCoin>(
                signer::address_of(sender),
                &mut in,
                &mut out,
                100,
                0,
                false,
                0,
                0
            );
            y_received_1 = y_received_1 + y;
            x_spent = x_spent + 100;
            i = i+1;
        };
        coin::deposit(signer::address_of(sender), in);
        coin::deposit(signer::address_of(sender), out);
        destroy_pool_for_test<AuxCoin, AuxTestCoin>();

        setup_pool_for_test(sender, 30, 2000000, 2000000);

        add_exact_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 4000);
        let in = coin::withdraw<AuxCoin>(sender, 150000);
        let out = coin::zero();
        let (y_received_2, _) = swap_exact_coin_for_coin_mut<AuxCoin, AuxTestCoin>(
            signer::address_of(sender),
            &mut in,
            &mut out,
            x_spent,
            0,
            false,
            0,
            0
        );
        coin::deposit(signer::address_of(sender), in);
        coin::deposit(signer::address_of(sender), out);

        assert!(y_received_1 <= y_received_2, 1);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    public fun test_add_liquidity_with_slippage_tolerance(
        sender: &signer,
        aptos_framework: &signer
    ) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let sender_addr = signer::address_of(sender);
        setup_pool_for_test(sender, 0, 10000, 10000);

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
        add_exact_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 4001);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 1000, ETEST_FAILED);
            assert!(y_reserve == 4001, ETEST_FAILED);
            assert!(pool_lp_au == 2000, (pool_lp_au as u64));
        };
        assert!(coin::balance<AuxCoin>(sender_addr) == 9000, ETEST_FAILED);
        assert!(coin::balance<AuxTestCoin>(sender_addr) == 5999, ETEST_FAILED);
        assert!(coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == 1000,
                ETEST_FAILED);

        // Pool has 1000 in sender plus minimum of 1000. Doubling should
        // approximately double the LP. Due to rounding, we will deposit (1000,
        // 4000) and receive 1999.
        //
        // This is favorable to the pool because the previous LPs now have stake
        // of (2000 / 3999) * (2000) > 1000 X and (2000 / 3999) * (8001) > 4001 Y.
        add_liquidity<AuxCoin, AuxTestCoin>(sender, 1000, 4000, 10);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 2000, x_reserve);
            assert!(y_reserve == 8001, y_reserve);
            assert!(pool_lp_au == 3999, (pool_lp_au as u64));
        };

        let sender_x = coin::balance<AuxCoin>(sender_addr);
        let sender_y = coin::balance<AuxTestCoin>(sender_addr);
        let sender_lp = coin::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr);
        assert!(sender_x == 8000, sender_x);
        assert!(sender_y == 1999, sender_y);
        assert!(sender_lp == 2999, sender_lp);
    }

    #[test]
    fun test_amount_in_limit_max_u128() {
                    // max_out_per_in_au_numerator,
                    // max_out_per_in_au_denominator,
                    // x_reserve,
                    // y_reserve,
                    // pool.fee_bps
        let max_u128 = 340282366920938463463374607431768211455u128;
        let in1 = amount_in_limit(1, 1, 70000, 100000, 30);
        let in2 = amount_in_limit(max_u128, max_u128, 70000, 100000, 30);
        assert!(in1 == in2, in1);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_add_liquidity_remove_liquidity_with_aux_account(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let sender_addr = signer::address_of(sender);

        setup_pool_for_test(sender, 0, 10000, 10000);
        vault::create_vault_for_test(sender);
        vault::create_aux_account(sender);
        vault::deposit<AuxCoin>(sender, sender_addr, 1000);
        vault::deposit<AuxTestCoin>(sender, sender_addr, 4000);
        let aux_bal = vault::balance<AuxCoin>(sender_addr);
        let test_bal = vault::balance<AuxTestCoin>(sender_addr);

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
        add_liquidity_with_aux_account<AuxCoin, AuxTestCoin>(sender, 1000, 4000, 0);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 1000, ETEST_FAILED);
            assert!(y_reserve == 4000, ETEST_FAILED);
            assert!(pool_lp_au == 2000, ETEST_FAILED);
        };
        aux_bal = aux_bal - 1000;
        test_bal = test_bal - 4000;
        assert!(vault::balance<AuxCoin>(sender_addr) == (aux_bal as u128), ETEST_FAILED);
        assert!(vault::balance<AuxTestCoin>(sender_addr) == (test_bal as u128), ETEST_FAILED);
        assert!(vault::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == (2000 - MIN_LIQUIDITY as u128),
                ETEST_FAILED);

        // Exact remove_liquidity.
        remove_liquidity_with_aux_account<AuxCoin, AuxTestCoin>(sender, 50);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 975, 1);
            assert!(y_reserve == 3900, 1);
            assert!(pool_lp_au == 1950, (pool_lp_au as u64));
        };
        aux_bal = aux_bal + 25;
        test_bal = test_bal + 100;
        assert!(vault::balance<AuxCoin>(sender_addr) == (aux_bal as u128), ETEST_FAILED);
        assert!(vault::balance<AuxTestCoin>(sender_addr) == (test_bal as u128), ETEST_FAILED);
        assert!(vault::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == (1950 - MIN_LIQUIDITY as u128),
                ETEST_FAILED);

        // Rounded remove_liquidity
        remove_liquidity_with_aux_account<AuxCoin, AuxTestCoin>(sender, 17);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 967, 1);
            assert!(y_reserve == 3866, 1);
            assert!(pool_lp_au == 1933, 1);
        };
        aux_bal = aux_bal + 8;
        test_bal = test_bal + 34;
        assert!(vault::balance<AuxCoin>(sender_addr) == (aux_bal as u128), ETEST_FAILED);
        assert!(vault::balance<AuxTestCoin>(sender_addr) == (test_bal as u128), ETEST_FAILED);
        assert!(vault::balance<LP<AuxCoin, AuxTestCoin>>(sender_addr) == (1933 - MIN_LIQUIDITY as u128),
                ETEST_FAILED);

        // Total remove_liquidity
        remove_liquidity_with_aux_account<AuxCoin, AuxTestCoin>(sender, 1933 - MIN_LIQUIDITY);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxTestCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxTestCoin>>(), 0);
            assert!(x_reserve == 501, x_reserve);
            assert!(y_reserve == 2000, y_reserve);
            assert!(pool_lp_au == (MIN_LIQUIDITY as u128), 1);
        };
    }

    #[expected_failure(abort_code = EINVALID_POOL)]
    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_cannot_create_pool_with_same_asset(sender: &signer, aptos_framework: &signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let signer_addr = signer::address_of(sender);
        account::create_account_for_test(signer_addr);
        setup_module_for_test(sender);
        let resource_account_addr = util::create_resource_account_addr(signer_addr, b"amm");
        assert!(resource_account_addr == @aux, ETEST_FAILED);

        aux::aux_coin::initialize_aux_coin(sender);
        create_pool<AuxCoin, AuxCoin>(sender, 0);

    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_can_withdraw_liquidity_same_coin_type_regression(sender: &signer, aptos_framework: &signer) acquires Pool {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let sender_addr = signer::address_of(sender);
        account::create_account_for_test(sender_addr);
        setup_module_for_test(sender);
        let resource_account_addr = util::create_resource_account_addr(sender_addr, b"amm");
        assert!(resource_account_addr == @aux, ETEST_FAILED);

        aux::aux_coin::initialize_aux_coin(sender);

        // Create pool with same coin avoiding create_pool checks
        let amm_signer = &authority::get_signer_self();
        let (lp_burn, lp_freeze, lp_mint) = coin::initialize<LP<AuxCoin, AuxCoin>>(
            amm_signer,
            lp_name<AuxCoin, AuxCoin>(),
            lp_symbol<AuxCoin, AuxCoin>(),
            LP_TOKEN_DECIMALS,
            true // monitor_supply
        );
        coin::destroy_freeze_cap(lp_freeze);

        if (!coin::is_account_registered<AuxCoin>(@aux)) {
            coin::register<AuxCoin>(amm_signer);
        };
        if (!coin::is_account_registered<AuxCoin>(@aux)) {
            coin::register<AuxCoin>(amm_signer);
        };
        if (!coin::is_account_registered<LP<AuxCoin, AuxCoin>>(@aux)) {
            coin::register<LP<AuxCoin,AuxCoin>>(amm_signer);
        };

        let pool = Pool<AuxCoin, AuxCoin> {
            frozen: false,
            timestamp: timestamp::now_microseconds(),
            fee_bps: 30,
            swap_events: account::new_event_handle<SwapEvent>(amm_signer),
            add_liquidity_events: account::new_event_handle<AddLiquidityEvent>(amm_signer),
            remove_liquidity_events: account::new_event_handle<RemoveLiquidityEvent>(amm_signer),
            x_reserve: coin::zero(),
            y_reserve: coin::zero(),
            lp_mint: lp_mint,
            lp_burn: lp_burn,
        };
        move_to(amm_signer, pool);

        // Mint aux coin
        util::maybe_register_coin<AuxCoin>(sender);
        assert!(coin::is_account_registered<AuxCoin>(sender_addr), ETEST_FAILED);

        managed_coin::mint<AuxCoin>(&authority::get_signer(sender), sender_addr, 1000000000000);

        // deposit liquidity
        let sender_addr = signer::address_of(sender);
        let aux_bal = coin::balance<AuxCoin>(sender_addr);

        {
            let pool = borrow_global<Pool<AuxCoin, AuxCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxCoin>>(), 0);
            assert!(x_reserve == 0, ETEST_FAILED);
            assert!(y_reserve == 0, ETEST_FAILED);
            assert!(pool_lp_au == 0, ETEST_FAILED);
        };

        let _ = sender_addr;
        add_exact_liquidity<AuxCoin, AuxCoin>(sender, 1000, 4000);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxCoin>>(), 0);
            assert!(x_reserve == 1000, ETEST_FAILED);
            assert!(y_reserve == 4000, ETEST_FAILED);
            assert!(pool_lp_au == 2000, ETEST_FAILED);
        };
        aux_bal = aux_bal - 5000;
        assert!(coin::balance<AuxCoin>(sender_addr) == aux_bal, ETEST_FAILED);
        assert!(coin::balance<LP<AuxCoin, AuxCoin>>(sender_addr) == (2000 - MIN_LIQUIDITY as u64),
                ETEST_FAILED);

        // Exact remove_liquidity.
        remove_liquidity<AuxCoin, AuxCoin>(sender, 50);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxCoin>>(), 0);
            assert!(x_reserve == 975, 1);
            assert!(y_reserve == 3900, 1);
            assert!(pool_lp_au == 1950, (pool_lp_au as u64));
        };
        aux_bal = aux_bal + 25 + 100;
        assert!(coin::balance<AuxCoin>(sender_addr) == aux_bal, ETEST_FAILED);
        assert!(coin::balance<LP<AuxCoin, AuxCoin>>(sender_addr) == (1950 - MIN_LIQUIDITY as u64),
                ETEST_FAILED);

        // Rounded remove_liquidity
        remove_liquidity<AuxCoin, AuxCoin>(sender, 17);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxCoin>>(), 0);
            assert!(x_reserve == 967, 1);
            assert!(y_reserve == 3866, 1);
            assert!(pool_lp_au == 1933, 1);
        };
        aux_bal = aux_bal + 8 + 34;
        assert!(coin::balance<AuxCoin>(sender_addr) == aux_bal, ETEST_FAILED);
        assert!(coin::balance<LP<AuxCoin, AuxCoin>>(sender_addr) == (1933 - MIN_LIQUIDITY as u64),
                ETEST_FAILED);

        // Total remove_liquidity
        remove_liquidity<AuxCoin, AuxCoin>(sender, 1933 - MIN_LIQUIDITY);
        {
            let pool = borrow_global<Pool<AuxCoin, AuxCoin>>(@aux);
            let x_reserve = coin::value(&pool.x_reserve);
            let y_reserve = coin::value(&pool.y_reserve);
            let pool_lp_au = option::get_with_default(&coin::supply<LP<AuxCoin, AuxCoin>>(), 0);
            assert!(x_reserve == 501, x_reserve);
            assert!(y_reserve == 2000, y_reserve);
            assert!(pool_lp_au == (MIN_LIQUIDITY as u128), 1);
        };
    }

}
