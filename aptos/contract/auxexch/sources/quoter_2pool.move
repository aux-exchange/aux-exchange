/// Auto generated from github.com/aux-exchange/aux-exchange/docs/stableswap
/// don't modify by hand!
module aux::quoter_2pool {
    use aux::quote_coin;
    use aux::reward_quoter::{Self, RewardDistributionQuoter, QuoterRedeemToken};

    use aux::math_2pool as pool_math;

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


    /// LP Bundle combines LP Coins, and the RedeemTokens for the fees.
    /// The number of lp coins, and the number of RedeemTokens are equal, and they must be created or burned together.
    struct LPBundle has store, copy, drop {
        /// Lps for the pool.
        lps: u64,
        reward_token_0: QuoterRedeemToken,
        reward_token_1: QuoterRedeemToken,
    }

    /// Quoter is the struct that holds the coins, fee distributor, and information about the pool.
    /// Swap fees are moved into reward_distributor, and lps can redeem those with the redeem tokens.
    struct Quoter has store, copy, drop {
        /// reserve of the coin 0
        reserve_0: u64,
        /// fee for coin 0
        fee_0: u64,
        /// scaler_0 is used to convert the coin value to 18 decimals.
        scaler_0: u128,
        /// reward distributor for the fees in 0
        reward_distributor_0: RewardDistributionQuoter,
        /// reserve of the coin 1
        reserve_1: u64,
        /// fee for coin 1
        fee_1: u64,
        /// scaler_1 is used to convert the coin value to 18 decimals.
        scaler_1: u128,
        /// reward distributor for the fees in 1
        reward_distributor_1: RewardDistributionQuoter,

        // in place of of mint/burn
        lp_treasury: quote_coin::CoinTreasury,

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

    /**************************/
    /* Public Function        */
    /**************************/

    /// Create a new Quoter.
    public fun new_quoter(
        fee_numerator: u128,
        amp: u128,
        balanced_reserve: u128,
        reserve_0: u64,
        fee_0: u64,
        scaler_0: u128,
        reward_distributor_0: RewardDistributionQuoter,
        reserve_1: u64,
        fee_1: u64,
        scaler_1: u128,
        reward_distributor_1: RewardDistributionQuoter,
        lp_supply: u128,
    ): Quoter {
        Quoter {
            fee_numerator,
            amp,
            balanced_reserve,
            reserve_0: quote_coin::new(reserve_0),
            fee_0: quote_coin::new(fee_0),
            scaler_0,
            reward_distributor_0,
            reserve_1: quote_coin::new(reserve_1),
            fee_1: quote_coin::new(fee_1),
            scaler_1,
            reward_distributor_1,
            lp_treasury: quote_coin::new_coin_treasury(lp_supply),
        }
    }


    /// Update the A parameter of the stable curve.
    public fun update_amp(pool: &mut Quoter, amp: u128) {
        assert!(
            amp > 0,
            E_AMP_ZERO,
        );

        assert!(
            amp <= MAX_AMP,
            E_AMP_TOO_LARGE,
        );
        pool.amp = amp;
        // update balanced reserve
        update_balanced_reserve(pool);
    }

    /// Update fee for the pool.
    public fun update_fee(pool: &mut Quoter, fee_numerator: u128) {
        pool.fee_numerator = fee_numerator;
    }

    /// Move fee into reward distributor.
    /// This will be automatically called when adding/removing liquidity from the pool.
    public fun move_fee_into_reward_distributor(pool: &mut Quoter)
    {

        // no op if there is no fee to move
        let fee_added = false;

        let fee_moved_0 = quote_coin::value(&pool.fee_0);
        // only merge if there is fee to move
        if (fee_moved_0> 0) {
            fee_added = true;
            reward_quoter::add_reward(&mut pool.reward_distributor_0, quote_coin::extract_all(&mut pool.fee_0));
        };

        let fee_moved_1 = quote_coin::value(&pool.fee_1);
        // only merge if there is fee to move
        if (fee_moved_1> 0) {
            fee_added = true;
            reward_quoter::add_reward(&mut pool.reward_distributor_1, quote_coin::extract_all(&mut pool.fee_1));
        };

        if (!fee_added) {
            return
        };
    }

    /// Add liquidity to the protocol.
    /// Unlike constant product amm, arbitrary amount of coins are allowed here.
    /// Note, however, imbalanced coins will result in less lp coins than balanced coins.
    /// There is no fee to add liquidity. This will not underflow, so the output lp coins value may be 0.
    public fun add_liquidity(
pool: &mut Quoter,
        amount_0: u64,
        amount_1: u64,
        min_lp_amount: u64
    ): LPBundle
    {
        move_fee_into_reward_distributor(pool);

        // move the coins into reserve

        quote_coin::merge(&mut pool.reserve_0, amount_0);
        // move the coins into reserve

        quote_coin::merge(&mut pool.reserve_1, amount_1);

        // update balanced reserve and lp token supply
        let before_balanced_reserve = pool.balanced_reserve;
        let before_lp_coins_supply = quote_coin::treasury_supply(&pool.lp_treasury);

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

        let lps = quote_coin::mint(
            lp_to_mint,
            &mut pool.lp_treasury,
        );

        // mint reward tokens
        let reward_token_0 = reward_quoter::mint(&mut pool.reward_distributor_0, lp_to_mint);
        let reward_token_1 = reward_quoter::mint(&mut pool.reward_distributor_1, lp_to_mint);

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
    public fun remove_liquidity_for_coin(
pool: &mut Quoter,
        amount_0_to_withdraw: u64,
        amount_1_to_withdraw: u64,
        lp_bundle: LPBundle
    ): (u64, u64, LPBundle)
    {
        move_fee_into_reward_distributor(pool);

        assert!(
            amount_0_to_withdraw > 0 || amount_1_to_withdraw > 0,
            E_WITHDRAW_AMOUNT_ALL_ZERO,
        );

        let before_balanced_reserve = pool.balanced_reserve;

        // calculate the new reserve

        let coin_0 = if (amount_0_to_withdraw > 0) {
            // calculate the fee
            let fee = ((amount_0_to_withdraw as u128) * pool.fee_numerator) / FEE_DENOMINATOR;
            if (fee * FEE_DENOMINATOR < (amount_0_to_withdraw as u128) * pool.fee_numerator) {
                fee = fee + 1;
            };
            let fee = (fee as u64);

            let fee_coin_0 = quote_coin::extract(&mut pool.reserve_0, fee);
            quote_coin::merge(&mut pool.fee_0, fee_coin_0);

            quote_coin::extract(&mut pool.reserve_0, amount_0_to_withdraw)
        } else {
            quote_coin::zero()
        };

        // calculate the new reserve

        let coin_1 = if (amount_1_to_withdraw > 0) {
            // calculate the fee
            let fee = ((amount_1_to_withdraw as u128) * pool.fee_numerator) / FEE_DENOMINATOR;
            if (fee * FEE_DENOMINATOR < (amount_1_to_withdraw as u128) * pool.fee_numerator) {
                fee = fee + 1;
            };
            let fee = (fee as u64);

            let fee_coin_1 = quote_coin::extract(&mut pool.reserve_1, fee);
            quote_coin::merge(&mut pool.fee_1, fee_coin_1);

            quote_coin::extract(&mut pool.reserve_1, amount_1_to_withdraw)
        } else {
            quote_coin::zero()
        };

        let before_lp_coins_supply = quote_coin::treasury_supply(&pool.lp_treasury);

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

        quote_coin::burn(lps_to_burn, &mut pool.lp_treasury);
        // burn the reward 0
        let reward_coin_0 = reward_quoter::burn(&mut pool.reward_distributor_0, reward_token_0);
        quote_coin::merge(&mut coin_0, reward_coin_0);
        // burn the reward 1
        let reward_coin_1 = reward_quoter::burn(&mut pool.reward_distributor_1, reward_token_1);
        quote_coin::merge(&mut coin_1, reward_coin_1);

        (coin_0, coin_1, lp_bundle)
    }

    /// Remove liquidity from the pool by burning lp bundles.
    /// The coins returned will follow the current ratio of the pool.
    /// There is no fee.
    public fun remove_liquidity(
pool: &mut Quoter,
        lp_bundle: LPBundle,
    ): (u64, u64)
    {
        move_fee_into_reward_distributor(pool);

        let LPBundle {
            reward_token_0,
            reward_token_1,
            lps: lp,
        } = lp_bundle;
        let lp_burnt = quote_coin::value(&lp);
        assert!(
            lp_burnt > 0,
            E_LP_TO_BURN_IS_ZERO,
        );

        let before_lp_coins_supply = quote_coin::treasury_supply(&pool.lp_treasury);

        // remove liquidity for coin 0
        let before_reserve_0 = quote_coin::value(&pool.reserve_0);

        let withdraw_0 = (
            ((before_reserve_0 as u128) * (lp_burnt as u128))
            / before_lp_coins_supply
             as u64);
        let coin_0 = quote_coin::extract(&mut pool.reserve_0, withdraw_0);
        let reward_coin_0 = reward_quoter::burn(&mut pool.reward_distributor_0, reward_token_0);
        quote_coin::merge(&mut coin_0, reward_coin_0);

        // remove liquidity for coin 1
        let before_reserve_1 = quote_coin::value(&pool.reserve_1);

        let withdraw_1 = (
            ((before_reserve_1 as u128) * (lp_burnt as u128))
            / before_lp_coins_supply
             as u64);
        let coin_1 = quote_coin::extract(&mut pool.reserve_1, withdraw_1);
        let reward_coin_1 = reward_quoter::burn(&mut pool.reward_distributor_1, reward_token_1);
        quote_coin::merge(&mut coin_1, reward_coin_1);

        // recalculate d
        update_balanced_reserve(pool);

        quote_coin::burn(lp, &mut pool.lp_treasury);

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
        let before_reserve_0 = quote_coin::value(&pool.reserve_0);

        let is_coin_0_out = out_coin_index == 0;


        if (out_coin_index != 0) {
            quote_coin::merge(&mut pool.reserve_0, quote_coin::extract_all(&mut coin_0));
        };

        let after_reserve_0 = quote_coin::value(&pool.reserve_0);
        let after_reserve_0_scaled = (after_reserve_0 as u128) * pool.scaler_0;

        // calculate the amount in for coin 1
        let before_reserve_1 = quote_coin::value(&pool.reserve_1);

        let is_coin_1_out = out_coin_index == 1;


        if (out_coin_index != 1) {
            quote_coin::merge(&mut pool.reserve_1, quote_coin::extract_all(&mut coin_1));
        };

        let after_reserve_1 = quote_coin::value(&pool.reserve_1);
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
            let fee_0 = (fee_amount as u64);
            // amount the user will receive
            let amount_0_out = diff - fee_0;

            assert!(amount_0_out > 0, E_OUTPUT_COIN_UNDERFLOW);
            assert!(amount_0_out >= min_quantity_out, E_OUTPUT_COIN_INSUFFICIENT);

            let out_coin = quote_coin::extract(&mut pool.reserve_0, amount_0_out);
            quote_coin::merge(&mut coin_0, out_coin);
            let fee_coin = quote_coin::extract(&mut pool.reserve_0, fee_0);
            quote_coin::merge(&mut pool.fee_0, fee_coin);
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

            let out_coin = quote_coin::extract(&mut pool.reserve_1, amount_1_out);
            quote_coin::merge(&mut coin_1, out_coin);
            let fee_coin = quote_coin::extract(&mut pool.reserve_1, fee_1);
            quote_coin::merge(&mut pool.fee_1, fee_coin);
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
        coin_0: u64,
        requested_quantity_0: u64,
        coin_1: u64,
        requested_quantity_1: u64,
        in_coin_index: u8,
    ): (u64, u64)
    {
        assert!(in_coin_index < N_COINS_U8, E_INVALID_IN_COIN_INDEX);
        let amp = pool.amp;
        let before_balanced_reserve = pool.balanced_reserve;

        // process coin 0
        let before_reserve_0 = quote_coin::value(&pool.reserve_0);

        let is_coin_0_out = in_coin_index != 0;

        if (is_coin_0_out && requested_quantity_0 > 0) {
            // calculate fee.
            // fee is based on the amount user receives.
            let fee = (pool.fee_numerator * (requested_quantity_0 as u128))/FEE_DENOMINATOR;
            if (fee * FEE_DENOMINATOR < pool.fee_numerator * (requested_quantity_0 as u128)) {
                fee = fee + 1;
            };
            let fee = (fee as u64);
            let fee_coin = quote_coin::extract(&mut pool.reserve_0, fee);
            quote_coin::merge(&mut pool.fee_0, fee_coin);
            quote_coin::merge(&mut coin_0, quote_coin::extract(&mut pool.reserve_0, requested_quantity_0));
        };

        let after_reserve_0 = quote_coin::value(&pool.reserve_0);
        let after_reserve_0_scaled = (after_reserve_0 as u128) * pool.scaler_0;

        // process coin 1
        let before_reserve_1 = quote_coin::value(&pool.reserve_1);

        let is_coin_1_out = in_coin_index != 1;

        if (is_coin_1_out && requested_quantity_1 > 0) {
            // calculate fee.
            // fee is based on the amount user receives.
            let fee = (pool.fee_numerator * (requested_quantity_1 as u128))/FEE_DENOMINATOR;
            if (fee * FEE_DENOMINATOR < pool.fee_numerator * (requested_quantity_1 as u128)) {
                fee = fee + 1;
            };
            let fee = (fee as u64);
            let fee_coin = quote_coin::extract(&mut pool.reserve_1, fee);
            quote_coin::merge(&mut pool.fee_1, fee_coin);
            quote_coin::merge(&mut coin_1, quote_coin::extract(&mut pool.reserve_1, requested_quantity_1));
        };

        let after_reserve_1 = quote_coin::value(&pool.reserve_1);
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
            let amount_0_in = after_reserve_0 - before_reserve_0;
            assert!(amount_0_in <= quote_coin::value(&coin_0), E_INPUT_COIN_INSUFFICIENT);
            quote_coin::merge(&mut pool.reserve_0, quote_coin::extract(&mut coin_0, amount_0_in));
        };

        if (in_coin_index == 1) {
            after_reserve_1 = ((new_x / pool.scaler_1) as u64);
            // make sure new reserve is not round down
            if (new_x % pool.scaler_1 > 0) {
                after_reserve_1 = after_reserve_1 + 1;
            };
            assert!(after_reserve_1 > before_reserve_1, E_INPUT_COIN_UNDERFLOW);
            let amount_1_in = after_reserve_1 - before_reserve_1;
            assert!(amount_1_in <= quote_coin::value(&coin_1), E_INPUT_COIN_INSUFFICIENT);
            quote_coin::merge(&mut pool.reserve_1, quote_coin::extract(&mut coin_1, amount_1_in));
        };

        update_balanced_reserve(pool);

        let after_balanced_reserve = pool.balanced_reserve;
        assert!(after_balanced_reserve >= before_balanced_reserve, E_BALANCED_RESERVE_DECREASING);

        (coin_0, coin_1)
    }

    /*********************/
    /* LPBundle          */
    /*********************/

    /// extract amount from the bundle.
    public fun bundle_extract(lp: &mut LPBundle, amount: u64): LPBundle {
        LPBundle {
            reward_token_0: reward_quoter::token_extract(&mut lp.reward_token_0, amount),
            reward_token_1: reward_quoter::token_extract(&mut lp.reward_token_1, amount),
            lps: quote_coin::extract(&mut lp.lps, amount),
        }
    }

    /// detach reward tokens from lp coins.
    /// **note**: to redeem lp coins from the pool, reward tokens must be reattached to the lp coins.
    public fun bundle_detach_reward(
        lp: LPBundle,
    ): (
        u64,
        QuoterRedeemToken,
        QuoterRedeemToken,
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
    public fun bundle_attach_reward(
        lps: u64,
        reward_token_0: QuoterRedeemToken,
        reward_token_1: QuoterRedeemToken,
    ): LPBundle {
        assert!(
            quote_coin::value(&lps) == reward_quoter::token_value(&reward_token_0),
            E_REWARD_TOKEN_AMOUNT_MISMATCH
        );
        assert!(
            quote_coin::value(&lps) == reward_quoter::token_value(&reward_token_1),
            E_REWARD_TOKEN_AMOUNT_MISMATCH
        );

        LPBundle {
            lps,
            reward_token_0,
            reward_token_1,
        }
    }

    /// check if the reward token is fungible.
    public fun bundle_is_fungible(
        l: &LPBundle,
        r: &LPBundle,
    ): bool {
        if (!reward_quoter::is_fungible(&l.reward_token_0, &r.reward_token_0)) {
            return false
        };
        if (!reward_quoter::is_fungible(&l.reward_token_1, &r.reward_token_1)) {
            return false
        };

        true
    }

    /// merge lp token bundle into another bundle.
    /// the reward tokens must be fungile.
    public fun bundle_merge(
        l: &mut LPBundle,
        r: LPBundle,
    ) {
        let LPBundle {
            lps,
            reward_token_0,
            reward_token_1,
        } = r;

        quote_coin::merge(&mut l.lps, lps);

        reward_quoter::token_merge(&mut l.reward_token_0, reward_token_0);
        reward_quoter::token_merge(&mut l.reward_token_1, reward_token_1);
    }

    /// melt lp token bundle into another bundle
    public fun bundle_melt(
        l: &mut LPBundle,
        r: LPBundle,
    ) {
        let LPBundle {
            lps,
            reward_token_0,
            reward_token_1,
        } = r;

        quote_coin::merge(&mut l.lps, lps);

        reward_quoter::token_melt(&mut l.reward_token_0, reward_token_0);
        reward_quoter::token_melt(&mut l.reward_token_1, reward_token_1);
    }

    public fun bundle_value(lp_bundle: &LPBundle): u64 {
        quote_coin::value(&lp_bundle.lps)
    }

    public fun update_balanced_reserve(pool: &mut Quoter) {
        let scaler_0 = pool.scaler_0;
        let reserve_0_unscaled = quote_coin::value(&pool.reserve_0);
        let reserve_0 = (reserve_0_unscaled as u128) * scaler_0;

        let scaler_1 = pool.scaler_1;
        let reserve_1_unscaled = quote_coin::value(&pool.reserve_1);
        let reserve_1 = (reserve_1_unscaled as u128) * scaler_1;

        pool.balanced_reserve = pool_math::calculate_d(
            reserve_0,
            reserve_1,
            pool.amp
        );
    }

    public fun get_balanced_reserve(pool: &Quoter): u128 {
        pool.balanced_reserve
    }

    public fun get_lp_supply(pool: &Quoter): u128 {
       quote_coin::treasury_supply(&pool.lp_treasury)
    }

    public fun get_reserve_0(pool: &Quoter): u64 {
        quote_coin::value(&pool.reserve_0)
    }

    public fun get_fee_0(pool: &Quoter): u64 {
        quote_coin::value(&pool.fee_0)
    }

    public fun get_reserve_1(pool: &Quoter): u64 {
        quote_coin::value(&pool.reserve_1)
    }

    public fun get_fee_1(pool: &Quoter): u64 {
        quote_coin::value(&pool.fee_1)
    }
}
