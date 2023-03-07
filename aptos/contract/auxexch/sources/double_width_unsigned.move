// Auto generated from gen-move-math
// https://github.com/fardream/gen-move-math
// Manual edit with caution.
// Arguments: double-width -p aux -w 256
// Version: v1.2.7
module aux::uint256 {
    struct Uint256 has store, copy, drop {
        hi: u128,
        lo: u128,
    }

    // MAX_SHIFT is desired width - 1.
    // It looks like move's shift size must be in u8, which has a max of 255.
    const MAX_SHIFT: u8 = 255;
    const UNDERLYING_SIZE: u8 = 128;
    const UNDERLYING_HALF_SIZE: u8 = 64;
    const UNDERLYING_HALF_POINT: u128 = 170141183460469231731687303715884105728;
    const UNDERLYING_LOWER_ONES: u128 = 18446744073709551615;
    const UNDERLYING_UPPER_ONES: u128 = 340282366920938463444927863358058659840;
    const UNDERLYING_ONES: u128 = 340282366920938463463374607431768211455;

    const E_OVERFLOW: u64 = 1001;
    const E_DIVISION_BY_ZERO: u64 = 1002;

    /// new creates a new Uint256
    public fun new(hi: u128, lo: u128): Uint256 {
        Uint256 {
            hi, lo,
        }
    }

    /// create a new zero value of the Uint256
    public fun zero(): Uint256 {
        Uint256 {
            hi: 0,
            lo: 0,
        }
    }

    /// checks if the value is zero.
    public fun is_zero(x: &Uint256): bool {
        x.hi == 0 && x.lo == 0
    }

    /// equal
    public fun equal(x: Uint256, y: Uint256): bool {
        x.hi == y.hi && x.lo == y.lo
    }

    /// greater
    public fun greater(x: Uint256, y: Uint256): bool {
        (x.hi > y.hi) || ((x.hi == y.hi) && (x.lo > y.lo))
    }

    /// greater_or_equal
    public fun greater_or_equal(x: Uint256, y: Uint256): bool {
        (x.hi > y.hi) || ((x.hi == y.hi) && (x.lo >= y.lo))
    }

    /// less
    public fun less(x: Uint256, y: Uint256): bool {
        (x.hi < y.hi) || ((x.hi == y.hi) && (x.lo < y.lo))
    }

    /// less_or_equal
    public fun less_or_equal(x: Uint256, y: Uint256): bool {
        (x.hi < y.hi) || ((x.hi == y.hi) && (x.lo <= y.lo))
    }

    /// add two underlying with carry - will never abort.
    /// First return value is the value of the result, the second return value indicate if carry happens.
    public fun underlying_add_with_carry(x: u128, y: u128):(u128, u128) {
        let r = UNDERLYING_ONES - x;
        if (r < y) {
            (y - r - 1, 1)
        } else {
            (x + y, 0)
        }
    }

    /// subtract y from x with borrow - will never abort.
    /// First return value is the value of the result, the second return value indicate if borrow happens.
    public fun underlying_sub_with_borrow(x: u128, y:u128): (u128, u128) {
        if (x < y) {
            ((UNDERLYING_ONES - y) + 1 + x, 1)
        } else {
            (x-y, 0)
        }
    }

    /// add x and y, plus possible carry, abort when overflow
    fun underlying_add_plus_carry(x: u128, y: u128, carry: u128): u128 {
        x + y + carry // will abort if overflow
    }

    /// subtract y and possible borrow from x, abort when underflow
    fun underlying_sub_minus_borrow(x: u128, y: u128, borrow: u128): u128 {
        x - y - borrow // will abort if underflow
    }

    /// add x and y, abort if overflows
    public fun add(x: Uint256, y: Uint256): Uint256 {
        let (lo, c) = underlying_add_with_carry(x.lo, y.lo);
        let hi = underlying_add_plus_carry(x.hi, y.hi, c);
        Uint256 {
            hi,
            lo,
        }
    }

    /// add u128 to Uint256
    public fun add_underlying(x:Uint256, y: u128): Uint256 {
        let (lo, carry) = underlying_add_with_carry(x.lo, y);
        Uint256 {
            lo,
            hi: x.hi + carry,
        }
    }

    /// subtract y from x, abort if underflows
    public fun subtract(x: Uint256, y: Uint256): Uint256 {
        let (lo, b) = underlying_sub_with_borrow(x.lo, y.lo);
        let hi = underlying_sub_minus_borrow(x.hi, y.hi, b);
        Uint256 {
            hi,
            lo,
        }
    }

    /// subtract y from x, abort if underflows
    public fun subtract_underlying(x: Uint256, y: u128): Uint256 {
        let (lo, b) = underlying_sub_with_borrow(x.lo, y);
        let hi = x.hi - b;
        Uint256 {
            hi,
            lo,
        }
    }

    /// x * y, first return value is the lower part of the result, second return value is the upper part of the result.
    public fun underlying_mul_with_carry(x: u128, y: u128):(u128, u128) {
        // split x and y into lower part and upper part.
        // xh, xl, yh, yl
        // result is
        // upper = xh * xl + (xh * yl) >> half_size + (xl * yh) >> half_size
        // lower = xl * yl + (xh * yl) << half_size + (xl * yh) << half_size
        let xh = (x & UNDERLYING_UPPER_ONES) >> UNDERLYING_HALF_SIZE;
        let xl = x & UNDERLYING_LOWER_ONES;
        let yh = (y & UNDERLYING_UPPER_ONES) >> UNDERLYING_HALF_SIZE;
        let yl = y & UNDERLYING_LOWER_ONES;
        let xhyl = xh * yl;
        let xlyh = xl * yh;

        let (lo, lo_carry_1) = underlying_add_with_carry(xl * yl, (xhyl & UNDERLYING_LOWER_ONES) << UNDERLYING_HALF_SIZE);
        let (lo, lo_carry_2) = underlying_add_with_carry(lo, (xlyh & UNDERLYING_LOWER_ONES)<< UNDERLYING_HALF_SIZE);
        let hi = xh * yh + (xhyl >> UNDERLYING_HALF_SIZE) + (xlyh >> UNDERLYING_HALF_SIZE) + lo_carry_1 + lo_carry_2;

        (lo, hi)
    }

    public fun underlying_mul_to_uint256(x: u128, y: u128): Uint256{
        let (lo, hi) = underlying_mul_with_carry(x, y);
        new(hi, lo)
    }

    /// x * y, abort if overflow
    public fun multiply(x: Uint256, y: Uint256): Uint256 {
        assert!(x.hi == 0 || y.hi == 0, E_OVERFLOW); // if hi * hi is not zero, overflow already
        let (xlyl, xlyl_carry) = underlying_mul_with_carry(x.lo, y.lo);
        Uint256 {
            lo: xlyl,
            hi: x.lo * y.hi + x.hi * y.lo + xlyl_carry,
        }
    }

    /// x * y where y is u128
    public fun multiply_underlying(x: Uint256, y: u128): Uint256 {
        let (xlyl, xlyl_carry) = underlying_mul_with_carry(x.lo, y);
        Uint256 {
            lo: xlyl,
            hi: x.hi * y + xlyl_carry,
        }
    }

    /// left shift, abort if shift is greater than the size of the int.
    public fun lsh(x: Uint256, y: u8): Uint256 {
        assert!(y <= MAX_SHIFT, E_OVERFLOW);
        if (y >= UNDERLYING_SIZE) {
            Uint256 {
                hi: x.lo << (y - UNDERLYING_SIZE),
                lo: 0,
            }
        } else if (y == 0) {
            copy x
        } else {
            Uint256 {
                hi: (x.hi << y) + (x.lo >> (UNDERLYING_SIZE - y)),
                lo: x.lo << y,
            }
        }
    }

    /// right shift, abort if shift is greater than the size of the int
    public fun rsh(x: Uint256, y: u8): Uint256 {
        assert!(y <= MAX_SHIFT, E_OVERFLOW);
        if (y >= UNDERLYING_SIZE) {
            Uint256 {
                hi: 0,
                lo: x.hi >> (y - UNDERLYING_SIZE),
            }
        } else if (y==0) {
            copy x
        } else {
            Uint256 {
                hi: x.hi >> y,
                lo: (x.lo >> y) + (x.hi << (UNDERLYING_SIZE-y)),
            }
        }
    }

    /// count leading zeros of the underlying type u128
    public fun underlying_leading_zeros(x: u128): u8 {
        if (x == 0) {
            UNDERLYING_SIZE
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

    /// get number leading zeros
    public fun leading_zeros(x: Uint256): u8 {
        if (x.hi == 0) {
            UNDERLYING_SIZE + underlying_leading_zeros(x.lo)
        } else {
            underlying_leading_zeros(x.hi)
        }
    }

    /// divide_mod returns x/y and x%y
    public fun divide_mod(x: Uint256, y: Uint256): (Uint256, Uint256) {
        assert!(y.hi != 0 || y.lo != 0, E_DIVISION_BY_ZERO);
        if (greater(y, x)) {
            (zero(), copy x)
        } else if (equal(x, y)){
            (new(0,1), zero())
        } else if (x.hi == 0 && y.hi == 0) {
            (new(0, x.lo/y.lo), new(0,x.lo%y.lo))
        } else {
            let n_x = leading_zeros(x);
            let n_y = leading_zeros(y);
            // x is greater than y, so this cannot happen
            // assert!(n_x <= n_y, 1);

            let shift = n_y - n_x;
            let current = lsh(y, shift);
            let remainder = copy x;

            let result = new(0,0);

            loop {
                if (!less(remainder, current)) {
                    remainder = subtract(remainder, current);
                    result = add(result, lsh(new(0,1), shift));
                };
                if (shift == 0) { break };
                current = rsh(current, 1);
                shift = shift - 1;
            };

            (result, remainder)
        }
    }

    /// divide returns x/y
    public fun divide(x: Uint256, y: Uint256): Uint256 {
        let (r, _) = divide_mod(x, y);
        r
    }

    /// mod returns x%y
    public fun mod(x: Uint256, y: Uint256): Uint256 {
        let (_, r) = divide_mod(x, y);
        r
    }

    /// divide_mod_underlying returns x/y and x%y, where y is u128.
    public fun divide_mod_underlying(x: Uint256, y: u128): (Uint256, u128) {
        let (result, remainder) = divide_mod(x, new(0, y));
        (result, downcast(remainder))
    }

    /// divide underlying returns x/y, where y is u128
    public fun divide_underlying(x: Uint256, y: u128): Uint256 {
        let (result, _) = divide_mod(x, new(0, y));
        result
    }

    /// hi component of the value.
    public fun hi(x: Uint256): u128 {
        x.hi
    }

    /// lo component of the value
    public fun lo(x: Uint256): u128 {
        x.lo
    }

    public fun bitwise_and(x: Uint256, y: Uint256): Uint256 {
        Uint256 {
            hi: x.hi & y.hi,
            lo: x.lo & y.lo,
        }
    }

    public fun bitwise_or(x: Uint256, y: Uint256): Uint256 {
        Uint256 {
            hi: x.hi | y.hi,
            lo: x.lo | y.lo,
        }
    }

    public fun bitwise_xor(x: Uint256, y: Uint256): Uint256 {
        Uint256 {
            hi: x.hi ^ y.hi,
            lo: x.lo ^ y.lo,
        }
    }

    /// Indicate the value will overflow if converted to underlying type.
    public fun underlying_overflow(x: Uint256): bool {
        x.hi != 0
    }

    /// downcast converts Uint256 to u128. abort if overflow.
    public fun downcast(x: Uint256): u128 {
        assert!(
            !underlying_overflow(x),
            E_OVERFLOW,
        );

        x.lo
    }
}
