module aux::test_btc {
    use std::option;
    use sui::coin;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    struct TEST_BTC has drop {}

    fun init(witness: TEST_BTC, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 8, b"BTC", b"Bitcoin", b"Test Bitcoin", option::none(), ctx);
        transfer::freeze_object(metadata);
        transfer::transfer(treasury, tx_context::sender(ctx))
    }
}
