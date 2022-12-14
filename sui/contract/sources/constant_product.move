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
    use std::type_name::{Self, TypeName};

    use sui::balance::{Self, Supply};
    use sui::coin::{Self, Coin};
    use sui::event;
    use sui::math;
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::vec_set::{Self, VecSet};

    /*************/
    /* Constants */
    /*************/

    const EBadWitness: u64 = 0;
    const EInvalidArg: u64 = 1;
    const EPoolAlreadyExists: u64 = 2;
    const EPoolEmpty: u64 = 3;
    const EPoolOverflow: u64 = 4;
    const EMinSwap: u64 = 5;

    const MAX_BPS: u128 = 10000;

    /***********/
    /* Objects */
    /***********/

    struct Pools has key {
        id: UID,
        pools: VecSet<TypeName>
    }

    struct Pool<phantom X, phantom Y> has key {
        id: UID,
        reserve_x: Coin<X>,
        reserve_y: Coin<Y>,
        supply_lp: Supply<LP<X, Y>>,
        fee_bps: u64
    }

    struct LP<phantom X, phantom Y> has drop {}

    /**********/
    /* Events */
    /**********/

    struct PoolsCreated has copy, drop {
        id: ID
    }

    struct PoolCreated<phantom X, phantom Y> has copy, drop {
        id: ID
    }

    struct Swapped<phantom X, phantom Y> has copy, drop {
        coin_type_in: TypeName,
        coin_type_out: TypeName,
        amount_in: u64,
        amount_out: u64 
    }

    struct LiquidityAdded<phantom X, phantom Y> has copy, drop {
        amount_added_x: u64,
        amount_added_y: u64,
        amount_minted_lp: u64
    }

    struct LiquidityRemoved<phantom X, phantom Y> has copy, drop {
        amount_removed_x: u64,
        amount_removed_y: u64,
        amount_burned_lp: u64
    }

    /***************/
    /* Module init */
    /***************/

    /// `Pools` can only be created once on deploy
    fun init(ctx: &mut TxContext) {
        let id = object::new(ctx);
        let inner_id = object::uid_to_inner(&id);
        let pools = Pools {
            id,
            pools: vec_set::empty()
        };
        event::emit(PoolsCreated { id: inner_id });
        transfer::share_object(pools);
    }

    /***********************/
    /* Getters and setters */
    /***********************/

    public fun reserve_x<X, Y>(self: &Pool<X, Y>): &Coin<X> {
        &self.reserve_x
    }

    public fun reserve_y<X, Y>(self: &Pool<X, Y>): &Coin<Y> {
        &self.reserve_y
    }

    public fun supply_lp<X, Y>(self: &Pool<X, Y>): &Supply<LP<X, Y>> {
        &self.supply_lp
    }

    public fun fee_bps<X, Y>(self: &Pool<X, Y>): u64 {
        self.fee_bps
    }

    /*******************/
    /* Entry functions */
    /*******************/

    public entry fun create_pool<X, Y>(
        pools: &mut Pools,
        fee_bps: u64,
        ctx: &mut TxContext
    ) {
        assert!(!vec_set::contains(&pools.pools, &type_name::get<Pool<X, Y>>()), EPoolAlreadyExists);
        assert!((fee_bps as u128) <= MAX_BPS, EInvalidArg);
        let supply_lp = balance::create_supply(LP {});
        let id = object::new(ctx);
        let inner_id = object::uid_to_inner(&id);

        event::emit<PoolCreated<X, Y>>(PoolCreated { id: inner_id });
        let pool = Pool<X, Y> {
            id,
            reserve_x: coin::zero(ctx),
            reserve_y: coin::zero(ctx),
            supply_lp,
            fee_bps
        };
        transfer::share_object(pool);
        vec_set::insert(&mut pools.pools, type_name::get<Pool<X, Y>>());
    }

    public entry fun swap_exact_x_for_y_<X, Y>(
        self: &mut Pool<X, Y>,
        coin_x: &mut Coin<X>,
        amount_x: u64,
        min_amount_y: u64,
        ctx: &mut TxContext
    ) {
        transfer::transfer(
            swap_exact_x_for_y(self, coin::split(coin_x, amount_x, ctx), min_amount_y, ctx),
            tx_context::sender(ctx)
        )
    }

    public entry fun swap_exact_y_for_x_<X, Y>(
        self: &mut Pool<X, Y>,
        coin_y: &mut Coin<Y>,
        amount_y: u64,
        min_base_amount: u64,
        ctx: &mut TxContext
    ) {
        transfer::transfer(
            swap_exact_y_for_x(self, coin::split(coin_y, amount_y, ctx), min_base_amount, ctx),
            tx_context::sender(ctx)
        )
    }

    public entry fun add_liquidity_<X, Y>(
        self: &mut Pool<X, Y>,
        coin_x: &mut Coin<X>,
        coin_y: &mut Coin<Y>,
        amount_x: u64,
        amount_y: u64,
        ctx: &mut TxContext
    ) {
        transfer::transfer(
            add_liquidity(
                self,
                coin::split(coin_x, amount_x, ctx),
                coin::split(coin_y, amount_y, ctx),
                ctx
            ),
            tx_context::sender(ctx)
        );
    }

    public entry fun remove_liquidity_<X, Y>(
        self: &mut Pool<X, Y>,
        lp: &mut Coin<LP<X, Y>>,
        amount_lp: u64,
        ctx: &mut TxContext
    ) {
        let (coin_x, coin_y) = remove_liquidity(self, coin::split(lp, amount_lp, ctx), ctx);
        let sender = tx_context::sender(ctx);

        transfer::transfer(coin_x, sender);
        transfer::transfer(coin_y, sender);
    }

    /********************/
    /* Public functions */
    /********************/

    /// Swap coin_x for coin_y (+COIN_X, -COIN_Y)
    public fun swap_exact_x_for_y<X, Y>(
        self: &mut Pool<X, Y>, 
        coin_x: Coin<X>,
        min_amount_y: u64,
        ctx: &mut TxContext
    ): Coin<Y> {
        let amount_in = coin::value(&coin_x);
        assert!(amount_in > 0, EInvalidArg);

        let reserve_x = coin::value(&self.reserve_x);
        let reserve_y = coin::value(&self.reserve_y);
        assert!(reserve_x > 0 && reserve_y > 0, EPoolEmpty);

        let amount_out = get_amount_out(
            (amount_in as u128),
            (coin::value(&self.reserve_x) as u128),
            (coin::value(&self.reserve_y) as u128),
            (self.fee_bps as u128)
        );
        assert!(amount_out >= min_amount_y, EMinSwap);

        let coin_type_in = type_name::get<X>();
        let coin_type_out = type_name::get<Y>();
        event::emit<Swapped<X, Y>>(Swapped { coin_type_in, coin_type_out, amount_in, amount_out });
        coin::join(&mut self.reserve_x, coin_x);
        coin::take(coin::balance_mut(&mut self.reserve_y), amount_out, ctx)
    }

    /// Swap coin_x for coin_y (+COIN_Y, -COIN_X)
    public fun swap_exact_y_for_x<X, Y>(
        self: &mut Pool<X, Y>, 
        coin_y: Coin<Y>,
        min_amount_x: u64,
        ctx: &mut TxContext
    ): Coin<X> {
        let amount_in = coin::value(&coin_y);
        assert!(amount_in > 0, EInvalidArg);
        let (reserves_x, reserves_y) = (coin::value(&self.reserve_x), coin::value(&self.reserve_y));
        assert!(reserves_x > 0 && reserves_y > 0, EPoolEmpty);

        let amount_out = get_amount_out(
            (amount_in as u128),
            (reserves_y as u128),
            (reserves_x as u128),
            (self.fee_bps as u128)
        );
        assert!(amount_out >= min_amount_x, EMinSwap);

        let coin_type_in = type_name::get<Y>();
        let coin_type_out = type_name::get<X>();
        event::emit<Swapped<X, Y>>(Swapped { coin_type_in, coin_type_out, amount_in, amount_out });
        coin::join(&mut self.reserve_y, coin_y);
        coin::take(coin::balance_mut(&mut self.reserve_x), amount_out, ctx)
    }

    /// TODO slippage
    /// 
    /// say you tolerate 1% slippage, so adding 100 COIN_X and 1 COIN_Y, you provide between
    /// 
    /// 99 COIN_X / 1 COIN_Y
    /// 100 COIN_X / 0.99 COIN_Y
    public fun add_liquidity<X, Y>(
        self: &mut Pool<X, Y>,
        coin_x: Coin<X>,
        coin_y: Coin<Y>,
        ctx: &mut TxContext
    ): Coin<LP<X, Y>> {
        assert!(coin::value(&coin_x) > 0, EInvalidArg);
        assert!(coin::value(&coin_y) > 0, EInvalidArg);

        let amount_added_x = coin::value(&coin_x);
        let amount_added_y = coin::value(&coin_y);

        // TODO burn initial tokens
        let lp_supply = balance::supply_value(&self.supply_lp);
        let amount_minted_lp = if (lp_supply == 0) {
            assert!(amount_added_x > 0 && amount_added_y > 0, EInvalidArg);
            math::sqrt(amount_added_x) * math::sqrt(amount_added_y)
        } else {
            let pool_x = coin::value(&self.reserve_x);
            let pool_y = coin::value(&self.reserve_y);
            // calc share based on ratio of existing deposits
            // FIXME overflow (but dividing separately has integer division issue)
            let share_x = (amount_added_x * lp_supply) / pool_x;
            let share_y = (amount_added_y * lp_supply) / pool_y;
            // TODO slippage
            math::min(share_x, share_y)  // add liquidity favorably to the pool
        };

        event::emit<LiquidityAdded<X, Y>>(
            LiquidityAdded {
                amount_added_x,
                amount_added_y,
                amount_minted_lp
            }
        );
        // FIXME abort if exceeds slippage or refund part of coin to user
        coin::join(&mut self.reserve_x, coin_x);
        coin::join(&mut self.reserve_y, coin_y);
        coin::from_balance(balance::increase_supply(&mut self.supply_lp, amount_minted_lp), ctx)
    }

    public fun remove_liquidity<X, Y>(
        self: &mut Pool<X, Y>,
        lp: Coin<LP<X, Y>>,
        ctx: &mut TxContext
    ): (Coin<X>, Coin<Y>) {
        let amount_burned_lp = coin::value(&lp);
        assert!(amount_burned_lp > 0, EInvalidArg);

        let reserve_x = coin::value(&self.reserve_x);
        let reserve_y = coin::value(&self.reserve_y);
        let reserve_lp = balance::supply_value(&self.supply_lp);

        let amount_removed_x = (reserve_x * amount_burned_lp) / reserve_lp;
        let amount_removed_y = (reserve_y * amount_burned_lp) / reserve_lp;

        event::emit<LiquidityRemoved<X, Y>>(
            LiquidityRemoved {
                amount_removed_x,
                amount_removed_y,
                amount_burned_lp
            }
        );
        balance::decrease_supply(&mut self.supply_lp, coin::into_balance(lp));
        (
            coin::take(coin::balance_mut(&mut self.reserve_x), amount_removed_x, ctx),
            coin::take(coin::balance_mut(&mut self.reserve_y), amount_removed_y, ctx)
        )
    }

    /*********************/
    /* Private functions */
    /*********************/

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

    /*********************/
    /* Private functions */
    /*********************/
    #[test_only]
    public fun create_pools_for_testing(ctx: &mut TxContext) {
        let pools = Pools { id: object::new(ctx), pools: vec_set::empty() };
        transfer::share_object(pools);
    }
}

#[test_only]
module aux::constant_product_tests {
    use sui::balance;
    use sui::coin::{Self, Coin};
    use sui::test_scenario::{Self, Scenario};

    use aux::constant_product::{Self, LP, Pool, Pools};

    struct COIN_X {}
    struct COIN_Y {}
    struct WITNESS has drop {}

    const TRADER_X: address = @0xA;
    const TRADER_Y: address = @0xB;

    const ETestFailure: u64 = 0;

    fun create_pool_for_testing(scenario: &mut Scenario, fee_bps: u64) {
        test_scenario::next_tx(scenario, @aux);
        {
            let ctx = test_scenario::ctx(scenario);
            constant_product::create_pools_for_testing(ctx);
        };

        test_scenario::next_tx(scenario, @aux);
        {
            let pools = test_scenario::take_shared<Pools>(scenario);
            let ctx = test_scenario::ctx(scenario);
            constant_product::create_pool<COIN_X, COIN_Y>(
                &mut pools,
                fee_bps,
                ctx
            );
            test_scenario::return_shared(pools);
        }
    }
    
    fun add_liquidity_for_testing(
        scenario: &mut Scenario,
        pool: &mut Pool<COIN_X, COIN_Y>,
        amount_x: u64,
        amount_y: u64
    ): Coin<LP<COIN_X, COIN_Y>> {
        let ctx = test_scenario::ctx(scenario);
        constant_product::add_liquidity(
            pool,
            coin::mint_for_testing<COIN_X>(amount_x, ctx),
            coin::mint_for_testing<COIN_Y>(amount_y, ctx),
            ctx
        )
    }

    fun create_pool_and_add_liquidity_for_testing(
        scenario: &mut Scenario,
        fee_bps: u64,
        amount_x: u64,
        amount_y: u64
    ) {
        test_scenario::next_tx(scenario, @aux);
        {
            create_pool_for_testing(scenario, fee_bps);
        };

        test_scenario::next_tx(scenario, @aux);
        {
            let pool = test_scenario::take_shared<Pool<COIN_X, COIN_Y>>(scenario);
            let lp = add_liquidity_for_testing(scenario, &mut pool, amount_x, amount_y);
            coin::destroy_for_testing(lp);
            test_scenario::return_shared(pool);
        };
    }

    fun remove_liquidity_for_testing(
        scenario: &mut Scenario,
        pool: &mut Pool<COIN_X, COIN_Y>,
        amount_lp: u64 
    ): (Coin<COIN_X>, Coin<COIN_Y>) {
        let ctx = test_scenario::ctx(scenario);
        constant_product::remove_liquidity(
            pool,
            coin::mint_for_testing<LP<COIN_X, COIN_Y>>(amount_lp, ctx),
            ctx
        )
    }

    #[test]
    fun test_create() {
        let scenario = test_scenario::begin(@aux);
        {
            create_pool_for_testing(&mut scenario, 0)
        };

        test_scenario::next_tx(&mut scenario, @aux);
        {
            let pool = test_scenario::take_shared<Pool<COIN_X, COIN_Y>>(&mut scenario);

            // pool should be initialized to empty on creation
            assert!(coin::value(constant_product::reserve_x(&pool)) == 0, 0);
            assert!(coin::value(constant_product::reserve_y(&pool)) == 0, 0);
            assert!(balance::supply_value(constant_product::supply_lp(&pool)) == 0, 0);
            test_scenario::return_shared(pool);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_add_liquidity_empty() {
        let scenario = test_scenario::begin(@aux);
        {
            create_pool_for_testing(&mut scenario, 0);
        };

        test_scenario::next_tx(&mut scenario, @aux);
        {
            let pool = test_scenario::take_shared<Pool<COIN_X, COIN_Y>>(&mut scenario);
            let lp = add_liquidity_for_testing(&mut scenario, &mut pool, 100, 400);
            assert!(coin::value(&lp) == 200, ETestFailure);
            assert!(coin::value(constant_product::reserve_x(&pool)) == 100, ETestFailure);
            assert!(coin::value(constant_product::reserve_y(&pool)) == 400, ETestFailure);
            assert!(balance::supply_value(constant_product::supply_lp(&pool)) == 200, 0);
            coin::destroy_for_testing(lp);
            test_scenario::return_shared(pool);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_add_liquidity_nonempty() {
        let scenario = test_scenario::begin(@aux);
        create_pool_and_add_liquidity_for_testing(&mut scenario, 0, 100, 400);
        test_scenario::next_tx(&mut scenario, @aux);
        {
            let pool = test_scenario::take_shared<Pool<COIN_X, COIN_Y>>(&mut scenario);
            let lp = add_liquidity_for_testing(&mut scenario, &mut pool, 100, 400);
            std::debug::print(&coin::value(&lp));
            assert!(coin::value(&lp) == 200, ETestFailure);
            assert!(coin::value(constant_product::reserve_x(&pool)) == 2 * 100, ETestFailure);
            assert!(coin::value(constant_product::reserve_y(&pool)) == 2 * 400, ETestFailure);
            assert!(balance::supply_value(constant_product::supply_lp(&pool)) == 2 * 200, 0);
            coin::destroy_for_testing(lp);
            test_scenario::return_shared(pool);
        };

        test_scenario::end(scenario);
    }
    
    #[test]
    fun test_remove_liquidity_some() {
        let scenario = test_scenario::begin(@aux);
        create_pool_and_add_liquidity_for_testing(&mut scenario, 0, 100, 400);
        test_scenario::next_tx(&mut scenario, @aux);
        {
            let pool = test_scenario::take_shared<Pool<COIN_X, COIN_Y>>(&mut scenario);
            let (coin_x, coin_y) = remove_liquidity_for_testing(&mut scenario, &mut pool, 100);
            assert!(coin::value(&coin_x) == 50, ETestFailure);
            assert!(coin::value(&coin_y) == 200, ETestFailure);
            assert!(coin::value(constant_product::reserve_x(&pool)) == 50, ETestFailure);
            assert!(coin::value(constant_product::reserve_y(&pool)) == 200, ETestFailure);
            coin::destroy_for_testing(coin_x);
            coin::destroy_for_testing(coin_y);
            test_scenario::return_shared(pool);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_remove_liquidity_all() {
        let scenario = test_scenario::begin(@aux);
        create_pool_and_add_liquidity_for_testing(&mut scenario, 0, 100, 400);
        test_scenario::next_tx(&mut scenario, @aux);
        {
            let pool = test_scenario::take_shared<Pool<COIN_X, COIN_Y>>(&mut scenario);
            let (coin_x, coin_y) = remove_liquidity_for_testing(&mut scenario, &mut pool, 200);
            assert!(coin::value(&coin_x) == 100, ETestFailure);
            assert!(coin::value(&coin_y) == 400, ETestFailure);
            assert!(coin::value(constant_product::reserve_x(&pool)) == 0, ETestFailure);
            assert!(coin::value(constant_product::reserve_y(&pool)) == 0, ETestFailure);
            coin::destroy_for_testing(coin_x);
            coin::destroy_for_testing(coin_y);
            test_scenario::return_shared(pool);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_swap_exact_x_for_y() {
        let scenario = test_scenario::begin(@aux);
        create_pool_and_add_liquidity_for_testing(&mut scenario, 0, 100, 400);
        test_scenario::next_tx(&mut scenario, @aux);
        {
            let pool = test_scenario::take_shared<Pool<COIN_X, COIN_Y>>(&mut scenario);
            let coin_y = constant_product::swap_exact_x_for_y<COIN_X, COIN_Y>(
                &mut pool,
                coin::mint_for_testing<COIN_X>(100, test_scenario::ctx(&mut scenario)),
                200,
                test_scenario::ctx(&mut scenario)
            );
            assert!(coin::value(&coin_y) == 200, ETestFailure);
            assert!(coin::value(constant_product::reserve_x(&pool)) == 200, ETestFailure);
            assert!(coin::value(constant_product::reserve_y(&pool)) == 200, ETestFailure);
            coin::destroy_for_testing(coin_y);
            test_scenario::return_shared(pool);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_swap_exact_y_for_x() {
        let scenario = test_scenario::begin(@aux);
        create_pool_and_add_liquidity_for_testing(&mut scenario, 0, 100, 400);
        test_scenario::next_tx(&mut scenario, @aux);
        {
            let pool = test_scenario::take_shared<Pool<COIN_X, COIN_Y>>(&mut scenario);
            let coin_x = constant_product::swap_exact_y_for_x<COIN_X, COIN_Y>(
                &mut pool,
                coin::mint_for_testing<COIN_Y>(400, test_scenario::ctx(&mut scenario)),
                50,
                test_scenario::ctx(&mut scenario)
            );
            assert!(coin::value(&coin_x) == 50, ETestFailure);
            assert!(coin::value(constant_product::reserve_x(&pool)) == 50, ETestFailure);
            assert!(coin::value(constant_product::reserve_y(&pool)) == 800, ETestFailure);
            coin::destroy_for_testing(coin_x);
            test_scenario::return_shared(pool);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_swap_reverses() {
        let scenario = test_scenario::begin(@aux);
        create_pool_and_add_liquidity_for_testing(&mut scenario, 0, 100, 400);
        test_scenario::next_tx(&mut scenario, @aux);
        {
            let pool = test_scenario::take_shared<Pool<COIN_X, COIN_Y>>(&mut scenario);
            let coin_y = constant_product::swap_exact_x_for_y<COIN_X, COIN_Y>(
                &mut pool,
                coin::mint_for_testing<COIN_X>(100, test_scenario::ctx(&mut scenario)),
                200,
                test_scenario::ctx(&mut scenario)
            );
            let coin_x = constant_product::swap_exact_y_for_x<COIN_X, COIN_Y>(
                &mut pool,
                coin::mint_for_testing<COIN_Y>(200, test_scenario::ctx(&mut scenario)),
                100,
                test_scenario::ctx(&mut scenario)
            );
            assert!(coin::value(&coin_x) == 100, ETestFailure);
            assert!(coin::value(constant_product::reserve_x(&pool)) == 100, ETestFailure);
            assert!(coin::value(constant_product::reserve_y(&pool)) == 400, ETestFailure);
            coin::destroy_for_testing(coin_x);
            coin::destroy_for_testing(coin_y);
            test_scenario::return_shared(pool);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_swap_exact_fee() {
        let scenario = test_scenario::begin(@aux);
        create_pool_and_add_liquidity_for_testing(&mut scenario, 30, 10000, 40000);
        test_scenario::next_tx(&mut scenario, @aux);
        {
            let pool = test_scenario::take_shared<Pool<COIN_X, COIN_Y>>(&mut scenario);
            let coin_y = constant_product::swap_exact_x_for_y<COIN_X, COIN_Y>(
                &mut pool,
                coin::mint_for_testing<COIN_X>(10000, test_scenario::ctx(&mut scenario)),
                200,
                test_scenario::ctx(&mut scenario)
            );
            assert!(coin::value(&coin_y) == 19969,
                    coin::value(&coin_y));
            assert!(coin::value(constant_product::reserve_x(&pool)) == 20000,
                    coin::value(constant_product::reserve_x(&pool)));
            assert!(coin::value(constant_product::reserve_y(&pool)) == 20031,
                    coin::value(constant_product::reserve_y(&pool)));
            coin::destroy_for_testing(coin_y);
            test_scenario::return_shared(pool);
        };

        test_scenario::end(scenario);
    }
}
