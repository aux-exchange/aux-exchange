#[test_only]
module aux::quoter_2pool_test {
    use aux::quoter_2pool;

    const MAX_U64: u64 = 18446744073709551615;

    fun get_amount_in(amount_out: u64, reserve_in: u64, reserve_out: u64, fee_bps: u64, current_a: u128): u64 {
        let pool = quoter_2pool::new_quoter(
            (fee_bps as u128) * 1000000,
            current_a,
            0,
            reserve_in,
            0,
            1,
            reserve_out,
            0,
            1,
            0,
        );
        quoter_2pool::update_balanced_reserve(&mut pool);
        let (remaining, _) = quoter_2pool::swap_coin_for_exact_coin(
            &mut pool,
            0,
            amount_out,
            0,
            MAX_U64
        );

        MAX_U64 - remaining
    }

    fun get_amount_out(amount_in: u64, reserve_in: u64, reserve_out: u64, fee_bps: u64, current_a: u128): u64 {
        let pool = quoter_2pool::new_quoter(
            (fee_bps as u128) * 1000000,
            current_a,
            0,
            reserve_in,
            0,
            1,
            reserve_out,
            0,
            1,
            0,
        );

        quoter_2pool::update_balanced_reserve(&mut pool);

        let (_, amount_out) = quoter_2pool::swap_exact_coin_for_coin(
            &mut pool,
            amount_in,
            0,
            1,
            0
        );

        amount_out
    }

    #[test]
    fun test_get_amount_in() {
        // we charge at least 1 au fee
        assert!(get_amount_in(1, 10, 10, 1, 85)==2, get_amount_in(1, 10, 10, 1, 85));
        // perfect balance pool, including fee so pay a bit more than 10000, 30x, 30y
        assert!(get_amount_in(10000, 300000, 300000, 5, 85)==10007, get_amount_in(10000, 300000, 300000, 5, 85));

        // ask same amount out, since amount in is more expensive priced by the pool, less amount_in is required
        assert!(get_amount_in(10000, 250000, 300000, 5, 85)==9996, (get_amount_in(10000, 250000, 300000, 5, 85) as u64));

        assert!(get_amount_in(10000, 200000, 300000, 5, 85)==9983, (get_amount_in(10000, 200000, 300000, 5, 85) as u64));

        assert!(get_amount_in(10000, 150000, 300000, 5, 85)==9960, (get_amount_in(10000, 150000, 300000, 5, 85) as u64));

        assert!(get_amount_in(10000, 100000, 300000, 5, 85)==9913, (get_amount_in(10000, 100000, 300000, 5, 85) as u64));

        assert!(get_amount_in(10000, 100000, 200000, 5, 85)==9963, (get_amount_in(10000, 100000, 200000, 5, 85) as u64));

        // with same pool, the more amount_out, the more amount_in required
        assert!(get_amount_in(10000, 300000, 300000, 5, 85)==10007, (get_amount_in(10000, 300000, 300000, 5, 85) as u64));

        assert!(get_amount_in(20000, 300000, 300000, 5, 85)==20018, (get_amount_in(20000, 300000, 300000, 5, 85) as u64));

        assert!(get_amount_in(30000, 300000, 300000, 5, 85)==30033, (get_amount_in(30000, 300000, 300000, 5, 85) as u64));

        assert!(get_amount_in(40000, 300000, 300000, 5, 85)==40052, (get_amount_in(40000, 300000, 300000, 5, 85) as u64));

        // A decreases, more slippagge, so for same amount_out, need more amount_in
        assert!(get_amount_in(40000, 300000, 300000, 5, 80)==40054, (get_amount_in(40000, 300000, 300000, 5, 80) as u64));
        assert!(get_amount_in(40000, 300000, 300000, 5, 75)==40057, (get_amount_in(40000, 300000, 300000, 5, 75) as u64));
        assert!(get_amount_in(40000, 300000, 300000, 5, 70)==40059, (get_amount_in(40000, 300000, 300000, 5, 70) as u64));
        assert!(get_amount_in(40000, 300000, 300000, 5, 1)==41899, (get_amount_in(40000, 300000, 300000, 5, 1) as u64));
    }

    #[test]
    fun test_get_amount_out(){
        // 1 x, 30x, 30y
        assert!(get_amount_out(10000, 300000, 300000, 5, 85)==9993, (get_amount_out(10000, 300000, 300000, 5, 85) as u64));

         // ask same amount in, since amount in is more expensive priced by the pool, more amount_out
        assert!(get_amount_out(10000, 250000, 300000, 5, 85)==10003, (get_amount_out(10000, 250000, 300000, 5, 85) as u64));

        assert!(get_amount_out(10000, 200000, 300000, 5, 85)==10016, (get_amount_out(10000, 200000, 300000, 5, 85) as u64));

        assert!(get_amount_out(10000, 150000, 300000, 5, 85)==10039, (get_amount_out(10000, 150000, 300000, 5, 85) as u64));

        assert!(get_amount_out(10000, 100000, 300000, 5, 85)==10086, (get_amount_out(10000, 100000, 300000, 5, 85) as u64));

        assert!(get_amount_out(10000, 100000, 200000, 5, 85)==10036, (get_amount_out(10000, 100000, 200000, 5, 85) as u64));

        // with same pool, the more amount_in, the more amount_out
        assert!(get_amount_out(10000, 300000, 300000, 5, 85)==9993, (get_amount_out(10000, 300000, 300000, 5, 85) as u64));

        assert!(get_amount_out(20000, 300000, 300000, 5, 85)==19982, (get_amount_out(20000, 300000, 300000, 5, 85) as u64));

        assert!(get_amount_out(30000, 300000, 300000, 5, 85)==29967, (get_amount_out(30000, 300000, 300000, 5, 85) as u64));

        assert!(get_amount_out(40000, 300000, 300000, 5, 85)==39948, (get_amount_out(40000, 300000, 300000, 5, 85) as u64));

        // Other fixed, Smaller A, more splippage, so less amount_out
        assert!(get_amount_out(40000, 300000, 300000, 5, 80)==39946, (get_amount_out(40000, 300000, 300000, 5, 80) as u64));
        assert!(get_amount_out(40000, 300000, 300000, 5, 75)==39944, (get_amount_out(40000, 300000, 300000, 5, 75) as u64));
        assert!(get_amount_out(40000, 300000, 300000, 5, 70)==39941, (get_amount_out(40000, 300000, 300000, 5, 70) as u64));

        // Extreme case, this is right, with smaller A, same amount_in, less amount_out due to larger slippage
        assert!(get_amount_out(40000, 300000, 300000, 5, 1)==38265, (get_amount_out(40000, 300000, 300000, 5, 1) as u64));
    }
}