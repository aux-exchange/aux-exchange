// Auto generated from gen-move-math
// https://github.com/fardream/gen-move-math
// Manual edit with caution.
// Arguments: more-math -p aux -w 256 -w 128 -o ../aptos/contract/aux/sources/more_math.move
// Version: v1.4.0
module aux::more_math_u256 {
    const E_WIDTH_OVERFLOW_U8: u64 = 1;
    const HALF_SIZE: u8 = 128;
    const MAX_SHIFT_SIZE: u8 = 255;

    const ALL_ONES: u256 = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
    const LOWER_ONES: u256 = (1 << 128) - 1;
    const UPPER_ONES: u256 = ((1 << 128) - 1) << 128;
    /// add two u256 with carry - will never abort.
    /// First return value is the value of the result, the second return value indicate if carry happens.
    public fun add_with_carry(x: u256, y: u256):(u256, u256) {
        let r = ALL_ONES - x;
        if (r < y) {
            (y - r - 1, 1)
        } else {
            (x + y, 0)
        }
    }

    /// subtract y from x with borrow - will never abort.
    /// First return value is the value of the result, the second return value indicate if borrow happens.
    public fun sub_with_borrow(x: u256, y:u256): (u256, u256) {
        if (x < y) {
            ((ALL_ONES - y) + 1 + x, 1)
        } else {
            (x-y, 0)
        }
    }

    /// x * y, first return value is the lower part of the result, second return value is the upper part of the result.
    public fun mul_with_carry(x: u256, y: u256):(u256, u256) {
        // split x and y into lower part and upper part.
        // xh, xl, yh, yl
        // result is
        // upper = xh * xl + (xh * yl) >> half_size + (xl * yh) >> half_size
        // lower = xl * yl + (xh * yl) << half_size + (xl * yh) << half_size
        let xh = (x & UPPER_ONES) >> HALF_SIZE;
        let xl = x & LOWER_ONES;
        let yh = (y & UPPER_ONES) >> HALF_SIZE;
        let yl = y & LOWER_ONES;
        let xhyl = xh * yl;
        let xlyh = xl * yh;

        let (lo, lo_carry_1) = add_with_carry(xl * yl, (xhyl & LOWER_ONES) << HALF_SIZE);
        let (lo, lo_carry_2) = add_with_carry(lo, (xlyh & LOWER_ONES)<< HALF_SIZE);
        let hi = xh * yh + (xhyl >> HALF_SIZE) + (xlyh >> HALF_SIZE) + lo_carry_1 + lo_carry_2;

        (lo, hi)
    }

    /// count leading zeros u256
    public fun leading_zeros(x: u256): u8 {
        if (x == 0) {
            abort(E_WIDTH_OVERFLOW_U8)
        } else {
            let n: u8 = 0;
            if (x & 115792089237316195423570985008687907852929702298719625575994209400481361428480 == 0) {
                // x's higher 128 is all zero, shift the lower part over
                x = x << 128;
                n = n + 128;
            };
            if (x & 115792089237316195417293883273301227089434195242432897623355228563449095127040 == 0) {
                // x's higher 64 is all zero, shift the lower part over
                x = x << 64;
                n = n + 64;
            };
            if (x & 115792089210356248756420345214020892766250353992003419616917011526809519390720 == 0) {
                // x's higher 32 is all zero, shift the lower part over
                x = x << 32;
                n = n + 32;
            };
            if (x & 115790322390251417039241401711187164934754157181743688420499462401711837020160 == 0) {
                // x's higher 16 is all zero, shift the lower part over
                x = x << 16;
                n = n + 16;
            };
            if (x & 115339776388732929035197660848497720713218148788040405586178452820382218977280 == 0) {
                // x's higher 8 is all zero, shift the lower part over
                x = x << 8;
                n = n + 8;
            };
            if (x & 108555083659983933209597798445644913612440610624038028786991485007418559037440 == 0) {
                // x's higher 4 is all zero, shift the lower part over
                x = x << 4;
                n = n + 4;
            };
            if (x & 86844066927987146567678238756515930889952488499230423029593188005934847229952 == 0) {
                // x's higher 2 is all zero, shift the lower part over
                x = x << 2;
                n = n + 2;
            };
            if (x & 57896044618658097711785492504343953926634992332820282019728792003956564819968 == 0) {
                n = n + 1;
            };

            n
        }
    }

    /// sqrt returns y = floor(sqrt(x))
    public fun sqrt(x: u256): u256 {
        if (x == 0) {
            0
        } else if (x <= 3) {
            1
        } else {
            // reproduced from golang's big.Int.Sqrt
            let n = (MAX_SHIFT_SIZE - leading_zeros(x)) >> 1;
            let z = x >> ((n - 1) / 2);
            let z_next = (z + x / z) >> 1;
            while (z_next < z) {
                z = z_next;
                z_next = (z + x / z) >> 1;
            };
            z
        }
    }
}

// Auto generated from gen-move-math
// https://github.com/fardream/gen-move-math
// Manual edit with caution.
// Arguments: more-math -p aux -w 256 -w 128 -o ../aptos/contract/aux/sources/more_math.move
// Version: v1.4.0
module aux::more_math_u128 {
    const E_WIDTH_OVERFLOW_U8: u64 = 1;
    const HALF_SIZE: u8 = 64;
    const MAX_SHIFT_SIZE: u8 = 127;

    const ALL_ONES: u128 = 340282366920938463463374607431768211455;
    const LOWER_ONES: u128 = (1 << 64) - 1;
    const UPPER_ONES: u128 = ((1 << 64) - 1) << 64;
    /// add two u128 with carry - will never abort.
    /// First return value is the value of the result, the second return value indicate if carry happens.
    public fun add_with_carry(x: u128, y: u128):(u128, u128) {
        let r = ALL_ONES - x;
        if (r < y) {
            (y - r - 1, 1)
        } else {
            (x + y, 0)
        }
    }

    /// subtract y from x with borrow - will never abort.
    /// First return value is the value of the result, the second return value indicate if borrow happens.
    public fun sub_with_borrow(x: u128, y:u128): (u128, u128) {
        if (x < y) {
            ((ALL_ONES - y) + 1 + x, 1)
        } else {
            (x-y, 0)
        }
    }

    /// x * y, first return value is the lower part of the result, second return value is the upper part of the result.
    public fun mul_with_carry(x: u128, y: u128):(u128, u128) {
        // split x and y into lower part and upper part.
        // xh, xl, yh, yl
        // result is
        // upper = xh * xl + (xh * yl) >> half_size + (xl * yh) >> half_size
        // lower = xl * yl + (xh * yl) << half_size + (xl * yh) << half_size
        let xh = (x & UPPER_ONES) >> HALF_SIZE;
        let xl = x & LOWER_ONES;
        let yh = (y & UPPER_ONES) >> HALF_SIZE;
        let yl = y & LOWER_ONES;
        let xhyl = xh * yl;
        let xlyh = xl * yh;

        let (lo, lo_carry_1) = add_with_carry(xl * yl, (xhyl & LOWER_ONES) << HALF_SIZE);
        let (lo, lo_carry_2) = add_with_carry(lo, (xlyh & LOWER_ONES)<< HALF_SIZE);
        let hi = xh * yh + (xhyl >> HALF_SIZE) + (xlyh >> HALF_SIZE) + lo_carry_1 + lo_carry_2;

        (lo, hi)
    }

    /// count leading zeros u128
    public fun leading_zeros(x: u128): u8 {
        if (x == 0) {
            128
        } else {
            let n: u8 = 0;
            if (x & 340282366920938463444927863358058659840 == 0) {
                // x's higher 64 is all zero, shift the lower part over
                x = x << 64;
                n = n + 64;
            };
            if (x & 340282366841710300949110269838224261120 == 0) {
                // x's higher 32 is all zero, shift the lower part over
                x = x << 32;
                n = n + 32;
            };
            if (x & 340277174624079928635746076935438991360 == 0) {
                // x's higher 16 is all zero, shift the lower part over
                x = x << 16;
                n = n + 16;
            };
            if (x & 338953138925153547590470800371487866880 == 0) {
                // x's higher 8 is all zero, shift the lower part over
                x = x << 8;
                n = n + 8;
            };
            if (x & 319014718988379809496913694467282698240 == 0) {
                // x's higher 4 is all zero, shift the lower part over
                x = x << 4;
                n = n + 4;
            };
            if (x & 255211775190703847597530955573826158592 == 0) {
                // x's higher 2 is all zero, shift the lower part over
                x = x << 2;
                n = n + 2;
            };
            if (x & 170141183460469231731687303715884105728 == 0) {
                n = n + 1;
            };

            n
        }
    }

    /// sqrt returns y = floor(sqrt(x))
    public fun sqrt(x: u128): u128 {
        if (x == 0) {
            0
        } else if (x <= 3) {
            1
        } else {
            // reproduced from golang's big.Int.Sqrt
            let n = (MAX_SHIFT_SIZE - leading_zeros(x)) >> 1;
            let z = x >> ((n - 1) / 2);
            let z_next = (z + x / z) >> 1;
            while (z_next < z) {
                z = z_next;
                z_next = (z + x / z) >> 1;
            };
            z
        }
    }
}
