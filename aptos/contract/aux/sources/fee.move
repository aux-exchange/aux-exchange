// Have to separete fee as a separate module to resolve dependency cycle after initialize fee when `create_aux_account` in vault, the reason is when delegator places an order, it won't have signer capability of the original account creator, so won't be able to initialize the fee during place_order
// a incomplete view of the dependency graph:
// router -> amm -> constant_product (the amm fee is independent of clob)
//        -> clob_market  -> clob ->: clob_side -> clob_level -> clob_order
//                                                -> rb_tree    -> rb_tree
//                          -> fee -> volume_tracker
//                          -> volume_tracker
//                          -> vault -> volume_tracker

module aux::fee {
    use std::signer;
    const FEE_ALREADY_INITIALIZED: u64 = 0;
    struct Fee has key {
        maker_rebate_bps: u8,
        taker_fee_bps: u8
    }

    public fun fee_exists(account: address) : bool{
        exists<Fee>(account)
    }

    public fun initialize_fee_default(sender: &signer) {
        // Make sure the user hasn't initialize fee before
        assert!(!fee_exists(signer::address_of(sender)),FEE_ALREADY_INITIALIZED);
        move_to<Fee>(sender, Fee {maker_rebate_bps: 1, taker_fee_bps: 2});
    }

    public(friend) fun update_maker_rebase_bps(account: address, new_maker_rebate_bps: u8) acquires Fee {
        borrow_global_mut<Fee>(account).maker_rebate_bps = new_maker_rebate_bps
    }

    public(friend) fun update_taker_fee_bps(account: address, new_taker_fee_bps: u8) acquires Fee {
        borrow_global_mut<Fee>(account).taker_fee_bps = new_taker_fee_bps
    }

    public fun get_taker_fee_bps(user: address): u8 acquires Fee {
        borrow_global<Fee>(user).taker_fee_bps
    }

    public fun get_maker_rebate_bps(user: address): u8 acquires Fee {
        borrow_global<Fee>(user).maker_rebate_bps
    }

    public fun maker_rebate(user: address, val: u64): u64 acquires Fee {
        ((val as u128) * (get_maker_rebate_bps(user) as u128)/ 10000 as u64)
    }

    public fun taker_fee(user: address, val: u64): u64 acquires Fee {
        ((val as u128) * (get_taker_fee_bps(user) as u128)/ 10000 as u64)
    }

    public fun add_fee(user: address, val: u64, is_taker: bool): u64 acquires Fee {
        (if (is_taker) {
            (val as u128) * (10000 + (get_taker_fee_bps(user) as u128)) / 10000
        } else {
            // maker rebate is a negative fee, so we subtract
            (val as u128) * (10000 - (get_maker_rebate_bps(user) as u128)) / 10000
        } as u64)
    }

    public fun subtract_fee(user: address, val: u64, is_taker: bool): u64 acquires Fee {
        (if (is_taker) {
            (val as u128) * (10000 - (get_taker_fee_bps(user) as u128)) / 10000
        } else {
            // maker rebate is a negative fee, so we add
            (val as u128) * (10000 + (get_maker_rebate_bps(user) as u128)) / 10000
        } as u64)
    }

    #[test_only]
    public fun init_zero_fees(sender: &signer) acquires Fee {
        let account = signer::address_of(sender);
        if (fee_exists(account)){
            update_maker_rebase_bps(account, 0);
            update_taker_fee_bps(account, 0);
        }else{
            move_to(sender, Fee{maker_rebate_bps: 0, taker_fee_bps: 0});
        };
    }

}