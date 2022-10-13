/// caller module for aux
module aux::aux_coin {
    use std::signer;

    use aptos_framework::coin;
    use aptos_framework::managed_coin;

    use aux::authority;

    struct AuxCoin {}
    // TODO: what is the point of this?
    #[test_only]
    struct AuxTestCoin {}

    fun init_module(source:&signer) {
        if (!coin::is_coin_initialized<AuxCoin>()) {
            managed_coin::initialize<AuxCoin>(
                source,
                b"AuxCoin",
                b"AUX",
                6,
                true,
            );
        };
        if (!coin::is_account_registered<AuxCoin>(signer::address_of(source))) {
            managed_coin::register<AuxCoin>(source);
        }
    }

    public entry fun initialize_aux_coin(sender: &signer) {
        let sender = &authority::get_signer(sender);

        managed_coin::initialize<AuxCoin>(
            sender,
            b"AuxCoin",
            b"AUX",
            6,
            true,
        );
    }

    public entry fun mint(sender: &signer, reciepient: address, amount: u64) {
        managed_coin::mint<AuxCoin>(&authority::get_signer(sender), reciepient, amount);
    }

    public entry fun register_account(sender: &signer) {
        managed_coin::register<AuxCoin>(sender)
    }

    #[test_only]
    public fun initialize_aux_test_coin(sender: &signer) {
        let sender = &authority::get_signer(sender);

        managed_coin::initialize<AuxTestCoin>(
            sender,
            b"AuxTestCoin",
            b"XUA",
            6,
            true,
        );
    }

    #[test_only]
    public fun initialize_for_test(sender: &signer) {
        initialize_aux_coin(sender);
        initialize_aux_test_coin(sender);
    }
}
