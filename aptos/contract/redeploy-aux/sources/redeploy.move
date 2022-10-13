script {
    fun redeploy(owner:&signer, metadata: vector<u8>, id: vector<u8>) {
        let resource_account_signer = &aux::authority::get_signer(owner);
        deployer::deployer::publish_from_repo_to_another_account(owner, resource_account_signer, metadata, id);
    }
}
