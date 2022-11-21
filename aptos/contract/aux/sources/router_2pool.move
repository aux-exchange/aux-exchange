/// Auto generated from github.com/aux-exchange/aux-exchange/docs/stableswap
/// don't modify by hand!
/// helpers for stable pool
module aux::router_2pool {
    use std::signer;

    use aptos_framework::coin;

    use aux::stable_2pool;

    /**************************/
    /* Entry Function Wrapper */
    /**************************/

    public entry fun add_liquidity<Coin0, Coin1>(
        sender: &signer,
        coin_0_amount: u64,
        coin_1_amount: u64,
        min_lp_amount: u64,
    ) {
        let sender_addr = signer::address_of(sender);

        let coin_0 = if (coin_0_amount > 0) {
            coin::withdraw<Coin0>(sender, coin_0_amount)
        } else {
            coin::zero<Coin0>()
        };

        let coin_1 = if (coin_1_amount > 0) {
            coin::withdraw<Coin1>(sender, coin_1_amount)
        } else {
            coin::zero<Coin1>()
        };

        let lp_tokens = stable_2pool::add_liquidity(
            sender_addr,
            coin_0,
            coin_1,
            min_lp_amount,
        );

        if (!coin::is_account_registered<stable_2pool::LP<Coin0, Coin1>>(sender_addr)) {
            coin::register<stable_2pool::LP<Coin0, Coin1>>(sender);
        };
        coin::deposit(sender_addr, lp_tokens);
    }

    public entry fun remove_liquidity_for_coin<Coin0, Coin1>(
        sender: &signer,
        amount_0_to_withdraw: u64,
        amount_1_to_withdraw: u64,
        lp_amount: u64,
    ) {
        let lp = coin::withdraw<stable_2pool::LP<Coin0, Coin1>>(sender, lp_amount);
        let sender_addr = signer::address_of(sender);

        let (coin_0, coin_1, lp) = stable_2pool::remove_liquidity_for_coin<Coin0, Coin1>(
            sender_addr,
            amount_0_to_withdraw,
            amount_1_to_withdraw,
            lp,
        );

        if (coin::value(&coin_0) > 0) {
            if (!coin::is_account_registered<Coin0>(sender_addr)) {
                coin::register<Coin0>(sender);
            };
            coin::deposit(sender_addr, coin_0);
        } else {
            coin::destroy_zero(coin_0);
        };

        if (coin::value(&coin_1) > 0) {
            if (!coin::is_account_registered<Coin1>(sender_addr)) {
                coin::register<Coin1>(sender);
            };
            coin::deposit(sender_addr, coin_1);
        } else {
            coin::destroy_zero(coin_1);
        };

        if (coin::value(&lp) == 0) {
            coin::destroy_zero(lp);
        } else {
            coin::deposit(sender_addr, lp);
        }
    }

    public entry fun remove_liquidity<Coin0, Coin1>(
        sender: &signer,
        lp_amount: u64,
    ) {
        let lp = coin::withdraw<stable_2pool::LP<Coin0, Coin1>>(sender, lp_amount);
        let sender_addr = signer::address_of(sender);

        let (coin_0, coin_1) = stable_2pool::remove_liquidity<Coin0, Coin1>(sender_addr, lp);

        if (coin::value(&coin_0) > 0) {
            if (!coin::is_account_registered<Coin0>(sender_addr)) {
                coin::register<Coin0>(sender);
            };
            coin::deposit(sender_addr, coin_0);
        } else {
            coin::destroy_zero(coin_0);
        };

        if (coin::value(&coin_1) > 0) {
            if (!coin::is_account_registered<Coin1>(sender_addr)) {
                coin::register<Coin1>(sender);
            };
            coin::deposit(sender_addr, coin_1);
        } else {
            coin::destroy_zero(coin_1);
        };
    }

    public entry fun swap_exact_coin_for_coin<Coin0, Coin1>(
        sender: &signer,
        coin_0_amount: u64,
        coin_1_amount: u64,
        out_coin_index: u8,
        min_quantity_out: u64,
    ) {
        let sender_addr = signer::address_of(sender);

        let coin_0 = if (coin_0_amount > 0) {
            coin::withdraw<Coin0>(sender, coin_0_amount)
        } else {
            coin::zero<Coin0>()
        };

        let coin_1 = if (coin_1_amount > 0) {
            coin::withdraw<Coin1>(sender, coin_1_amount)
        } else {
            coin::zero<Coin1>()
        };

        let (coin_0, coin_1) = stable_2pool::swap_exact_coin_for_coin(
            sender_addr,
            coin_0,
            coin_1,
            out_coin_index,
            min_quantity_out,
        );

        if (coin::value(&coin_0) > 0) {
            if (!coin::is_account_registered<Coin0>(sender_addr)) {
                coin::register<Coin0>(sender);
            };
            coin::deposit(sender_addr, coin_0);
        } else {
            coin::destroy_zero(coin_0);
        };

        if (coin::value(&coin_1) > 0) {
            if (!coin::is_account_registered<Coin1>(sender_addr)) {
                coin::register<Coin1>(sender);
            };
            coin::deposit(sender_addr, coin_1);
        } else {
            coin::destroy_zero(coin_1);
        };
    }

    public entry fun swap_coin_for_exact_coin<Coin0, Coin1>(
        sender: &signer,
        requested_quantity_0: u64,
        requested_quantity_1: u64,
        in_coin_index: u8,
        max_in_coin_amount: u64,
    ) {
        let sender_addr = signer::address_of(sender);

        let coin_0 = if (in_coin_index == 0) {
            coin::withdraw<Coin0>(sender, max_in_coin_amount)
        } else {
            coin::zero<Coin0>()
        };

        let coin_1 = if (in_coin_index == 1) {
            coin::withdraw<Coin1>(sender, max_in_coin_amount)
        } else {
            coin::zero<Coin1>()
        };

        let (coin_0, coin_1) = stable_2pool::swap_coin_for_exact_coin(
            sender_addr,
            coin_0,
            requested_quantity_0,
            coin_1,
            requested_quantity_1,
            in_coin_index,
        );

        if (coin::value(&coin_0) > 0) {
            if (!coin::is_account_registered<Coin0>(sender_addr)) {
                coin::register<Coin0>(sender);
            };
            coin::deposit(sender_addr, coin_0);
        } else {
            coin::destroy_zero(coin_0);
        };

        if (coin::value(&coin_1) > 0) {
            if (!coin::is_account_registered<Coin1>(sender_addr)) {
                coin::register<Coin1>(sender);
            };
            coin::deposit(sender_addr, coin_1);
        } else {
            coin::destroy_zero(coin_1);
        };
    }

    public entry fun remove_coin<Coin0, Coin1>(
        sender: &signer,
        amount_0_to_withdraw: u64,
        amount_1_to_withdraw: u64,
    ) {
        let sender_addr = signer::address_of(sender);
        let lp_amount = coin::balance<stable_2pool::LP<Coin0, Coin1>>(sender_addr);
        remove_liquidity_for_coin<Coin0, Coin1>(
            sender,
            amount_0_to_withdraw,
            amount_1_to_withdraw,
            lp_amount,
        );
    }
}