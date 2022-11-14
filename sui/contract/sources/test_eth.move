module aux::test_eth {
    use std::option;
    use sui::coin;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    struct TEST_ETH has drop {}

    fun init(witness: TEST_ETH, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 8, b"ETH", b"Ether", b"Test Ether", option::none(), ctx);
        transfer::freeze_object(metadata);
        transfer::transfer(treasury, tx_context::sender(ctx))
    }
}
