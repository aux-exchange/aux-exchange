#[test_only]
module aux::quoter_3pool_test {
    const E_EMERGENCY_ABORT: u64 = 0xFFFFFF;
    fun is_not_emergency(): bool {
        false
    }
    use aux::quoter_3pool;

    #[test]
    fun test_3pool() {
        let quoter = quoter_3pool::new_quoter(
            15000000,
            10,
            0, // balanced reserve
            0, // r 0
            0, // fee 0
            1000000000000, // s 0
            0,
            0,
            1000000000000,
            0,
            0,
            10000000000,
            0
        );

        let token_mul = 1000000;

        let alice_lp_balance = quoter_3pool::add_liquidity(
            &mut quoter,
            1000 * token_mul,
            2000 * token_mul,
            4000 * token_mul,
            0,
        );

        assert!(alice_lp_balance == 292527494605, alice_lp_balance);

        let (_, _, bob_usdc8_balance) = quoter_3pool::swap_exact_coin_for_coin(
            &mut quoter,
            20 * token_mul,
            0,
            0,
            2,
            0
        );

        assert!(bob_usdc8_balance == 496794979, bob_usdc8_balance); // ~ around 5 USDCD8

        let total_usdcd8_in_pool: u64 = 3502459828 + 745193;
        let required_usdcd8_to_balance: u64 = 2000 * token_mul * 100 - total_usdcd8_in_pool;

        let bob_lp_balance = quoter_3pool::add_liquidity(
            &mut quoter,
            980 * token_mul,
            0,
            required_usdcd8_to_balance,
            0
        );
        assert!(bob_lp_balance == 307466058484, bob_lp_balance);
        let total_lp_supply = (quoter_3pool::get_lp_supply(&quoter) as u64);
        assert!(total_lp_supply == alice_lp_balance + bob_lp_balance, total_lp_supply); // total lp

        // total lp amount should be smaller than 6000
        assert!(alice_lp_balance + bob_lp_balance < 6000 * 100 * token_mul, alice_lp_balance + bob_lp_balance);

        let (_, alice_usdt_balance, alice_usdcd8_balance) = quoter_3pool::swap_coin_for_exact_coin(
            &mut quoter,
            0,
            100 * token_mul,
            100 * token_mul,
            0,
            102 * token_mul,
        );
        assert!(alice_usdt_balance == 100 * token_mul, alice_usdt_balance);
        assert!(alice_usdcd8_balance == 100 * token_mul, alice_usdcd8_balance);

        let (_, _, _, alice_lp_balance) = quoter_3pool::remove_liquidity_for_coin(
            &mut quoter,
            1500 * token_mul,
            0,
            0,
            alice_lp_balance
        );
        // original balance is 292527494605
        // burnt lp is 151001899666
        // or 66 bps slippage
        assert!(alice_lp_balance == 141525594941, alice_lp_balance);

        quoter_3pool::remove_liquidity(
            &mut quoter,
            alice_lp_balance,
        );

        let (bob_usdc_balance, bob_usdt_balance, bob_usdc8_balance) = quoter_3pool::remove_liquidity(
            &mut quoter,
            bob_lp_balance,
        );
        assert!(bob_usdc8_balance == 136889994775, bob_usdc8_balance);
        assert!(bob_usdc_balance == 411702179, bob_usdc_balance);
        assert!(bob_usdt_balance == 1301105504, bob_usdc_balance);

        assert!(quoter_3pool::get_balanced_reserve(&quoter) == 0, 1);
    }
}
