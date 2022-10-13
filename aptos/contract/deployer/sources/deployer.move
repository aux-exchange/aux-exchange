// deployer is for creating resource account and deploy the package.
// When creating the resource account, it stores the owner address to allow the created package to save the owner information.
module deployer::deployer {
    use std::signer;
    use std::vector;

    use aptos_framework::account::{Self, SignerCapability};
    use aptos_framework::code::publish_package_txn;
    use aptos_framework::simple_map::{Self, SimpleMap};

    const E_UNAUTHORIZED: u64 = 1001;
	const E_METADATA_MISMATCH: u64 = 1002;
	const E_CODE_LENGTH_MISMATH: u64 = 1003;

    // ResourceAccountAuthority is saved onto the resource account. It contains the SignerCapability and the owner address.
    struct ResourceAccountAuthority has key {
        owner_address: address,
        signer_capability: SignerCapability,
    }

    // OwnedResourceAccounts contains all the resource accounts created for an account.
    struct OwnedResourceAccounts has key {
        resource_accounts: SimpleMap<vector<u8>, address>,
    }


    // create_internal creates the resource account, save the signer capability to the resource account, and
    // save the resource account address to the owner, then returns the signer for the resource account.
    fun create_internal(creator: &signer, seed: vector<u8>): signer acquires OwnedResourceAccounts {
        let (resource_account_signer, signer_capability) = account::create_resource_account(creator, seed);

        let owner_address = signer::address_of(creator);

        move_to(&resource_account_signer,
            ResourceAccountAuthority {
                owner_address,
                signer_capability,
            }
        );

        if (!exists<OwnedResourceAccounts>(owner_address)) {
            move_to(creator,
                OwnedResourceAccounts {
                    resource_accounts: simple_map::create()
                });
        };

        simple_map::add(
            &mut borrow_global_mut<OwnedResourceAccounts>(owner_address).resource_accounts,
            seed,
            signer::address_of(&resource_account_signer));

        resource_account_signer
    }

    // create a resource account and save the signer capability to the resource account.
    public entry fun create_resource_account(creator: &signer, seed: vector<u8>) acquires OwnedResourceAccounts {
        let _ = create_internal(creator, seed);
    }

    // publish to resource account whose signer capability is not retrieved yet.
    public entry fun publish_to_resource_account(creator: &signer, resource_account: address, metadata: vector<u8>, code: vector<vector<u8>>) acquires ResourceAccountAuthority {
        let resource_account = borrow_global<ResourceAccountAuthority>(resource_account);
        assert!(
            resource_account.owner_address == signer::address_of(creator),
            E_UNAUTHORIZED,
        );

        let resource_account_signer = account::create_signer_with_capability(&resource_account.signer_capability);

        publish_package_txn(
            &resource_account_signer,
            metadata,
            code);
    }

    // create a resource account and publish a package to it.
    public entry fun create_resource_account_and_publish(creator: &signer, seed: vector<u8>, metadata: vector<u8>, code: vector<vector<u8>>) acquires OwnedResourceAccounts {
       let resource_account_signer = create_internal(creator, seed);

        publish_package_txn(&resource_account_signer, metadata, code);
    }

    public fun resource_account_signer_exists(resource_account_address: address): bool {
        exists<ResourceAccountAuthority>(resource_account_address)
    }

    // retrieve the resource account signer capability.
    public fun retrieve_resource_account_signer(module_signer: &signer): (address, SignerCapability) acquires ResourceAccountAuthority {
        let ResourceAccountAuthority {
            owner_address,
            signer_capability
        } = move_from<ResourceAccountAuthority>(signer::address_of(module_signer));

        (owner_address, signer_capability)
    }

    public fun get_signer_for_address(creator: &signer, resource_account: address): signer acquires ResourceAccountAuthority {
        let resource_account = borrow_global<ResourceAccountAuthority>(resource_account);
        assert!(
            resource_account.owner_address == signer::address_of(creator),
            E_UNAUTHORIZED,
        );

        account::create_signer_with_capability(&resource_account.signer_capability)
    }

    // package to publish contains all the information that is used for publish_package_txn
    struct PackageToPublish has store {
        metadata: vector<u8>,
        codes: vector<vector<u8>>,
        codes_index: vector<vector<u64>>,
    }

    fun new_package(metadata: vector<u8>): PackageToPublish {
        PackageToPublish {
            metadata,
            codes: vector::empty(),
            codes_index: vector::empty(),
        }
    }

    fun add_code(package: &mut PackageToPublish, metadata: &vector<u8>, code_line_index: u64, code_line_seq: u64, code: vector<u8>) {
        assert!(&package.metadata == metadata, E_METADATA_MISMATCH);
        let size = vector::length(&package.codes);
        assert!(code_line_index == size || code_line_index == size - 1, size);
        if (size == code_line_index) {
            assert!(code_line_seq == 0, E_CODE_LENGTH_MISMATH);
            vector::push_back(&mut package.codes, code);
            vector::push_back(&mut package.codes_index, vector::empty());
            vector::push_back(vector::borrow_mut(&mut package.codes_index, code_line_index), code_line_seq);
        } else {
            let code_index_size = vector::length(vector::borrow(&package.codes_index, code_line_index));
            assert!(code_line_seq == code_index_size, E_CODE_LENGTH_MISMATH);
            vector::push_back(vector::borrow_mut(&mut package.codes_index, code_line_index), code_line_seq);
            vector::append(vector::borrow_mut(&mut package.codes, code_line_index), code);
        }
    }

    struct CodeRepo has key {
        codes: SimpleMap<vector<u8>, PackageToPublish>,
    }

    public entry fun upload_code(creator: &signer, id: vector<u8>, metadata: vector<u8>, code_line_index: u64, code_line_seq: u64,  code: vector<u8>) acquires CodeRepo {
        let creator_addr = signer::address_of(creator);
        if (!exists<CodeRepo>(creator_addr)) {
            move_to(creator, CodeRepo {
                codes: simple_map::create(),
            });
        };

        let code_repo = borrow_global_mut<CodeRepo>(creator_addr);

        if (!simple_map::contains_key(&code_repo.codes, &id)) {
            let package = new_package(metadata);
            add_code(&mut package, &metadata, code_line_index, code_line_seq, code);
            simple_map::add(&mut code_repo.codes, id, package);
        } else {
            let package = simple_map::borrow_mut(&mut code_repo.codes, &id);
            add_code(package, &metadata, code_line_index, code_line_seq, code);
        }
    }

    public entry fun publish_from_repo_to_resource_account(creator: &signer, resource_account: address, metadata: vector<u8>, id: vector<u8>) acquires CodeRepo, ResourceAccountAuthority {
        let codes = get_code(creator, &metadata, &id);

        publish_to_resource_account(creator, resource_account, metadata, codes)
    }

    public fun get_code(code_owner: &signer, metadata: &vector<u8>, id: &vector<u8>): vector<vector<u8>> acquires CodeRepo {
        let creator_addr = signer::address_of(code_owner);

        let code_repo = borrow_global_mut<CodeRepo>(creator_addr);

        let (_, code) = simple_map::remove(&mut code_repo.codes, id);

        assert!(&code.metadata == metadata, E_METADATA_MISMATCH);

        let PackageToPublish {
            codes,
            codes_index: _,
            metadata: _,
        } = code;

        codes
    }
    public entry fun publish_from_repo(creator: &signer, metadata: vector<u8>, id: vector<u8>) acquires CodeRepo {
        let codes = get_code(creator, &metadata, &id);

        publish_package_txn(creator, metadata, codes);
    }

    public fun publish_from_repo_to_another_account(code_owner: &signer, destination: &signer, metadata: vector<u8>,  id: vector<u8>) acquires CodeRepo {
        let codes = get_code(code_owner, &metadata, &id);

        publish_package_txn(destination, metadata, codes);
    }

    public entry fun delete_code(code_owner: &signer, id: vector<u8>) acquires CodeRepo {
        let creator_addr = signer::address_of(code_owner);

        let code_repo = borrow_global_mut<CodeRepo>(creator_addr);

        if (!simple_map::contains_key(&code_repo.codes, &id)) {
            return
        };
        let (_, code) = simple_map::remove(&mut code_repo.codes, &id);
         let PackageToPublish {
            codes: _,
            codes_index: _,
            metadata: _,
        } = code;
    }
}
