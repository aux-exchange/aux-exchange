#[test_only]
module aux::stable_3pool_test {
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::timestamp;

    use deployer::deployer::create_resource_account;

    use aux::fake_coin::{Self, FakeCoin, USDC, USDT, USDCD8};
    use aux::router_3pool;
    use aux::stable_3pool;
    use aux::authority;

    /// call `aptos_framework::create_account_for_test` if the user is not set up yet.
    fun setup_user(sender: &signer) {
        let sender_addr = signer::address_of(sender);
        if (!account::exists_at(sender_addr)) {
            account::create_account_for_test(sender_addr);
        };
    }

    /// set up the pool, the sender (which is the owner of the aux), and alice.
    fun setup(sender: &signer, aux: &signer, alice: &signer, bob: &signer) {
        setup_user(sender);
        setup_user(alice);
        setup_user(bob);

        if (!account::exists_at(@aux)) {
            create_resource_account(sender, b"amm");
            authority::init_module_for_test(&deployer::deployer::get_signer_for_address(sender, @aux));
        };
        fake_coin::initialize_for_test(aux);
    }

    #[test(sender = @0x5e7c3, aux = @aux, alice = @0x123, bob = @0x124, aptos_framework = @0x1)]
    fun test_3pool(sender: &signer, aux: &signer, alice: &signer, bob: &signer, aptos_framework: &signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        setup(sender, aux, alice, bob);

        let alice_addr = signer::address_of(alice);
        let bob_addr = signer::address_of(bob);

        router_3pool::create_pool<
            FakeCoin<USDC>,
            FakeCoin<USDT>,
            FakeCoin<USDCD8>,
        >(
            sender,
            15000000, // 15 bps fee
            10, // the stable swap will be pretty close to constant prod
        );

        let token_mul = 1000000;
        fake_coin::register_and_mint<USDC>(alice, 2000 * token_mul);
        fake_coin::register_and_mint<USDT>(alice, 2000 * token_mul);
        fake_coin::register_and_mint<USDCD8>(alice, 4000 * token_mul);

        router_3pool::add_liquidity<
            FakeCoin<USDC>,
            FakeCoin<USDT>,
            FakeCoin<USDCD8>,
        >(
            alice,
            1000 * token_mul, // 1000 USDC
            2000 * token_mul, // 2000 USDDT
            4000 * token_mul, // 40 USDCD8
            0,
        );
        stable_3pool::print_pool<
            FakeCoin<USDC>,
            FakeCoin<USDT>,
            FakeCoin<USDCD8>,
        >();
        let alice_lp_balance = router_3pool::balance<FakeCoin<USDC>, FakeCoin<USDT>, FakeCoin<USDCD8>>(alice_addr);
        assert!(alice_lp_balance == 292527494605, alice_lp_balance);

        fake_coin::register_and_mint<USDC>(bob, 20 * token_mul);

        router_3pool::swap_exact_coin_for_coin<
            FakeCoin<USDC>,
            FakeCoin<USDT>,
            FakeCoin<USDCD8>,
        >(
            bob,
            20 * token_mul, // Swap for 20 USDC
            0,
            0,
            2, // for some amount of USDCD8. Given USDCD8 this should be significantly smaller than 20, which is 2_000_000_000
            0,
        );
        stable_3pool::print_pool<
            FakeCoin<USDC>,
            FakeCoin<USDT>,
            FakeCoin<USDCD8>,
        >();

        assert!(coin::balance<FakeCoin<USDC>>(bob_addr) == 0, 1);
        let bob_usdc8_balance = coin::balance<FakeCoin<USDCD8>>(bob_addr);
        assert!(bob_usdc8_balance == 496794979, bob_usdc8_balance); // ~ around 5 USDCD8

        fake_coin::burn<USDCD8>(bob, bob_usdc8_balance);
        let total_usdcd8_in_pool: u64 = 3502459828 + 745193;
        let required_usdcd8_to_balance: u64 = 2000 * token_mul * 100 - total_usdcd8_in_pool;
        // let's make a balanced pool
        fake_coin::register_and_mint<USDC>(bob, 980 * token_mul);
        fake_coin::register_and_mint<USDCD8>(bob, required_usdcd8_to_balance);

        router_3pool::add_liquidity<
            FakeCoin<USDC>,
            FakeCoin<USDT>,
            FakeCoin<USDCD8>,
        >(
            bob,
            980 * token_mul,
            0,
            required_usdcd8_to_balance,
            0,
        );
        stable_3pool::print_pool<
            FakeCoin<USDC>,
            FakeCoin<USDT>,
            FakeCoin<USDCD8>,
        >();

        let bob_lp_balance = router_3pool::balance<FakeCoin<USDC>, FakeCoin<USDT>, FakeCoin<USDCD8>>(bob_addr);
        assert!(bob_lp_balance == 307471760192, bob_lp_balance);

        let total_lp_supply = (std::option::destroy_with_default(coin::supply<stable_3pool::LP<
            FakeCoin<USDC>,
            FakeCoin<USDT>,
            FakeCoin<USDCD8>,
        >>(), 0) as u64);

        assert!(total_lp_supply == 307471760192 + 292527494605, total_lp_supply); // total lp

        // total lp amount should be smaller than 6000
        assert!(alice_lp_balance + bob_lp_balance < 6000 * 100 * token_mul, alice_lp_balance + bob_lp_balance);

        // swap for exact
        router_3pool::swap_coin_for_exact_coin<
            FakeCoin<USDC>,
            FakeCoin<USDT>,
            FakeCoin<USDCD8>,
        >(
            alice,
            0,
            100 * token_mul,
            100 * token_mul,
            0,
            102 * token_mul,
        );
        stable_3pool::print_pool<
            FakeCoin<USDC>,
            FakeCoin<USDT>,
            FakeCoin<USDCD8>,
        >();

        let alice_usdt_balance = coin::balance<FakeCoin<USDT>>(alice_addr);
        assert!(alice_usdt_balance == 100 * token_mul, alice_usdt_balance);
        let alice_usdcd8_balance = coin::balance<FakeCoin<USDCD8>>(alice_addr);
        assert!(alice_usdcd8_balance == 100 * token_mul, alice_usdcd8_balance);

        // alice withdraw 1500 usdc
        router_3pool::remove_liquidity_for_coin<
            FakeCoin<USDC>,
            FakeCoin<USDT>,
            FakeCoin<USDCD8>,
        >(
            alice,
            1500 * token_mul,
            0,
            0,
            alice_lp_balance,
        );
        stable_3pool::print_pool<
            FakeCoin<USDC>,
            FakeCoin<USDT>,
            FakeCoin<USDCD8>,
        >();

        let alice_lp_balance = router_3pool::balance<FakeCoin<USDC>, FakeCoin<USDT>, FakeCoin<USDCD8>>(alice_addr);
        // original balance is 292527494605
        // burnt lp is 151001899666
        // or 66 bps slippage
        assert!(alice_lp_balance == 141520248196, alice_lp_balance);

        let total_lp_supply = (std::option::destroy_with_default(coin::supply<stable_3pool::LP<
            FakeCoin<USDC>,
            FakeCoin<USDT>,
            FakeCoin<USDCD8>,
        >>(), 0) as u64);

        std::debug::print(&total_lp_supply);

        router_3pool::remove_liquidity<
            FakeCoin<USDC>,
            FakeCoin<USDT>,
            FakeCoin<USDCD8>,
        >(
            alice,
            alice_lp_balance,
        );
        stable_3pool::print_pool<
            FakeCoin<USDC>,
            FakeCoin<USDT>,
            FakeCoin<USDCD8>,
        >();

        // burn all bob's coins
        fake_coin::burn_all<USDC>(bob);
        fake_coin::burn_all<USDT>(bob);
        fake_coin::burn_all<USDCD8>(bob);

        // bob withdraw all the liquidity in the pool
        router_3pool::remove_liquidity<
            FakeCoin<USDC>,
            FakeCoin<USDT>,
            FakeCoin<USDCD8>,
        >(
            bob,
            bob_lp_balance,
        );
        stable_3pool::print_pool<
            FakeCoin<USDC>,
            FakeCoin<USDT>,
            FakeCoin<USDCD8>,
        >();

        let bob_lp_balance = router_3pool::balance<FakeCoin<USDC>, FakeCoin<USDT>, FakeCoin<USDCD8>>(bob_addr);
        assert!(bob_lp_balance == 0, bob_lp_balance);
        let bob_usdc8_balance = coin::balance<FakeCoin<USDCD8>>(bob_addr);
        assert!(bob_usdc8_balance == 136891888899, bob_usdc8_balance);
        let bob_usdc_balance = coin::balance<FakeCoin<USDC>>(bob_addr);
        assert!(bob_usdc_balance == 411709487, bob_usdc_balance);
        let bob_usdt_balance = coin::balance<FakeCoin<USDT>>(bob_addr);
        assert!(bob_usdt_balance == 1301102749, bob_usdt_balance);
    }
}
