#[test_only]
module aux::math_3pool_test {
    use aux::math_3pool::{calculate_d, calculate_x};

    #[test]
    fun test_calculate_d_0() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let expected_d: u128 = 3000000000000000000000;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_1() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let expected_d: u128 = 3998187734904039643733;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_2() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let expected_d: u128 = 4993378082962246621860;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_3() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let expected_d: u128 = 5985435865189416134648;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_4() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let expected_d: u128 = 6973955520632703312711;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_5() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let expected_d: u128 = 3998187734904039643733;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_6() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let expected_d: u128 = 4998073947332798319835;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_7() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let expected_d: u128 = 5995113928792398913703;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_8() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let expected_d: u128 = 6989969881886394221744;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_9() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let expected_d: u128 = 7982577600692691468751;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_10() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let expected_d: u128 = 4993378082962246621860;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_11() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let expected_d: u128 = 5995113928792398913703;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_12() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let expected_d: u128 = 6992967787820906937056;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_13() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let expected_d: u128 = 7988686596589328391187;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_14() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let expected_d: u128 = 8982489378722752093527;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_15() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let expected_d: u128 = 5985435865189416134648;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_16() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let expected_d: u128 = 6989969881886394221744;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_17() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let expected_d: u128 = 7988686596589328391187;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_18() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let expected_d: u128 = 8984935471642750299222;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_19() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let expected_d: u128 = 9979293045949747636708;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_20() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let expected_d: u128 = 6973955520632703312711;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_21() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let expected_d: u128 = 7982577600692691468751;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_22() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let expected_d: u128 = 8982489378722752093527;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_23() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let expected_d: u128 = 9979293045949747636708;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_24() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let expected_d: u128 = 10974043649611107520428;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_25() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let expected_d: u128 = 3998187734904039643733;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_26() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let expected_d: u128 = 4998073947332798319835;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_27() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let expected_d: u128 = 5995113928792398913703;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_28() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let expected_d: u128 = 6989969881886394221744;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_29() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let expected_d: u128 = 7982577600692691468751;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_30() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let expected_d: u128 = 4998073947332798319835;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_31() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let expected_d: u128 = 6000000000000000000000;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_32() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let expected_d: u128 = 6998994463534369711562;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_33() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let expected_d: u128 = 7996375469808079287467;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_34() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let expected_d: u128 = 8992305683312416560277;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_35() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let expected_d: u128 = 5995113928792398913703;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_36() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let expected_d: u128 = 6998994463534369711562;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_37() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let expected_d: u128 = 7998951568500447452901;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_38() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let expected_d: u128 = 8997246008109686249667;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_39() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let expected_d: u128 = 9994263918204225289237;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_40() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let expected_d: u128 = 6989969881886394221744;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_41() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let expected_d: u128 = 7996375469808079287467;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_42() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let expected_d: u128 = 8997246008109686249667;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_43() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let expected_d: u128 = 9996147894665596639671;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_44() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let expected_d: u128 = 10993748294182400419198;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_45() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let expected_d: u128 = 7982577600692691468751;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_46() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let expected_d: u128 = 8992305683312416560277;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_47() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let expected_d: u128 = 9994263918204225289237;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_48() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let expected_d: u128 = 10993748294182400419198;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_49() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let expected_d: u128 = 11991787145216717847036;
        let d = calculate_d(x0, x1, x2, 15);
        assert!(d == expected_d, 1);
    }

    #[test]
    fun test_calculate_x_0_0() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let d: u128 = 3000000000000000000000;
        let expected_x2: u128 = 1000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_1() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let d: u128 = 3998187734904039643733;
        let expected_x2: u128 = 1999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_2() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let d: u128 = 4993378082962246621860;
        let expected_x2: u128 = 3000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_3() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let d: u128 = 5985435865189416134648;
        let expected_x2: u128 = 3999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_4() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let d: u128 = 6973955520632703312711;
        let expected_x2: u128 = 4999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_5() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let d: u128 = 3998187734904039643733;
        let expected_x2: u128 = 999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_6() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let d: u128 = 4998073947332798319835;
        let expected_x2: u128 = 1999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_7() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let d: u128 = 5995113928792398913703;
        let expected_x2: u128 = 2999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_8() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let d: u128 = 6989969881886394221744;
        let expected_x2: u128 = 3999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_9() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let d: u128 = 7982577600692691468751;
        let expected_x2: u128 = 4999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_10() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let d: u128 = 4993378082962246621860;
        let expected_x2: u128 = 1000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_11() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let d: u128 = 5995113928792398913703;
        let expected_x2: u128 = 1999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_12() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let d: u128 = 6992967787820906937056;
        let expected_x2: u128 = 2999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_13() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let d: u128 = 7988686596589328391187;
        let expected_x2: u128 = 4000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_14() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let d: u128 = 8982489378722752093527;
        let expected_x2: u128 = 5000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_15() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let d: u128 = 5985435865189416134648;
        let expected_x2: u128 = 999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_16() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let d: u128 = 6989969881886394221744;
        let expected_x2: u128 = 1999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_17() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let d: u128 = 7988686596589328391187;
        let expected_x2: u128 = 3000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_18() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let d: u128 = 8984935471642750299222;
        let expected_x2: u128 = 3999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_19() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let d: u128 = 9979293045949747636708;
        let expected_x2: u128 = 5000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_20() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let d: u128 = 6973955520632703312711;
        let expected_x2: u128 = 999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_21() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let d: u128 = 7982577600692691468751;
        let expected_x2: u128 = 1999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_22() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let d: u128 = 8982489378722752093527;
        let expected_x2: u128 = 3000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_23() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let d: u128 = 9979293045949747636708;
        let expected_x2: u128 = 4000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_24() {
        // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let d: u128 = 10974043649611107520428;
        let expected_x2: u128 = 4999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_25() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let d: u128 = 3998187734904039643733;
        let expected_x2: u128 = 999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_26() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let d: u128 = 4998073947332798319835;
        let expected_x2: u128 = 1999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_27() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let d: u128 = 5995113928792398913703;
        let expected_x2: u128 = 2999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_28() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let d: u128 = 6989969881886394221744;
        let expected_x2: u128 = 3999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_29() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let d: u128 = 7982577600692691468751;
        let expected_x2: u128 = 4999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_30() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let d: u128 = 4998073947332798319835;
        let expected_x2: u128 = 999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_31() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let d: u128 = 6000000000000000000000;
        let expected_x2: u128 = 2000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_32() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let d: u128 = 6998994463534369711562;
        let expected_x2: u128 = 3000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_33() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let d: u128 = 7996375469808079287467;
        let expected_x2: u128 = 4000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_34() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let d: u128 = 8992305683312416560277;
        let expected_x2: u128 = 5000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_35() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let d: u128 = 5995113928792398913703;
        let expected_x2: u128 = 999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_36() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let d: u128 = 6998994463534369711562;
        let expected_x2: u128 = 2000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_37() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let d: u128 = 7998951568500447452901;
        let expected_x2: u128 = 3000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_38() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let d: u128 = 8997246008109686249667;
        let expected_x2: u128 = 3999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_39() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let d: u128 = 9994263918204225289237;
        let expected_x2: u128 = 5000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_40() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let d: u128 = 6989969881886394221744;
        let expected_x2: u128 = 999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_41() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let d: u128 = 7996375469808079287467;
        let expected_x2: u128 = 2000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_42() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let d: u128 = 8997246008109686249667;
        let expected_x2: u128 = 2999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_43() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let d: u128 = 9996147894665596639671;
        let expected_x2: u128 = 4000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_44() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let d: u128 = 10993748294182400419198;
        let expected_x2: u128 = 5000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_45() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 1000000000000000000000;
        let d: u128 = 7982577600692691468751;
        let expected_x2: u128 = 999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_46() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 2000000000000000000000;
        let d: u128 = 8992305683312416560277;
        let expected_x2: u128 = 2000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_47() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 3000000000000000000000;
        let d: u128 = 9994263918204225289237;
        let expected_x2: u128 = 3000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_48() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 4000000000000000000000;
        let d: u128 = 10993748294182400419198;
        let expected_x2: u128 = 4000000000000000000000;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
    #[test]
    fun test_calculate_x_0_49() {
        // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let x2: u128 = 5000000000000000000000;
        let d: u128 = 11991787145216717847036;
        let expected_x2: u128 = 4999999999999999999999;
        let x2 = calculate_x(x0, x1, x2, 2, 15, d);
        assert!(x2 == expected_x2, 1);
    }
}
