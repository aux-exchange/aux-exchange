/// Auto generated from github.com/aux-exchange/aux-exchange/docs/stableswap
/// don't modify by hand!
module aux::quoter_2pool {
    use aux::math_2pool as pool_math;
    use aux::uint256;

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

    /// Lp token decimals is constant 8
    const LP_TOKEN_DECIMALS: u8 = 8;

    /// max coin decimal allowed is 8
    const MAX_COIN_DECIMAL_ALLOWED: u8 = 10;

    /// max amp
    const MAX_AMP: u128 = 2000;

    /// Quoter
    struct Quoter has copy, drop, store {
        /// reserve of the coin 0
        reserve_0: u64,
        /// fee for coin 0
        fee_0: u64,
        /// scaler_0 is used to convert the coin value to 18 decimals.
        scaler_0: u128,
        /// reserve of the coin 1
        reserve_1: u64,
        /// fee for coin 1
        fee_1: u64,
        /// scaler_1 is used to convert the coin value to 18 decimals.
        scaler_1: u128,

        /// balanced reserve, or D.
        /// If the pool is in equilibrium (all coins have the save reserve),
        /// the sum of the all coins will have this value.
        balanced_reserve: u128,
        /// amp
        amp: u128,

        /// fee numertor.
        /// the denominator is the consant FEE_DENOMINATOR
        fee_numerator: u128,

        /// LP
        lp_supply: u128
    }

    /// create a new 2pool.
    public fun new_quoter(
        fee_numerator: u128,
        amp: u128,
        balanced_reserve: u128,
        reserve_0: u64,
        fee_0: u64,
        scaler_0: u128,
        reserve_1: u64,
        fee_1: u64,
        scaler_1: u128,
        lp_supply: u128,
    ): Quoter {
        Quoter{
            fee_numerator,
            lp_supply,
            balanced_reserve,
            amp,
            reserve_0,
            fee_0,
            scaler_0,
            reserve_1,
            fee_1,
            scaler_1,
        }
    }

    /// Move fee into reserve.
    /// This will be automatically called when adding/removing liquidity from the pool.
    public fun move_fee_into_reserve(pool: &mut Quoter)
    {
        // no op if there is no fee to move
        let fee_added = false;

        let fee_moved_0 = pool.fee_0;
        // only merge if there is fee to move
        if (fee_moved_0> 0) {
            fee_added = true;
            pool.reserve_0 = pool.reserve_0 + pool.fee_0;
            pool.fee_0 = 0;
        };

        let fee_moved_1 = pool.fee_1;
        // only merge if there is fee to move
        if (fee_moved_1> 0) {
            fee_added = true;
            pool.reserve_1 = pool.reserve_1 + pool.fee_1;
            pool.fee_1 = 0;
        };

        if (!fee_added) {
            return
        };

        update_balanced_reserve(pool);
    }

    /// Add liquidity to the protocol.
    /// There is no fee to add liquidity.
    public fun add_liquidity(
        pool: &mut Quoter,
        amount_0: u64,
        amount_1: u64,
        min_lp_amount: u64,
    ): u64
    {
        move_fee_into_reserve(pool);

        // move the coins into reserve
        pool.reserve_0 = pool.reserve_0 + amount_0;

        // move the coins into reserve
        pool.reserve_1 = pool.reserve_1 + amount_1;

        // update balanced reserve and lp token supply
        let before_balanced_reserve = pool.balanced_reserve;
        let before_lp_tokens_supply = pool.lp_supply;

        update_balanced_reserve(pool);

        let after_balanced_reserve = pool.balanced_reserve;

        assert!(
            before_balanced_reserve <= after_balanced_reserve,
            E_BALANCED_RESERVE_DECREASING,
        );

        // if lp token supply is 0, this is an empty pool.
        let after_lp_tokens_supply = if (before_lp_tokens_supply == 0) {
            after_balanced_reserve / BALANCED_RESERVED_TO_LP_SCALER
        } else {
            let new_lp_amount = uint256::divide_underlying(
                uint256::underlying_mul_to_uint256(
                    after_balanced_reserve,
                    before_lp_tokens_supply,
                ),
                before_balanced_reserve,
            );
            assert!(
                !uint256::underlying_overflow(new_lp_amount),
                E_LP_AMOUNT_OVERFLOW,
            );

            uint256::downcast(new_lp_amount)
        };

        assert!(
            after_lp_tokens_supply > before_lp_tokens_supply,
            E_LP_AMOUNT_INCREASE_UNDERFLOW,
        );

        let lp_to_mint = after_lp_tokens_supply - before_lp_tokens_supply;

        assert!(
            lp_to_mint <= MAX_U64,
            E_LP_TO_MINT_OVERFLOW,
        );

        let lp_to_mint = (lp_to_mint as u64);

        assert!(
            lp_to_mint >= min_lp_amount,
            E_LP_AMOUNT_INSUFFICIENT,
        );

        pool.lp_supply = after_lp_tokens_supply;

        lp_to_mint
    }

    /// Remove coins from the pool and burn some lp tokens.
    /// There will be a fee charged on each withdrawal. If the withdrawal amount is 0, fee is 0,
    /// otherwise the fee will be the same as swap, with a 1 minimal.
    /// Fee is charged on the output amount.
    /// For example, if 10000 is requested, and fee is 1bps, the pool will dispense 10001
    /// coins from the reserve, and deposite 1 into the fee.
    public fun remove_liquidity_for_coin(
        pool: &mut Quoter,
        amount_0_to_withdraw: u64,
        amount_1_to_withdraw: u64,
        lp: u64,
    ): (u64, u64, u64)
    {
        assert!(
            amount_0_to_withdraw > 0 || amount_1_to_withdraw > 0,
            E_WITHDRAW_AMOUNT_ALL_ZERO,
        );

        move_fee_into_reserve(pool);

        let before_balanced_reserve = pool.balanced_reserve;

        // calculate the fee
        let coin_0 = if (amount_0_to_withdraw > 0) {
            let fee = ((amount_0_to_withdraw as u128) * pool.fee_numerator) / FEE_DENOMINATOR;
            if (fee * FEE_DENOMINATOR < (amount_0_to_withdraw as u128) * pool.fee_numerator) {
                fee = fee + 1;
            };
            let fee = (fee as u64);

            pool.reserve_0 = pool.reserve_0 - fee;
            pool.fee_0 = pool.fee_0 + fee;
            pool.reserve_0 = pool.reserve_0 - amount_0_to_withdraw;

            amount_0_to_withdraw
        } else {
            0
        };

        // calculate the fee
        let coin_1 = if (amount_1_to_withdraw > 0) {
            let fee = ((amount_1_to_withdraw as u128) * pool.fee_numerator) / FEE_DENOMINATOR;
            if (fee * FEE_DENOMINATOR < (amount_1_to_withdraw as u128) * pool.fee_numerator) {
                fee = fee + 1;
            };
            let fee = (fee as u64);

            pool.reserve_1 = pool.reserve_1 - fee;
            pool.fee_1 = pool.fee_1 + fee;
            pool.reserve_1 = pool.reserve_1 - amount_1_to_withdraw;

            amount_1_to_withdraw
        } else {
            0
        };

        let before_lp_tokens_supply = pool.lp_supply;

        update_balanced_reserve(pool);

        let after_balanced_reserve = pool.balanced_reserve;
        assert!(
            before_balanced_reserve > after_balanced_reserve,
            E_WITHDRAW_BALANCED_RESERVE_UNDERFLOW
        );

        let after_lp_tokens_supply = uint256::downcast(
            uint256::divide_underlying(
                uint256::underlying_mul_to_uint256(
                    after_balanced_reserve,
                    before_lp_tokens_supply,
                ),
                before_balanced_reserve,
            ),
        );

        if (after_lp_tokens_supply == before_lp_tokens_supply) {
            after_lp_tokens_supply = before_lp_tokens_supply - 1;
        };

        let lp_burnt = (before_lp_tokens_supply - after_lp_tokens_supply);
        assert!(
            lp_burnt <= MAX_U64,
            E_LP_BURNT_OVERFLOW,
        );

        pool.lp_supply = pool.lp_supply - lp_burnt;

        let lp_burnt = (lp_burnt as u64);

        lp = lp - lp_burnt;

        (coin_0, coin_1, lp)
    }

    /// Remove liquidity from the pool by burning lp tokens.
    /// The coins returned will follow the current ratio of the pool.
    /// There is no fee.
    public fun remove_liquidity(
        pool: &mut Quoter,
        lp: u64,
    ): (u64, u64)
    {
        let lp_burnt = lp;
        assert!(
            lp_burnt > 0,
            E_LP_TO_BURN_IS_ZERO,
        );

        move_fee_into_reserve(pool);

        let before_lp_tokens_supply = pool.lp_supply;

        // remove liquidity for coin 0
        let before_reserve_0 = pool.reserve_0;

        let withdraw_0 = (
            ((before_reserve_0 as u128) * (lp_burnt as u128))
            / before_lp_tokens_supply
             as u64);
        pool.reserve_0 = pool.reserve_0 - withdraw_0;
        let coin_0 = withdraw_0;

        // remove liquidity for coin 1
        let before_reserve_1 = pool.reserve_1;

        let withdraw_1 = (
            ((before_reserve_1 as u128) * (lp_burnt as u128))
            / before_lp_tokens_supply
             as u64);
        pool.reserve_1 = pool.reserve_1 - withdraw_1;
        let coin_1 = withdraw_1;

        // recalculate d
        update_balanced_reserve(pool);

        pool.lp_supply = pool.lp_supply - (lp_burnt as u128);

        (coin_0, coin_1)
    }

    /// swap coins, where output amount is decided by the input amount.
    /// for input coins, the full amount stored in the coin will be transferred to the pool.
    /// for the output coin, the amount swapped for will be added (so the output coin can contain non-zero value).
    /// output coin is identified by the index.
    public fun swap_exact_coin_for_coin(
        pool: &mut Quoter,
        coin_0: u64,
        coin_1: u64,
        out_coin_index: u8,
        min_quantity_out: u64,
    ): (u64, u64)
    {
        assert!(out_coin_index < N_COINS_U8, E_INVALID_OUT_COIN_INDEX);

        let amp = pool.amp;
        let before_balanced_reserve = pool.balanced_reserve;

        // calculate the amount in for coin 0
        let before_reserve_0 = pool.reserve_0;

        let is_coin_0_out = out_coin_index == 0;

        if (out_coin_index != 0) {
            pool.reserve_0 = pool.reserve_0 + coin_0;
        };

        let after_reserve_0 = pool.reserve_0;
        let after_reserve_0_scaled = (after_reserve_0 as u128) * pool.scaler_0;

        // calculate the amount in for coin 1
        let before_reserve_1 = pool.reserve_1;

        let is_coin_1_out = out_coin_index == 1;

        if (out_coin_index != 1) {
            pool.reserve_1 = pool.reserve_1 + coin_1;
        };

        let after_reserve_1 = pool.reserve_1;
        let after_reserve_1_scaled = (after_reserve_1 as u128) * pool.scaler_1;

        // calculate the scaled output coin value
        let new_x = pool_math::calculate_x_non_decreasing_d(
            after_reserve_0_scaled,
            after_reserve_1_scaled,
            out_coin_index,
            amp,
            before_balanced_reserve,
        );

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
            let fee_0 = (fee_amount as u64);
            // amount the user will receive
            let amount_0_out = diff - fee_0;

            assert!(amount_0_out > 0, E_OUTPUT_COIN_UNDERFLOW);
            assert!(amount_0_out >= min_quantity_out, E_OUTPUT_COIN_INSUFFICIENT);

            coin_0 = coin_0 + amount_0_out;
            pool.reserve_0 = pool.reserve_0 - amount_0_out;
            pool.fee_0 = pool.fee_0 + fee_0;
            pool.reserve_0 = pool.reserve_0 - fee_0;
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
            let fee_1 = (fee_amount as u64);
            // amount the user will receive
            let amount_1_out = diff - fee_1;

            assert!(amount_1_out > 0, E_OUTPUT_COIN_UNDERFLOW);
            assert!(amount_1_out >= min_quantity_out, E_OUTPUT_COIN_INSUFFICIENT);

            coin_1 = coin_1 + amount_1_out;
            pool.reserve_1 = pool.reserve_1 - amount_1_out;
            pool.fee_1 = pool.fee_1 + fee_1;
            pool.reserve_1 = pool.reserve_1 - fee_1;
        };

        update_balanced_reserve(pool);
        let after_balanced_reserve = pool.balanced_reserve;
        assert!(after_balanced_reserve >= before_balanced_reserve, E_BALANCED_RESERVE_DECREASING);

        (coin_0, coin_1)
    }

    /// swap coins, where input amount is decided by the requested output amount.
    /// for the output coins, the amount swapped for will be added (so the output coin can contain non-zero value).
    /// for the input coin, the amount necessary is deducted.
    /// input coin is identified by the index.
    public fun swap_coin_for_exact_coin(
        pool: &mut Quoter,
        requested_quantity_0: u64,
        requested_quantity_1: u64,
        in_coin_index: u8,
        max_in_coin_amount: u64,
    ): (u64, u64)
    {
        assert!(in_coin_index < N_COINS_U8, E_INVALID_IN_COIN_INDEX);

        let amp = pool.amp;
        let before_balanced_reserve = pool.balanced_reserve;

        // process coin 0
        let before_reserve_0 = pool.reserve_0;

        let coin_0 = if (in_coin_index == 0) {
            max_in_coin_amount
        } else if (requested_quantity_0 > 0) {
            // calculate fee.
            // fee is based on the amount user receives.
            let fee = (pool.fee_numerator * (requested_quantity_0 as u128))/FEE_DENOMINATOR;
            if (fee * FEE_DENOMINATOR < pool.fee_numerator * (requested_quantity_0 as u128)) {
                fee = fee + 1;
            };
            let fee = (fee as u64);
            pool.fee_0 = pool.fee_0 + fee;
            pool.reserve_0 = pool.reserve_0 - fee;
            pool.reserve_0 = pool.reserve_0 - requested_quantity_0;
            requested_quantity_0
        } else {
            0
        };

        let after_reserve_0 = pool.reserve_0;
        let after_reserve_0_scaled = (after_reserve_0 as u128) * pool.scaler_0;

        // process coin 1
        let before_reserve_1 = pool.reserve_1;

        let coin_1 = if (in_coin_index == 1) {
            max_in_coin_amount
        } else if (requested_quantity_1 > 0) {
            // calculate fee.
            // fee is based on the amount user receives.
            let fee = (pool.fee_numerator * (requested_quantity_1 as u128))/FEE_DENOMINATOR;
            if (fee * FEE_DENOMINATOR < pool.fee_numerator * (requested_quantity_1 as u128)) {
                fee = fee + 1;
            };
            let fee = (fee as u64);
            pool.fee_1 = pool.fee_1 + fee;
            pool.reserve_1 = pool.reserve_1 - fee;
            pool.reserve_1 = pool.reserve_1 - requested_quantity_1;
            requested_quantity_1
        } else {
            0
        };

        let after_reserve_1 = pool.reserve_1;
        let after_reserve_1_scaled = (after_reserve_1 as u128) * pool.scaler_1;


        // get the new reserve for the input coin
        let new_x = pool_math::calculate_x_non_decreasing_d(
            after_reserve_0_scaled,
            after_reserve_1_scaled,
            in_coin_index,
            amp,
            before_balanced_reserve,
        );

        if (in_coin_index == 0) {
            after_reserve_0 = ((new_x / pool.scaler_0) as u64);
            // make sure new reserve is not round down
            if (new_x % pool.scaler_0 > 0) {
                after_reserve_0 = after_reserve_0 + 1;
            };
            assert!(after_reserve_0 > before_reserve_0, E_INPUT_COIN_UNDERFLOW);
            let amount_0_in = after_reserve_0 - before_reserve_0;
            assert!(amount_0_in <= coin_0, E_INPUT_COIN_INSUFFICIENT);
            coin_0 = coin_0 - amount_0_in;
            pool.reserve_0 = pool.reserve_0 + amount_0_in;
        };

        if (in_coin_index == 1) {
            after_reserve_1 = ((new_x / pool.scaler_1) as u64);
            // make sure new reserve is not round down
            if (new_x % pool.scaler_1 > 0) {
                after_reserve_1 = after_reserve_1 + 1;
            };
            assert!(after_reserve_1 > before_reserve_1, E_INPUT_COIN_UNDERFLOW);
            let amount_1_in = after_reserve_1 - before_reserve_1;
            assert!(amount_1_in <= coin_1, E_INPUT_COIN_INSUFFICIENT);
            coin_1 = coin_1 - amount_1_in;
            pool.reserve_1 = pool.reserve_1 + amount_1_in;
        };

        update_balanced_reserve(pool);

        let after_balanced_reserve = pool.balanced_reserve;
        assert!(after_balanced_reserve >= before_balanced_reserve, E_BALANCED_RESERVE_DECREASING);

        (coin_0, coin_1)
    }

    public fun calculate_required_lp_for_coin(
        pool: &Quoter,
        amount_0_to_withdraw: u64,
        amount_1_to_withdraw: u64,
    ): u64
    {
        let lp = (MAX_U64 as u64);
        let pool = *pool;
        let (_, _, leftover_lp) = remove_liquidity_for_coin(
            &mut pool,
            amount_0_to_withdraw,
            amount_1_to_withdraw,
            lp
        );

        lp - leftover_lp
    }

    public fun update_balanced_reserve(
        pool: &mut Quoter,
    ) {

        let scaler_0 = pool.scaler_0;
        let reserve_0_unscaled = pool.reserve_0;
        let reserve_0 = (reserve_0_unscaled as u128) * scaler_0;

        let scaler_1 = pool.scaler_1;
        let reserve_1_unscaled = pool.reserve_1;
        let reserve_1 = (reserve_1_unscaled as u128) * scaler_1;

        pool.balanced_reserve = pool_math::calculate_d(
            reserve_0,
            reserve_1,
            pool.amp
        );
    }

    public fun get_fee_numerator(pool: &Quoter): u128 {
        pool.fee_numerator
    }

    public fun get_balanced_reserve(pool: &Quoter): u128 {
        pool.balanced_reserve
    }

    public fun get_amp(pool: &Quoter): u128 {
        pool.amp
    }

    public fun get_lp_supply(pool: &Quoter): u128 {
        pool.lp_supply
    }

    public fun get_reserve_0(pool: &Quoter): u64 {
        pool.reserve_0
    }

    public fun get_fee_0(pool: &Quoter): u64 {
        pool.fee_0
    }

    public fun get_scaler_0(pool: &Quoter): u128 {
        pool.scaler_0
    }

    public fun get_reserve_1(pool: &Quoter): u64 {
        pool.reserve_1
    }

    public fun get_fee_1(pool: &Quoter): u64 {
        pool.fee_1
    }

    public fun get_scaler_1(pool: &Quoter): u128 {
        pool.scaler_1
    }
}
