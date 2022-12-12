/// caller module for aux
module aux::aux_coin {
    use std::option;

    use sui::coin::{Self, TreasuryCap};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    struct AUX has drop {}

    fun init(witness: AUX, ctx: &mut TxContext) {
        // Get a treasury cap for the coin and give it to the transaction sender
        let (treasury_cap, metadata) = coin::create_currency<AUX>(witness, 2, b"AUX", b"AUX", b"", option::none(), ctx);
        transfer::freeze_object(metadata);
        transfer::transfer(treasury_cap, tx_context::sender(ctx))
    }

    // public entry fun initialize_aux_coin(sender: &signer) {
    //     let sender = &authority::get_signer(sender);

    //     managed_coin::initialize<AuxCoin>(
    //         sender,
    //         b"AuxCoin",
    //         b"AUX",
    //         6,
    //         true,
    //     );
    // }

    public entry fun mint_to(cap: &mut TreasuryCap<AUX>, recipient: address, amount: u64, ctx: &mut TxContext) {
        let coin = coin::mint<AUX>(cap, amount, ctx);
        transfer::transfer(coin, recipient)
    }

    // public entry fun register_account(sender: &signer) {
    //     managed_coin::register<AuxCoin>(sender)
    // }

    // #[test_only]
    // public fun initialize_aux_test_coin(ctx: &mut TxContext) {
    //     let (treasury_cap, metadata) = coin::create_currency<AUX>(AUX {}, 2, b"AUX", b"AUX", b"", option::none(), ctx);
    //     transfer::freeze_object(metadata);
    //     transfer::transfer(treasury_cap, tx_context::sender(ctx))
    // }

    // #[test_only]
    // public fun initialize_for_test(sender: &signer) {
    //     initialize_aux_coin(sender);
    //     initialize_aux_test_coin(sender);
    // }
}
