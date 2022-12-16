module aux_eth_relay::redeem_with_native_swap {
    use std::signer;
    use std::string::String;
    use aptos_std::table::{Self, Table};
    use aptos_std::type_info::type_name;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::account::{Self, SignerCapability, create_signer_with_capability};
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;

    use wormhole::emitter::{Self, EmitterCapability};
    use token_bridge::transfer_with_payload::get_payload;
    use token_bridge::complete_transfer_with_payload::submit_vaa;
    use aux::amm::swap_exact_coin_for_coin_mut;

    use aux_eth_relay::native_swap;
    use deployer::deployer::{claim_signer_capability};
    
    // Errors
    const EUNKNOWN_COINTYPE: u64 = 0;
    const ENO_ESCROW_FOUND: u64 = 1;

    struct RelaySignerCap has key {
        cap: SignerCapability
    }

    struct RedeemVaaEvent has drop, store {
        timestamp: u64,
        relayer: address,
        coin_type: String,
        recipient: address,
        total_coin: u64,
        fee_coin: u64,
        requested_apt_amount: u64,
        swapped_apt_amount: u64,
        escrowed: bool
    }

    struct WithdrawEscrowEvent has drop, store {
        timestamp: u64,
        coin_type: String,
        recipient: address,
        amount: u64
    }

    struct RelayState has key {
        emitter: EmitterCapability,
        redeem_vaa_events: EventHandle<RedeemVaaEvent>,
        withdraw_escrow_events: EventHandle<WithdrawEscrowEvent>
    }

    struct Escrow<phantom CoinType> has key {
        table: Table<address, Coin<CoinType>>
    }

    fun init_module(deployer: &signer) {
        let signer_cap = claim_signer_capability(deployer, @aux_eth_relay);
        let emitter = wormhole::wormhole::register_emitter();
        let resource = &create_signer_with_capability(&signer_cap);
        move_to(resource, RelayState {
            emitter,
            redeem_vaa_events: account::new_event_handle<RedeemVaaEvent>(resource),
            withdraw_escrow_events: account::new_event_handle<WithdrawEscrowEvent>(resource)
        });
        move_to(resource, RelaySignerCap {
            cap: signer_cap
        });
    }

    fun redeem_vaa_internal<CoinType>(relay: &signer, vaa: vector<u8>, min_out: u64, escrowed: bool): (address, Coin<CoinType>) acquires RelayState {
        let relay_address = signer::address_of(relay);
        let state = borrow_global_mut<RelayState>(@aux_eth_relay);
        let (total_coin, transfer_with_payload) = submit_vaa<CoinType>(vaa, &state.emitter);
        if (!coin::is_account_registered<CoinType>(relay_address)) {
            coin::register<CoinType>(relay);
        };
        let ns = native_swap::parse(get_payload(&transfer_with_payload));
        let recipient = native_swap::recipient(&ns);
        let fee_amount = native_swap::fee_amount(&ns);
        let requested_apt = native_swap::native_swap_amount(&ns);
        let total_coin_amount = coin::value(&total_coin);
        let fee_coin = coin::extract(&mut total_coin, fee_amount);

        let apt = coin::zero<AptosCoin>();
        if (fee_amount != 0) {
            swap_exact_coin_for_coin_mut<CoinType, AptosCoin>(
                relay_address,
                &mut fee_coin,
                &mut apt,
                fee_amount,
                min_out,
                false,
                0,
                0
            );
        };
        event::emit_event(
            &mut state.redeem_vaa_events,
            RedeemVaaEvent {
                timestamp: timestamp::now_microseconds(),
                relayer: relay_address,
                coin_type: type_name<CoinType>(),
                recipient,
                total_coin: total_coin_amount,
                fee_coin: fee_amount,
                requested_apt_amount: requested_apt,
                swapped_apt_amount: coin::value(&apt),
                escrowed
            }
        );
        coin::destroy_zero(fee_coin);
        coin::deposit<AptosCoin>(relay_address, apt);
        coin::transfer<AptosCoin>(relay, recipient, requested_apt);
        (recipient, total_coin)
    }

    public entry fun redeem_vaa<CoinType>(relay: &signer, vaa: vector<u8>, min_out: u64) acquires RelayState {
        let (recipient, remaining_coin) = redeem_vaa_internal(relay, vaa, min_out, false);
        coin::deposit<CoinType>(recipient, remaining_coin);
    }

    public entry fun redeem_vaa_with_escrow<CoinType>(relay: &signer, vaa: vector<u8>, min_out: u64) acquires RelayState, RelaySignerCap, Escrow {
        let (recipient, remaining_coin) = redeem_vaa_internal(relay, vaa, min_out, true);
        if (!exists<Escrow<CoinType>>(@aux_eth_relay)) {
            let signer_cap = borrow_global<RelaySignerCap>(@aux_eth_relay);
            let resource = &create_signer_with_capability(&signer_cap.cap);
            move_to(resource, Escrow<CoinType>{
                table: table::new()
            });
        };
        
        let escrow = borrow_global_mut<Escrow<CoinType>>(@aux_eth_relay);
        let escrowed_coin;
        if (table::contains(&escrow.table, recipient)) {
            escrowed_coin = table::remove(&mut escrow.table, recipient);
        } else {
            escrowed_coin = coin::zero<CoinType>();
        };
        coin::merge(&mut escrowed_coin, remaining_coin);

        table::add(&mut escrow.table, recipient, escrowed_coin);
    }

    public entry fun withdraw_from_escrow<CoinType>(recipient: &signer) acquires RelayState, Escrow {
        let recipient_addr = signer::address_of(recipient);
        let state = borrow_global_mut<RelayState>(@aux_eth_relay);
        assert!(exists<Escrow<CoinType>>(@aux_eth_relay), EUNKNOWN_COINTYPE);
        let escrow = borrow_global_mut<Escrow<CoinType>>(@aux_eth_relay);
        assert!(table::contains(&escrow.table, recipient_addr), ENO_ESCROW_FOUND);
        let escrow_coin = table::remove(&mut escrow.table, recipient_addr);
        if (!coin::is_account_registered<CoinType>(recipient_addr)) {
            coin::register<CoinType>(recipient);
        };
        event::emit_event(
            &mut state.withdraw_escrow_events,
            WithdrawEscrowEvent {
                timestamp: timestamp::now_microseconds(),
                coin_type: type_name<CoinType>(),
                recipient: recipient_addr,
                amount: coin::value(&escrow_coin)
            }
        );
        coin::deposit<CoinType>(recipient_addr, escrow_coin);
    }

    public entry fun emitter_id(): u64 acquires RelayState {
        let state = borrow_global<RelayState>(@aux_eth_relay);
        emitter::get_emitter(&state.emitter)
    }
}