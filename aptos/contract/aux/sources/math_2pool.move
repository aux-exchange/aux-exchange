module aux::math_2pool {
    use aux::uint256;

    const E_COIN_BALANCE_ZERO: u64 = 1001;
    const E_D_OVERFLOW: u64 = 1002;
    const E_FAIL_TO_CONVERGE: u64 = 1003;
    const E_X_OVERFLOW: u64 = 1004;
    const E_COIN_DECIMAL_TOO_LARGE: u64 = 1005;
    const E_D_ZERO: u64 = 1006;

    const N_COINS: u128 = 2;

    public fun calculate_d(x_0: u128, x_1: u128, amp: u128): u128 {
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
            let d_p = uint256::new(0, d);
            {
                // d_p = d_p * D / n / x_i
                d_p = uint256::multiply_underlying(d_p, d);
                d_p = uint256::divide_underlying(d_p, x_0 * N_COINS);
            };
            {
                // d_p = d_p * D / n / x_i
                d_p = uint256::multiply_underlying(d_p, d);
                d_p = uint256::divide_underlying(d_p, x_1 * N_COINS);
            };

            let numerator =  uint256::multiply_underlying(d_p, N_COINS);
            numerator = uint256::add_underlying(numerator, ann_sum);
            numerator = uint256::multiply_underlying(numerator, d);

            let denominator = uint256::multiply_underlying(d_p, N_COINS + 1);
            denominator = uint256::add_underlying(denominator, d * ann);
            denominator = uint256::subtract_underlying(denominator, d);

            let d_prev = d;

            let d_uint256 = uint256::divide(numerator, denominator);
            assert!(!uint256::underlying_overflow(d_uint256), E_D_OVERFLOW);

            d = uint256::downcast(d_uint256);

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

    public fun calculate_x_0(x_1: u128, amp: u128, d: u128): u128 {
        assert!(x_1 > 0, E_COIN_BALANCE_ZERO);

        assert!(d > 0, E_D_ZERO);
        // note we only iterate N_COINS - 1, so we multiply by N_COINS here.
        let ann: u128 = amp * N_COINS;
        let sum_e_i: u128 = 0;
        let c = uint256::new(0, d);

        // c
        {
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

        let x_0 = d;
        while (i < 256) {
            let prev_x = x_0;
            let x_0_uint256_2 = uint256::underlying_mul_to_uint256(x_0, x_0);
            let numerator = uint256::add(c, x_0_uint256_2);
            let denominator = b + 2 * x_0 - d;
            let x_0_uint256 = uint256::divide_underlying(numerator, denominator);
            assert!(!uint256::underlying_overflow(x_0_uint256), E_X_OVERFLOW);
            x_0 = uint256::downcast(x_0_uint256);
            if (prev_x >= x_0) {
                if (prev_x - x_0 <= 1) {
                    return x_0
                };
            } else {
                if (x_0 - prev_x <= 1) {
                    return x_0
                };
            };
            i = i + 1;
        };

        abort(E_FAIL_TO_CONVERGE)
    }

    // calculate x_0, but with d never decreasing.
    public fun calculate_x_0_non_decreasing_d(x_1: u128, amp: u128, d: u128): u128 {
        let x_0 = calculate_x_0(x_1, amp, d);
        let new_d = calculate_d(x_0, x_1, amp);
        if (new_d < d) {
            x_0 + 1
        } else {
            x_0
        }
    }

    public fun calculate_x_1(x_0: u128, amp: u128, d: u128): u128 {
        assert!(x_0 > 0, E_COIN_BALANCE_ZERO);

        assert!(d > 0, E_D_ZERO);
        // note we only iterate N_COINS - 1, so we multiply by N_COINS here.
        let ann: u128 = amp * N_COINS;
        let sum_e_i: u128 = 0;
        let c = uint256::new(0, d);

        // c
        {
            c = uint256::multiply_underlying(c, d);
            c = uint256::divide_underlying(c, x_0);
            c = uint256::divide_underlying(c, N_COINS);
            // sum_e_i
            sum_e_i = sum_e_i + x_0;
            ann = ann * N_COINS;
        };

        // note that N_COINS need be divided again
        c = uint256::multiply_underlying(c, d);
        c = uint256::divide_underlying(c, ann * N_COINS);
        let b = sum_e_i + d / ann;

        let i: u64 = 0;

        let x_1 = d;
        while (i < 256) {
            let prev_x = x_1;
            let x_1_uint256_2 = uint256::underlying_mul_to_uint256(x_1, x_1);
            let numerator = uint256::add(c, x_1_uint256_2);
            let denominator = b + 2 * x_1 - d;
            let x_1_uint256 = uint256::divide_underlying(numerator, denominator);
            assert!(!uint256::underlying_overflow(x_1_uint256), E_X_OVERFLOW);
            x_1 = uint256::downcast(x_1_uint256);
            if (prev_x >= x_1) {
                if (prev_x - x_1 <= 1) {
                    return x_1
                };
            } else {
                if (x_1 - prev_x <= 1) {
                    return x_1
                };
            };
            i = i + 1;
        };

        abort(E_FAIL_TO_CONVERGE)
    }

    // calculate x_1, but with d never decreasing.
    public fun calculate_x_1_non_decreasing_d(x_0: u128, amp: u128, d: u128): u128 {
        let x_1 = calculate_x_1(x_0, amp, d);
        let new_d = calculate_d(x_0, x_1, amp);
        if (new_d < d) {
            x_1 + 1
        } else {
            x_1
        }
    }
}
