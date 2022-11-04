#[test_only]
module aux::math_2pool_small_test {
    const E_EMERGENCY_ABORT: u64 = 0xFFFFFF;
    fun is_not_emergency(): bool {
        false
    }
    use aux::math_2pool::{calculate_d,calculate_x_0_non_decreasing_d, calculate_x_1_non_decreasing_d};
    #[test]
    fun test_math_2pool_small() {
        let scaler = 1;
        let x_0 = 1000 * scaler;
        let x_1 = 4000 * scaler;
        let d = calculate_d(x_0, x_1, 85);

        let x_0 = (1000 + 2)*scaler;
        let x_1 = calculate_x_1_non_decreasing_d(x_0, 85, d);
        assert!(x_1 == 3998*scaler, 1);

        let x_1 = (3998 + 7)*scaler;
        let x_0 = calculate_x_0_non_decreasing_d(x_1, 85, d);
        assert!(x_0 == 995*scaler, 2);

        let scaler = 10000;
        let x_0 = 1000 * scaler;
        let x_1 = 4000 * scaler;
        let d = calculate_d(x_0, x_1, 85);

        let x_0 = (1000 + 2)*scaler;
        let x_1 = calculate_x_1_non_decreasing_d(x_0, 85, d);
        assert!(x_1 == 39979660, 1);

        let x_1 = 39979660 + 7*scaler;
        let x_0 = calculate_x_0_non_decreasing_d(x_1, 85, d);
        assert!(x_0 == 9951177, 2);
    }
}

