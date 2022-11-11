/// Auto generated from github.com/aux-exchange/aux-exchange/docs/stableswap
/// don't modify by hand!
module aux::math_2pool {
    use aux::uint256;
    const E_COIN_BALANCE_ZERO: u64 = 1001;
    const E_D_OVERFLOW: u64 = 1002;
    const E_FAIL_TO_CONVERGE: u64 = 1003;
    const E_X_OVERFLOW: u64 = 1004;
    const E_COIN_DECIMAL_TOO_LARGE: u64 = 1005;
    const E_D_ZERO: u64 = 1006;
    const E_NO_OUTPUT: u64 = 1007;

    const N_COINS: u128 = 2;
    const N_COINS_U8: u8 = 2;

    /// calculate d based on x_i and amp.
    /// - amp is not scaled.
    /// - at max 256 iterations.
    public fun calculate_d(x_0: u128, x_1: u128, amp: u128): u128 {
        if ((x_0 == 0) && (x_1 == 0)) {
            return 0
        };

        assert!(x_0 > 0, E_COIN_BALANCE_ZERO);
        assert!(x_1 > 0, E_COIN_BALANCE_ZERO);

        let ann: u128 = amp;
        let sum: u128 = 0;

        {
            ann = ann * N_COINS;
            sum = sum + x_0;
        };
        {
            ann = ann * N_COINS;
            sum = sum + x_1;
        };

        // initialize d to the sum of all balances
        let d = sum;

        let ann_sum = sum * ann;

        // at most 256 iterations for the newton raphson method
        let i: u64 = 0;
        while (i < 256) {
            // calculate d_p = D^{n+1}/n^n/\prod x_i
            let d_p = d;
            {
                // d_p = d_p * D / n / x_i
                d_p = d_p * d;
                d_p = d_p / (x_0 * N_COINS);
            };
            {
                // d_p = d_p * D / n / x_i
                d_p = d_p * d;
                d_p = d_p / (x_1 * N_COINS);
            };

            let numerator = d_p * N_COINS;
            numerator = numerator + ann_sum;
            numerator = numerator * d;

            let denominator = d_p * (N_COINS + 1);
            denominator = denominator + d * ann;
            denominator = denominator - d;

            let d_prev = d;

            let d = numerator / denominator;

            if (d_prev >= d) {
                if (d_prev - d <= 1) {
                    return d
                };
            } else {
                if (d - d_prev <= 1) {
                    return d
                };
            };

            i = i + 1;
        };

        abort(E_FAIL_TO_CONVERGE)
    }


    /// calculate x_i, which i is identified by the out_index.
    /// the input x_i where i is out_index is not used in the calculation.
    public fun calculate_x(x_0: u128, x_1: u128, out_index: u8, amp: u128, d: u128): u128 {
        assert!(out_index < N_COINS_U8, E_NO_OUTPUT);

        assert!(out_index == 0 || x_0 > 0, E_COIN_BALANCE_ZERO);
        assert!(out_index == 1 || x_1 > 0, E_COIN_BALANCE_ZERO);

        assert!(d > 0, E_D_ZERO);

        // note we only iterate N_COINS - 1, so we multiply by N_COINS here.
        let ann: u128 = amp * N_COINS;
        let sum_e_i: u128 = 0;
        let c = uint256::new(0, d);


        if (out_index != 0) {
            c = uint256::multiply_underlying(c, d);
            c = uint256::divide_underlying(c, x_0);
            c = uint256::divide_underlying(c, N_COINS);
            // sum_e_i
            sum_e_i = sum_e_i + x_0;
            ann = ann * N_COINS;
        };

        if (out_index != 1) {
            c = uint256::multiply_underlying(c, d);
            c = uint256::divide_underlying(c, x_1);
            c = uint256::divide_underlying(c, N_COINS);
            // sum_e_i
            sum_e_i = sum_e_i + x_1;
            ann = ann * N_COINS;
        };

        // note that N_COINS need be divided again
        c = uint256::multiply_underlying(c, d);
        c = uint256::divide_underlying(c, ann * N_COINS);
        let b = sum_e_i + d / ann;

        let i: u64 = 0;

        let x = d;
        while (i < 256) {
            let prev_x = x;
            let x_uint256_2 = uint256::underlying_mul_to_uint256(x, x);
            let numerator = uint256::add(c, x_uint256_2);
            let denominator = b + 2 * x - d;
            let x_uint256 = uint256::divide_underlying(numerator, denominator);
            assert!(!uint256::underlying_overflow(x_uint256), E_X_OVERFLOW);
            x = uint256::downcast(x_uint256);
            if (prev_x >= x) {
                if (prev_x - x <= 1) {
                    return x
                };
            } else {
                if (x - prev_x <= 1) {
                    return x
                };
            };
            i = i + 1;
        };

        abort(E_FAIL_TO_CONVERGE)
    }

    /// calculate x_i, which i is identified by the out_index, while maintaining non-decreasing d.
    /// after calculate_x, if the resulting d is decreasing, add 1 to the result, otherwise return the result.
    /// the input x_i where i is out_index is not used in the calculation.
    public fun calculate_x_non_decreasing_d(x_0: u128, x_1: u128, out_index: u8, amp: u128, d: u128): u128 {
        let x = calculate_x(x_0, x_1, out_index, amp, d);
        let n_x_0 = if (out_index == 0) {
            x
        } else {
            x_0
        };
        let n_x_1 = if (out_index == 1) {
            x
        } else {
            x_1
        };

        let new_d = calculate_d(n_x_0, n_x_1, amp);
        if (new_d < d) {
            x + 1
        } else {
            x
        }
    }

    public fun get_scaler(decimal: u8): u128 {
        if (decimal == 0) {
            100000000
        } else if (decimal == 1) {
            10000000
        } else if (decimal == 2) {
            1000000
        } else if (decimal == 3) {
            100000
        } else if (decimal == 4) {
            10000
        } else if (decimal == 5) {
            1000
        } else if (decimal == 6) {
            100
        } else if (decimal == 7) {
            10
        } else if (decimal == 8) {
            1
        } else {
            abort(E_COIN_DECIMAL_TOO_LARGE)
        }
    }
}
