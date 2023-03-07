#[test_only]
module aux::native_u256_test {
    #[test]
    fun test_native_u256() {
        let a: u256 = 1;
        assert!(a == 1, 0);
    }
}
