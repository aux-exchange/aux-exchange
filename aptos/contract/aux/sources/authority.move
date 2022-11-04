// Auto generated from aptos/deployer/cmd/gen-aptos-deployer-selfsign
// Modify by hand with caution.
// Argumenets: -a aux -f amm -f aux_coin -f clob_market -f vault -n authority -o sources/authority.move
// authority controls the signer capability of this module.
module aux::authority {
    use std::signer;
    use aptos_framework::account::{Self, SignerCapability};

    use deployer::deployer;

    friend aux::amm;
    friend aux::aux_coin;
    friend aux::clob_market;
    friend aux::vault;
    friend aux::router;
    friend aux::fake_coin;
    friend aux::stake;
    friend aux::stable_2pool;
    friend aux::stable_3pool;

    const E_NOT_SELF_SIGNED: u64 = 1001;
    const E_CANNOT_SIGN_FOR_OTHER: u64 = 1002;
    const E_NOT_OWNER: u64 = 1003;

    struct Authority has key {
        signer_capability: SignerCapability,
        owner_address: address,
    }

    // on module initialization, the module will tries to get the signer capability from deployer.
    fun init_module(source: &signer) {
        let source_addr = signer::address_of(source);
        if(!exists<Authority>(source_addr) && deployer::resource_account_signer_exists(source_addr)) {
            let (owner_address, signer_capability) = deployer::retrieve_resource_account_signer(source);
            let auth_signer = account::create_signer_with_capability(&signer_capability);
            assert!(
                signer::address_of(source) == signer::address_of(&auth_signer),
                E_CANNOT_SIGN_FOR_OTHER,
            );

            move_to(source, Authority {
                signer_capability,
                owner_address,
            });
        }
    }

    // get signer for the module itself.
    public(friend) fun get_signer_self(): signer acquires Authority {
        assert!(
            exists<Authority>(@aux),
            E_NOT_SELF_SIGNED,
        );

        let auth = borrow_global<Authority>(@aux);

        let auth_signer = account::create_signer_with_capability(&auth.signer_capability);

        assert!(
            signer::address_of(&auth_signer) == @aux,
            E_CANNOT_SIGN_FOR_OTHER,
        );

        auth_signer
    }

    // get the signer for the owner.
    public fun get_signer(owner: &signer): signer acquires Authority {
        assert!(
            exists<Authority>(@aux),
            E_NOT_SELF_SIGNED,
        );

        let auth = borrow_global<Authority>(@aux);

        assert!(
            signer::address_of(owner) == auth.owner_address,
            E_NOT_OWNER,
        );

        let auth_signer = account::create_signer_with_capability(&auth.signer_capability);

        assert!(
            signer::address_of(&auth_signer) == @aux,
            E_CANNOT_SIGN_FOR_OTHER,
        );

        auth_signer
    }

    public(friend) fun is_signer_owner(user: &signer): bool acquires Authority {
        assert!(
            exists<Authority>(@aux),
            E_NOT_SELF_SIGNED,
        );

        let auth = borrow_global<Authority>(@aux);

        signer::address_of(user) == auth.owner_address
    }

    #[test_only]
    public fun init_module_for_test(source: &signer) {
        init_module(source)
    }
}
