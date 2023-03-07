/// TODO: optionally use sender's vault account
module aux::router {
    use aux::amm;
    use aux::clob_market;
    use aux::util;
    use aux::fee;

    use aptos_framework::coin;
    use std::signer;

    const MAX_U64: u64 = 18446744073709551615;
    const CRITBIT_NULL_INDEX: u64 = 1 << 63;


    const E_UNSUPPORTED: u64 = 1;
    const E_INVALID_MIN_OUT: u64 = 2;
    const E_INTERNAL_ERROR: u64 = 3;
    const E_TEST_FAILED: u64 = 4;
    const E_MISSING_AUX_USER_ACCOUNT: u64 = 5;
    const E_VOLUME_TRACKER_UNREGISTERED: u64 = 6;


    //////////////////////////////////////////////////////////////////
    // !!! CONSTANTS !!! Keep in sync clob.move, clob_market.move, router.move
    // Order type

    // Place an order in the order book. The portion of the order that matches
    // against passive orders on the opposite side of the book becomes
    // aggressive. The remainder is passive.
    const LIMIT_ORDER: u64 = 100;

    // Place an aggressive order. If the entire order cannot fill immediately,
    // cancel the entire order.
    const FILL_OR_KILL: u64 = 101;

    // Place an aggressive order. The portion of the order that does not fill
    // immediately is cancelled.
    const IMMEDIATE_OR_CANCEL: u64 = 102;

    // Place a passive order. If the order would be aggressive, optionally slide
    // it to become passive. Otherwise, cancel the order.
    const POST_ONLY: u64 = 103;

    // Join the best bid or best ask level. Optionally place the order more or
    // less aggressive than the best bid or ask up to the limit price.
    const PASSIVE_JOIN: u64 = 104;

    // Self-trading prevention (STP) action type
    // This order agrees on the specification that when a self-trading occur, cancel the passive one (the maker order)

    // Cancel passive side
    const CANCEL_PASSIVE: u64 = 200;
    // Cancel aggressive side
    const CANCEL_AGGRESSIVE: u64 = 201;
    // Cancel both sides
    const CANCEL_BOTH: u64 = 202;

    // Order Event Types
    const ORDER_FILL_EVENT: u64 = 1;
    const ORDER_CANCEL_EVENT: u64 = 2;
    const ORDER_PLACED_EVENT: u64 = 3;

    // end !!! CONSTANTS !!! Keep in sync clob.move, clob_market.move, router.move
    //////////////////////////////////////////////////////////////////

    /*******************/
    /* ENTRY FUNCTIONS */
    /*******************/

    /// USER -> CoinIn -> POOL -> CoinOut -> USER
    public entry fun swap_exact_coin_for_coin_with_signer<CoinIn, CoinOut>(
        sender: &signer, // delegatee, see place_order in clob_market for more comments
        au_in: u64,
        min_au_out: u64,
    ) {
        let coin_in = coin::withdraw<CoinIn>(sender, au_in);
        let coin_out = coin::zero();
        let sender_addr = signer::address_of(sender);
        if (!fee::fee_exists(sender_addr)) {
            fee::initialize_fee_default(sender);
        };
        let (coin_out, coin_in) = swap_exact_coin_for_coin<CoinIn, CoinOut>(
            sender_addr,
            coin_in,
            coin_out,
            au_in,
            min_au_out
        );
        coin::deposit<CoinOut>(sender_addr, coin_out);
        coin::deposit<CoinIn>(sender_addr, coin_in);
    }

    /// USER -> CoinIn -> POOL -> CoinOut -> USER
    public entry fun swap_coin_for_exact_coin_with_signer<CoinIn, CoinOut>(
        sender: &signer,
        max_au_in: u64,
        au_out: u64,
    ) {
        let coin_out = coin::zero();
        let coin_in = coin::withdraw<CoinIn>(sender, max_au_in);
        let sender_addr = signer::address_of(sender);
        if (!fee::fee_exists(sender_addr)) {
            fee::initialize_fee_default(sender);
        };
        let (coin_out, coin_in) = swap_coin_for_exact_coin<CoinIn, CoinOut>(
            sender_addr,
            coin_in,
            coin_out,
            max_au_in,
            au_out
        );
        coin::deposit<CoinIn>(sender_addr, coin_in);
        coin::deposit<CoinOut>(sender_addr, coin_out);
    }

    /********************/
    /* PUBLIC FUNCTIONS */
    /********************/

    public fun swap_exact_coin_for_coin<CoinIn, CoinOut>(
        sender_addr: address, // delegatee, see place_order in clob_market for more comments
        coin_in: coin::Coin<CoinIn>,
        coin_out: coin::Coin<CoinOut>,
        au_in: u64,
        min_au_out: u64,
    ): (coin::Coin<CoinOut>, coin::Coin<CoinIn>) {
        let taker_fee_bps = fee::default_taker_fee_bps();

        // check if pool/market exists
        let pool_exists = amm::pool_exists<CoinIn, CoinOut>() || amm::pool_exists<CoinOut, CoinIn>();
        // Bid: swap Quote (CoinIn), for Base (CoinOut)
        let market_exists_quote_in_base_out = clob_market::market_exists<CoinOut, CoinIn>();
        // Ask: swap Base (CoinIn), for Quote (CoinOut)
        let market_exists_base_in_quote_out = clob_market::market_exists<CoinIn, CoinOut>();

        // There is a pool and a market
        if (pool_exists && market_exists_base_in_quote_out) {
            // Pool<CoinIn, CoinOut> && Market<CoinIn, CoinOut>

            let lot_size = clob_market::lot_size<CoinIn, CoinOut>();
            // let base_decimals = coin::decimals<CoinIn>();
            let base_unit_au = util::exp(10, (coin::decimals<CoinIn>() as u128));

            let total_input_spent_au = 0;
            let total_output_received_au = 0;

            while (total_input_spent_au < au_in) {
                // user is selling base to receive quote (ASK)

                // if there are no bids, or the remaining quantity is < 1 lot, execute the rest through the pool
                if (clob_market::n_bid_levels<CoinIn, CoinOut>() == 0 || au_in - total_input_spent_au < lot_size) {
                    let (coin_received_au, coin_spent_au) = amm::swap_exact_coin_for_coin_mut<CoinIn, CoinOut>(
                        sender_addr,
                        &mut coin_in,
                        &mut coin_out,
                        au_in - total_input_spent_au,
                        0,
                        false,
                        0,
                        0
                    );
                    total_input_spent_au = total_input_spent_au + coin_spent_au;
                    total_output_received_au = total_output_received_au + coin_received_au;
                    break
                };
                // best price on orderbook is top of bids (most someone is willing to pay in Y (quote) for 1 unit of X (base))
                let best_bid_price_au = clob_market::best_bid_au<CoinIn, CoinOut>();
                let best_bid_less_fee = (best_bid_price_au as u128) * (10000 - (taker_fee_bps as u128)) / 10000;
                let (y_received_au, x_spent_au) = amm::swap_exact_coin_for_coin_mut<CoinIn, CoinOut>(
                    sender_addr,
                    &mut coin_in,
                    &mut coin_out,
                    au_in - total_input_spent_au,
                    0,
                    true,
                    (best_bid_less_fee as u128),
                    base_unit_au,
                );

                total_input_spent_au = total_input_spent_au + x_spent_au;
                total_output_received_au = total_output_received_au + y_received_au;

                if (total_input_spent_au < au_in) {
                    let (base_spent_au, quote_received_au) = clob_market::place_market_order_mut<CoinIn, CoinOut>(
                        sender_addr,
                        &mut coin_in,
                        &mut coin_out,
                        false,
                        IMMEDIATE_OR_CANCEL,
                        (best_bid_price_au as u64),
                        au_in - total_input_spent_au,
                        0
                    );
                    total_input_spent_au = total_input_spent_au + (base_spent_au as u64);
                    total_output_received_au = total_output_received_au + (quote_received_au as u64);
                }
            };
            assert!(total_input_spent_au == au_in, E_INTERNAL_ERROR);
            assert!(total_output_received_au >= min_au_out, E_INVALID_MIN_OUT);
        } else if (pool_exists && market_exists_quote_in_base_out) {
            // Pool<CoinIn, CoinOut> && Market<CoinOut, CoinIn>

            let lot_size = clob_market::lot_size<CoinOut, CoinIn>();
            let base_unit_au = util::exp(10, (coin::decimals<CoinOut>() as u128));

            let total_input_spent_au = 0;
            let total_output_received_au= 0;
            while (total_input_spent_au < au_in) {
                // user is spending quote to receive base (BID)

                // if there are no asks, execute the rest through the pool
                if (clob_market::n_ask_levels<CoinOut, CoinIn>() == 0) {

                    let (coin_received_au, coin_spent_au) = amm::swap_exact_coin_for_coin_mut(
                        sender_addr,
                        &mut coin_in,
                        &mut coin_out,
                        au_in - total_input_spent_au,
                        0,
                        false,
                        0,
                        0,
                    );

                    total_input_spent_au = total_input_spent_au + coin_spent_au;
                    total_output_received_au = total_output_received_au + coin_received_au;
                    break
                };
                // best price on orderbook is top of asks (least amount of X (quote) someone is willing sell 1 unit of Y (base) for)
                let best_ask_price_au = clob_market::best_ask_au<CoinOut, CoinIn>();
                let best_ask_plus_fee = (best_ask_price_au as u128) * (10000 + (taker_fee_bps as u128)) / 10000;

                // if we can't purchase at least one lot, execute the rest through the pool
                let base_au_for_level = (((au_in - total_input_spent_au) as u128) * (base_unit_au as u128) / (best_ask_plus_fee as u128) as u64) ;  // how many au of base can we buy at the best ask with our remaining quote?
                if (base_au_for_level < lot_size) {
                    let (coin_received_au, coin_spent_au) = amm::swap_exact_coin_for_coin_mut(
                        sender_addr,
                        &mut coin_in,
                        &mut coin_out,
                        au_in - total_input_spent_au,
                        0,
                        false,
                        0,
                        0,
                    );

                    total_input_spent_au = total_input_spent_au + coin_spent_au;
                    total_output_received_au = total_output_received_au + coin_received_au;
                    break
                };

                let (y_received_au, x_spent_au) = amm::swap_exact_coin_for_coin_mut(
                        sender_addr,
                        &mut coin_in,
                        &mut coin_out,
                        au_in - total_input_spent_au,
                        0,
                        true,
                        base_unit_au,
                        (best_ask_plus_fee as u128)
                );

                total_input_spent_au = total_input_spent_au + x_spent_au;
                total_output_received_au = total_output_received_au + y_received_au;

                if (total_input_spent_au < au_in) {
                    // remaining input coin is max_quote_qty
                    let base_au_for_level = (((au_in - total_input_spent_au) as u128) * (base_unit_au as u128) / (best_ask_plus_fee as u128) as u64);  // how many au of base can we buy at the best ask with our remaining quote?
                    let (base_received_au, quote_spent_au) = clob_market::place_market_order_mut<CoinOut, CoinIn>(
                        sender_addr,
                        &mut coin_out,
                        &mut coin_in,
                        true,
                        IMMEDIATE_OR_CANCEL,
                        (best_ask_price_au as u64),
                        base_au_for_level,
                        0
                    );
                    assert!((base_received_au as u64) <= base_au_for_level, 0x1111);
                    assert!((quote_spent_au as u64) <= (au_in - total_input_spent_au), 0x2222);
                    total_input_spent_au = total_input_spent_au + (quote_spent_au as u64);
                    total_output_received_au = total_output_received_au + (base_received_au as u64);
                }
            };
            assert!(total_input_spent_au == au_in, E_INTERNAL_ERROR);
            assert!(total_output_received_au >= min_au_out, E_INVALID_MIN_OUT);
        } else if (pool_exists) {
            let (coin_received, coin_spent) = amm::swap_exact_coin_for_coin_mut(
                sender_addr,
                &mut coin_in,
                &mut coin_out,
                au_in,
                min_au_out,
                false,
                0,
                0,
            );
            assert!((coin_spent as u64) == au_in, E_INTERNAL_ERROR);
            assert!((coin_received as u64) >= min_au_out, E_INVALID_MIN_OUT);
        } else if (market_exists_base_in_quote_out) {
            let (base_spent_au, quote_received_au) = clob_market::place_market_order_mut<CoinIn, CoinOut>(
                sender_addr,
                &mut coin_in,
                &mut coin_out,
                false,
                IMMEDIATE_OR_CANCEL,
                0,
                au_in,
                0
            );
            // Cannot guarantee exact AU in due to lot sizes
            assert!((base_spent_au as u64) <= au_in, E_INTERNAL_ERROR);
            assert!((quote_received_au as u64) >= min_au_out, E_INVALID_MIN_OUT);
        } else {
            abort(E_UNSUPPORTED)
        };
        (coin_out, coin_in)
    }

    public fun swap_coin_for_exact_coin<CoinIn, CoinOut>(
        sender_addr: address,
        coin_in: coin::Coin<CoinIn>,
        coin_out: coin::Coin<CoinOut>,
        max_au_in: u64,
        au_out: u64,
    ): (coin::Coin<CoinOut>, coin::Coin<CoinIn>) {
        let taker_fee_bps = fee::default_taker_fee_bps();
        // check if pool/market exists
        let pool_exists = amm::pool_exists<CoinIn, CoinOut>() || amm::pool_exists<CoinOut, CoinIn>();
        // Bid: swap Quote (CoinIn), for Base (CoinOut)
        let market_exists_quote_in_base_out = clob_market::market_exists<CoinOut, CoinIn>();
        // Ask: swap Base (CoinIn), for Quote (CoinOut)
        let market_exists_base_in_quote_out = clob_market::market_exists<CoinIn, CoinOut>();

        // There is a pool and a market
        if (pool_exists && market_exists_base_in_quote_out) {
            // Pool<CoinIn, CoinOut> && Market<CoinIn, CoinOut>

            let lot_size = clob_market::lot_size<CoinIn, CoinOut>();
            let base_unit_au = util::exp(10, (coin::decimals<CoinIn>() as u128));

            let total_input_spent_au = 0;
            let total_output_received_au = 0;
            while (total_output_received_au < au_out && total_input_spent_au < max_au_in) {
                // user is selling base to receive exact quote (ASK)

                // if there are no bids, execute the rest through the pool
                if (clob_market::n_bid_levels<CoinIn, CoinOut>() == 0) {
                    let (coin_received_au, coin_spent_au) = amm::swap_coin_for_exact_coin_mut<CoinIn, CoinOut>(
                        sender_addr,
                        &mut coin_in,
                        &mut coin_out,
                        max_au_in - total_input_spent_au,
                        au_out - total_output_received_au,
                        false,
                        0,
                        0
                    );
                    // coin::deposit<CoinIn>(sender_addr, coin_in);
                    total_input_spent_au = total_input_spent_au + coin_spent_au;
                    total_output_received_au = total_output_received_au + coin_received_au;
                    break
                };
                // best price on orderbook is top of bids (most someone is willing to pay in Y (quote) for 1 unit of X (base))
                let best_bid_price_au = clob_market::best_bid_au<CoinIn, CoinOut>();
                let best_bid_less_fee = (best_bid_price_au as u128) * (10000 - (taker_fee_bps as u128)) / 10000;
                let base_au_for_level = (((au_out - total_output_received_au) as u128) * (base_unit_au as u128) / (best_bid_less_fee as u128) as u64);  // how many au of base can we buy at the best ask with our remaining quote?
                if (base_au_for_level < lot_size) {
                    let (coin_received_au, coin_spent_au) = amm::swap_coin_for_exact_coin_mut<CoinIn, CoinOut>(
                        sender_addr,
                        &mut coin_in,
                        &mut coin_out,
                        max_au_in - total_input_spent_au,
                        au_out - total_output_received_au,
                        false,
                        0,
                        0
                    );
                    // coin::deposit<CoinIn>(sender_addr, coin_in);
                    total_input_spent_au = total_input_spent_au + coin_spent_au;
                    total_output_received_au = total_output_received_au + coin_received_au;
                    break
                };

                let (coin_received_au, coin_spent_au) = amm::swap_coin_for_exact_coin_mut<CoinIn, CoinOut>(
                    sender_addr,
                    &mut coin_in,
                    &mut coin_out,
                    max_au_in - total_input_spent_au,
                    au_out - total_output_received_au,
                    true,
                    base_unit_au,
                    (best_bid_less_fee as u128)
                );
                // coin::deposit<CoinIn>(sender_addr, coin_in);

                total_input_spent_au = total_input_spent_au + coin_spent_au;
                total_output_received_au = total_output_received_au + coin_received_au;

                if (total_output_received_au < au_out && total_input_spent_au < max_au_in) {
                    let base_au_for_level = (((au_out - total_output_received_au) as u128) * (base_unit_au as u128) / (best_bid_less_fee as u128) as u64);  // how many au of base can we buy at the best ask with our remaining quote?
                    let (base_spent_au, quote_received_au) = clob_market::place_market_order_mut<CoinIn, CoinOut>(
                        sender_addr,
                        &mut coin_in,
                        &mut coin_out,
                        false,
                        IMMEDIATE_OR_CANCEL,
                        (best_bid_price_au as u64),
                        base_au_for_level,
                        0
                    );
                    total_input_spent_au = total_input_spent_au + (base_spent_au as u64);
                    total_output_received_au = total_output_received_au + (quote_received_au as u64);
                }
            };
            assert!(total_input_spent_au <= max_au_in, E_INTERNAL_ERROR);
            assert!(total_output_received_au == au_out, E_INVALID_MIN_OUT);
        } else if (pool_exists && market_exists_quote_in_base_out) {
            // Pool<CoinIn, CoinOut> && Market<CoinOut, CoinIn>
            let lot_size = clob_market::lot_size<CoinOut, CoinIn>();
            // let base_decimals = coin::decimals<CoinIn>();
            let base_unit_au = util::exp(10, (coin::decimals<CoinOut>() as u128));

            let total_input_spent_au = 0;
            let total_output_received_au = 0;
            while (total_output_received_au < au_out && total_input_spent_au < max_au_in) {
                // user is spending max quote to receive exact base (BID)

                // if there are no asks, or the remaining quantity is < 1 lot, execute the rest through the pool
                if (clob_market::n_ask_levels<CoinOut, CoinIn>() == 0 || au_out - total_output_received_au < lot_size) {
                    let (coin_received_au, coin_spent_au) = amm::swap_coin_for_exact_coin_mut<CoinIn, CoinOut>(
                        sender_addr,
                        &mut coin_in,
                        &mut coin_out,
                        max_au_in - total_input_spent_au,
                        au_out - total_output_received_au,
                        false,
                        0,
                        0
                    );
                    // coin::deposit<CoinIn>(sender_addr, coin_in);
                    total_input_spent_au = total_input_spent_au + coin_spent_au;
                    total_output_received_au = total_output_received_au + coin_received_au;
                    break
                };
                // best price on orderbook is top of asks (least amount of X (quote) someone is willing sell 1 unit of Y (base) for)
                let best_ask_price_au = clob_market::best_ask_au<CoinOut, CoinIn>();
                let best_ask_plus_fee = (best_ask_price_au as u128) * (10000 + (taker_fee_bps as u128)) / 10000;
                let (y_received_au, x_spent_au) = amm::swap_coin_for_exact_coin_mut<CoinIn, CoinOut>(
                    sender_addr,
                    &mut coin_in,
                    &mut coin_out,
                    max_au_in - total_input_spent_au,
                    au_out - total_output_received_au,
                    true,
                    (best_ask_plus_fee as u128),
                    base_unit_au,
                );
                total_input_spent_au = total_input_spent_au + x_spent_au;
                total_output_received_au = total_output_received_au + y_received_au;

                if (total_output_received_au < au_out && total_input_spent_au < max_au_in) {
                    // remaining input coin is max_quote_qty
                    let (base_received_au, quote_spent_au) = clob_market::place_market_order_mut<CoinOut, CoinIn>(
                        sender_addr,
                        &mut coin_out,
                        &mut coin_in,
                        true,
                        IMMEDIATE_OR_CANCEL,
                        (best_ask_price_au as u64),
                        au_out - total_output_received_au,
                        0
                    );
                    total_input_spent_au = total_input_spent_au + (quote_spent_au as u64);
                    total_output_received_au = total_output_received_au + (base_received_au as u64);
                }
            };
            assert!(total_input_spent_au <= max_au_in, E_INTERNAL_ERROR);
            assert!(total_output_received_au == au_out, E_INVALID_MIN_OUT);

        } else if (pool_exists) {
            amm::swap_coin_for_exact_coin_mut<CoinIn, CoinOut>(
                sender_addr,
                &mut coin_in,
                &mut coin_out,
                max_au_in,
                au_out,
                false,
                0,
                0
            );
        } else if (market_exists_quote_in_base_out) {
            std::debug::print<u64>(&6666);
            // limit price = quote_au * 1ebase_decimals / base_au
            let limit_price = ((max_au_in as u128) * util::exp(10, (coin::decimals<CoinOut>() as u128)) / (au_out as u128) as u64);
            std::debug::print<u64>(&limit_price);
            // BUY
            let (base_received_au, quote_spent_au) = clob_market::place_market_order_mut<CoinOut, CoinIn>(
                sender_addr,
                &mut coin_out,
                &mut coin_in,
                true,
                IMMEDIATE_OR_CANCEL,
                MAX_U64,
                au_out,
                0
            );
            // Can't guarantee exact AU out due to lot sizes
            assert!((base_received_au as u64) <= au_out, E_INTERNAL_ERROR);
            assert!((quote_spent_au as u64) <= max_au_in, E_INVALID_MIN_OUT);
        } else {
            abort(E_UNSUPPORTED)
        };
        (coin_out, coin_in)
    }


    /*********/
    /* TESTS */
    /*********/

    #[test_only]
    use aptos_framework::account;
    #[test_only]
    use aptos_framework::timestamp;
    #[test_only]
    use aux::authority;
    #[test_only]
    use aux::vault;

    #[test_only]
    struct USDC has key {}
    #[test_only]
    struct BTC has key {}

    #[test_only]
    fun setup_for_test<X, Y, B, Q>(
        sender: &signer,
        aux: &signer,
        alice: &signer,
        bob: &signer,
        aptos_framework: &signer,
        base_decimals: u8,
        quote_decimals: u8,
        lot_size: u64,
        tick_size: u64,
        pool_exists: bool,
        market_exists: bool
    ) {
        use aux::util;

        amm::setup_module_for_test(sender);

        if (market_exists) {
            clob_market::setup_for_test<B, Q>(sender, aux, alice, bob, aptos_framework, base_decimals, quote_decimals, lot_size, tick_size);
        } else {
            // create test accounts
            let alice_addr = signer::address_of(alice);
            let bob_addr = signer::address_of(bob);

            util::init_coin_for_test<B>(aux, base_decimals);
            util::init_coin_for_test<Q>(aux, quote_decimals);

            account::create_account_for_test(alice_addr);
            account::create_account_for_test(bob_addr);
            coin::register<Q>(alice);
            coin::register<B>(alice);
            coin::register<Q>(bob);
            coin::register<B>(bob);
            timestamp::set_time_has_started_for_testing(aptos_framework);

        };

        assert!(signer::address_of(&authority::get_signer(sender)) == @aux, E_TEST_FAILED);

        // TODO: test with fees
        if (pool_exists) {
            amm::create_pool<X, Y>(sender, 0);
        };

        let sender_addr = signer::address_of(sender);

        aptos_framework::account::create_account_for_test(sender_addr);

        util::maybe_register_coin<X>(sender);
        util::maybe_register_coin<Y>(sender);
        assert!(coin::is_account_registered<X>(sender_addr), E_TEST_FAILED);
        assert!(coin::is_account_registered<Y>(sender_addr), E_TEST_FAILED);

        util::mint_coin_for_test<X>(&authority::get_signer(sender), signer::address_of(alice), 50000000000);
        util::mint_coin_for_test<Y>(&authority::get_signer(sender), signer::address_of(alice), 50000000000);
        util::mint_coin_for_test<X>(&authority::get_signer(sender), signer::address_of(bob), 50000000000);
        util::mint_coin_for_test<Y>(&authority::get_signer(sender), signer::address_of(bob), 50000000000);

        util::mint_coin_for_test<X>(&authority::get_signer(sender), sender_addr, 50000000000);
        util::mint_coin_for_test<Y>(&authority::get_signer(sender), sender_addr, 50000000000);
    }

    /*==========*/
    /* Exact In */
    /*==========*/

    #[test(sender = @0x5e7c3, aux = @aux, alice = @0x123, bob = @0x456, aptos_framework = @0x1)]
    fun test_pool_and_exact_base_in_quote_out_market(
        sender: &signer,
        alice: &signer,
        bob: &signer,
        aux: &signer,
        aptos_framework: &signer
    ) {
        // Base: decimals = 8, lot size = 1e4
        // Quote: decimals = 6, tick size = 1e4

        // Create Pool
        // Create Market

        // X = Base = BTC
        // Y = Quote = USDC
        let base_decimals = 8;
        let quote_decimals = 6;
        let lot_size = 10000;
        let tick_size = 10000;
        setup_for_test<BTC, USDC, BTC, USDC>(
            sender,
            aux,
            alice,
            bob,
            aptos_framework,
            base_decimals,
            quote_decimals,
            lot_size,
            tick_size,
            true,
            true);

        let sender_addr = signer::address_of(sender);

        // Pool balances are base: 1e8 (1.00), quote: 22600e6 (22,600.00), so gives
        let amm_initial_usdc = 22600000000;
        amm::add_exact_liquidity<BTC, USDC>(sender, 100000000, amm_initial_usdc);

        let alice_addr = signer::address_of(alice);
        let bob_addr = signer::address_of(bob);

        // alice buys .25 @ 20,900
        let alice_initial_usdc = 50000000000;
        vault::deposit<USDC>(alice, alice_addr, alice_initial_usdc);
        clob_market::place_order<BTC, USDC>(alice, signer::address_of(alice), true, 20900000000, 25000000, 0, 0, LIMIT_ORDER, 0, true, MAX_U64, CANCEL_PASSIVE);
        // bob buys .5 @ 21,500
        let bob_initial_usdc = alice_initial_usdc;
        vault::deposit<USDC>(bob, bob_addr, bob_initial_usdc);
        clob_market::place_order<BTC, USDC>(bob, signer::address_of(bob), true, 21500000000, 50000000, 0, 0, LIMIT_ORDER, 0, true, MAX_U64, CANCEL_PASSIVE);


        // Test selling .75 BTC for > 16,000 (notional price ~21,333)
        let btc_t0 = coin::balance<BTC>(sender_addr);
        let usdc_t0 = coin::balance<USDC>(sender_addr);

        swap_exact_coin_for_coin_with_signer<BTC, USDC>(sender, 75000000, 16000000000);

        let btc_t1 = coin::balance<BTC>(sender_addr);
        let usdc_t1 = coin::balance<USDC>(sender_addr);

        assert!(btc_t0 - btc_t1 == 75000000, E_TEST_FAILED);
        assert!(usdc_t1 - usdc_t0 >= 16000000000, usdc_t1 - usdc_t0);

        let alice_usdc_spent = (alice_initial_usdc as u128) - vault::balance<USDC>(alice_addr);
        let bob_usdc_spent = (bob_initial_usdc as u128) - vault::balance<USDC>(bob_addr);
        let amm_usdc_spent = amm_initial_usdc - amm::y_au<BTC, USDC>();

        assert!(alice_usdc_spent > 0, E_TEST_FAILED);
        assert!(bob_usdc_spent == 10750000000, E_TEST_FAILED);
        assert!(amm_usdc_spent > 0, E_TEST_FAILED);

        // sum will not be exact due to fees
        assert!(alice_usdc_spent + bob_usdc_spent + (amm_usdc_spent as u128) >= 16000000000, E_TEST_FAILED);
    }


    #[test(sender = @0x5e7c3, aux = @aux, alice = @0x123, bob = @0x456, aptos_framework = @0x1)]
    fun test_pool_and_exact_quote_in_base_out_market(
        sender: &signer,
        alice: &signer,
        bob: &signer,
        aux: &signer,
        aptos_framework: &signer
    ) {
        // X = Quote = USDC
        // Y = Base = BTC
        let base_decimals = 8;
        let quote_decimals = 6;
        let lot_size = 10000;
        let tick_size = 10000;
        setup_for_test<USDC, BTC, BTC, USDC>(
            sender,
            aux,
            alice,
            bob,
            aptos_framework,
            base_decimals,
            quote_decimals,
            lot_size,
            tick_size,
            true,
            true
        );
        let sender_addr = signer::address_of(sender);

        // Pool balances are base: 1e8 (1.00), quote: 22000e6 (22,000.00), so gives
        let amm_initial_usdc = 21000000000;
        amm::add_exact_liquidity<USDC, BTC>(sender, amm_initial_usdc, 100000000);

        let alice_addr = signer::address_of(alice);
        let bob_addr = signer::address_of(bob);


        // alice sells .25 @ 23,100
        vault::deposit<BTC>(alice, alice_addr, 50000000);
        clob_market::place_order<BTC, USDC>(alice, signer::address_of(alice), false, 23100000000, 25000000, 0, 0, LIMIT_ORDER, 0, true, MAX_U64, CANCEL_PASSIVE);

        // bob sells .5 @ 22,500
        vault::deposit<BTC>(bob, bob_addr, 50000000);
        clob_market::place_order<BTC, USDC>(bob, signer::address_of(bob), false, 22500000000, 50000000, 0, 0, LIMIT_ORDER, 0, true, MAX_U64, CANCEL_PASSIVE);

        // Orderbook gives .75 for 17,025 (exclusive of fees)

        // Test buying min .75 BTC for 17,000 (notional price ~22,666)
        let btc_t0 = coin::balance<BTC>(sender_addr);
        let usdc_t0 = coin::balance<USDC>(sender_addr);

        swap_exact_coin_for_coin_with_signer<USDC, BTC>(sender, 17000000000, 75000000);

        let btc_t1 = coin::balance<BTC>(sender_addr);
        let usdc_t1 = coin::balance<USDC>(sender_addr);

        assert!(btc_t1 - btc_t0 >= 75000000, E_TEST_FAILED);
        assert!(usdc_t0 - usdc_t1 == 17000000000, usdc_t0 - usdc_t1);

        let alice_usdc_received = vault::balance<USDC>(alice_addr);
        let bob_usdc_received = vault::balance<USDC>(bob_addr);
        let amm_usdc_received = amm::x_au<USDC, BTC>() - amm_initial_usdc;

        assert!(alice_usdc_received > 0, E_TEST_FAILED);
        assert!(bob_usdc_received == 11250000000, E_TEST_FAILED);
        assert!(amm_usdc_received > 0, E_TEST_FAILED);

        // sum will not be exact due to fees
        // std::debug::print<u128>(&(alice_usdc_received + bob_usdc_received + amm_usdc_received));
    }

    #[test(sender = @0x5e7c3, aux = @aux, alice = @0x123, bob = @0x456, aptos_framework = @0x1)]
    fun test_exact_base_in_quote_out_market_only(
        sender: &signer,
        alice: &signer,
        bob: &signer,
        aux: &signer,
        aptos_framework: &signer
    ) {
        // Base: decimals = 8, lot size = 1e4
        // Quote: decimals = 6, tick size = 1e4
        // Base = BTC
        // Quote = USDC
        let base_decimals = 8;
        let quote_decimals = 6;
        let lot_size = 10000;
        let tick_size = 10000;
        setup_for_test<USDC, BTC, BTC, USDC>(
            sender,
            aux,
            alice,
            bob,
            aptos_framework,
            base_decimals,
            quote_decimals,
            lot_size,
            tick_size,
            false,
            true);

        let sender_addr = signer::address_of(sender);

        let alice_addr = signer::address_of(alice);
        let bob_addr = signer::address_of(bob);

        // alice buys .25 @ 20,900
        let alice_initial_usdc = 50000000000;
        vault::deposit<USDC>(alice, alice_addr, alice_initial_usdc);
        clob_market::place_order<BTC, USDC>(alice, signer::address_of(alice), true, 20900000000, 25000000, 0, 0, LIMIT_ORDER, 0, true, MAX_U64, CANCEL_PASSIVE);
        // bob buys .5 @ 21,500
        let bob_initial_usdc = alice_initial_usdc;
        vault::deposit<USDC>(bob, bob_addr, bob_initial_usdc);
        clob_market::place_order<BTC, USDC>(bob, signer::address_of(bob), true, 21500000000, 50000000, 0, 0, LIMIT_ORDER, 0, true, MAX_U64, CANCEL_PASSIVE);


        // Test selling .75 BTC for > 15,900 (notional price ~21,200)
        let btc_t0 = coin::balance<BTC>(sender_addr);
        let usdc_t0 = coin::balance<USDC>(sender_addr);

        coin::register<BTC>(&authority::get_signer_self());


        swap_exact_coin_for_coin_with_signer<BTC, USDC>(sender, 75000000, 15000000000);

        // all orders should have been matched
        assert!(clob_market::n_bid_levels<BTC, USDC>() == 0, E_TEST_FAILED);

        let btc_t1 = coin::balance<BTC>(sender_addr);
        let usdc_t1 = coin::balance<USDC>(sender_addr);

        assert!(btc_t0 - btc_t1 == 75000000, btc_t0 - btc_t1);
        assert!(usdc_t1 - usdc_t0 == fee::subtract_fee(sender_addr, 15975000000, true), usdc_t1 - usdc_t0);

        let alice_usdc_spent = (alice_initial_usdc as u128) - vault::balance<USDC>(alice_addr);
        let bob_usdc_spent = (bob_initial_usdc as u128) - vault::balance<USDC>(bob_addr);
        // let amm_usdc_spent = amm_initial_usdc - amm::y_au<USDC, BTC>();

        assert!(alice_usdc_spent == (fee::add_fee(alice_addr, 5225000000, false) as u128), E_TEST_FAILED);
        assert!(bob_usdc_spent == (fee::add_fee(bob_addr, 10750000000, false) as u128), E_TEST_FAILED);
    }

    #[test(sender = @0x5e7c3, aux = @aux, alice = @0x123, bob = @0x456, aptos_framework = @0x1)]
    fun test_pool_only_exact_usdc_for_btc(
        sender: &signer,
        alice: &signer,
        bob: &signer,
        aux: &signer,
        aptos_framework: &signer
    ) {
        // X = BTC
        // Y = USDC
        let base_decimals = 8;
        let quote_decimals = 6;
        let lot_size = 10000;
        let tick_size = 10000;
        setup_for_test<BTC, USDC, BTC, USDC>(
            sender,
            aux,
            alice,
            bob,
            aptos_framework,
            base_decimals,
            quote_decimals,
            lot_size,
            tick_size,
            true,
            false);

        let sender_addr = signer::address_of(sender);

        // Pool balances are base: 1e8 (1.00), quote: 22000e6 (22,000.00), so gives
        let amm_initial_usdc = 23000000000;
        amm::add_exact_liquidity<BTC, USDC>(sender, 100000000, amm_initial_usdc);

        // Test buying min .75 BTC for 17000000000 (notional price ~22,666)
        let btc_t0 = coin::balance<BTC>(sender_addr);
        let usdc_t0 = coin::balance<USDC>(sender_addr);

        let predicted_btc_out = amm::au_out<USDC, BTC>(17500000000);
        // std::debug::print<u128>(&predicted_btc_out);
        swap_exact_coin_for_coin_with_signer<USDC, BTC>(sender, 17500000000, 40000000);

        let btc_t1 = coin::balance<BTC>(sender_addr);
        let usdc_t1 = coin::balance<USDC>(sender_addr);

        assert!(btc_t1 - btc_t0 >= 40000000, E_TEST_FAILED);
        assert!(btc_t1 - btc_t0 == (predicted_btc_out as u64), E_TEST_FAILED);
        assert!(usdc_t0 - usdc_t1 == 17500000000, usdc_t0 - usdc_t1);

        let amm_usdc_received = amm::y_au<BTC, USDC>() - amm_initial_usdc;

        assert!(amm_usdc_received > 0, E_TEST_FAILED);

        // sum will not be exact due to fees
        // std::debug::print<u128>(&amm_usdc_received);
    }

    #[expected_failure]
    #[test(sender = @0x5e7c3, aux = @aux, alice = @0x123, bob = @0x456, aptos_framework = @0x1)]
    fun test_exact_quote_in_base_out_market_only(
        sender: &signer,
        alice: &signer,
        bob: &signer,
        aux: &signer,
        aptos_framework: &signer
    ) {
        // X = Quote = USDC
        // Y = Base = BTC
        let base_decimals = 8;
        let quote_decimals = 6;
        let lot_size = 10000;
        let tick_size = 10000;
        setup_for_test<BTC, USDC, BTC, USDC>(
            sender,
            aux,
            alice,
            bob,
            aptos_framework,
            base_decimals,
            quote_decimals,
            lot_size,
            tick_size,
            false,
            true);


        // Swap exact amount in book of USDC (17,025) for min .74 BTC
        swap_exact_coin_for_coin_with_signer<USDC, BTC>(sender, 1702500000, 74000000);
    }

    /*===========*/
    /* Exact Out */
    /*===========*/

    #[test(sender = @0x5e7c3, aux = @aux, alice = @0x123, bob = @0x456, aptos_framework = @0x1)]
    fun test_pool_and_base_in_exact_quote_out_market(
        sender: &signer,
        alice: &signer,
        bob: &signer,
        aux: &signer,
        aptos_framework: &signer
    ) {
        // Base: decimals = 8, lot size = 1e4
        // Quote: decimals = 6, tick size = 1e4

        // Create Pool
        // Create Market

        // X = Base = BTC
        // Y = Quote = USDC
        let base_decimals = 8;
        let quote_decimals = 6;
        let lot_size = 10000;
        let tick_size = 10000;
        setup_for_test<BTC, USDC, BTC, USDC>(
            sender,
            aux,
            alice,
            bob,
            aptos_framework,
            base_decimals,
            quote_decimals,
            lot_size,
            tick_size,
            true,
            true);

        let sender_addr = signer::address_of(sender);

        // Pool balances are base: 1e8 (1.00), quote: 22600e6 (22,600.00), so gives
        let amm_initial_usdc = 22600000000;
        amm::add_exact_liquidity<BTC, USDC>(sender, 100000000, amm_initial_usdc);

        let alice_addr = signer::address_of(alice);
        let bob_addr = signer::address_of(bob);

        // alice buys .25 @ 20,900
        let alice_initial_usdc = 50000000000;
        vault::deposit<USDC>(alice, alice_addr, alice_initial_usdc);
        clob_market::place_order<BTC, USDC>(alice, alice_addr, true, 20900000000, 25000000, 0, 0, LIMIT_ORDER, 0, true, MAX_U64, CANCEL_PASSIVE);
        // bob buys .5 @ 21,500
        let bob_initial_usdc = alice_initial_usdc;
        vault::deposit<USDC>(bob, bob_addr, bob_initial_usdc);
        clob_market::place_order<BTC, USDC>(bob, bob_addr, true, 21500000000, 50000000, 0, 0, LIMIT_ORDER, 0, true, MAX_U64, CANCEL_PASSIVE);


        // Test selling <= .75 BTC for 16,000 (notional price ~21,333)
        let btc_t0 = coin::balance<BTC>(sender_addr);
        let usdc_t0 = coin::balance<USDC>(sender_addr);

        swap_coin_for_exact_coin_with_signer<BTC, USDC>(sender, 75000000, 16000000000);

        let btc_t1 = coin::balance<BTC>(sender_addr);
        let usdc_t1 = coin::balance<USDC>(sender_addr);

        assert!(btc_t0 - btc_t1 <= 75000000, E_TEST_FAILED);
        assert!(usdc_t1 - usdc_t0 == 16000000000, usdc_t1 - usdc_t0);

        let alice_usdc_spent = (alice_initial_usdc as u128) - vault::balance<USDC>(alice_addr);
        let bob_usdc_spent = (bob_initial_usdc as u128) - vault::balance<USDC>(bob_addr);
        let amm_usdc_spent = amm_initial_usdc - amm::y_au<BTC, USDC>();

        assert!(alice_usdc_spent > 0, E_TEST_FAILED);
        assert!(bob_usdc_spent > 0, E_TEST_FAILED);
        assert!(amm_usdc_spent > 0, E_TEST_FAILED);

        // sum will not be exact due to fees
        assert!(alice_usdc_spent + bob_usdc_spent + (amm_usdc_spent as u128) >= 16000000000, E_TEST_FAILED);
    }

    #[test(sender = @0x5e7c3, aux = @aux, alice = @0x123, bob = @0x456, aptos_framework = @0x1)]
    fun test_pool_and_quote_in_exact_base_out_market(
        sender: &signer,
        alice: &signer,
        bob: &signer,
        aux: &signer,
        aptos_framework: &signer
    ) {
        // X = Quote = USDC
        // Y = Base = BTC
        let base_decimals = 8;
        let quote_decimals = 6;
        let lot_size = 10000;
        let tick_size = 10000;
        setup_for_test<USDC, BTC, BTC, USDC>(
            sender,
            aux,
            alice,
            bob,
            aptos_framework,
            base_decimals,
            quote_decimals,
            lot_size,
            tick_size,
            true,
            true
        );
        let sender_addr = signer::address_of(sender);

        // Pool balances are base: 1e8 (1.00), quote: 22000e6 (22,000.00), so gives
        let amm_initial_usdc = 21000000000;
        amm::add_exact_liquidity<USDC, BTC>(sender, amm_initial_usdc, 100000000);

        let alice_addr = signer::address_of(alice);
        let bob_addr = signer::address_of(bob);


        // alice sells .25 @ 23,100
        vault::deposit<BTC>(alice, alice_addr, 50000000);
        clob_market::place_order<BTC, USDC>(alice, signer::address_of(alice), false, 23100000000, 25000000, 0, 0, LIMIT_ORDER, 0, true, MAX_U64, CANCEL_PASSIVE);

        // bob sells .5 @ 22,500
        vault::deposit<BTC>(bob, bob_addr, 50000000);
        clob_market::place_order<BTC, USDC>(bob, signer::address_of(bob), false, 22500000000, 50000000, 0, 0, LIMIT_ORDER, 0, true, MAX_U64, CANCEL_PASSIVE);

        // Orderbook gives .75 for 17,025 (exclusive of fees)

        // Test buying min .75 BTC for 17,000 (notional price ~22,666)
        let btc_t0 = coin::balance<BTC>(sender_addr);
        let usdc_t0 = coin::balance<USDC>(sender_addr);

        swap_coin_for_exact_coin_with_signer<USDC, BTC>(sender, 17000000000, 75000000);

        let btc_t1 = coin::balance<BTC>(sender_addr);
        let usdc_t1 = coin::balance<USDC>(sender_addr);

        assert!(btc_t1 - btc_t0 == 75000000, E_TEST_FAILED);
        assert!(usdc_t0 - usdc_t1 <= 17000000000, usdc_t0 - usdc_t1);

        let alice_usdc_received = vault::balance<USDC>(alice_addr);
        let bob_usdc_received = vault::balance<USDC>(bob_addr);
        let amm_usdc_received = amm::x_au<USDC, BTC>() - amm_initial_usdc;

        assert!(alice_usdc_received > 0, E_TEST_FAILED);
        assert!(bob_usdc_received == 11250000000, E_TEST_FAILED);
        assert!(amm_usdc_received > 0, E_TEST_FAILED);

        // sum will not be exact due to fees
        // std::debug::print<u128>(&(alice_usdc_received + bob_usdc_received + amm_usdc_received));
    }

    #[test(sender = @0x5e7c3, aux = @aux, alice = @0x123, bob = @0x456, aptos_framework = @0x1)]
    fun test_quote_in_exact_base_out_market_only(
        sender: &signer,
        alice: &signer,
        bob: &signer,
        aux: &signer,
        aptos_framework: &signer
    ) {
        // X = Quote = USDC
        // Y = Base = BTC
        let base_decimals = 8;
        let quote_decimals = 6;
        let lot_size = 10000;
        let tick_size = 10000;
        setup_for_test<USDC, BTC, BTC, USDC>(
            sender,
            aux,
            alice,
            bob,
            aptos_framework,
            base_decimals,
            quote_decimals,
            lot_size,
            tick_size,
            false,
            true
        );
        let sender_addr = signer::address_of(sender);

        let alice_addr = signer::address_of(alice);
        let bob_addr = signer::address_of(bob);


        // alice sells .25 @ 23,100
        vault::deposit<BTC>(alice, alice_addr, 50000000);
        clob_market::place_order<BTC, USDC>(alice, signer::address_of(alice), false, 23100000000, 25000000, 0, 0, LIMIT_ORDER, 0, true, MAX_U64, CANCEL_PASSIVE);

        // bob sells .5 @ 22,500
        vault::deposit<BTC>(bob, bob_addr, 50000000);
        clob_market::place_order<BTC, USDC>(bob, signer::address_of(bob), false, 22500000000, 50000000, 0, 0, LIMIT_ORDER, 0, true, MAX_U64, CANCEL_PASSIVE);

        // Orderbook gives .75 for 17,025 (exclusive of fees)

        // Test buying min .75 BTC for 17,000 (notional price ~22,666)
        let btc_t0 = coin::balance<BTC>(sender_addr);
        let usdc_t0 = coin::balance<USDC>(sender_addr);

        swap_coin_for_exact_coin_with_signer<USDC, BTC>(sender, 17025000000, 75000000);

        let btc_t1 = coin::balance<BTC>(sender_addr);
        let usdc_t1 = coin::balance<USDC>(sender_addr);

        assert!(btc_t1 - btc_t0 == 75000000, btc_t1 - btc_t0);
        assert!(usdc_t0 - usdc_t1 == 17025000000, usdc_t0 - usdc_t1);

        let alice_usdc_received = vault::balance<USDC>(alice_addr);
        let bob_usdc_received = vault::balance<USDC>(bob_addr);

        assert!(alice_usdc_received == (fee::subtract_fee(alice_addr, 5775000000, false) as u128), (alice_usdc_received as u64));
        assert!(bob_usdc_received == (fee::subtract_fee(bob_addr, 11250000000, false) as u128), E_TEST_FAILED);

        // sum will not be exact due to fees
        // std::debug::print<u128>(&(alice_usdc_received + bob_usdc_received + amm_usdc_received));
    }


    #[test(sender = @0x5e7c3, aux = @aux, alice = @0x123, bob = @0x456, aptos_framework = @0x1)]
    fun test_pool_only_usdc_for_exact_btc(
        sender: &signer,
        alice: &signer,
        bob: &signer,
        aux: &signer,
        aptos_framework: &signer
    ) {
        // X = BTC
        // Y = USDC
        let base_decimals = 8;
        let quote_decimals = 6;
        let lot_size = 10000;
        let tick_size = 10000;
        setup_for_test<BTC, USDC, BTC, USDC>(
            sender,
            aux,
            alice,
            bob,
            aptos_framework,
            base_decimals,
            quote_decimals,
            lot_size,
            tick_size,
            true,
            false);

        let sender_addr = signer::address_of(sender);

        // Pool balances are base: 1e8 (1.00), quote: 22000e6 (22,000.00), so gives
        let amm_initial_usdc = 23000000000;
        amm::add_exact_liquidity<BTC, USDC>(sender, 100000000, amm_initial_usdc);

        // Test buying min .75 BTC for 17000000000 (notional price ~22,666)
        let btc_t0 = coin::balance<BTC>(sender_addr);
        let usdc_t0 = coin::balance<USDC>(sender_addr);

        let predicted_usdc_in = amm::au_in<USDC, BTC>(40000000);
        // std::debug::print<u128>(&predicted_btc_out);
        swap_coin_for_exact_coin_with_signer<USDC, BTC>(sender, 17500000000, 40000000);

        let btc_t1 = coin::balance<BTC>(sender_addr);
        let usdc_t1 = coin::balance<USDC>(sender_addr);

        assert!(btc_t1 - btc_t0 == 40000000, E_TEST_FAILED);
        assert!(usdc_t0 - usdc_t1 <= 17500000000, usdc_t0 - usdc_t1);
        assert!(usdc_t0 - usdc_t1 == predicted_usdc_in, usdc_t0 - usdc_t1);

        let amm_usdc_received = amm::y_au<BTC, USDC>() - amm_initial_usdc;

        assert!(amm_usdc_received > 0, E_TEST_FAILED);

        // sum will not be exact due to fees
        // std::debug::print<u128>(&amm_usdc_received);
    }

    #[expected_failure(abort_code = E_UNSUPPORTED)]
    #[test(sender = @0x5e7c3, aux = @aux, alice = @0x123, bob = @0x456, aptos_framework = @0x1)]
    fun test_base_in_exact_quote_out_market_only(
        sender: &signer,
        alice: &signer,
        bob: &signer,
        aux: &signer,
        aptos_framework: &signer
    ) {
        // X = Quote = USDC
        // Y = Base = BTC
        let base_decimals = 8;
        let quote_decimals = 6;
        let lot_size = 10000;
        let tick_size = 10000;
        setup_for_test<BTC, USDC, BTC, USDC>(
            sender,
            aux,
            alice,
            bob,
            aptos_framework,
            base_decimals,
            quote_decimals,
            lot_size,
            tick_size,
            false,
            true);

        swap_coin_for_exact_coin_with_signer<BTC, USDC>(sender, 74000000, 1700000000);
    }

}
