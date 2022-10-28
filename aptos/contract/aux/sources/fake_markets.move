module aux::fake_markets {
    use aptos_framework::chain_id;
    use aptos_framework::aptos_coin::AptosCoin;
    use aux::clob_market;
    use aux::amm;
    use aux::fake_coin::{FakeCoin, BTC, ETH, SOL, AUX, USDC, USDT};
    use aux::vault;

    fun create_fake_pool<X, Y>(source: &signer) {
        if (!amm::pool_exists<FakeCoin<X>, FakeCoin<Y>>() && 
            !amm::pool_exists<FakeCoin<Y>, FakeCoin<X>>()) {
            amm::create_pool<FakeCoin<X>, FakeCoin<Y>>(source, 30);
        };
    }

    fun create_fake_market<B, Q>(source: &signer, lot_size_au: u64, tick_size_au: u64) {
        if (!clob_market::market_exists<FakeCoin<B>, FakeCoin<Q>>()) {
            clob_market::create_market<FakeCoin<B>, FakeCoin<Q>>(
                source,
                lot_size_au,
                tick_size_au,
            );
        };
    }

    // Intialized indicates all the fake markets have been initialized without checking other modules.
	// This is to prevent the other module is in abort only mode and cannot be redeployed.
    struct Initialized has key {}

    fun init_module(source: &signer) {
        // https://github.com/aptos-labs/aptos-core/blob/main/types/src/chain_id.rs
        // Mainnet is 1 and pre-mainnet is 5
        let chain = chain_id::get();
        if (exists<Initialized>(@aux)) {
            return
        };
        move_to(source, Initialized{});
        if (chain != 1 && chain != 5) {
            vault::create_vault(source);
            // 0.001 BTC, 0.01 USDC
            create_fake_market<BTC, USDC>(source, 100000, 10000);

            // 0.001 BTC, 0.01 USDT
            create_fake_market<BTC, USDT>(source, 100000, 10000);

            // 0.01 ETH, 0.01 USDC
            create_fake_market<ETH, USDC>(source, 10000, 10000);

            // 0.01 ETH, 0.01 USDT
            create_fake_market<ETH, USDT>(source, 10000, 10000);

            // 0.01 SOL, 0.01 USDC
            create_fake_market<SOL, USDC>(source, 10000000, 10000);

            // 0.01 SOL, 0.01 USDT
            create_fake_market<SOL, USDT>(source, 10000000, 10000);

            // 0.1 AUX, 0.01 USDC
            create_fake_market<AUX, USDC>(source, 100000, 10000);

            // 0.1 AUX, 0.01 USDT
            create_fake_market<AUX, USDT>(source, 100000, 10000);

            if (!clob_market::market_exists<AptosCoin, FakeCoin<USDC>>()) {
                clob_market::create_market<AptosCoin, FakeCoin<USDC>>(
                    source,
                    100000,
                    10000,
                );
            };

            if (!clob_market::market_exists<AptosCoin, FakeCoin<USDT>>()) {
                clob_market::create_market<AptosCoin, FakeCoin<USDT>>(
                    source,
                    100000,
                    10000,
                );
            };

            if (!amm::pool_exists<AptosCoin, FakeCoin<USDC>>() && 
                !amm::pool_exists<FakeCoin<USDC>, AptosCoin>()) {
                amm::create_pool<AptosCoin, FakeCoin<USDC>>(source, 30);
            };

            if (!amm::pool_exists<AptosCoin, FakeCoin<USDT>>() && 
                !amm::pool_exists<FakeCoin<USDT>, AptosCoin>()) {
                amm::create_pool<AptosCoin, FakeCoin<USDT>>(source, 30);
            };

            create_fake_pool<BTC, ETH>(source);
            create_fake_pool<BTC, USDC>(source);
            create_fake_pool<BTC, USDT>(source);
            create_fake_pool<ETH, USDC>(source);
            create_fake_pool<ETH, USDT>(source);
            create_fake_pool<SOL, USDC>(source);
            create_fake_pool<SOL, USDT>(source);
            create_fake_pool<AUX, USDC>(source);
            create_fake_pool<AUX, USDT>(source);
        };
    }
}
