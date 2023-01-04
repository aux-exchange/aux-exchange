// Auto generated from gen-move-math
// https://github.com/fardream/gen-move-math
// Manual edit with caution.
// Arguments: signed-math -p aux -o ../aptos/contract/aux/sources/signed_int.move -p aux -w 32 -w 128
// Version: v1.4.5
module aux::int32 {
    /// Int32 defines a signed integer with 32 bit width from u32.
    /// Negative numbers are represented by two's complements.
    struct Int32 has store, copy, drop {
        value: u32,
    }

    const E_OUT_OF_RANGE: u64 = 1001;

    /// BREAK_POINT is the value of 2^(32-1), where positive and negative breaks.
    /// It is the minimal value of the negative value -2^(32-1).
    /// BREAK_POINT has the sign bit 1, and all lower bits 0.
    const BREAK_POINT: u32 = 2147483648;
    /// Max Positive, this is BREAK_POINT-1, and the max value for the positive numbers.
    /// MAX_POSITIVE has the sign bit 0, and all lower bits 1.
    const MAX_POSITIVE: u32 = 2147483647;
    /// Max U is the max value of the unsigned, which is 2^32 - 1.
    /// MAX_U has all its bits 1.
    const MAX_U: u32 = 4294967295;

    /// swap_half shifts the value of negative numbers to lower half of the total range,
    /// and non negative numbers to the upper half of the total range - this is essentially
    /// x + BREAK_POINT.
    fun swap_half(x: Int32): u32 {
        // Flip the sign bit - that's it.
        x.value^BREAK_POINT
    }

    /// new creates a Int32.
    public fun new(absolute_value: u32, negative: bool): Int32 {
        assert!((negative && absolute_value <= BREAK_POINT) || (!negative && absolute_value < BREAK_POINT), E_OUT_OF_RANGE);
        if (!negative || absolute_value == 0) {
            Int32 {
                value: absolute_value,
            }
        } else {
            Int32 {
                value: (MAX_U ^ absolute_value) + 1,
            }
        }
    }

    /// is_negative checks if x is negative.
    public fun is_negative(x: Int32): bool {
        x.value >= BREAK_POINT
    }

    public fun is_zero(x: Int32): bool {
        x.value == 0
    }

    /// negative returns -x.
    public fun negative(x: Int32): Int32 {
        assert!(x.value != BREAK_POINT, E_OUT_OF_RANGE);

        if (x.value == 0) {
            copy x
        } else {
            Int32 {
                value: (MAX_U^x.value) + 1
            }
        }
    }

    /// abs returns the absolute value of x (as the unsigned underlying u32)
    public fun abs(x: Int32): u32 {
        if (!is_negative(x)) {
            x.value
        } else {
            (MAX_U^x.value) + 1
        }
    }

    /// zero obtains the zero value of the type.
    public fun zero(): Int32 {
        Int32 {
            value: 0
        }
    }

    /// equal checks if x == y
    public fun equal(x: Int32, y: Int32): bool {
        x.value == y.value
    }

    /// greater checks if x > y
    public fun greater(x: Int32, y:Int32): bool {
        swap_half(x) > swap_half(y)
    }

    /// less checks if x < y
    public fun less(x: Int32, y: Int32): bool {
        swap_half(x) < swap_half(y)
    }

    /// add x and y, abort if overflow
    public fun add(x: Int32, y: Int32): Int32 {
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
        Int32 {
            value: r,
        }
    }

    /// subtract y from x, abort if overflows
    public fun subtract(x: Int32, y: Int32): Int32 {
        // y is the smallest value of negative
        // x must be at most -1
        if (y.value == BREAK_POINT) {
            // technically speaking, should check overflow
            // however, the minus will abort with underflow
            // assert!(x.value >= BREAK_POINT, E_OUT_OF_RANGE);
            Int32 {
                value: x.value - y.value,
            }
        } else {
            add(x, negative(y))
        }
    }

    /// calculate x - y for the unsigned type.
    public fun unsigned_subtract(x: u32, y: u32): Int32 {
        if (x > y) {
            new(x - y, false)
        } else {
            new(y - x, true)
        }
    }

    /// multiply x and y, abort if overflows
    public fun multiply(x: Int32, y: Int32): Int32 {
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
    public fun divide(x: Int32, y: Int32): Int32 {
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
    public fun mod(x: Int32, y: Int32): Int32 {
        subtract(x, multiply(y, divide(x, y)))
    }

    /// raw value returns the underlying unsigned integer u32
    public fun raw_value(x: Int32): u32 {
        x.value
    }

    /// bitwise and
    public fun bitwise_and(x: Int32, y: Int32): Int32 {
        Int32 {
            value: x.value & y.value,
        }
    }

    /// bitwise or
    public fun bitwise_or(x: Int32, y: Int32): Int32 {
        Int32 {
            value: x.value | y.value,
        }
    }

    /// bitwise xor
    public fun bitwise_xor(x: Int32, y: Int32): Int32 {
        Int32 {
            value: x.value ^ y.value,
        }
    }

    /// left shift the integer
    public fun lsh(x: Int32, n: u8): Int32 {
        Int32 {
            value: (x.value << n),
        }
    }

    /// right shift the integer
    public fun rsh(x: Int32, n: u8): Int32 {
        Int32 {
            value: (x.value >> n),
        }
    }
}

// Auto generated from gen-move-math
// https://github.com/fardream/gen-move-math
// Manual edit with caution.
// Arguments: signed-math -p aux -o ../aptos/contract/aux/sources/signed_int.move -p aux -w 32 -w 128
// Version: v1.4.5
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

    /// calculate x - y for the unsigned type.
    public fun unsigned_subtract(x: u128, y: u128): Int128 {
        if (x > y) {
            new(x - y, false)
        } else {
            new(y - x, true)
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
