#[test_only]
module aux::stable_2pool_test {
    use std::signer;
    use std::option;
    use aptos_framework::coin;
    use aptos_framework::account;
    use aptos_framework::timestamp;

    use aux::authority;
    use aux::util;
    use aux::fake_coin::{Self, FakeCoin, USDC, USDT};
    use aux::quote_coin;
    use aux::router_2pool;
    use aux::stable_2pool;
    use aux::quoter_2pool;

    const ETEST_FAILED: u64 = 0;
    const MAX_U64: u64 = 18446744073709551615;

    struct Pool<phantom X, phantom Y> has key {}

    fun create_pool<X, Y>(sender: &signer, fee_bps: u64, a: u128, x_ramp_up: u64, y_ramp_up: u64) {
        router_2pool::create_pool<X, Y>(
            sender,
            (fee_bps as u128) * 1000000,
            (a as u128),
        );
        let _ = x_ramp_up;
        let _ = y_ramp_up;
        move_to(
            &authority::get_signer(sender),
            Pool<X, Y> {},
        );
    }

    fun get_pool<X, Y>(): quoter_2pool::Quoter {
        stable_2pool::get_quoter<X, Y>()
    }

    fun add_liquidity<X, Y>(sender: &signer, x_au: u64, y_au: u64) {
        router_2pool::add_liquidity<X, Y>(sender, x_au, y_au, 0);
    }

    fun remove_liquidity<X, Y>(sender: &signer, lp_au: u64) {
        router_2pool::remove_liquidity<X, Y>(sender, lp_au)
    }

    fun reset_pool<X, Y>(_sender: &signer) {
        assert!(quoter_2pool::get_balanced_reserve(&stable_2pool::get_quoter<X, Y>()) == 0,
            (quoter_2pool::get_balanced_reserve(&stable_2pool::get_quoter<X, Y>()) as u64),
        )
    }

    fun au_out<CoinIn, CoinOut>(au_in: u64): u64 {
        if (stable_2pool::pool_exists<CoinIn, CoinOut>()) {
            let quoter = stable_2pool::get_quoter<CoinIn, CoinOut>();
            let (_, out) = quoter_2pool::swap_exact_coin_for_coin(&mut quoter, quote_coin::new(au_in), quote_coin::new(0), 1, 0);
            quote_coin::value(&out)
        } else if(stable_2pool::pool_exists<CoinOut, CoinIn>()) {
            let quoter = stable_2pool::get_quoter<CoinOut, CoinIn>();
            let (out, _) = quoter_2pool::swap_exact_coin_for_coin(&mut quoter, quote_coin::new(0), quote_coin::new(au_in), 0, 0);
            quote_coin::value(&out)
        } else {
            abort(ETEST_FAILED)
        }
    }

    fun au_in<CoinIn, CoinOut>(au_out: u64): u64 {
        if (stable_2pool::pool_exists<CoinIn, CoinOut>()) {
            let quoter = stable_2pool::get_quoter<CoinIn, CoinOut>();
            let (remaining, _) = quoter_2pool::swap_coin_for_exact_coin(&mut quoter, quote_coin::new(MAX_U64), 0, quote_coin::new(0), au_out, 0);
            MAX_U64 - quote_coin::value(&remaining)
        } else if(stable_2pool::pool_exists<CoinOut, CoinIn>()) {
            let quoter = stable_2pool::get_quoter<CoinOut, CoinIn>();
            let (_, remaining) = quoter_2pool::swap_coin_for_exact_coin(&mut quoter, quote_coin::new(0), au_out, quote_coin::new(MAX_U64), 0, 1);
            MAX_U64 - quote_coin::value(&remaining)
        } else {
            abort(ETEST_FAILED)
        }
    }

    fun swap_coin_for_exact_coin<CoinIn, CoinOut>(sender: &signer, max_in: u64, exact_out: u64) {
        if (stable_2pool::pool_exists<CoinIn, CoinOut>()) {
            router_2pool::swap_coin_for_exact_coin<CoinIn, CoinOut>(sender, 0, exact_out, 0, max_in)
        } else if (stable_2pool::pool_exists<CoinOut, CoinIn>()){
            router_2pool::swap_coin_for_exact_coin<CoinOut, CoinIn>(sender, exact_out, 0, 1, max_in)
        } else {
            abort(ETEST_FAILED)
        }
    }

    fun coin_swap_coin_for_exact_coin<CoinIn, CoinOut>(sender: &signer, 
        user_in: &mut coin::Coin<CoinIn>,
        user_out:&mut coin::Coin<CoinOut>,
        max_in: u64,
        exact_out: u64,
    ): (u64, u64) {
        let in_value = coin::value(user_in);
        let in = coin::extract(user_in, max_in);
        let out = coin::extract_all(user_out);
        if (stable_2pool::pool_exists<CoinIn, CoinOut>()) {
            let (in, out) = stable_2pool::swap_coin_for_exact_coin<CoinIn, CoinOut>(signer::address_of(sender), in, 0, out, exact_out, 0);
            coin::merge(user_in, in);
            coin::merge(user_out, out);
        } else if (stable_2pool::pool_exists<CoinOut, CoinIn>()){
            let (out, in) = stable_2pool::swap_coin_for_exact_coin<CoinOut, CoinIn>(signer::address_of(sender), out, exact_out, in, 0, 1);
            coin::merge(user_in, in);
            coin::merge(user_out, out);
        }  else {
            abort(ETEST_FAILED)
        };
        (coin::value(user_out), (in_value - coin::value(user_in)))
    }

    fun swap_exact_coin_for_coin<CoinIn, CoinOut>(sender: &signer, exact_in: u64, min_out: u64) {
        if (stable_2pool::pool_exists<CoinIn, CoinOut>()) {
            router_2pool::swap_exact_coin_for_coin<CoinIn, CoinOut>(sender, exact_in, 0, 1, min_out)
        } else if (stable_2pool::pool_exists<CoinOut, CoinIn>()){
            router_2pool::swap_exact_coin_for_coin<CoinOut, CoinIn>(sender, 0, exact_in, 0, min_out)
        } else {
            abort(ETEST_FAILED)
        }
    }

    fun coin_swap_exact_coin_for_coin<CoinIn, CoinOut>(sender: &signer, 
        user_in: &mut coin::Coin<CoinIn>,
        user_out:&mut coin::Coin<CoinOut>,
        au_in: u64,
        min_au_out: u64,
    ): (u64, u64) {
        let in_value = coin::value(user_in);
        let in = coin::extract(user_in, au_in);
        let out = coin::extract_all(user_out);
        if (stable_2pool::pool_exists<CoinIn, CoinOut>()) {
            let (in, out) = stable_2pool::swap_exact_coin_for_coin<CoinIn, CoinOut>(signer::address_of(sender), in, out, 1, min_au_out);
            coin::merge(user_in, in);
            coin::merge(user_out, out);
        } else if (stable_2pool::pool_exists<CoinOut, CoinIn>()){
            let (out, in) = stable_2pool::swap_exact_coin_for_coin<CoinOut, CoinIn>(signer::address_of(sender), out, in, 0, min_au_out);
            coin::merge(user_in, in);
            coin::merge(user_out, out);
        }  else {
            abort(ETEST_FAILED)
        };
        (coin::value(user_out), (in_value - coin::value(user_in)))
    }

    #[test_only]
    public fun setup_module_for_test(sender: &signer, aptos_framework: &signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        deployer::deployer::create_resource_account(sender, b"amm");
        authority::init_module_for_test(&deployer::deployer::get_signer_for_address(sender, @aux));
        fake_coin::initialize_for_test(&authority::get_signer(sender));
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    public fun test_create_pool(sender: &signer, aptos_framework: &signer) {
        let signer_addr = signer::address_of(sender);
        account::create_account_for_test(signer_addr);
        setup_module_for_test(sender, aptos_framework);
        let resource_account_addr = util::create_resource_account_addr(signer_addr, b"amm");
        assert!(resource_account_addr == @aux, ETEST_FAILED);

        aux::fake_coin::register<FakeCoin<USDC>>(sender);
        aux::fake_coin::register<FakeCoin<USDT>>(sender);
        create_pool<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 0, 85, 1, 1);
        assert!(exists<Pool<FakeCoin<USDC>, FakeCoin<USDT>>>(
            resource_account_addr), aptos_framework::error::not_found(ETEST_FAILED));
        // reverse pair should not exist
        assert!(!exists<Pool<FakeCoin<USDT>, FakeCoin<USDC>>>(
            resource_account_addr), aptos_framework::error::not_found(ETEST_FAILED));
        // other pairs should not exist
        assert!(!exists<Pool<FakeCoin<USDT>, FakeCoin<USDT>>>(
            resource_account_addr), aptos_framework::error::not_found(ETEST_FAILED));
        assert!(!exists<Pool<FakeCoin<USDC>, FakeCoin<USDC>>>(
            resource_account_addr), aptos_framework::error::not_found(ETEST_FAILED));
    }

    #[test_only]
    fun one_time_setup(sender: &signer, sender_init_x: u64, sender_init_y: u64, aptos_framework:&signer) {
        let sender_addr = signer::address_of(sender);
        if (!account::exists_at(sender_addr)) {
            account::create_account_for_test(sender_addr);
        };
        setup_module_for_test(sender, aptos_framework);
        assert!(signer::address_of(&authority::get_signer(sender)) == @aux, ETEST_FAILED);
        aux::fake_coin::register<USDC>(sender);
        aux::fake_coin::register<USDT>(sender);
        assert!(coin::is_account_registered<FakeCoin<USDC>>(sender_addr), ETEST_FAILED);
        assert!(coin::is_account_registered<FakeCoin<USDT>>(sender_addr), ETEST_FAILED);

        fake_coin::mint<USDC>(sender, sender_init_x);
        fake_coin::mint<USDT>(sender, sender_init_y);
    }

    #[test_only]
    fun setup_pool_for_test(sender: &signer, fee_bps: u64, sender_init_x: u64, sender_init_y: u64, current_A: u128, aptos_framework: &signer) {
        one_time_setup(sender, sender_init_x, sender_init_y, aptos_framework);
        create_pool<FakeCoin<USDC>, FakeCoin<USDT>>(sender, fee_bps, current_A, 1, 1);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    public fun test_add_initial_liquidity(sender: &signer, aptos_framework: &signer) {
        use aux::fake_coin::{init_module_for_testing, register_and_mint, BTC, FakeCoin};
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let sender_addr = signer::address_of(sender);
        if (!account::exists_at(sender_addr)) {
            account::create_account_for_test(sender_addr);
        };
        init_module_for_testing(sender);
        assert!(signer::address_of(&authority::get_signer(sender)) == @aux, ETEST_FAILED);
        aux::aux_coin::initialize_aux_coin(sender);

        util::maybe_register_coin<FakeCoin<USDC>>(sender);
        assert!(coin::is_account_registered<FakeCoin<USDC>>(sender_addr), ETEST_FAILED);

        fake_coin::mint<USDC>(sender, 1000000000);

        register_and_mint<BTC>(sender, 200000000);

        create_pool<FakeCoin<USDC>, FakeCoin<BTC>>(sender, 0, 85, 1, 1);

        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<BTC>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<BTC>>>(), 0);
            assert!(x_reserve == 0, ETEST_FAILED);
            assert!(y_reserve == 0, ETEST_FAILED);
            assert!(pool_lp_au == 0, ETEST_FAILED);
        };
        let _ = sender_addr;
        add_liquidity<FakeCoin<USDC>, FakeCoin<BTC>>(sender, 200000, 200000000);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    public fun test_add_liquidity(sender: &signer, aptos_framework: &signer) {

        let sender_addr = signer::address_of(sender);

        setup_pool_for_test(sender, 0, 10000, 10000, 85, aptos_framework);

        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 0, ETEST_FAILED);
            assert!(y_reserve == 0, ETEST_FAILED);
            assert!(pool_lp_au == 0, ETEST_FAILED);
        };
        let _ = sender_addr;
        add_liquidity<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 1000, 4000);
        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 1000, ETEST_FAILED);
            assert!(y_reserve == 4000, ETEST_FAILED);
            assert!(pool_lp_au == 499181, (pool_lp_au as u64));
        };
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == 9000, ETEST_FAILED);
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == 6000, ETEST_FAILED);
        assert!(router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr) == 499181,
                router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr));

        // adding same coin amounts doubles liquidity
        add_liquidity<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 1000, 4000);
        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 2000, ETEST_FAILED);
            assert!(y_reserve == 8000, ETEST_FAILED);
            assert!(pool_lp_au == 998362, (pool_lp_au as u64)); // 499181 * 2
        };
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == 8000, ETEST_FAILED);
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == 2000, ETEST_FAILED);
        assert!(router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr) == 998362,
                router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr));
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    public fun test_add_liquidity_small(sender: &signer, aptos_framework: &signer) {

        let sender_addr = signer::address_of(sender);

        setup_pool_for_test(sender, 0, 10000, 10000, 85, aptos_framework);

        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 0, ETEST_FAILED);
            assert!(y_reserve == 0, ETEST_FAILED);
            assert!(pool_lp_au == 0, ETEST_FAILED);
        };
        let _ = sender_addr;
        add_liquidity<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 1000, 1000);
        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 1000, ETEST_FAILED);
            assert!(y_reserve == 1000, ETEST_FAILED);
            assert!(pool_lp_au == 200000, (pool_lp_au as u64));
        };
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == 9000, ETEST_FAILED);
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == 9000, ETEST_FAILED);
        assert!(router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr) == 200000,
                router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr));
    }

    #[test(sender = @0x5e7c3, liquidity_provider = @0x12345, aptos_framework = @0x1)]
    fun test_reset_pool(sender: &signer, liquidity_provider: &signer, aptos_framework: &signer) {

        setup_pool_for_test(sender, 0, 10000, 10000, 85, aptos_framework);

        let lp_addr = signer::address_of(liquidity_provider);
        account::create_account_for_test(lp_addr);

        fake_coin::register_and_mint<USDC>(liquidity_provider, 10000);
        fake_coin::register_and_mint<USDT>(liquidity_provider, 10000);

        assert!(coin::is_account_registered<FakeCoin<USDC>>(lp_addr), ETEST_FAILED);
        assert!(coin::is_account_registered<FakeCoin<USDT>>(lp_addr), ETEST_FAILED);

        add_liquidity<FakeCoin<USDC>, FakeCoin<USDT>>(liquidity_provider, 1000, 4000);

        assert!(
            router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(lp_addr) == 499181,
            router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(lp_addr)
        );

        remove_liquidity<FakeCoin<USDC>, FakeCoin<USDT>>(liquidity_provider, 499181);

        reset_pool<FakeCoin<USDC>, FakeCoin<USDT>>(sender);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_first(sender: &signer, aptos_framework: &signer) {
        let sender_addr = signer::address_of(sender);

        setup_pool_for_test(sender, 0, 10000, 10000, 85, aptos_framework);

        add_liquidity<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 1000, 4000);

        // swap X for Y
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == 9000, ETEST_FAILED);
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == 6000, ETEST_FAILED);
        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            assert!(x_reserve == 1000, ETEST_FAILED);
            assert!(y_reserve == 4000, ETEST_FAILED);
        };
        let au_out = au_out<FakeCoin<USDC>, FakeCoin<USDT>>(2);
        assert!(au_out == 2, au_out);
        swap_exact_coin_for_coin<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 2, 2);
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == 8998, coin::balance<FakeCoin<USDC>>(sender_addr));
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == 6002, coin::balance<FakeCoin<USDT>>(sender_addr));
        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            assert!(x_reserve == 1002, x_reserve);
            assert!(y_reserve == 3998, y_reserve);
        };

        // test swap in the other direction: swap Y for X
        let au_out = au_out<FakeCoin<USDT>, FakeCoin<USDC>>(7);
        assert!(au_out == 6, au_out);
        swap_exact_coin_for_coin<FakeCoin<USDT>, FakeCoin<USDC>>(sender, 7, 6);
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == 9004, coin::balance<FakeCoin<USDC>>(sender_addr));
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == 5995, coin::balance<FakeCoin<USDT>>(sender_addr));
        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            assert!(x_reserve == 996, x_reserve);
            assert!(y_reserve == 4005, y_reserve);
        };
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_remove_liquidity(sender: &signer, aptos_framework: &signer) {
        let sender_addr = signer::address_of(sender);
        setup_pool_for_test(sender, 0, 10000, 10000, 85, aptos_framework);

        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 0, ETEST_FAILED);
            assert!(y_reserve == 0, ETEST_FAILED);
            assert!(pool_lp_au == 0, ETEST_FAILED);
        };
        add_liquidity<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 1000, 4000);
        assert!(router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr) == 499181,
                router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr));
        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 1000, ETEST_FAILED);
            assert!(y_reserve == 4000, ETEST_FAILED);
            assert!(pool_lp_au == 499181, (pool_lp_au as u64));
        };
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == 9000, ETEST_FAILED);
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == 6000, ETEST_FAILED);
        // remove all liquidity
        remove_liquidity<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 399100);
        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 201, x_reserve);
            assert!(y_reserve == 802, y_reserve);
            assert!(pool_lp_au == 100081, (pool_lp_au as u64));
        };
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == 9799, coin::balance<FakeCoin<USDC>>(sender_addr));
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == 9198, coin::balance<FakeCoin<USDT>>(sender_addr) );
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_and_remove_liquidity(sender: &signer, aptos_framework: &signer) {
        let sender_addr = signer::address_of(sender);
        setup_pool_for_test(sender, 0, 10000, 10000, 85, aptos_framework);

        add_liquidity<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 1000, 4000);
        assert!(router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr) == 499181,
                router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr));

        // unlike constant product, stable swap outputs less when pool is imbalanced
        swap_exact_coin_for_coin<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 2, 2);
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == 8998, coin::balance<FakeCoin<USDC>>(sender_addr));
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == 6002, coin::balance<FakeCoin<USDT>>(sender_addr));
        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 1002, x_reserve);
            assert!(y_reserve == 3998, y_reserve);
            assert!(pool_lp_au == 499181, (pool_lp_au as u64));
        };
        remove_liquidity<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 100000);
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == 9198, coin::balance<FakeCoin<USDC>>(sender_addr));
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == 6802, coin::balance<FakeCoin<USDT>>(sender_addr));
        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 802, x_reserve);
            assert!(y_reserve == 3198, y_reserve);
            assert!(pool_lp_au == 399181, (pool_lp_au as u64));
        };
    }

    // Test error cases
    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    #[expected_failure(abort_code = 1, location = aux::stable_2pool)]
    fun test_cannot_create_duplicate_pool(sender: &signer, aptos_framework: &signer) {
        let signer_addr = signer::address_of(sender);
        account::create_account_for_test(signer_addr);
        setup_module_for_test(sender, aptos_framework);
        aux::aux_coin::initialize_aux_coin(sender);
        aux::aux_coin::initialize_aux_test_coin(sender);

        create_pool<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 0, 85, 1, 1);
        create_pool<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 0, 85, 1, 1);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    #[expected_failure(abort_code = 1, location = aux::stable_2pool)]
    fun test_cannot_create_duplicate_reverse_pool(sender: &signer, aptos_framework: &signer) {
        let signer_addr = signer::address_of(sender);
        account::create_account_for_test(signer_addr);
        setup_module_for_test(sender, aptos_framework);
        aux::aux_coin::initialize_aux_coin(sender);
        aux::aux_coin::initialize_aux_test_coin(sender);

        create_pool<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 0, 85, 1, 1);
        create_pool<FakeCoin<USDT>, FakeCoin<USDC>>(sender, 0, 85, 1, 1);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    #[expected_failure]
    fun test_type_args_wrong_order(sender: &signer, aptos_framework: &signer) {
        setup_pool_for_test(sender, 0, 10000, 10000, 85, aptos_framework);

        // wrong order
        add_liquidity<FakeCoin<USDT>, FakeCoin<USDC>>(sender, 1, 10);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_add_liquidity_remove_liquidity(sender: &signer, aptos_framework: &signer) {

        let sender_addr = signer::address_of(sender);

        setup_pool_for_test(sender, 0, 10000, 10000, 85, aptos_framework);
        let aux_bal = coin::balance<FakeCoin<USDC>>(sender_addr);
        let test_bal = coin::balance<FakeCoin<USDT>>(sender_addr);

        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 0, ETEST_FAILED);
            assert!(y_reserve == 0, ETEST_FAILED);
            assert!(pool_lp_au == 0, ETEST_FAILED);
        };

        let _ = sender_addr;
        add_liquidity<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 1000, 4000);
        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 1000, ETEST_FAILED);
            assert!(y_reserve == 4000, ETEST_FAILED);
            assert!(pool_lp_au == 499181, (pool_lp_au as u64));
        };
        aux_bal = aux_bal - 1000;
        test_bal = test_bal - 4000;
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == aux_bal, ETEST_FAILED);
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == test_bal, ETEST_FAILED);
        assert!(router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr) == 499181,
                ETEST_FAILED);

        // Exact remove_liquidity.
        remove_liquidity<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 5000);
        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 990, x_reserve);
            assert!(y_reserve == 3960, y_reserve);
            assert!(pool_lp_au == 494181, (pool_lp_au as u64));
        };
        aux_bal = aux_bal + 10;
        test_bal = test_bal + 40;
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == aux_bal, coin::balance<FakeCoin<USDC>>(sender_addr));
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == test_bal, coin::balance<FakeCoin<USDT>>(sender_addr));
        assert!(router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr) == 494181,
                ETEST_FAILED);

        // Rounded remove_liquidity
        remove_liquidity<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 1700);
        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 987, x_reserve);
            assert!(y_reserve == 3947, y_reserve);
            assert!(pool_lp_au == 492481, (pool_lp_au as u64));
        };
        aux_bal = aux_bal + 3;
        test_bal = test_bal + 13;
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == aux_bal, ETEST_FAILED);
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == test_bal, ETEST_FAILED);
        assert!(router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr) == 492481,
                ETEST_FAILED);

        // Total remove_liquidity
        remove_liquidity<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 492481);
        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 0, x_reserve);
            assert!(y_reserve == 0, y_reserve);
            assert!(pool_lp_au == 0, 1);
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
    fun test_swap_helper<CoinX, CoinY, CoinIn, CoinOut>(
        sender: &signer,
        aptos_framework: &signer,
        input: &SwapHelperInput,
    ) {
        if (!account::exists_at(signer::address_of(sender))) {
            one_time_setup(sender, 200000000, 200000000, aptos_framework);
        };
        create_pool<CoinX, CoinY>(sender, input.fee_bps, 85, 1, 1);

        add_liquidity<CoinX, CoinY>(sender, input.init_x, input.init_y);

        let lp_tokens = option::get_with_default(&coin::supply<stable_2pool::LP<CoinX, CoinY>>(), 0);
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
            let pool = get_pool<CoinX, CoinY>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let x_fee = quoter_2pool::get_fee_0(&pool);
            let y_fee = quoter_2pool::get_fee_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<CoinX, CoinY>>(), 0);
            if (input.x_in_y_out) {
                assert!(x_reserve == input.init_x + actual_au_in, 1);
                assert!(y_reserve == input.init_y - actual_au_out - y_fee, 1);
            } else {
                assert!(x_reserve == input.init_x - actual_au_out - x_fee, 1);
                assert!(y_reserve == input.init_y + actual_au_in, 1);
            };
            assert!(pool_lp_au == lp_tokens, 1);
        };

        stable_2pool::delete_pool_in_test<CoinX, CoinY>();
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_exact_coin_for_coin_no_fee(sender: &signer, aptos_framework: &signer) {
        let input = SwapHelperInput {
            fee_bps: 0,
            exact_in: true,
            init_x: 10000,
            init_y: 20000,
            au_in: 1000,
            au_out: 1000,
            expected_au_in: 1000,
            expected_au_out: 1004,
            x_in_y_out: true,
            use_limit: false,
            limit_num: 0,
            limit_denom: 0
        };
        test_swap_helper<FakeCoin<USDC>, FakeCoin<USDT>, FakeCoin<USDC>, FakeCoin<USDT>>(sender, aptos_framework, &input);
        input.init_x = 20000;
        input.init_y = 10000;
        input.x_in_y_out = false;

        test_swap_helper<FakeCoin<USDT>, FakeCoin<USDC>, FakeCoin<USDC>, FakeCoin<USDT>>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_exact_coin_for_coin_with_fee(sender: &signer, aptos_framework: &signer) {
        // With Fee
        let input = SwapHelperInput {
            fee_bps: 30,
            exact_in: true,
            init_x: 10000,
            init_y: 20000,
            au_in: 1000,
            au_out: 1000,
            expected_au_in: 1000,
            expected_au_out: 1000,
            x_in_y_out: true,
            use_limit: false,
            limit_num: 0,
            limit_denom: 0
        };
        test_swap_helper<FakeCoin<USDC>, FakeCoin<USDT>, FakeCoin<USDC>, FakeCoin<USDT>>(sender, aptos_framework, &input);
        input.init_x = 20000;
        input.init_y = 10000;
        input.x_in_y_out = false;

        test_swap_helper<FakeCoin<USDT>, FakeCoin<USDC>, FakeCoin<USDC>, FakeCoin<USDT>>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_coin_for_exact_coin_no_fee(sender: &signer, aptos_framework: &signer) {
        // X in Y out
        let input = SwapHelperInput {
            fee_bps: 0,
            exact_in: false,
            init_x: 10000,
            init_y: 20000,
            au_in: 1812,
            au_out: 1818,
            expected_au_in: 1812,
            expected_au_out: 1818,
            x_in_y_out: true,
            use_limit: false,
            limit_num: 0,
            limit_denom: 0
        };
        test_swap_helper<FakeCoin<USDC>, FakeCoin<USDT>, FakeCoin<USDC>, FakeCoin<USDT>>(sender, aptos_framework, &input);

        // Y in X out
        input.init_x = 20000;
        input.init_y = 10000;
        input.x_in_y_out = false;
        test_swap_helper<FakeCoin<USDT>, FakeCoin<USDC>, FakeCoin<USDC>, FakeCoin<USDT>>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_x_for_exact_y_no_fee_check_rounding(sender: &signer, aptos_framework: &signer) {
        let input = SwapHelperInput {
            fee_bps: 0,
            exact_in: false,
            init_x: 2000000,
            init_y: 200000000,
            au_in: 87960061,
            au_out: 100000000,
            expected_au_in: 87960061,
            expected_au_out: 100000000,
            x_in_y_out: true,
            use_limit: false,
            limit_num: 0,
            limit_denom: 0
        };
        test_swap_helper<FakeCoin<USDC>, FakeCoin<USDT>, FakeCoin<USDC>, FakeCoin<USDT>>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_coin_for_exact_coin_with_fee(sender: &signer, aptos_framework: &signer) {
        // X in Y out
        let input = SwapHelperInput {
            fee_bps: 30,
            exact_in: false,
            init_x: 10000,
            init_y: 20000,
            au_in: 1813,
            au_out: 1813,
            expected_au_in: 1813,
            expected_au_out: 1813,
            // final_x: 11000,
            // final_y: 18187
            x_in_y_out: true,
            use_limit: false,
            limit_num: 0,
            limit_denom: 0
        };
        test_swap_helper<FakeCoin<USDC>, FakeCoin<USDT>, FakeCoin<USDC>, FakeCoin<USDT>>(sender, aptos_framework, &input);

        // Y in X out
        input.init_x = 20000;
        input.init_y = 10000;
        input.x_in_y_out = false;
        test_swap_helper<FakeCoin<USDT>, FakeCoin<USDC>, FakeCoin<USDC>, FakeCoin<USDT>>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_exact_coin_for_coin_with_min_no_fee(sender: &signer, aptos_framework: &signer) {
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
        test_swap_helper<FakeCoin<USDC>, FakeCoin<USDT>, FakeCoin<USDC>, FakeCoin<USDT>>(sender, aptos_framework, &input);
        input.x_in_y_out = false;
        test_swap_helper<FakeCoin<USDT>, FakeCoin<USDC>, FakeCoin<USDC>, FakeCoin<USDT>>(sender, aptos_framework, &input);
    }

    #[expected_failure]
    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    fun test_swap_exact_coin_for_coin_binding_constraint_no_fee(sender: &signer, aptos_framework: &signer) {
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
        test_swap_helper<FakeCoin<USDC>, FakeCoin<USDT>, FakeCoin<USDC>, FakeCoin<USDT>>(sender, aptos_framework, &input);
        input.x_in_y_out = false;
        test_swap_helper<FakeCoin<USDT>, FakeCoin<USDC>, FakeCoin<USDC>, FakeCoin<USDT>>(sender, aptos_framework, &input);
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    public fun test_add_liquidity_with_slippage_tolerance(
        sender: &signer,
        aptos_framework: &signer
    ) {

        let sender_addr = signer::address_of(sender);
        setup_pool_for_test(sender, 0, 10000, 10000, 85, aptos_framework);

        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 0, ETEST_FAILED);
            assert!(y_reserve == 0, ETEST_FAILED);
            assert!(pool_lp_au == 0, ETEST_FAILED);
        };

        let _ = sender_addr;
        add_liquidity<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 1000, 4001);
        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 1000, ETEST_FAILED);
            assert!(y_reserve == 4001, ETEST_FAILED);
            assert!(pool_lp_au == 499281, (pool_lp_au as u64));
        };
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == 9000, ETEST_FAILED);
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == 5999, ETEST_FAILED);
        assert!(router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr) == 499281,
                router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr) );

        add_liquidity<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 1000, 4000);
        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 2000, x_reserve);
            assert!(y_reserve == 8001, y_reserve);
            assert!(pool_lp_au == 998462, (pool_lp_au as u64));
        };

        let sender_x = coin::balance<FakeCoin<USDC>>(sender_addr);
        let sender_y = coin::balance<FakeCoin<USDT>>(sender_addr);
        let sender_lp = router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr);
        assert!(sender_x == 8000, sender_x);
        assert!(sender_y == 1999, sender_y);
        assert!(sender_lp == 998462, sender_lp);
    }


    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    public fun test_stable_curve_frax(
        sender: &signer,
        aptos_framework: &signer
    ) {
        // emulate https://curve.fi/fraxusdc
        let decimal = 1000000;
        let sender_addr = signer::address_of(sender);
        setup_pool_for_test(sender, 4, 10000000 * decimal, 10000000 * decimal, 1500, aptos_framework);

        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 0, ETEST_FAILED);
            assert!(y_reserve == 0, ETEST_FAILED);
            assert!(pool_lp_au == 0, ETEST_FAILED);
        };

        let _ = sender_addr;
        add_liquidity<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 2000000 * decimal, 4000000 * decimal);
        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 2000000000000, x_reserve);
            assert!(y_reserve == 4000000000000, y_reserve);
            assert!(pool_lp_au == 599987504945812, (pool_lp_au as u64));
        };
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == 8000000000000, coin::balance<FakeCoin<USDC>>(sender_addr));
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == 6000000000000, coin::balance<FakeCoin<USDT>>(sender_addr));
        assert!(router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr) == 599987504945812,
                router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr) );

        swap_exact_coin_for_coin<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 1000 * decimal, 0);

        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == 7999000 * decimal, coin::balance<FakeCoin<USDC>>(sender_addr));
        // 1000 -> 999.88
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == 6000999880989, coin::balance<FakeCoin<USDT>>(sender_addr));

        swap_exact_coin_for_coin<FakeCoin<USDT>, FakeCoin<USDC>>(sender, 1000 * decimal, 0);

        // 1000 -> 999.32
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == 7999999319408, coin::balance<FakeCoin<USDC>>(sender_addr));
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == 5999999880989, coin::balance<FakeCoin<USDT>>(sender_addr));
    }

    #[test(sender = @0x5e7c3, aptos_framework = @0x1)]
    public fun test_stable_curve_steth(
        sender: &signer,
        aptos_framework: &signer,
    ) {
        // emulate https://curve.fi/steth
        let decimal = 100000000;
        let sender_addr = signer::address_of(sender);
        setup_pool_for_test(sender, 4, 10 * decimal, 10 * decimal, 50, aptos_framework);

        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 0, ETEST_FAILED);
            assert!(y_reserve == 0, ETEST_FAILED);
            assert!(pool_lp_au == 0, ETEST_FAILED);
        };

        let _ = sender_addr;
        add_liquidity<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 5 * decimal, 7 * decimal);
        {
            let pool = get_pool<FakeCoin<USDC>, FakeCoin<USDT>>();
            let x_reserve = quoter_2pool::get_reserve_0(&pool);
            let y_reserve = quoter_2pool::get_reserve_1(&pool);
            let pool_lp_au = option::get_with_default(&coin::supply<stable_2pool::LP<FakeCoin<USDC>, FakeCoin<USDT>>>(), 0);
            assert!(x_reserve == 500000000, x_reserve);
            assert!(y_reserve ==  700000000, y_reserve);
            assert!(pool_lp_au == 119983034036, (pool_lp_au as u64));
        };
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == 500000000, coin::balance<FakeCoin<USDC>>(sender_addr));
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == 300000000, coin::balance<FakeCoin<USDT>>(sender_addr));
        assert!(router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr) == 119983034036,
                router_2pool::balance<FakeCoin<USDC>, FakeCoin<USDT>>(sender_addr));

        swap_exact_coin_for_coin<FakeCoin<USDC>, FakeCoin<USDT>>(sender, 1 * decimal / 100000, 0);

        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == 499999000, coin::balance<FakeCoin<USDC>>(sender_addr));
        // 1 -> 1.003
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == 300001002, coin::balance<FakeCoin<USDT>>(sender_addr));

        swap_exact_coin_for_coin<FakeCoin<USDT>, FakeCoin<USDC>>(sender, 1 * decimal / 100000, 0);

        // 1 -> 0.996
        assert!(coin::balance<FakeCoin<USDC>>(sender_addr) == 499999995, coin::balance<FakeCoin<USDC>>(sender_addr));
        assert!(coin::balance<FakeCoin<USDT>>(sender_addr) == 300000002, coin::balance<FakeCoin<USDT>>(sender_addr));
    }
}
