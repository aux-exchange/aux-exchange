# Deployer

A very convoluted way of redeploying to a resource account and allow it to self-sign.

## Constraints

1.  For a module to self-sign, the module needs to get the `SignerCapability` from somewhere.
    The VM cannot create a signer even from the private key.

1.  The `SignerCapability` can either be inside the module address itself (with `friend` modules),
    or obtained from a call to an outside module, such as

    ```move
    module some_other_address::some_other_module {
        public fun get_signer(resource_account_addr: address): signer {
        }
    }
    ```

    However, the input must be an `address`, which is not guarded, and anyone can get the signer by just calling that function. If that function is to be guarded by a signer, we run into the chicken egg problem, since module cannot sign yet.

    **Therefore, the module must hold the signer capability inside itself.**

1.  It turns out the same package cannot update itself through an entry function inside itself.

## Deployer

1.  `deployer`'s `create-resource-account` binary creates a resource account, and save the `SignerCapability` and creator's `address` in the resource account.

1.  A module that is supposed to be self-sign will need to add a dependency to `deployer` and retrieves the signer capability and owner's address by calling the function `deployer::retrieve_resource_account_signer(source)`, where `source` is a `signer` that is the resource account address. See below code for some inspiration of using this in `init_module`.
    See an example in [examples/selfsigned](../deployer-examples/selfsigned).

    however, this can also be called from any other module that is signed by `owner` before `retrieve_resource_account_signer` is called. The `SignerCapability` must be obtained from the resource account modules once it's retrieved.

    ```move
    module resource_account_address::a_module {
        use std::signer;
        use aptos_framework::account::{Self, SignerCapability};
        use deployer::deployer;

        friend selfsigned::another_mod;

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
    }
    ```

    Publishing code can be done either through `create-resource-account-and-publish` binary, or `publish-to-resource-account` binary (given the `SignerCapability` is not retrieved yet).

1.  If the resource account's module doesn't expose a function to retrieve the `SignerCapability`, it's sealed. However, if the it does expose, we can create another module to deploy to that account. The signature of the function must be like follows to use the `republish-to-resource-account` binary:
    Note, the module that resides inside the target resource account needs to be added as a dependency. See [examples/redeployer](../deployer-examples/redeployer) for an example.

    ```move
    module redeployer::redeploy {
        use aptos_framework::code::publish_package_txn;
        use selfsigned::authority::get_signer;

        public entry fun redeploy(owner:&signer, metadata: vector<u8>, code: vector<vector<u8>>) {
            let resource_account_signer = get_signer(owner);
            publish_package_txn(&resource_account_signer, metadata, code)
        }
    }
    ```

## Generate selfsigned

A code generator is provided at [cmd/gen-aptos-deployer-selfsign] to generate the code:

```bash
gen-aptos-deployer-selfsign --help
generate the self-signed module to support self-signing modules. Used with deployer.

Usage:
  gen-aptos-deployer-selfsign [flags]

Flags:
  -a, --address string               address for the module (default "module_address")
  -f, --friend-modules stringArray   friend modules for this module, must be within the same address.
  -h, --help                         help for gen-aptos-deployer-selfsign
  -n, --module-name string           module name for the self-signed module (default "module_name")
  -o, --output string                output file name. (default "./sources/self_signed.move")
```

For example, to generate the [example](../deployer-examples/selfsigned/sources/authority.move), the following can be run in the [examples/selfsigned](../deployer-examples/selfsigned) folder:

```bash
go run ../deployer/cmd/gen-aptos-deployer-selfsign -a selfsigned -f another_mod -n authority -o sources/authority.move
```
