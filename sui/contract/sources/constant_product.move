/// Uniswap V2-style AMM implementation. Instead of ERC-20, here we use Coin<T> from Sui's SDK.
/// 
/// Implementation is based on UniswapV2 and UniswapV1:
///     https://uniswap.org/whitepaper.pdf
///     https://hackmd.io/@HaydenAdams/HJ9jLsfTz
/// 
/// As well as Sui's reference implementation:
///     https://github.com/MystenLabs/sui/blob/devnet/sui_programmability/examples/defi/sources/pool.move
/// 
/// TODO: add more tests for different decimals
/// TODO: add tests for edge cases
/// TODO: slippage when adding liquidity
/// TODO: burn initial liquidity
module aux::constant_product {
    use sui::object::{Self, UID};
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::transfer;
    use sui::math;
    use sui::tx_context::{Self, TxContext};

    const EInvalidArg: u64 = 0;
    const EPoolEmpty: u64 = 1;
    const EPoolOverflow: u64 = 2;
    const EMinSwap: u64 = 3;

    const MAX_BPS: u128 = 10000;

    struct LP<phantom X, phantom Y, phantom W> has drop {}

    struct Pool<phantom X, phantom Y, phantom W> has key {
        id: UID,
        reserve_x: Coin<X>,
        reserve_y: Coin<Y>,
        treasury_cap: TreasuryCap<LP<X, Y, W>>,
        fee_bps: u64,
    }

    entry fun create_pool_<X, Y, W: drop>(
        _: W,
        fee_bps: u64,
        ctx: &mut TxContext
    ) {
        create_pool<X, Y, W>(_,fee_bps, ctx);
    }

    public fun create_pool<X, Y, W: drop>(
        _: W,
        fee_bps: u64,
        ctx: &mut TxContext
    ) {
        assert!(fee_bps <= MAX_BPS, EInvalidArg);
        let treasury_cap = coin::create_currency(LP {}, 8, ctx);
        transfer::share_object(Pool<X, Y, W> {
            id: object::new(ctx),
            reserve_x: coin::zero(ctx),
            reserve_y: coin::zero(ctx),
            treasury_cap,
            fee_bps 
        });
    }

    entry fun swap_exact_x_for_y_<X, Y, W>(
        self: &mut Pool<X, Y, W>,
        coin_x: Coin<X>,
        min_amount_y: u64,
        ctx: &mut TxContext
    ) {
        transfer::transfer(
            swap_exact_x_for_y(self, coin_x, min_amount_y, ctx),
            tx_context::sender(ctx)
        )
    }

    /// Swap coin_x for coin_y (ETH-USDC would be +1 ETH & -2000 USDC)
    public fun swap_exact_x_for_y<X, Y, W>(
        self: &mut Pool<X, Y, W>, 
        coin_x: Coin<X>,
        min_amount_y: u64,
        ctx: &mut TxContext
    ): Coin<Y> {
        assert!(coin::value(&coin_x) > 0, EInvalidArg);
        let reserve_x = coin::value(&self.reserve_x);
        let reserve_y = coin::value(&self.reserve_y);
        assert!(reserve_x > 0 && reserve_y > 0, EPoolEmpty);

        let amount_out = get_amount_out(
            (coin::value(&coin_x) as u128),
            (coin::value(&self.reserve_x) as u128),
            (coin::value(&self.reserve_y) as u128),
            (self.fee_bps as u128)
        );

        assert!(amount_out >= min_amount_y, EMinSwap);

        coin::join(&mut self.reserve_x, coin_x);
        coin::take(coin::balance_mut(&mut self.reserve_y), amount_out, ctx)
    }

    entry fun swap_exact_y_for_x_<X, Y, W>(
        self: &mut Pool<X, Y, W>,
        coin_y: Coin<Y>,
        min_base_amount: u64,
            ctx: &mut TxContext
    ) {
        transfer::transfer(
            swap_exact_y_for_x(self, coin_y, min_base_amount, ctx),
            tx_context::sender(ctx)
        )
    }

    /// Swap coin_x for coin_y (ETH-USDC would be +2000 USDC & -1 ETH)
    public fun swap_exact_y_for_x<X, Y, W>(
        self: &mut Pool<X, Y, W>, 
        coin_y: Coin<Y>,
        min_base_amount: u64,
        ctx: &mut TxContext
    ): Coin<X> {
        assert!(coin::value(&coin_y) > 0, EInvalidArg);
        let (reserves_x, reserves_y) = (coin::value(&self.reserve_x), coin::value(&self.reserve_y));
        assert!(reserves_x > 0 && reserves_y > 0, EPoolEmpty);

        let base_amount = get_amount_out(
            (coin::value(&coin_y) as u128),
            (reserves_y as u128),
            (reserves_x as u128),
            (self.fee_bps as u128)
        );

        assert!(base_amount >= min_base_amount, EMinSwap);

        coin::join(&mut self.reserve_y, coin_y);
        coin::take(coin::balance_mut(&mut self.reserve_x), base_amount, ctx)
    }

    entry fun mint_<X, Y, W>(
        self: &mut Pool<X, Y, W>,
        coin_x: Coin<X>,
        coin_y: Coin<Y>,
        ctx: &mut TxContext
    ) {
        transfer::transfer(
            mint(self, coin_x, coin_y, 0, ctx),
            tx_context::sender(ctx)
        );
    }


    /// TODO
    /// 
    /// "slippage_bps" parameter for the AMM
    /// the idea would be when you `add_liquidity` (aka `mint`) you would check for slippage
    /// 
    /// say you tolerate 1% slippage, so adding 100 SUI and 1 USDC, you provide between
    /// 
    /// 99 SUI / 1 USDC
    /// 100 SUI / 0.99 USDC
    public fun mint<X, Y, W>(
        self: &mut Pool<X, Y, W>,
        coin_x: Coin<X>,
        coin_y: Coin<Y>,
        _slippage_bps: u64,  // TODO
        ctx: &mut TxContext
    ): Coin<LP<X, Y, W>> {
        assert!(coin::value(&coin_x) > 0, EInvalidArg);
        assert!(coin::value(&coin_y) > 0, EInvalidArg);

        let x = coin::value(&coin_x);
        let y = coin::value(&coin_y);

        // TODO burn initial tokens
        let lp_supply = coin::total_supply(&self.treasury_cap);
        let liquidity = if (lp_supply == 0) {
            assert!(x > 0 && y > 0, EInvalidArg);
            math::sqrt(x * y)
        } else {
            let pool_x = coin::value(&self.reserve_x);
            let pool_y = coin::value(&self.reserve_y);
            // calc share based on ratio of existing deposits
            let share_x = (x * lp_supply) / pool_x;
            let share_y = (y * lp_supply) / pool_y;
            // TODO slippage
            math::min(share_x, share_y)  // mint favorably to the pool
        };
        coin::join(&mut self.reserve_x, coin_x);
        coin::join(&mut self.reserve_y, coin_y);

        coin::mint(&mut self.treasury_cap, liquidity, ctx)
    }

    entry fun burn_<X, Y, W>(
        self: &mut Pool<X, Y, W>,
        lp: Coin<LP<X, Y, W>>,
        ctx: &mut TxContext
    ) {
        let (coin_x, coin_y) = burn(self, lp, ctx);
        let sender = tx_context::sender(ctx);

        transfer::transfer(coin_x, sender);
        transfer::transfer(coin_y, sender);
    }

    public fun burn<X, Y, W>(
        self: &mut Pool<X, Y, W>,
        lp: Coin<LP<X, Y, W>>,
        ctx: &mut TxContext
    ): (Coin<X>, Coin<Y>) {
        let lp_amount = coin::value(&lp);
        assert!(lp_amount > 0, EInvalidArg);

        let reserve_x = coin::value(&self.reserve_x);
        let reserve_y = coin::value(&self.reserve_y);
        let reserve_lp = coin::total_supply(&self.treasury_cap);

        let withdraw_base = (reserve_x * lp_amount) / reserve_lp;
        let withdraw_quote = (reserve_y * lp_amount) / reserve_lp;

        coin::burn(&mut self.treasury_cap, lp);

        (
            coin::take(coin::balance_mut(&mut self.reserve_x), withdraw_base, ctx),
            coin::take(coin::balance_mut(&mut self.reserve_y), withdraw_quote, ctx)
        )
    }

    fun get_amount_out(
        amount_in: u128,
        reserve_in: u128,
        reserve_out: u128,
        fee_bps: u128
    ): u64 {
        let input_amount_with_fee = amount_in * (MAX_BPS - fee_bps);
        let numerator = input_amount_with_fee * reserve_out;
        let denominator = (reserve_in * MAX_BPS) + input_amount_with_fee;

        (numerator / denominator as u64)
    }
}

#[test_only]
module aux::constant_product_tests {
    use sui::coin::{Self, Coin};
    use sui::test_scenario::{Self, Scenario};

    use aux::constant_product::{Self, Pool, LP};

    struct Base {}
    struct Quote {}
    struct Witness has drop {}

    const BASE_SUPPLY: u64 = 100;  // decimals 8, say Ether (Portal) on SPL
    const QUOTE_SUPPLY: u64 = 400;  // decimals 6, say USDC

    const FEE_BPS: u64 = 0;
    const TRADER_X: address = @0xA;
    const TRADER_Y: address = @0xB;
    const AUX: address = @0xA;

    const ETestFailure: u64 = 0;

    fun create_for_testing(scenario: &mut Scenario) {
        let ctx = test_scenario::ctx(scenario);
        aux::constant_product::create_pool<Base, Quote, Witness>(
            Witness {},
            FEE_BPS,
            ctx
        );
    }
    
    fun mint_for_testing(scenario: &mut Scenario): (Pool<Base, Quote, Witness>,
                                                    Coin<LP<Base, Quote, Witness>>) {
        let pool = test_scenario::take_shared<Pool<Base, Quote, Witness>>(scenario);
        let ctx = test_scenario::ctx(scenario);
        let lp_tokens = constant_product::mint(
            &mut pool,
            coin::mint_for_testing<Base>(BASE_SUPPLY, ctx),
            coin::mint_for_testing<Quote>(QUOTE_SUPPLY, ctx),
            0,
            ctx
        );
        (pool, lp_tokens)
    }

    #[test]
    fun test_create() {
        let scenario = &mut test_scenario::begin(@0x1);
        let ctx = test_scenario::ctx(scenario);
        aux::constant_product::create_pool<Base, Quote, Witness>(
            Witness {},
            FEE_BPS,
            ctx
        );
        // create_for_testing(scenario);

        test_scenario::next_tx(scenario, AUX);
        let pool = test_scenario::take_shared<Pool<Base, Quote, Witness>>(scenario);

        // pool should be initialized to empty on creation
        assert!(aux::constant_product::reserves_x(pool_mut) == 0, 0);
        assert!(aux::constant_product::reserves_y(pool_mut) == 0, 0);
        assert!(aux::constant_product::lp_reserves(pool_mut) == 0, 0);

        test_scenario::return_shared(scenario, pool)
    }

    #[test]
    fun test_mint_empty() {
        let scenario = &mut test_scenario::begin(&@0x1);
        create_for_testing(scenario);

        test_scenario::next_tx(scenario, &LP);
        let (self, lp_tokens) = mint_for_testing(scenario);
        let pool_mut = test_scenario::borrow_mut(&mut pool);

        assert!(aux::constant_product::reserves_x(pool_mut) == BASE_SUPPLY, ETestFailure);
        assert!(aux::constant_product::reserves_y(pool_mut) == QUOTE_SUPPLY, ETestFailure);
        let liquidity = math::sqrt(BASE_SUPPLY * QUOTE_SUPPLY);
        assert!(aux::constant_product::lp_reserves(pool_mut) == liquidity, ETestFailure);

        coin::destroy_for_testing(lp_tokens);
        test_scenario::return_shared(scenario, pool);
    }

    #[test]
    fun test_mint_nonempty() {
        let scenario = &mut test_scenario::begin(&@0x1);
        create_for_testing(scenario);

        test_scenario::next_tx(scenario, &LP);
        let (self, lp_tokens) = mint_for_testing(scenario);
        coin::destroy_for_testing(lp_tokens);
        test_scenario::return_shared(scenario, pool);

        // purposely mint twice for non-empty
        test_scenario::next_tx(scenario, &LP);
        let (self, lp_tokens) = mint_for_testing(scenario);
        let pool_mut = test_scenario::borrow_mut(&mut pool);

        assert!(aux::constant_product::reserves_x(pool_mut) == 2 * BASE_SUPPLY, ETestFailure);
        assert!(aux::constant_product::reserves_y(pool_mut) == 2 * QUOTE_SUPPLY, ETestFailure);
        // the liquidity invariant L = sqrt(x * y) should hold
        let liquidity = math::sqrt(2 * BASE_SUPPLY * 2 * QUOTE_SUPPLY);
        assert!(aux::constant_product::lp_reserves(pool_mut) == liquidity, ETestFailure);

        coin::destroy_for_testing(lp_tokens);
        test_scenario::return_shared(scenario, pool);
    }
    
    #[test]
    fun test_burn_some() {
        let scenario = &mut test_scenario::begin(&@0x1);
        create_for_testing(scenario);

        test_scenario::next_tx(scenario, &LP);
        let (self, lp_tokens) = mint_for_testing(scenario);
        coin::destroy_for_testing(lp_tokens);
        test_scenario::return_shared(scenario, pool);

        test_scenario::next_tx(scenario, &LP);
        let pool = test_scenario::take_shared<Pool<Base, Quote, Witness>>(scenario);
        let pool_mut = test_scenario::borrow_mut(&mut pool);
        let ctx = test_scenario::ctx(scenario);
        let (coin_x, coin_y) = aux::constant_product::burn(
            pool_mut,
            coin::mint_for_testing(100, ctx), // burn half the LP tokens
            ctx
        );

        assert!(coin::value(&coin_x) == 50, ETestFailure);
        assert!(coin::value(&coin_y) == 200, ETestFailure);
        assert!(aux::constant_product::lp_reserves(pool_mut) == 100, ETestFailure);

        coin::destroy_for_testing(coin_x);
        coin::destroy_for_testing(coin_y);
        test_scenario::return_shared(scenario, pool);
    }

    #[test]
    fun test_burn_all() {
        let scenario = &mut test_scenario::begin(&@0x1);
        create_for_testing(scenario);

        test_scenario::next_tx(scenario, &LP);
        let (self, lp_tokens) = mint_for_testing(scenario);
        coin::destroy_for_testing(lp_tokens);
        test_scenario::return_shared(scenario, pool);

        test_scenario::next_tx(scenario, &LP);
        let pool = test_scenario::take_shared<Pool<Base, Quote, Witness>>(scenario);
        let pool_mut = test_scenario::borrow_mut(&mut pool);
        let ctx = test_scenario::ctx(scenario);
        let (coin_x, coin_y) = aux::constant_product::burn(
            pool_mut,
            coin::mint_for_testing(200, ctx),
            ctx
        );

        assert!(coin::value(&coin_x) == 100, ETestFailure);
        assert!(coin::value(&coin_y) == 400, ETestFailure);
        assert!(aux::constant_product::lp_reserves(pool_mut) == 0, ETestFailure);

        coin::destroy_for_testing(coin_x);
        coin::destroy_for_testing(coin_y);
        test_scenario::return_shared(scenario, pool);
    }

    #[test]
    fun test_swap_exact_x_for_y() {
        let scenario = &mut test_scenario::begin(&@0x1);
        create_for_testing(scenario);

        test_scenario::next_tx(scenario, &LP);
        let (self, lp_tokens) = mint_for_testing(scenario);
        coin::destroy_for_testing(lp_tokens);
        test_scenario::return_shared(scenario, pool);

        test_scenario::next_tx(scenario, &TRADER_X); 
        let pool = test_scenario::take_shared<Pool<Base, Quote, Witness>>(scenario);
        let pool_mut = test_scenario::borrow_mut(&mut pool);
        let ctx = test_scenario::ctx(scenario);
        let coin_x = coin::mint_for_testing<Base>(BASE_SUPPLY, ctx);
        let coin_y = aux::constant_product::swap_exact_x_for_y(pool_mut, coin_x, 0, ctx);

        // x * y = 100 * 400 = 40,000 = k
        // (x + 100) (y - 200) = 40,000
        assert!(aux::constant_product::reserves_x(pool_mut) == 200, ETestFailure);
        assert!(coin::destroy_for_testing(coin_y) == 200, ETestFailure);

        test_scenario::return_shared(scenario, pool);
    }

    #[test]
    fun test_swap_exact_y_for_x() {
        let scenario = &mut test_scenario::begin(&@0x1);
        create_for_testing(scenario);

        test_scenario::next_tx(scenario, &LP);
        let (self, lp_tokens) = mint_for_testing(scenario);
        coin::destroy_for_testing(lp_tokens);
        test_scenario::return_shared(scenario, pool);

        test_scenario::next_tx(scenario, &TRADER_Y); 
        let pool = test_scenario::take_shared<Pool<Base, Quote, Witness>>(scenario);
        let pool_mut = test_scenario::borrow_mut(&mut pool);
        let ctx = test_scenario::ctx(scenario);
        let coin_y = coin::mint_for_testing<Quote>(QUOTE_SUPPLY, ctx);
        let coin_x = aux::constant_product::swap_exact_y_for_x(pool_mut, coin_y, 0, ctx);

        assert!(aux::constant_product::reserves_y(pool_mut) == 800, ETestFailure);
        assert!(coin::destroy_for_testing(coin_x) == 50, ETestFailure);

        test_scenario::return_shared(scenario, pool);
    }

    #[test]
    fun test_swap_reverses() {
                let scenario = &mut test_scenario::begin(&@0x1);
        create_for_testing(scenario);

        test_scenario::next_tx(scenario, &LP);
        let (self, lp_tokens) = mint_for_testing(scenario);
        coin::destroy_for_testing(lp_tokens);
        test_scenario::return_shared(scenario, pool);

        test_scenario::next_tx(scenario, &TRADER_X); 
        let pool = test_scenario::take_shared<Pool<Base, Quote, Witness>>(scenario);
        let pool_mut = test_scenario::borrow_mut(&mut pool);
        let ctx = test_scenario::ctx(scenario);
        let coin_x = coin::mint_for_testing<Base>(BASE_SUPPLY, ctx);
        let coin_y = aux::constant_product::swap_exact_x_for_y(pool_mut, coin_x, 0, ctx);
        assert!(aux::constant_product::reserves_x(pool_mut) == BASE_SUPPLY * 2, ETestFailure);
        assert!(aux::constant_product::reserves_y(pool_mut) == QUOTE_SUPPLY / 2, ETestFailure);
        assert!(coin::destroy_for_testing(coin_y) == QUOTE_SUPPLY / 2, ETestFailure);
        test_scenario::return_shared(scenario, pool);

        test_scenario::next_tx(scenario, &TRADER_Y); 
        let pool = test_scenario::take_shared<Pool<Base, Quote, Witness>>(scenario);
        let pool_mut = test_scenario::borrow_mut(&mut pool);
        let ctx = test_scenario::ctx(scenario);
        let coin_y = coin::mint_for_testing<Quote>(QUOTE_SUPPLY / 2, ctx);
        let coin_x = aux::constant_product::swap_exact_y_for_x(pool_mut, coin_y, 0, ctx);
        assert!(aux::constant_product::reserves_x(pool_mut) == BASE_SUPPLY, ETestFailure);
        assert!(aux::constant_product::reserves_y(pool_mut) == QUOTE_SUPPLY, ETestFailure);
        assert!(coin::destroy_for_testing(coin_x) == BASE_SUPPLY, ETestFailure);
        test_scenario::return_shared(scenario, pool);
    }

    #[test]
    fun test_swap_fee() {
        let scenario = &mut test_scenario::begin(&@0x1);
        let ctx = test_scenario::ctx(scenario);
        aux::constant_product::create_pool<Base, Quote, Witness>(
            30,  // 30 bps = 0.3%
            Witness {},
            ctx
        );

        test_scenario::next_tx(scenario, &LP);
        let (self, lp_tokens) = mint_for_testing(scenario);
        coin::destroy_for_testing(lp_tokens);
        test_scenario::return_shared(scenario, pool);

        test_scenario::next_tx(scenario, &TRADER_X); 
        let pool = test_scenario::take_shared<Pool<Base, Quote, Witness>>(scenario);
        let pool_mut = test_scenario::borrow_mut(&mut pool);
        let ctx = test_scenario::ctx(scenario);
        let coin_x = coin::mint_for_testing<Base>(BASE_SUPPLY, ctx);
        let coin_y = aux::constant_product::swap_exact_x_for_y(pool_mut, coin_x, 0, ctx);
        
        // truncating division
        // swap 99.7 coin_x => 199 coin_y (100 for 200 without fees)
        assert!(coin::destroy_for_testing(coin_y) == 199, ETestFailure);
        test_scenario::return_shared(scenario, pool);
    }
}
