#[test_only]
module aux::reward_distributor_test {
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::timestamp;

    use deployer::deployer::create_resource_account;

    use aux::fake_coin::{Self, USDC, FakeCoin};
    use aux::authority;
    use aux::reward_distributor::{
        create_reward_distributor,
        add_reward,
        mint,
        burn,
        rebase,
        token_merge,
        token_melt,
        token_extract,
        shutdown,
        acc_reward_per_share,
        is_fungible,
        token_value,
        token_last_acc_reward_per_share,
        total_token_amount,
        check_redeem_token,
    };

    struct Witness {}

    fun setup_user(sender: &signer) {
         let sender_addr = signer::address_of(sender);
         if (!account::exists_at(sender_addr)) {
             account::create_account_for_test(sender_addr);
         };
    }
    fun setup(sender: &signer, aux: &signer, alice: &signer, bob: &signer, aptos_framework: &signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        setup_user(sender);
        setup_user(alice);
        setup_user(bob);

        if (!account::exists_at(@aux)) {
            create_resource_account(sender, b"amm");
            authority::init_module_for_test(&deployer::deployer::get_signer_for_address(sender, @aux));
        };
        fake_coin::initialize_for_test(aux);
    }

    #[test(sender = @0x5e7c3, aux = @aux, alice = @0x123, bob = @0x124, aptos_framework = @0x1)]
    fun test_reward_distributor(sender: &signer, aux: &signer, alice: &signer, bob: &signer, aptos_framework: &signer) {
        setup(sender, aux, alice, bob, aptos_framework);

        let multiplier = 1000000000; // 1000 USDC
        let ten_to_12: u128 = 1000000000000;
        fake_coin::register_and_mint<USDC>(sender, 2000 * multiplier);

        let pool = create_reward_distributor<FakeCoin<USDC>, Witness>(aux, 0);

        // add 100,000 USDC to the reward pool.
        // no redeem token yet... so this goes no where
        add_reward(&mut pool, coin::withdraw<FakeCoin<USDC>>(sender, 100 * multiplier));
        assert!(acc_reward_per_share(&pool) == 0, 1);
        // add 100 redeem tokens
        let redeem_token_1 = mint(&mut pool, 100);
        // add 500,000 USDC, so each redeem_token_1 should have 5,000,000,000,000,000,000,000 share
        // redeem_token_1's last_acc_per_share is 0.
        add_reward(&mut pool, coin::withdraw<FakeCoin<USDC>>(sender, 500 * multiplier));
        let first_acc = 500*(multiplier as u128)/100 * ten_to_12;
        assert!(token_last_acc_reward_per_share(&redeem_token_1) == 0, 0);
        // extract from redeem_token_1_1
        let redeem_token_1_1 = token_extract(&mut redeem_token_1, 30);

        // extract and then merge back
        let redeem_token_1_2 = token_extract(&mut redeem_token_1, 15);
        token_merge(&mut redeem_token_1, redeem_token_1_2);
        assert!(token_value(&redeem_token_1) == 70, token_value(&redeem_token_1));

        // extract and burn
        let c1 = burn(&mut pool, token_extract(&mut redeem_token_1, 15));
        assert!(coin::value(&c1) == 5 * 15 * multiplier, coin::value(&c1));

        // rebase token here.
        let redeem_token_1_3 = token_extract(&mut redeem_token_1, 15);
        let (c2, redeem_token_1_3) = rebase(&mut pool, redeem_token_1_3);
        assert!(coin::value(&c1) == 5 * 15 * multiplier, coin::value(&c2));

        assert!(token_last_acc_reward_per_share(&redeem_token_1_3) == first_acc, 3);
        // now r1 and r1_3 cannot be fungible
        assert!(!is_fungible(&redeem_token_1, &redeem_token_1_3), 1);

        // let's melt r1_3 and r1_1
        token_melt(&mut redeem_token_1_1, redeem_token_1_3);
        assert!(token_last_acc_reward_per_share(&redeem_token_1_1) == (first_acc/3) + 1, 5);

        // total token supply is 100 - 15 = 85
        assert!(total_token_amount(&pool) == 85, (total_token_amount(&pool) as u64));

        let redeem_token_2 = mint(&mut pool, 65);
        add_reward(&mut pool, coin::withdraw<FakeCoin<USDC>>(sender, 250 * multiplier));
        assert!(total_token_amount(&pool) == 150, 9);
        assert!(acc_reward_per_share(&pool) == first_acc + (250*(multiplier as u128)*ten_to_12)/150, 3);

        assert!(!is_fungible(&redeem_token_1, &redeem_token_2), 1);

        // burn all tokens
        assert!(token_value(&redeem_token_1) == 40, token_value(&redeem_token_1));
        let c3 = burn(&mut pool, redeem_token_1);
        assert!(coin::value(&c3) == (250 * multiplier * 40) / 150 + 5 * multiplier * 40, 5);
        let c4 = burn(&mut pool, redeem_token_2);
        assert!(coin::value(&c4) == (250 * multiplier * 65) / 150, 5);
        let c5 = burn(&mut pool, redeem_token_1_1);
        assert!(coin::value(&c5) == (250 * multiplier * 45) / 150 + 5 * multiplier * 30 - 1, coin::value(&c5));
        let c = shutdown(pool);
        assert!(coin::value(&c) == 2 + 100 * multiplier, coin::value(&c));

        fake_coin::register<USDC>(alice);
        coin::deposit(signer::address_of(alice), c);
        coin::deposit(signer::address_of(alice), c1);
        coin::deposit(signer::address_of(alice), c2);
        coin::deposit(signer::address_of(alice), c3);
        coin::deposit(signer::address_of(alice), c4);
        coin::deposit(signer::address_of(alice), c5);
    }

    #[test(sender = @0x5e7c3, aux = @aux, alice = @0x123, bob = @0x124, aptos_framework = @0x1)]
    #[expected_failure(abort_code = 1002, location = aux::reward_distributor)]
    fun test_two_distributors_burn(sender: &signer, aux: &signer, alice: &signer, bob: &signer, aptos_framework: &signer) {
        setup(sender, aux, alice, bob, aptos_framework);

        let multiplier = 1000000000; // 1000 USDC
        fake_coin::register_and_mint<USDC>(sender, 2000 * multiplier);

        let pool0 = create_reward_distributor<FakeCoin<USDC>, Witness>(aux, 0);
        let pool1 = create_reward_distributor<FakeCoin<USDC>, Witness>(aux, 1);

        let redeem_token_0 = mint(&mut pool0, 100);
        let redeem_token_1 = mint(&mut pool1, 100);

        assert!(!check_redeem_token(&pool0, &redeem_token_1), 1);
        let c1 = burn(&mut pool0, redeem_token_1);
        let c2 = burn(&mut pool1, redeem_token_0);

        coin::merge(&mut c1, shutdown(pool0));
        coin::merge(&mut c2, shutdown(pool1));
        coin::deposit(signer::address_of(sender), c1);
        coin::deposit(signer::address_of(sender), c2)
    }

    #[test(sender = @0x5e7c3, aux = @aux, alice = @0x123, bob = @0x124, aptos_framework = @0x1)]
    #[expected_failure(abort_code = 1002, location = aux::reward_distributor)]
    fun test_two_distributors_rebase(sender: &signer, aux: &signer, alice: &signer, bob: &signer, aptos_framework: &signer) {
        setup(sender, aux, alice, bob, aptos_framework);

        let multiplier = 1000000000; // 1000 USDC
        fake_coin::register_and_mint<USDC>(sender, 2000 * multiplier);

        let pool1 = create_reward_distributor<FakeCoin<USDC>, Witness>(aux, 0);
        let pool2 = create_reward_distributor<FakeCoin<USDC>, Witness>(aux, 1);

        let redeem_token_1 = mint(&mut pool1, 100);
        let redeem_token_2 = mint(&mut pool2, 100);

        assert!(!check_redeem_token(&pool1, &redeem_token_2), 1);
        let (c1, r1) = rebase(&mut pool2, redeem_token_1);
        let (c2, r2) = rebase(&mut pool1, redeem_token_2);
        coin::merge(&mut c1, burn(&mut pool1, r1));
        coin::merge(&mut c2, burn(&mut pool2, r2));

        coin::merge(&mut c1, shutdown(pool1));
        coin::merge(&mut c2, shutdown(pool2));
        coin::deposit(signer::address_of(sender), c1);
        coin::deposit(signer::address_of(sender), c2)
    }
}
