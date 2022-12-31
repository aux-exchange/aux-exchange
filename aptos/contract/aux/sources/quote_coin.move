/// quote_coin emulates the aptos_framework::coin, but is for calculating or "quoting".
/// All operations on aptos_framework::coin are replicated here for `u64`, so the 
/// allows users to create and destroy arbitrary amounts. For example, user can simply
/// replace `coin::extract` with `quote_coin::extract`.
module aux::quote_coin {
    /// Coin Treasury is used to track the total supply of the coin.
    /// Together with `mint` or `burn` functions,
    /// it can simulate the function of a coin's `MintCapability` and `BurnCapability`
    struct CoinTreasury has store, copy, drop {
        supply: u128
    }

    /// new creates a new quote_coin.
    public fun new(value: u64): u64 {
        value
    }

    /// destroy a quote_coin
    public fun destroy(coin: u64) {
        let _ = coin;
    }

    /// create a new CoinTreasury to track the total supply of the
    /// coin.
    public fun new_coin_treasury(supply: u128): CoinTreasury {
        CoinTreasury {
            supply,
        }
    }

    /// Destroy CoinTreasury
    public fun destroy_coin_treasury(treasury: CoinTreasury) {
        let CoinTreasury { supply: _ } = treasury;
    }

    public fun treasury_supply(treasury: &CoinTreasury): u128 {
        treasury.supply
    }

    /****************************/
    /*  coin functions          */
    /****************************/

    public fun zero(): u64 {
        0
    }

    public fun merge(coin: &mut u64, other: u64) {
        *coin = *coin + other;
    }

    public fun extract(coin: &mut u64, amount: u64): u64 {
        *coin = *coin - amount;
        amount
    }

    public fun extract_all(coin: &mut u64): u64 {
        let r = *coin;
        *coin = 0;
        r
    }

    public fun value(coin: &u64): u64 {
        *coin
    }

    public fun destory_zero(coin: u64) {
        assert!(coin == 0, coin);
    }

    public fun mint(amount: u64, mint_cap: &mut CoinTreasury): u64 {
        mint_cap.supply = mint_cap.supply + (amount as u128);
        amount
    }

    public fun burn(coin: u64, mint_cap: &mut CoinTreasury) {
        mint_cap.supply = mint_cap.supply - (coin as u128);
    }
}
