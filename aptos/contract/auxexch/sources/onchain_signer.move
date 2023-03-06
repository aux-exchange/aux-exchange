module aux::onchain_signer {
    use std::bcs;
    use std::signer;
    use std::vector;

    use aptos_framework::account::{Self, SignerCapability};

    friend aux::vault;
    friend aux::volume_tracker;
    friend aux::clob_market;

    struct OnchainSigner has key {
        signer_capability: SignerCapability,
        account_address: address,
    }

    public(friend) fun create_onchain_signer(sender: &signer) {
        if (!exists<OnchainSigner>(signer::address_of(sender))) {
            let bytes = bcs::to_bytes(&@aux);
            vector::append(&mut bytes, b"aux-user");
            let (user_signer, signer_capability) = account::create_resource_account(sender, bytes);

            move_to(
                sender,
                OnchainSigner {
                    account_address: signer::address_of(&user_signer),
                    signer_capability,
                }
            );
        }
    }

    public(friend) fun get_signer_address(user_address: address): address acquires OnchainSigner {
        borrow_global<OnchainSigner>(user_address).account_address
    }

    public(friend) fun has_onchain_signer(user_address: address): bool {
        exists<OnchainSigner>(user_address)
    }

    public(friend) fun get_signer(user_address: address): signer acquires OnchainSigner {
        account::create_signer_with_capability(&borrow_global<OnchainSigner>(user_address).signer_capability)
    }
}