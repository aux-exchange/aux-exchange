module aux::concliq {
    use std::signer;

    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::type_info;

    use aux::int32::{Self, Int32};
    use aux::concliq_math;
    use aux::reward_distributor::{Self, RewardDistributor, RedeemToken};
    use aux::linked_list::{Self, LinkedList};
    use aux::authority;

    const E_POOL_ALREADY_EXISTS: u64 = 1;
    const E_POOL_NOT_FOUND: u64 = 2;
    const E_TYPE_ARGS_WRONG_ORDER: u64 = 3;
    const E_POOL_NOT_EMPTY: u64 = 6;
    const E_INSUFFICIENT_MIN_QUANTITY: u64 = 7;
    const E_REMOVE_LIQUIDITY_UNDERFLOW: u64 = 8;
    const E_OPERATION_OVERFLOW: u64 = 9;
    const E_CONSTANT_PRODUCT: u64 = 10;
    const E_INSUFFICIENT_MAX_QUANTITY: u64 = 12;
    const E_INVALID_FEE: u64 = 13;
    const E_POOL_FROZEN: u64 = 14;
    const E_INVALID_AMM_RATIO: u64 = 15;
    const E_INSUFFICIENT_INPUT_AMOUNT: u64 = 16;
    const E_INSUFFICIENT_LIQUIDITY: u64 = 17;
    const E_ADD_LIQUIDITY_UNDERFLOW: u64 = 18;
    const E_INSUFFICIENT_OUTPUT_AMOUNT: u64 = 19;
    const E_UNAUTHORIZED: u64 = 20;
    const E_INVALID_POOL: u64 = 21;
    const E_INVALID_TICK: u64 = 22;
    const E_UPPER_TICK_LOWER_THAN_LOWER: u64 = 23;
    const E_ZERO_TICK_SPACING: u64 = 24;

    /// LP for a price band.
    /// This is empty because LP needs to include RedeemToken.
    struct LP<phantom X, phantom Y> has store {
    }

    /// LPBundle, includes the lp amount and the redeem tokens
    struct LPBundle<phantom X, phantom Y> has store {
        lower_tick: Int32,
        tick_spacing: u32,
        value: u64,

        redeem_token_x: RedeemToken<X, LP<X, Y>>,
        redeem_token_y: RedeemToken<Y, LP<X, Y>>,
    }

    /// PriceBand is a price band in concentrated liquidity.
    /// It is defined by the lower tick and tick_spacing.
    struct PriceBand<phantom X, phantom Y> has store {
        reserve_x: Coin<X>,
        fee_x: Coin<X>,
        fee_distributor_x: RewardDistributor<X, LP<X, Y>>,

        reserve_y: Coin<Y>,
        fee_y: Coin<Y>,
        fee_distributor_y: RewardDistributor<Y, LP<X, Y>>,

        lower_tick: Int32,
        tick_spacing: u32,

        lp_supply: u128,

        // price
        sqrt_lower_price: u128,
        sqrt_1_over_lower_price: u128,
        sqrt_upper_price: u128,
        sqrt_1_over_upper_price: u128,

        // liquidity
        liquidity: u128,
    }

    /// Pool contains the price bands
    struct Pool<phantom X, phantom Y> has key {
        fee_bps: u128,
        tick_spacing: u32,

        current_price_band_index: u64,
        null_index: u64,
        price_bands: LinkedList<PriceBand<X, Y>>,

        current_sqrt_price: u128,
    }

    /// create a new pool
    public entry fun create_pool<X, Y>(sender: &signer, fee_bps: u128, tick_spacing: u32) {
        assert!(
            !exists<Pool<X, Y>>(@aux),
            E_POOL_ALREADY_EXISTS,
        );
        assert!(
            !exists<Pool<Y, X>>(@aux),
            E_POOL_ALREADY_EXISTS,
        );

        if (fee_bps < 10 && fee_bps > 30) {
            assert!(
                signer::address_of(sender) == @aux || authority::is_signer_owner(sender),
                E_UNAUTHORIZED,
            );
        };

        assert!(type_info::type_name<X>() != type_info::type_name<Y>(), E_INVALID_POOL);

        move_to(
            &authority::get_signer_self(),
            Pool<X, Y> {
                current_price_band_index: linked_list::null_index_value(),
                tick_spacing,
                fee_bps,
                price_bands: linked_list::new(),
                null_index: linked_list::null_index_value(),
                current_sqrt_price: 0,
            },
        );
    }

    fun new_price_band<X, Y>(owner: &signer, tick_lower: Int32, tick_spacing: u32): PriceBand<X, Y> {
        let tick_upper = int32::add(tick_lower, int32::new(tick_spacing, false));
        PriceBand {
            reserve_x: coin::zero(),
            fee_x: coin::zero(),
            fee_distributor_x: reward_distributor::create_reward_distributor(owner, (int32::raw_value(tick_lower) as u128)),

            reserve_y: coin::zero(),
            fee_y: coin::zero(),
            fee_distributor_y: reward_distributor::create_reward_distributor(owner, (int32::raw_value(tick_lower) as u128)),

            lower_tick: tick_lower,
            tick_spacing: tick_spacing,
            lp_supply: 0,

            liquidity: 0,
            sqrt_lower_price: concliq_math::get_square_price_from_tick(tick_lower),
            sqrt_1_over_lower_price: concliq_math::get_square_price_from_tick(int32::negative(tick_lower)),
            sqrt_upper_price: concliq_math::get_square_price_from_tick(tick_upper),
            sqrt_1_over_upper_price: concliq_math::get_square_price_from_tick(int32::negative(tick_upper)),
        }
    }

    // add liquidity to the pool
    fun add_liquidity<X, Y>(pool: &mut Pool<X, Y>, tick_lower: Int32, tick_upper: Int32, coin_x: Coin<X>, coin_y: Coin<Y>): (LPBundle<X, Y>, Coin<X>, Coin<Y>) {
        assert!(
            concliq_math::is_valid_tick(tick_lower, pool.tick_spacing),
            E_INVALID_TICK,
        );
        assert!(
            concliq_math::is_valid_tick(tick_upper, pool.tick_spacing),
            E_INVALID_TICK,
        );
        let abs_spacing = int32::subtract(tick_upper, tick_lower);
        assert!(!int32::is_negative(abs_spacing), E_UPPER_TICK_LOWER_THAN_LOWER);
        let abs_spacing = int32::abs(abs_spacing);
        assert!(abs_spacing > 0, E_ZERO_TICK_SPACING);
        let lp_amount: u64 = 0;
        let price_band = new_price_band<X, Y>(&authority::get_signer_self(), tick_lower, pool.tick_spacing);
        let lp_bundle = LPBundle {
            lower_tick: tick_lower,
            tick_spacing: pool.tick_spacing,
            value: lp_amount,
            redeem_token_x: reward_distributor::mint(&mut price_band.fee_distributor_x, lp_amount),
            redeem_token_y: reward_distributor::mint(&mut price_band.fee_distributor_y, lp_amount),
        };
        linked_list::insert(&mut pool.price_bands, price_band);
        (lp_bundle, coin_x, coin_y)
    }
}
