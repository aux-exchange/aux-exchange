module aux::util {
    use std::vector;
    use std::string::String;
    use std::hash;
    use std::bcs;
    use std::from_bcs;

    use aptos_std::type_info;

    const EUNSUPPORTED: u64 = 1;

    struct Type has copy, drop, store {
        name: String
    }

    public fun type_of<T>(): Type {
        Type {
            name: type_info::type_name<T>()
        }
    }

    public fun name(type: &Type): String {
        type.name
    }

    // TODO: replace with aptos-framework version once merged
    // NOTE: this should not be used to calculate addresses every time. Either
    // cache an address in the module address, publish the module to the
    // resource account, or pass the resource account address in.
    public fun create_resource_account_addr(addr: address, seed: vector<u8>): address {
        let bytes = bcs::to_bytes(&addr);
        vector::append(&mut bytes, seed);
        vector::push_back(&mut bytes, 255u8);
        from_bcs::to_address(hash::sha3_256(bytes))
    }

    // TODO: move to math lib
    // TODO: hardcode common powers of 10
    /// Returns a to the power of b. (adapted from https://github.com/pentagonxyz/movemate/blob/main/aptos/sources/math.move)
    public fun exp(a: u128, b: u128): u128 {
        let c = 1;

        while (b > 0) {
            if (b & 1 > 0) c = c * a;
            b = b >> 1;
            a = a * a;
        };

        c
    }

    public fun pow_10_4(): u128 {
        10000
    }
    public fun pow_10_5(): u128 {
        100000
    }
    public fun pow_10_6(): u128 {
        1000000
    }
    public fun pow_10_7(): u128 {
        10000000
    }
    public fun pow_10_8(): u128 {
        100000000
    }
    public fun pow_10_9(): u128 {
        1000000000
    }

    public fun sub_min_0(left: u64, right: u64): u64 {
        if (right >= left) { 0 } else {left - right }
    }

    public fun sub_min_0_u128(left: u128, right: u128): u128 {
        if (right >= left) { 0 } else {left - right }
    }

    // TEST UTILS
    #[test_only]
    public fun assert_eq_u128(val: u128, expected: u128) {
        if (val != expected) {
            // std::debug::print_stack_trace();
            std::debug::print<u128>(&expected);
        };
        assert!(val == expected, (val as u64));
    }
    #[test_only]
    public fun assert_eq_u64(val: u64, expected: u64) {
        if (val != expected) {
            std::debug::print<u64>(&expected)
        };
        assert!(val == expected, (val as u64))
    }

    #[test_only]
    struct BaseCoin has key {}
    #[test_only]
    struct QuoteCoin has key {}

    #[test_only]
    public fun init_coin_for_test<CoinType>(sender: &signer, decimals: u8) {
        aptos_framework::managed_coin::initialize<CoinType>(
            sender,
            b"Test",
            b"404",
            decimals,
            true
        );
    }
    #[test_only]
    public fun mint_coin_for_test<CoinType>(sender: &signer, to: address, amount: u64) {
        aptos_framework::managed_coin::mint<CoinType>(sender, to, amount)
    }

    #[test_only]
    public fun maybe_register_coin<CoinType>(sender: &signer) {
        if (!std::coin::is_account_registered<CoinType>(std::signer::address_of(sender))) {
            std::coin::register<CoinType>(sender);
        };
    }
}