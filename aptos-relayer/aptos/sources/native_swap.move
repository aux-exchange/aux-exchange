module aux_eth_relay::native_swap {
    use wormhole::deserialize::{
        deserialize_u64,
        deserialize_vector
    };
    use aptos_std::from_bcs;
    use wormhole::cursor;

    struct NativeSwap has drop {
        fee_amount: u64,
        recipient: address,
        native_swap_amount: u64
    }

    public fun parse(native_swap: vector<u8>): NativeSwap {
        let cur = cursor::init(native_swap);
        let fee_amount = deserialize_u64(&mut cur);
        let recipient = from_bcs::to_address(deserialize_vector(&mut cur, 32));
        let native_swap_amount = deserialize_u64(&mut cur);
        cursor::destroy_empty(cur);
        NativeSwap {
            fee_amount,
            recipient,
            native_swap_amount
        }
    }

    public fun fee_amount(ns: &NativeSwap): u64 {
        ns.fee_amount
    }


    public fun recipient(ns: &NativeSwap): address {
        ns.recipient
    }

    public fun native_swap_amount(ns: &NativeSwap): u64 {
        ns.native_swap_amount
    }

}