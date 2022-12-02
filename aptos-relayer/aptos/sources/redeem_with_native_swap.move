module aptos_relay::redeem_with_native_swap {
    use std::signer;
    use std::vector;
    use std::string::String;
    use aptos_std::type_info;
    use aptos_std::table::{Self, Table};
    use aptos_framework::coin::{Self, Coin};
    use aptos_std::any::{Self, Any};

    use wormhole::external_address::{Self, ExternalAddress};
    use wormhole::emitter::EmitterCapability;

    use token_bridge::transfer_with_payload::get_payload;

    use token_bridge::complete_transfer_with_payload::submit_vaa;

    use aptos_relay::native_swap;
    use aptos_relay::authority;

    struct RelayState has key {
        emitter: EmitterCapability
    }

    struct Escrow<phantom CoinType> has key {
        table: Table<address, Coin<CoinType>>
    }

    fun init_module(sender: &signer) {
        let emitter = wormhole::wormhole::register_emitter();
        move_to(sender, RelayState {
            emitter
        });
    }

    // public entry fun set_trusted_relay(owner: &signer, trusted_relay: vector<u8>) acquires RelayState {
    //     assert!(@aptos_relay == signer::address_of(owner), ENOT_OWNER);
    //     let state = borrow_global_mut<RelayState>(@aptos_relay);
    //     state.trusted_relay = external_address::from_bytes(trusted_relay);
    // }

    fun redeem_vaa_internal<CoinType>(relay: &signer, vaa: vector<u8>): (address, Coin<CoinType>) acquires RelayState {
        let relay_address = signer::address_of(relay);
        let state = borrow_global<RelayState>(@aptos_relay);
        let (totalCoin, transfer_with_payload) = submit_vaa<CoinType>(vaa, &state.emitter);
        if (!coin::is_account_registered<CoinType>(relay_address)) {
            coin::register<CoinType>(relay);
        };
        let ns = native_swap::parse(get_payload(&transfer_with_payload));
        let feeCoin = coin::extract(&mut totalCoin, native_swap::fee_amount(&ns));
        let recipient = native_swap::recipient(&ns);

        coin::deposit<CoinType>(relay_address, feeCoin);
        (recipient, totalCoin)
    }

    public entry fun redeem_vaa<CoinType>(relay: &signer, vaa: vector<u8>) acquires RelayState {
        let (recipient, remaining_coin) = redeem_vaa_internal(relay, vaa);
        coin::deposit<CoinType>(recipient, remaining_coin);
    }

    public entry fun redeem_vaa_with_escrow<CoinType>(relay: &signer, vaa: vector<u8>) acquires RelayState, Escrow {
        let (recipient, remaining_coin) = redeem_vaa_internal(relay, vaa);
        if (!exists<Escrow<CoinType>>(@aptos_relay)) {
            let self_signer = &authority::get_signer_self();
            move_to(self_signer, Escrow<CoinType>{
                table: table::new()
            });
        };
        
        let escrow = borrow_global_mut<Escrow<CoinType>>(@aptos_relay);
        let escrowed_coin = coin::zero<CoinType>();
        if (table::contains(&escrow.table, recipient)) {
            escrowed_coin = table::remove(&mut escrow.table, recipient);
        };
        coin::merge(&mut escrowed_coin, remaining_coin);

        table::add(&mut escrow.table, recipient, escrowed_coin);
    }

    public entry fun get_from_escrow<CoinType>(recipient: &signer) acquires RelayState {
        let state = borrow_global<RelayState>(@aptos_relay);
    }
}