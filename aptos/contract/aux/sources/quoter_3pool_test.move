#[test_only]
module aux::quoter_3pool_test {
    use aux::quoter_3pool;
    use aux::reward_quoter;
    use aux::quote_coin;

    #[test]
    fun test_3pool() {
        let quoter = quoter_3pool::new_quoter(
            15000000,
            10,
            0, // balanced reserve
            0, // r 0
            0, // fee 0
            1000000000000, // s 0
            reward_quoter::new(0, 0, 0, 0),
            0, // r 1
            0, // fee 1
            1000000000000, // s 1
            reward_quoter::new(0, 0, 0, 0),
            0, // r 2
            0, // fee 2
            10000000000, // s2
            reward_quoter::new(0, 0, 0, 0),
            0
        );

        let token_mul = 1000000;

        let alice_lp_bundle = quoter_3pool::add_liquidity(
            &mut quoter,
            quote_coin::new(1000 * token_mul),
            quote_coin::new(2000 * token_mul),
            quote_coin::new(4000 * token_mul),
            0,
        );
        let alice_lp_balance = quoter_3pool::bundle_value(&alice_lp_bundle);

        assert!(alice_lp_balance == 292527494605, alice_lp_balance);

        let (_, _, bob_usdc8_balance) = quoter_3pool::swap_exact_coin_for_coin(
            &mut quoter,
            quote_coin::new(20 * token_mul),
            quote_coin::new(0),
            quote_coin::new(0),
            2,
            0
        );

        let bob_usdc8_balance = quote_coin::value(&bob_usdc8_balance);
        assert!(bob_usdc8_balance == 496794979, bob_usdc8_balance); // ~ around 5 USDCD8

        let total_usdcd8_in_pool: u64 = 3502459828 + 745193;
        let required_usdcd8_to_balance: u64 = 2000 * token_mul * 100 - total_usdcd8_in_pool;

        let bob_lp_bundle = quoter_3pool::add_liquidity(
            &mut quoter,
            quote_coin::new(980 * token_mul),
            quote_coin::new(0),
            quote_coin::new(required_usdcd8_to_balance),
            0
        );
        let bob_lp_balance = quoter_3pool::bundle_value(&bob_lp_bundle);
        assert!(bob_lp_balance == 307471760192, bob_lp_balance);
        let total_lp_supply = (quoter_3pool::get_lp_supply(&quoter) as u64);
        assert!(total_lp_supply == alice_lp_balance + bob_lp_balance, total_lp_supply); // total lp

        // total lp amount should be smaller than 6000
        assert!(alice_lp_balance + bob_lp_balance < 6000 * 100 * token_mul, alice_lp_balance + bob_lp_balance);

        let (_, alice_usdt_balance, alice_usdcd8_balance) = quoter_3pool::swap_coin_for_exact_coin(
            &mut quoter,
            quote_coin::new(102 * token_mul),
            0,
            quote_coin::zero(),
            100 * token_mul,
            quote_coin::zero(),
            100 * token_mul,
            0,
        );
        let alice_usdt_balance = quote_coin::value(&alice_usdt_balance);
        let alice_usdcd8_balance = quote_coin::value(&alice_usdcd8_balance);
        assert!(alice_usdt_balance == 100 * token_mul, alice_usdt_balance);
        assert!(alice_usdcd8_balance == 100 * token_mul, alice_usdcd8_balance);

        let (_, _, _, alice_lp_bundle) = quoter_3pool::remove_liquidity_for_coin(
            &mut quoter,
            1500 * token_mul,
            0,
            0,
            alice_lp_bundle
        );
        // original balance is 292527494605
        // burnt lp is 151001899666
        // or 66 bps slippage
        let alice_lp_balance = quoter_3pool::bundle_value(&alice_lp_bundle);
        assert!(alice_lp_balance == 141520248196, alice_lp_balance);

        quoter_3pool::remove_liquidity(
            &mut quoter,
            alice_lp_bundle,
        );

        let (bob_usdc_balance, bob_usdt_balance, bob_usdc8_balance) = quoter_3pool::remove_liquidity(
            &mut quoter,
            bob_lp_bundle,
        );
        let bob_usdc8_balance = quote_coin::value(&bob_usdc8_balance);
        let bob_usdc_balance = quote_coin::value(&bob_usdc_balance);
        let bob_usdt_balance = quote_coin::value(&bob_usdt_balance);
        assert!(bob_usdc8_balance == 136891888899, bob_usdc8_balance);
        assert!(bob_usdc_balance == 411709487, bob_usdc_balance);
        assert!(bob_usdt_balance == 1301102749, bob_usdt_balance);

        assert!(quoter_3pool::get_balanced_reserve(&quoter) == 0, 1);
    }
}
