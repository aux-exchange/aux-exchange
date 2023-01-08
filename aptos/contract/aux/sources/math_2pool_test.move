#[test_only]
module aux::math_2pool_test {
    use aux::math_2pool::{calculate_d, calculate_x, calculate_x_non_decreasing_d};

    #[test]
    fun test_calculate_d_0() {
       // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let expected_d: u128 = 2000000000000000000000;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_1() {
       // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let expected_d: u128 = 2993987324342594819162;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_2() {
       // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let expected_d: u128 = 3978828876840973560802;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_3() {
       // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let expected_d: u128 = 4955810397915579285744;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_4() {
       // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let expected_d: u128 = 5925388362748303567980;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_5() {
       // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 6000000000000000000000;
        let expected_d: u128 = 6887867795041488135767;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_6() {
       // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 7000000000000000000000;
        let expected_d: u128 = 7843501099357207543234;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_7() {
       // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 8000000000000000000000;
        let expected_d: u128 = 8792513639835515740306;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_8() {
       // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 9000000000000000000000;
        let expected_d: u128 = 9735112883796791085400;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_9() {
       // test
        let x0: u128 = 1000000000000000000000;
        let x1: u128 = 10000000000000000000000;
        let expected_d: u128 = 10671492539695429511451;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_10() {
       // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let expected_d: u128 = 2993987324342594819162;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_11() {
       // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let expected_d: u128 = 4000000000000000000000;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_12() {
       // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let expected_d: u128 = 4996646432824630184465;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_13() {
       // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let expected_d: u128 = 5987974648685189638325;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_14() {
       // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let expected_d: u128 = 6974865077314815159986;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_15() {
       // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 6000000000000000000000;
        let expected_d: u128 = 7957657753681947121605;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_16() {
       // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 7000000000000000000000;
        let expected_d: u128 = 8936535524851711934567;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_17() {
       // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 8000000000000000000000;
        let expected_d: u128 = 9911620795831158571488;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_18() {
       // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 9000000000000000000000;
        let expected_d: u128 = 10883008008267593357850;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_19() {
       // test
        let x0: u128 = 2000000000000000000000;
        let x1: u128 = 10000000000000000000000;
        let expected_d: u128 = 11850776725496607135961;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_20() {
       // test
        let x0: u128 = 3000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let expected_d: u128 = 3978828876840973560802;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_21() {
       // test
        let x0: u128 = 3000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let expected_d: u128 = 4996646432824630184465;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_22() {
       // test
        let x0: u128 = 3000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let expected_d: u128 = 6000000000000000000000;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_23() {
       // test
        let x0: u128 = 3000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let expected_d: u128 = 6997650179274309702766;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_24() {
       // test
        let x0: u128 = 3000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let expected_d: u128 = 7991425036417606251576;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_25() {
       // test
        let x0: u128 = 3000000000000000000000;
        let x1: u128 = 6000000000000000000000;
        let expected_d: u128 = 8981961973027784457488;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_26() {
       // test
        let x0: u128 = 3000000000000000000000;
        let x1: u128 = 7000000000000000000000;
        let expected_d: u128 = 9969553313965636362846;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_27() {
       // test
        let x0: u128 = 3000000000000000000000;
        let x1: u128 = 8000000000000000000000;
        let expected_d: u128 = 10954360603545046811764;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_28() {
       // test
        let x0: u128 = 3000000000000000000000;
        let x1: u128 = 9000000000000000000000;
        let expected_d: u128 = 11936486630522920682408;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_29() {
       // test
        let x0: u128 = 3000000000000000000000;
        let x1: u128 = 10000000000000000000000;
        let expected_d: u128 = 12916004407207853098264;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_30() {
       // test
        let x0: u128 = 4000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let expected_d: u128 = 4955810397915579285744;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_31() {
       // test
        let x0: u128 = 4000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let expected_d: u128 = 5987974648685189638325;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_32() {
       // test
        let x0: u128 = 4000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let expected_d: u128 = 6997650179274309702766;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_33() {
       // test
        let x0: u128 = 4000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let expected_d: u128 = 8000000000000000000000;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_34() {
       // test
        let x0: u128 = 4000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let expected_d: u128 = 8998186562807776230738;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_35() {
       // test
        let x0: u128 = 4000000000000000000000;
        let x1: u128 = 6000000000000000000000;
        let expected_d: u128 = 9993292865649260368930;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_36() {
       // test
        let x0: u128 = 4000000000000000000000;
        let x1: u128 = 7000000000000000000000;
        let expected_d: u128 = 10985797352784921592990;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_37() {
       // test
        let x0: u128 = 4000000000000000000000;
        let x1: u128 = 8000000000000000000000;
        let expected_d: u128 = 11975949297370379276650;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_38() {
       // test
        let x0: u128 = 4000000000000000000000;
        let x1: u128 = 9000000000000000000000;
        let expected_d: u128 = 12963895280304759421395;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_39() {
       // test
        let x0: u128 = 4000000000000000000000;
        let x1: u128 = 10000000000000000000000;
        let expected_d: u128 = 13949730154629630319972;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_40() {
       // test
        let x0: u128 = 5000000000000000000000;
        let x1: u128 = 1000000000000000000000;
        let expected_d: u128 = 5925388362748303567980;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_41() {
       // test
        let x0: u128 = 5000000000000000000000;
        let x1: u128 = 2000000000000000000000;
        let expected_d: u128 = 6974865077314815159986;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_42() {
       // test
        let x0: u128 = 5000000000000000000000;
        let x1: u128 = 3000000000000000000000;
        let expected_d: u128 = 7991425036417606251576;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_43() {
       // test
        let x0: u128 = 5000000000000000000000;
        let x1: u128 = 4000000000000000000000;
        let expected_d: u128 = 8998186562807776230738;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_44() {
       // test
        let x0: u128 = 5000000000000000000000;
        let x1: u128 = 5000000000000000000000;
        let expected_d: u128 = 10000000000000000000000;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_45() {
       // test
        let x0: u128 = 5000000000000000000000;
        let x1: u128 = 6000000000000000000000;
        let expected_d: u128 = 10998522091619534205600;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_46() {
       // test
        let x0: u128 = 5000000000000000000000;
        let x1: u128 = 7000000000000000000000;
        let expected_d: u128 = 11994477554332926716575;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_47() {
       // test
        let x0: u128 = 5000000000000000000000;
        let x1: u128 = 8000000000000000000000;
        let expected_d: u128 = 12988237117259130537377;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_48() {
       // test
        let x0: u128 = 5000000000000000000000;
        let x1: u128 = 9000000000000000000000;
        let expected_d: u128 = 13980012779215461970321;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }
    #[test]
    fun test_calculate_d_49() {
       // test
        let x0: u128 = 5000000000000000000000;
        let x1: u128 = 10000000000000000000000;
        let expected_d: u128 = 14969936621712974095813;
        let d = calculate_d(x0, x1, 15);
        assert!(d == expected_d, 1);
    }

    #[test]
    fun test_calculate_x_1_0() {
        // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 2000000000000000000000;
        let expected_x1: u128 = 1000000000000000000000;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_1() {
        // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 2993987324342594819162;
        let expected_x1: u128 = 1999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_2() {
        // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 3978828876840973560802;
        let expected_x1: u128 = 2999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_3() {
        // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 4955810397915579285744;
        let expected_x1: u128 = 4000000000000000000000;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_4() {
        // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 5925388362748303567980;
        let expected_x1: u128 = 4999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_5() {
        // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 6887867795041488135767;
        let expected_x1: u128 = 6000000000000000000000;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_6() {
        // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 7843501099357207543234;
        let expected_x1: u128 = 6999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_7() {
        // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 8792513639835515740306;
        let expected_x1: u128 = 8000000000000000000000;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_8() {
        // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 9735112883796791085400;
        let expected_x1: u128 = 8999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_9() {
        // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 10671492539695429511451;
        let expected_x1: u128 = 10000000000000000000000;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_10() {
        // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 2993987324342594819162;
        let expected_x1: u128 = 999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_11() {
        // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 4000000000000000000000;
        let expected_x1: u128 = 2000000000000000000000;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_12() {
        // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 4996646432824630184465;
        let expected_x1: u128 = 2999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_13() {
        // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 5987974648685189638325;
        let expected_x1: u128 = 3999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_14() {
        // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 6974865077314815159986;
        let expected_x1: u128 = 5000000000000000000000;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_15() {
        // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 7957657753681947121605;
        let expected_x1: u128 = 5999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_16() {
        // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 8936535524851711934567;
        let expected_x1: u128 = 7000000000000000000000;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_17() {
        // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 9911620795831158571488;
        let expected_x1: u128 = 8000000000000000000000;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_18() {
        // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 10883008008267593357850;
        let expected_x1: u128 = 8999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_19() {
        // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 11850776725496607135961;
        let expected_x1: u128 = 9999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_20() {
        // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 3978828876840973560802;
        let expected_x1: u128 = 999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_21() {
        // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 4996646432824630184465;
        let expected_x1: u128 = 1999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_22() {
        // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 6000000000000000000000;
        let expected_x1: u128 = 3000000000000000000000;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_23() {
        // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 6997650179274309702766;
        let expected_x1: u128 = 3999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_24() {
        // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 7991425036417606251576;
        let expected_x1: u128 = 4999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_25() {
        // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 8981961973027784457488;
        let expected_x1: u128 = 5999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_26() {
        // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 9969553313965636362846;
        let expected_x1: u128 = 6999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_27() {
        // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 10954360603545046811764;
        let expected_x1: u128 = 7999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_28() {
        // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 11936486630522920682408;
        let expected_x1: u128 = 8999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_29() {
        // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 12916004407207853098264;
        let expected_x1: u128 = 9999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_30() {
        // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 4955810397915579285744;
        let expected_x1: u128 = 1000000000000000000000;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_31() {
        // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 5987974648685189638325;
        let expected_x1: u128 = 1999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_32() {
        // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 6997650179274309702766;
        let expected_x1: u128 = 2999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_33() {
        // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 8000000000000000000000;
        let expected_x1: u128 = 4000000000000000000000;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_34() {
        // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 8998186562807776230738;
        let expected_x1: u128 = 4999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_35() {
        // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 9993292865649260368930;
        let expected_x1: u128 = 5999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_36() {
        // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 10985797352784921592990;
        let expected_x1: u128 = 6999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_37() {
        // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 11975949297370379276650;
        let expected_x1: u128 = 7999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_38() {
        // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 12963895280304759421395;
        let expected_x1: u128 = 8999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_39() {
        // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 13949730154629630319972;
        let expected_x1: u128 = 10000000000000000000000;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_40() {
        // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 5925388362748303567980;
        let expected_x1: u128 = 999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_41() {
        // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 6974865077314815159986;
        let expected_x1: u128 = 2000000000000000000000;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_42() {
        // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 7991425036417606251576;
        let expected_x1: u128 = 2999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_43() {
        // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 8998186562807776230738;
        let expected_x1: u128 = 3999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_44() {
        // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 10000000000000000000000;
        let expected_x1: u128 = 5000000000000000000000;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_45() {
        // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 10998522091619534205600;
        let expected_x1: u128 = 5999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_46() {
        // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 11994477554332926716575;
        let expected_x1: u128 = 7000000000000000000000;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_47() {
        // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 12988237117259130537377;
        let expected_x1: u128 = 7999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_48() {
        // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 13980012779215461970321;
        let expected_x1: u128 = 8999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_1_49() {
        // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 14969936621712974095813;
        let expected_x1: u128 = 9999999999999999999999;
        let x1 = calculate_x(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }

    #[test]
    fun test_calculate_x_0_non_decreasing_0() {
      // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 2000000000000000000000;
        let expected_x1: u128 = 1000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_1() {
      // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 2993987324342594819162;
        let expected_x1: u128 = 2000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_2() {
      // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 3978828876840973560802;
        let expected_x1: u128 = 3000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_3() {
      // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 4955810397915579285744;
        let expected_x1: u128 = 4000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_4() {
      // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 5925388362748303567980;
        let expected_x1: u128 = 5000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_5() {
      // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 6887867795041488135767;
        let expected_x1: u128 = 6000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_6() {
      // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 7843501099357207543234;
        let expected_x1: u128 = 7000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_7() {
      // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 8792513639835515740306;
        let expected_x1: u128 = 8000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_8() {
      // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 9735112883796791085400;
        let expected_x1: u128 = 9000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_9() {
      // test
        let x0: u128 = 1000000000000000000000;
        let d: u128 = 10671492539695429511451;
        let expected_x1: u128 = 10000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_10() {
      // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 2993987324342594819162;
        let expected_x1: u128 = 1000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_11() {
      // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 4000000000000000000000;
        let expected_x1: u128 = 2000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_12() {
      // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 4996646432824630184465;
        let expected_x1: u128 = 3000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_13() {
      // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 5987974648685189638325;
        let expected_x1: u128 = 4000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_14() {
      // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 6974865077314815159986;
        let expected_x1: u128 = 5000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_15() {
      // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 7957657753681947121605;
        let expected_x1: u128 = 6000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_16() {
      // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 8936535524851711934567;
        let expected_x1: u128 = 7000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_17() {
      // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 9911620795831158571488;
        let expected_x1: u128 = 8000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_18() {
      // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 10883008008267593357850;
        let expected_x1: u128 = 9000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_19() {
      // test
        let x0: u128 = 2000000000000000000000;
        let d: u128 = 11850776725496607135961;
        let expected_x1: u128 = 10000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_20() {
      // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 3978828876840973560802;
        let expected_x1: u128 = 1000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_21() {
      // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 4996646432824630184465;
        let expected_x1: u128 = 2000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_22() {
      // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 6000000000000000000000;
        let expected_x1: u128 = 3000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_23() {
      // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 6997650179274309702766;
        let expected_x1: u128 = 4000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_24() {
      // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 7991425036417606251576;
        let expected_x1: u128 = 5000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_25() {
      // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 8981961973027784457488;
        let expected_x1: u128 = 6000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_26() {
      // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 9969553313965636362846;
        let expected_x1: u128 = 7000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_27() {
      // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 10954360603545046811764;
        let expected_x1: u128 = 8000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_28() {
      // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 11936486630522920682408;
        let expected_x1: u128 = 9000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_29() {
      // test
        let x0: u128 = 3000000000000000000000;
        let d: u128 = 12916004407207853098264;
        let expected_x1: u128 = 10000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_30() {
      // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 4955810397915579285744;
        let expected_x1: u128 = 1000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_31() {
      // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 5987974648685189638325;
        let expected_x1: u128 = 2000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_32() {
      // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 6997650179274309702766;
        let expected_x1: u128 = 3000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_33() {
      // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 8000000000000000000000;
        let expected_x1: u128 = 4000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_34() {
      // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 8998186562807776230738;
        let expected_x1: u128 = 5000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_35() {
      // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 9993292865649260368930;
        let expected_x1: u128 = 6000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_36() {
      // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 10985797352784921592990;
        let expected_x1: u128 = 7000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_37() {
      // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 11975949297370379276650;
        let expected_x1: u128 = 8000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_38() {
      // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 12963895280304759421395;
        let expected_x1: u128 = 9000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_39() {
      // test
        let x0: u128 = 4000000000000000000000;
        let d: u128 = 13949730154629630319972;
        let expected_x1: u128 = 10000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_40() {
      // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 5925388362748303567980;
        let expected_x1: u128 = 1000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_41() {
      // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 6974865077314815159986;
        let expected_x1: u128 = 2000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_42() {
      // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 7991425036417606251576;
        let expected_x1: u128 = 3000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_43() {
      // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 8998186562807776230738;
        let expected_x1: u128 = 4000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_44() {
      // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 10000000000000000000000;
        let expected_x1: u128 = 5000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_45() {
      // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 10998522091619534205600;
        let expected_x1: u128 = 6000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_46() {
      // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 11994477554332926716575;
        let expected_x1: u128 = 7000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_47() {
      // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 12988237117259130537377;
        let expected_x1: u128 = 8000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_48() {
      // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 13980012779215461970321;
        let expected_x1: u128 = 9000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
    #[test]
    fun test_calculate_x_0_non_decreasing_49() {
      // test
        let x0: u128 = 5000000000000000000000;
        let d: u128 = 14969936621712974095813;
        let expected_x1: u128 = 10000000000000000000000;
        let x1 = calculate_x_non_decreasing_d(x0, 0, 1, 15, d);
        assert!(x1 == expected_x1, 1);
    }
}
