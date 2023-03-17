// Fake coins for testing. Any type T can be wrapped in this module as a fake
// coin. We support several canonical fake coins to use in testing.
module aux::fake_coin {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::managed_coin;
    use aptos_framework::chain_id;

    use aux::authority;

    // Wrapper for fake coins. All coin types are wrapped by FakeCoin so that the
    // module cannot be used to mint any non-Fake tokens.
    struct FakeCoin<phantom T> {}

    // Canonical fake versions of coins.
    struct USDC {}
    struct USDT {}
    struct BTC {}
    struct ETH {}
    struct SOL {}
    struct AUX {}
    struct USDCD8 {}

    fun init_module(source: &signer) {
        let chain = chain_id::get();
        if (chain != 1 && chain != 5) {
            initialize<USDC>(source, 6, b"Fake Coin USDC", b"USDC");
            initialize<USDT>(source, 6, b"Fake Coin USDT", b"USDT");
            initialize<BTC>(source, 8, b"Fake Coin BTC", b"BTC");
            initialize<ETH>(source, 8, b"Fake Coin ETH", b"ETH");
            initialize<SOL>(source, 8, b"Fake Coin SOL", b"SOL");
            initialize<AUX>(source, 6, b"Fake Coin AUX", b"AUX");
            initialize<USDCD8>(source, 8, b"Fake Coin USDC 8 Decimal", b"USDCD8");
        }
    }

    #[test_only]
    public fun init_module_for_testing(sender: &signer) {
        deployer::deployer::create_resource_account(sender, b"amm");
        authority::init_module_for_test(&deployer::deployer::get_signer_for_address(sender, @aux));
        initialize_for_test(&authority::get_signer(sender));
    }

    // Initializes a new fake coin. Should only be called by this module.
    fun initialize<T>(
        sender: &signer, 
        decimals: u8, 
        name: vector<u8>,
        symbol: vector<u8> 
    ) {
        if (!coin::is_coin_initialized<FakeCoin<T>>()) {
            managed_coin::initialize<FakeCoin<T>>(
                sender,
                name,
                symbol,
                decimals,
                true,
            );
        };
        if (!coin::is_account_registered<FakeCoin<T>>(signer::address_of(sender))) {
            managed_coin::register<FakeCoin<T>>(sender);
        };
    }

    // Mints to a recipient. Users can do this for arbitrary amounts. We require
    // the user to sign for their own mint to prevent interfering with other
    // users, but this is not strictly required for the contract to function.
    public entry fun mint<T>(
        sender: &signer, 
        amount: u64
    ) {
        let recipient = signer::address_of(sender);
        let module_signer = authority::get_signer_self();
        managed_coin::mint<FakeCoin<T>>(&module_signer, recipient, amount);
    }

    // Registers a recipient for the fake coin.
    public entry fun register<T>(sender: &signer) {
        let addr = signer::address_of(sender);
        if (!coin::is_account_registered<FakeCoin<T>>(addr)) {
            managed_coin::register<FakeCoin<T>>(sender);
        };
    }

    // If not already registered, registers the recipient for the fake coin and
    // mints the quantity.
    public entry fun register_and_mint<T>(sender: &signer, amount: u64) {
        let recipient = signer::address_of(sender);
        if (!coin::is_account_registered<FakeCoin<T>>(recipient)) {
            managed_coin::register<FakeCoin<T>>(sender);
        };
        let module_signer = authority::get_signer_self();
        managed_coin::mint<FakeCoin<T>>(&module_signer, recipient, amount);
    }

    // Burn coins. Some of the tests requires the user to have zero balance in various of the coins.
    public entry fun burn<T>(sender: &signer, amount: u64) {
        let module_signer = &authority::get_signer_self();
        register<T>(module_signer);
        coin::transfer<FakeCoin<T>>(sender, signer::address_of(module_signer), amount);
        managed_coin::burn<FakeCoin<T>>(module_signer, amount);
    }

    #[test_only]
    public fun initialize_for_test(sender: &signer) {
        initialize<USDC>(sender, 6, b"Fake Coin USDC", b"USDC");
        initialize<USDT>(sender, 6, b"Fake Coin USDT", b"USDT");
        initialize<BTC>(sender, 8, b"Fake Coin BTC", b"BTC");
        initialize<ETH>(sender, 18, b"Fake Coin ETH", b"ETH");
        initialize<SOL>(sender, 9, b"Fake Coin SOL", b"SOL");
        initialize<AUX>(sender, 6, b"Fake Coin AUX", b"AUX");
        initialize<USDCD8>(sender, 8, b"Fake Coin USDC 8 Decimal", b"USDCD8");
    }

    #[test(aux = @aux, user = @0x5e7c3)]
    fun test_register_and_mint(aux: &signer, user: &signer) {
        use aptos_framework::account;

        let _ = aux;
        init_module_for_testing(user);
        let addr = signer::address_of(user);
        account::create_account_for_test(addr);
        register_and_mint<BTC>(user, 100);
        let balance = coin::balance<FakeCoin<BTC>>(addr);
        assert!(balance == 100, balance);
    }

    #[test_only]
    public fun burn_all<T>(sender: &signer) {
        let sender_addr = signer::address_of(sender);
        if (!coin::is_account_registered<FakeCoin<T>>(sender_addr)) {
            return
        };
        let amount = coin::balance<FakeCoin<T>>(sender_addr);
        if (amount == 0) {
            return
        };
        let module_signer = &authority::get_signer_self();
        register<T>(module_signer);
        coin::transfer<FakeCoin<T>>(sender, signer::address_of(module_signer), amount);
        managed_coin::burn<FakeCoin<T>>(module_signer, amount);
    }
}
