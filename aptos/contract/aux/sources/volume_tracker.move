module aux::volume_tracker {
    use std::vector;

    use aux::onchain_signer;
    friend aux::clob_market;

    const SECONDS_IN_DAY: u64 = 86400;
    const BUFFER_SIZE: u64 = 30;

    // ERROR
    const ECOIN_ALREADY_VOLUME_TRACKED: u64 = 0;
    const ECOIN_NOT_VOLUME_TRACKED: u64 = 1;
    const VOLUME_TRACKER_ALREADY_REGISTERED: u64 = 2;
    const VOLUME_TRACKER_NOT_REGISTERED: u64 = 3;

    struct VolumeEntry has store {
        volume: u128, // cumulative volume in current entry
        timestamp: u64, // last updated timestamp
        day: u64 // the day volume entry accumulate on, starts from 0
    }

    struct VolumeTracker has store {
        initial_timestamp: u64, // the period start time,
        buffer: vector<VolumeEntry>, // 30 day, slot_number = (current_time_stamp - initial_timestamp) % SECONDS_IN_DAY
        past_30_days_total: u128, //  result from get_past_30_day_volume, can be a lazy value
        last_update_day: u64, // the day the get_past_30_day_volume is run and past_30_days_total is updated, if is same as today, then we can directly use past_30_days_total, otherwise need to recompute.
    }

    struct SingleAssetTracker<phantom Asset> has key {
        volume_tracker: VolumeTracker,
    }


    // Check whether a global volume tracker has been published under account
    public fun global_volume_tracker_registered(account: address): bool {
        onchain_signer::has_onchain_signer(account)
    }

    // Publish a volume tracker under sender
    public fun register_global_volume_tracker(sender: &signer){
        onchain_signer::create_onchain_signer(sender)
    }

    public fun is_coin_volume_tracked<Coin>(account: address): bool {
        if (!onchain_signer::has_onchain_signer(account)) {
            false
        } else {
            let res_account = onchain_signer::get_signer_address(account);
            exists<SingleAssetTracker<Coin>>(res_account)
        }
    }

    public(friend) fun register_coin_for_volume_track<Coin>(account: address) {
        // Make sure the volume tracker has been registered
        assert!(global_volume_tracker_registered(account), VOLUME_TRACKER_NOT_REGISTERED);
        // Make sure the coin hasn't been registered before
        assert!(!is_coin_volume_tracked<Coin>(account), ECOIN_ALREADY_VOLUME_TRACKED);

        let buffer = vector::empty<VolumeEntry>();
        let i = 0;
        while (i < BUFFER_SIZE) {
            vector::push_back<VolumeEntry>(&mut buffer, VolumeEntry {
                volume: 0,
                timestamp: 0,
                day: 0, // todo: think about it
            });
            i = i + 1;
        };

        let this_signer = onchain_signer::get_signer(account);
        move_to(&this_signer, SingleAssetTracker<Coin>{
            volume_tracker: VolumeTracker {
                initial_timestamp: 0,
                buffer: buffer,
                past_30_days_total: 0,
                last_update_day: 0
            }
        })
    }

    public(friend) fun update_volume_tracker<CoinType>(account: address, timestamp: u64, volume: u64) acquires SingleAssetTracker {
        // Make sure the coin is volume tracked
        assert!(is_coin_volume_tracked<CoinType>(account), ECOIN_NOT_VOLUME_TRACKED);
        let res_account = onchain_signer::get_signer_address(account);

        let volume_tracker = &mut borrow_global_mut<SingleAssetTracker<CoinType>>(res_account).volume_tracker;
        let day = (timestamp - volume_tracker.initial_timestamp) / SECONDS_IN_DAY;
        let slot_idx = day % (BUFFER_SIZE as u64);
        let volume_entry_mut = vector::borrow_mut(&mut volume_tracker.buffer, slot_idx);
        if(volume_entry_mut.day != day) {
            volume_entry_mut.day = day;
            volume_entry_mut.volume = (volume as u128);
        }else{
            volume_entry_mut.volume = volume_entry_mut.volume + (volume as u128);
        };
        volume_entry_mut.timestamp = timestamp;
    }

    public fun get_past_30_day_volume<Coin>(account: address, timestamp: u64): u128 acquires SingleAssetTracker {
        let volume_tracker = &mut borrow_global_mut<SingleAssetTracker<Coin>>(onchain_signer::get_signer_address(account)).volume_tracker;
        let today = (timestamp - volume_tracker.initial_timestamp) / SECONDS_IN_DAY;
        if (volume_tracker.last_update_day == today){
            return volume_tracker.past_30_days_total
        };
        // recompute and update past_30_days_total
        let buffer = &volume_tracker.buffer;
        let volume = 0;
        let i = 0;
        while (i < BUFFER_SIZE){
            if(vector::borrow(buffer, i).day + BUFFER_SIZE >= today) {
                volume = volume + vector::borrow(buffer, i).volume;
            };
            i = i + 1;
        };
        volume_tracker.past_30_days_total = volume;
        volume_tracker.last_update_day = today;
        volume
    }
}