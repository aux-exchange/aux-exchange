module aptos_relay::receive_payload {
    use std::error;
    use std::signer;
    use std::string;
    use aptos_framework::account;
    use aptos_framework::event;

    use wormhole::deserialize::{
        deserialize_u8,
        deserialize_u16,
    };
    use wormhole::cursor;
    use wormhole::external_address::{Self, ExternalAddress};
    use wormhole::u16::U16;
    use wormhole::emitter::EmitterCapability;

    use token_bridge::normalized_amount::{Self, NormalizedAmount};

    use token_bridge::complete_transfer_with_payload::submit_vaa;

    struct RelayState has key {
        emitter: EmitterCapability,
    }

    fun init_module(sender: &signer) {
        let emitter = wormhole::wormhole::register_emitter();
        move_to(sender, RelayState {
            emitter,
        });
    }

    public fun redeem_vaa<CoinType>(vaa: vector<u8>) acquires RelayState {
        let state = borrow_global<RelayState>(@aptos_relay);
        let (coin, transfer_with_payload) = submit_vaa<CoinType>(vaa, &state.emitter);
        
    }
}