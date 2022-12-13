// Have to separete fee as a separate module to resolve dependency cycle after initialize fee when `create_aux_account` in vault, the reason is when delegator places an order, it won't have signer capability of the original account creator, so won't be able to initialize the fee during place_order
// a incomplete view of the dependency graph:
// router -> amm -> constant_product (the amm fee is independent of clob)
//        -> clob_market  -> clob ->: clob_side -> clob_level -> clob_order
//                                                -> rb_tree    -> rb_tree
//                          -> fee -> volume_tracker
//                          -> volume_tracker
//                          -> vault -> volume_tracker

module aux::fee {
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    const FEE_ALREADY_INITIALIZED: u64 = 0;
    const E_TEST_FAILURE: u64 = 1;

    const DEFAULT_MAKER_REBATE_BPS: u8 = 0;
    const DEFAULT_TAKER_FEE_BPS: u8 = 0;

    struct Fee has key {
        owner: address,
        maker_rebate_bps: u8,
        taker_fee_bps: u8
    }

    public fun default_taker_fee_bps(): u8 {
        DEFAULT_TAKER_FEE_BPS
    }

    public fun default_maker_rebate_bps(): u8 {
        DEFAULT_MAKER_REBATE_BPS
    }

    public entry fun create_fee_tracker(ctx: &mut TxContext) {
        // Make sure the user hasn't initialize fee before
        let sender = tx_context::sender(ctx);
        transfer::transfer<Fee>(
            Fee {
                owner: sender,
                maker_rebate_bps: DEFAULT_MAKER_REBATE_BPS,
                taker_fee_bps: DEFAULT_TAKER_FEE_BPS
            },
            sender
        );
    }

    public(friend) fun update_maker_rebase_bps(fee: &mut Fee, new_maker_rebate_bps: u8) {
        fee.maker_rebate_bps = new_maker_rebate_bps
    }

    public(friend) fun update_taker_fee_bps(fee: &mut Fee, new_taker_fee_bps: u8) {
        fee.taker_fee_bps = new_taker_fee_bps
    }

    public fun taker_fee_bps(fee: &Fee): u8 {
        fee.taker_fee_bps
    }

    public fun maker_rebate_bps(fee: &Fee): u8 {
        fee.maker_rebate_bps
    }

    public fun maker_rebate(fee: &Fee, val: u64): u64 {
        ((val as u128) * (fee.maker_rebate_bps as u128)/ 10000 as u64)
    }

    public fun taker_fee(fee: &Fee, val: u64): u64 {
        ((val as u128) * (fee.taker_fee_bps as u128)/ 10000 as u64)
    }

    public fun add_fee(fee: &Fee, val: u64, is_taker: bool): u64 {
        (if (is_taker) {
            (val as u128) * (10000 + (fee.taker_fee_bps as u128)) / 10000
        } else {
            // maker rebate is a negative fee, so we subtract
            (val as u128) * (10000 - (fee.maker_rebate_bps as u128)) / 10000
        } as u64)
    }

    public fun subtract_fee(fee: &Fee, val: u64, is_taker: bool): u64 {
        (if (is_taker) {
            (val as u128) * (10000 - (fee.taker_fee_bps as u128)) / 10000
        } else {
            // maker rebate is a negative fee, so we add
            (val as u128) * (10000 + (fee.maker_rebate_bps as u128)) / 10000
        } as u64)
    }

    #[test_only]
    public fun create_zero_fee(user: address): Fee {
        Fee {
            owner: user,
            maker_rebate_bps: 0,
            taker_fee_bps: 0
        }
    }

    #[test_only]
    public fun init_fees_for_test(user: address, taker_fee_bps: u8, maker_rebate_bps: u8): Fee {
        Fee {
            owner: user,
            maker_rebate_bps,
            taker_fee_bps
        }
    }

    #[test(alice = @0x123, bob = @0x456)]
    fun test_fees(alice_addr: address, bob_addr: address) {
        let alice_fee = init_fees_for_test(alice_addr, 2, 1);
        let bob_fee = init_fees_for_test(bob_addr, 2, 1);

        assert!(add_fee(&alice_fee, 10000, true) == 10002, E_TEST_FAILURE);
        assert!(subtract_fee(&alice_fee, 10000, true) == 9998, E_TEST_FAILURE);
        assert!(add_fee(&bob_fee, 10000, false) == 9999, E_TEST_FAILURE);
        assert!(subtract_fee(&bob_fee, 10000, false) == 10001, E_TEST_FAILURE);
    }

}