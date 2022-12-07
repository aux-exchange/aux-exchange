// Auto generated from gen-move-math
// https://github.com/fardream/gen-move-math
// Manual edit with caution.
// Arguments: -p aux -o ../aptos/contract/aux/sources/signed_int.move -p aux -w 64 -w 128
// Version: v1.3.0
module aux::int64 {
    /// Int64 defines a signed integer with 64 bit width from u64.
    /// Negative numbers are represented by two's complements.
    struct Int64 has store, copy, drop {
        value: u64,
    }

    const E_OUT_OF_RANGE: u64 = 1001;

    /// BREAK_POINT is the value of 2^(64-1), where positive and negative breaks.
    /// It is the minimal value of the negative value -2^(64-1).
    /// BREAK_POINT has the sign bit 1, and all lower bits 0.
    const BREAK_POINT: u64 = 9223372036854775808;
    /// Max Positive, this is BREAK_POINT-1, and the max value for the positive numbers.
    /// MAX_POSITIVE has the sign bit 0, and all lower bits 1.
    const MAX_POSITIVE: u64 = 9223372036854775807;
    /// Max U is the max value of the unsigned, which is 2^64 - 1.
    /// MAX_U has all its bits 1.
    const MAX_U: u64 = 18446744073709551615;

    /// swap_half shifts the value of negative numbers to lower half of the total range,
    /// and non negative numbers to the upper half of the total range - this is essentially
    /// x + BREAK_POINT.
    fun swap_half(x: Int64): u64 {
        // Flip the sign bit - that's it.
        x.value^BREAK_POINT
    }

    /// new creates a Int64.
    public fun new(absolute_value: u64, negative: bool): Int64 {
        assert!((negative && absolute_value <= BREAK_POINT) || (!negative && absolute_value < BREAK_POINT), E_OUT_OF_RANGE);
        if (!negative || absolute_value == 0) {
            Int64 {
                value: absolute_value,
            }
        } else {
            Int64 {
                value: (MAX_U ^ absolute_value) + 1,
            }
        }
    }

    /// is_negative checks if x is negative.
    public fun is_negative(x: Int64): bool {
        x.value >= BREAK_POINT
    }

    public fun is_zero(x: Int64): bool {
        x.value == 0
    }

    /// negative returns -x.
    public fun negative(x: Int64): Int64 {
        assert!(x.value != BREAK_POINT, E_OUT_OF_RANGE);

        if (x.value == 0) {
            copy x
        } else {
            Int64 {
                value: (MAX_U^x.value) + 1
            }
        }
    }

    /// abs returns the absolute value of x (as the unsigned underlying u64)
    public fun abs(x: Int64): u64 {
        if (!is_negative(x)) {
            x.value
        } else {
            (MAX_U^x.value) + 1
        }
    }

    /// zero obtains the zero value of the type.
    public fun zero(): Int64 {
        Int64 {
            value: 0
        }
    }

    /// equal checks if x == y
    public fun equal(x: Int64, y: Int64): bool {
        x.value == y.value
    }

    /// greater checks if x > y
    public fun greater(x: Int64, y:Int64): bool {
        swap_half(x) > swap_half(y)
    }

    /// less checks if x < y
    public fun less(x: Int64, y: Int64): bool {
        swap_half(x) < swap_half(y)
    }

    /// add x and y, abort if overflow
    public fun add(x: Int64, y: Int64): Int64 {
        // get the lower bits of x, and y, and the sign bits.
        let xl = x.value & MAX_POSITIVE;
        let xs = x.value & BREAK_POINT;
        let yl = y.value & MAX_POSITIVE;
        let ys = y.value & BREAK_POINT;
        // add the lower bits up, and if x and have don't have the same sign, flip the sign bit.
        let r = (xl + yl) ^ (xs ^ ys);
        // get the sign bit of the result
        let rs = r & BREAK_POINT;
        // make sure:
        // - x and y's sign bits are different (never overflow)
        // - or r's sign bits are same as x and y's sign bits (in this case, the result may overflow).
        assert!((xs != ys)||(xs == rs), E_OUT_OF_RANGE);
        // return the result
        Int64 {
            value: r,
        }
    }

    /// subtract y from x, abort if overflows
    public fun subtract(x: Int64, y: Int64): Int64 {
        // y is the smallest value of negative
        // x must be at most -1
        if (y.value == BREAK_POINT) {
            // technically speaking, should check overflow
            // however, the minus will abort with underflow
            // assert!(x.value >= BREAK_POINT, E_OUT_OF_RANGE);
            Int64 {
                value: x.value - y.value,
            }
        } else {
            add(x, negative(y))
        }
    }

    /// multiply x and y, abort if overflows
    public fun multiply(x: Int64, y: Int64): Int64 {
        let xv = abs(x);
        let yv = abs(y);
        let r = xv * yv; // will fail if overflow
        if ((x.value & BREAK_POINT)^(y.value & BREAK_POINT) == 0) {
            new(r, false)
        } else {
            new(r, true)
        }
    }

    /// divide x with y, abort if y is 0
    public fun divide(x: Int64, y: Int64): Int64 {
        let xv = abs(x);
        let yv = abs(y);
        let r = xv / yv; // will fail if divide by 0
        if ((x.value & BREAK_POINT)^(y.value & BREAK_POINT) == 0) {
            new(r, false)
        } else {
            new(r, true)
        }
    }

    /// mod remainder of the integer division (x - y*(x/y))
    public fun mod(x: Int64, y: Int64): Int64 {
        subtract(x, multiply(y, divide(x, y)))
    }

    /// raw value returns the underlying unsigned integer u64
    public fun raw_value(x: Int64): u64 {
        x.value
    }

    /// bitwise and 
    public fun bitwise_and(x: Int64, y: Int64): Int64 {
        Int64 {
            value: x.value & y.value,
        }
    }

    /// bitwise or
    public fun bitwise_or(x: Int64, y: Int64): Int64 {
        Int64 {
            value: x.value | y.value,
        }
    }

    /// bitwise xor
    public fun bitwise_xor(x: Int64, y: Int64): Int64 {
        Int64 {
            value: x.value ^ y.value,
        }
    }

    /// left shift the integer
    public fun lsh(x: Int64, n: u8): Int64 {
        Int64 {
            value: (x.value << n),
        }
    }

    /// right shift the integer
    public fun rsh(x: Int64, n: u8): Int64 {
        Int64 {
            value: (x.value >> n),
        }
    }
}

// Auto generated from gen-move-math
// https://github.com/fardream/gen-move-math
// Manual edit with caution.
// Arguments: -p aux -o ../aptos/contract/aux/sources/signed_int.move -p aux -w 64 -w 128
// Version: v1.3.0
module aux::int128 {
    /// Int128 defines a signed integer with 128 bit width from u128.
    /// Negative numbers are represented by two's complements.
    struct Int128 has store, copy, drop {
        value: u128,
    }

    const E_OUT_OF_RANGE: u64 = 1001;

    /// BREAK_POINT is the value of 2^(128-1), where positive and negative breaks.
    /// It is the minimal value of the negative value -2^(128-1).
    /// BREAK_POINT has the sign bit 1, and all lower bits 0.
    const BREAK_POINT: u128 = 170141183460469231731687303715884105728;
    /// Max Positive, this is BREAK_POINT-1, and the max value for the positive numbers.
    /// MAX_POSITIVE has the sign bit 0, and all lower bits 1.
    const MAX_POSITIVE: u128 = 170141183460469231731687303715884105727;
    /// Max U is the max value of the unsigned, which is 2^128 - 1.
    /// MAX_U has all its bits 1.
    const MAX_U: u128 = 340282366920938463463374607431768211455;

    /// swap_half shifts the value of negative numbers to lower half of the total range,
    /// and non negative numbers to the upper half of the total range - this is essentially
    /// x + BREAK_POINT.
    fun swap_half(x: Int128): u128 {
        // Flip the sign bit - that's it.
        x.value^BREAK_POINT
    }

    /// new creates a Int128.
    public fun new(absolute_value: u128, negative: bool): Int128 {
        assert!((negative && absolute_value <= BREAK_POINT) || (!negative && absolute_value < BREAK_POINT), E_OUT_OF_RANGE);
        if (!negative || absolute_value == 0) {
            Int128 {
                value: absolute_value,
            }
        } else {
            Int128 {
                value: (MAX_U ^ absolute_value) + 1,
            }
        }
    }

    /// is_negative checks if x is negative.
    public fun is_negative(x: Int128): bool {
        x.value >= BREAK_POINT
    }

    public fun is_zero(x: Int128): bool {
        x.value == 0
    }

    /// negative returns -x.
    public fun negative(x: Int128): Int128 {
        assert!(x.value != BREAK_POINT, E_OUT_OF_RANGE);

        if (x.value == 0) {
            copy x
        } else {
            Int128 {
                value: (MAX_U^x.value) + 1
            }
        }
    }

    /// abs returns the absolute value of x (as the unsigned underlying u128)
    public fun abs(x: Int128): u128 {
        if (!is_negative(x)) {
            x.value
        } else {
            (MAX_U^x.value) + 1
        }
    }

    /// zero obtains the zero value of the type.
    public fun zero(): Int128 {
        Int128 {
            value: 0
        }
    }

    /// equal checks if x == y
    public fun equal(x: Int128, y: Int128): bool {
        x.value == y.value
    }

    /// greater checks if x > y
    public fun greater(x: Int128, y:Int128): bool {
        swap_half(x) > swap_half(y)
    }

    /// less checks if x < y
    public fun less(x: Int128, y: Int128): bool {
        swap_half(x) < swap_half(y)
    }

    /// add x and y, abort if overflow
    public fun add(x: Int128, y: Int128): Int128 {
        // get the lower bits of x, and y, and the sign bits.
        let xl = x.value & MAX_POSITIVE;
        let xs = x.value & BREAK_POINT;
        let yl = y.value & MAX_POSITIVE;
        let ys = y.value & BREAK_POINT;
        // add the lower bits up, and if x and have don't have the same sign, flip the sign bit.
        let r = (xl + yl) ^ (xs ^ ys);
        // get the sign bit of the result
        let rs = r & BREAK_POINT;
        // make sure:
        // - x and y's sign bits are different (never overflow)
        // - or r's sign bits are same as x and y's sign bits (in this case, the result may overflow).
        assert!((xs != ys)||(xs == rs), E_OUT_OF_RANGE);
        // return the result
        Int128 {
            value: r,
        }
    }

    /// subtract y from x, abort if overflows
    public fun subtract(x: Int128, y: Int128): Int128 {
        // y is the smallest value of negative
        // x must be at most -1
        if (y.value == BREAK_POINT) {
            // technically speaking, should check overflow
            // however, the minus will abort with underflow
            // assert!(x.value >= BREAK_POINT, E_OUT_OF_RANGE);
            Int128 {
                value: x.value - y.value,
            }
        } else {
            add(x, negative(y))
        }
    }

    /// multiply x and y, abort if overflows
    public fun multiply(x: Int128, y: Int128): Int128 {
        let xv = abs(x);
        let yv = abs(y);
        let r = xv * yv; // will fail if overflow
        if ((x.value & BREAK_POINT)^(y.value & BREAK_POINT) == 0) {
            new(r, false)
        } else {
            new(r, true)
        }
    }

    /// divide x with y, abort if y is 0
    public fun divide(x: Int128, y: Int128): Int128 {
        let xv = abs(x);
        let yv = abs(y);
        let r = xv / yv; // will fail if divide by 0
        if ((x.value & BREAK_POINT)^(y.value & BREAK_POINT) == 0) {
            new(r, false)
        } else {
            new(r, true)
        }
    }

    /// mod remainder of the integer division (x - y*(x/y))
    public fun mod(x: Int128, y: Int128): Int128 {
        subtract(x, multiply(y, divide(x, y)))
    }

    /// raw value returns the underlying unsigned integer u128
    public fun raw_value(x: Int128): u128 {
        x.value
    }

    /// bitwise and 
    public fun bitwise_and(x: Int128, y: Int128): Int128 {
        Int128 {
            value: x.value & y.value,
        }
    }

    /// bitwise or
    public fun bitwise_or(x: Int128, y: Int128): Int128 {
        Int128 {
            value: x.value | y.value,
        }
    }

    /// bitwise xor
    public fun bitwise_xor(x: Int128, y: Int128): Int128 {
        Int128 {
            value: x.value ^ y.value,
        }
    }

    /// left shift the integer
    public fun lsh(x: Int128, n: u8): Int128 {
        Int128 {
            value: (x.value << n),
        }
    }

    /// right shift the integer
    public fun rsh(x: Int128, n: u8): Int128 {
        Int128 {
            value: (x.value >> n),
        }
    }
}
