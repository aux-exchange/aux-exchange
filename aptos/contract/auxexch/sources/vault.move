// vault defines
// - a vault, or a resource account, that holds many coins that users deposit. One of the coins is funding coin, which every
//   other coin is priced in.
// - user balances in each of the coins (or the shares of the coins that the user entitled to in the treasury).
module aux::vault {
    friend aux::clob_market;

    use std::signer;
    use std::error;
    use std::string::String;

    // use aptos_std::debug;
    use aptos_framework::coin;
    use aptos_framework::event;
    use aptos_framework::type_info;
    use aptos_framework::account;
    use aptos_std::table::{Self, Table};

    use aux::onchain_signer;
    use aux::util::Type;
    use aux::authority;
    use aux::volume_tracker;
    use aux::fee;

    const EVAULT_ALREADY_EXISTS: u64 = 1;
    const EACCOUNT_ALREADY_EXISTS: u64 = 2;
    const EACCOUNT_NOT_FOUND: u64 = 3;
    const ENOT_MODULE: u64 = 4;
    const EUNINITIALIZED_COIN: u64 = 5;
    const EUNINITIALIZED_VAULT: u64 = 6;
    const EBALANCE_INVARIANT_VIOLATION: u64 = 7;
    const ECANNOT_DOUBLE_REGISTER_SAME_COIN: u64 = 9;
    const EINSUFFICIENT_FUNDS: u64 = 10;
    const ETRADER_NOT_AUTHORIZED: u64 = 11;

    // CoinInfo provides information about a coin that can be borrowed.
    struct CoinInfo has store {
        coin_type: Type,
        decimals: u8,
        mark_price: u64,
    }

    // Balance for one coin
    struct CoinBalance<phantom CoinType> has key {
        balance: u128,
        available_balance: u128
    }

    // Used for set definition.
    struct Nothing has store, copy, drop {}

    // Aux user account
    struct AuxUserAccount has key {
        // Any account listed here can deposit and trade but not withdraw on
        // behalf of the user.
        authorized_traders: Table<address, Nothing>
    }

    struct TransferEvent has store, drop {
        coinType: String,
        from: address,
        to: address,
        amount_au: u64,
    }

    struct DepositEvent has store, drop{
        coinType: String,
        depositor: address,
        to: address,
        amount_au: u64,
    }

    struct WithdrawEvent has store, drop {
        coinType: String,
        owner: address,
        amount_au: u64,
    }

    struct Vault has key {
        transfer_events: event::EventHandle<TransferEvent>,
        deposit_events: event::EventHandle<DepositEvent>,
        withdraw_events: event::EventHandle<WithdrawEvent>,
    }

    fun init_module(source: &signer) {
        if (!exists<Vault>(signer::address_of(source))) {
            move_to(source, Vault {
                transfer_events: account::new_event_handle<TransferEvent>(source),
                deposit_events: account::new_event_handle<DepositEvent>(source),
                withdraw_events: account::new_event_handle<WithdrawEvent>(source),
            });
        };
    }

    /*******************/
    /* ENTRY FUNCTIONS */
    /*******************/

    /// TODO
    /// update mark price from oracle.
    // public entry fun update_mark_price<CoinType>() {
    //     assert!(false, UNIMPLEMENTED);
    // }

    public entry fun create_vault(sender: &signer) {
        // Allow init_module functions in aux to call this function.
        let vault_signer = if (signer::address_of(sender) == @aux) {
            sender
        } else {
            &authority::get_signer(sender)
        };

        assert!(
            signer::address_of(vault_signer) == @aux,
            error::permission_denied(ENOT_MODULE)
        );

        if (!exists<Vault>(@aux)) {
            move_to(vault_signer, Vault {
                transfer_events: account::new_event_handle<TransferEvent>(vault_signer),
                deposit_events: account::new_event_handle<DepositEvent>(vault_signer),
                withdraw_events: account::new_event_handle<WithdrawEvent>(vault_signer),
            });
        }
    }

    /// request an account from treasury.
    public entry fun create_aux_account(sender: &signer) {
        let sender_addr = signer::address_of(sender);
        assert!(!exists<AuxUserAccount>(sender_addr), error::already_exists(EACCOUNT_ALREADY_EXISTS));
        move_to(sender, AuxUserAccount{
            authorized_traders: table::new(),
        });
        onchain_signer::create_onchain_signer(sender);
        // Register volume tracker for this account if hasn't
        if(!volume_tracker::global_volume_tracker_registered(sender_addr)){
            volume_tracker::register_global_volume_tracker(sender);
        };

        // Initialize fee for this account if hasn't
        if(!fee::fee_exists(sender_addr)){
            fee::initialize_fee_default(sender);
        };

        // TODO: emit event for account creation?
    }


    /// Transfer the coins between two different accounts of the ledger.
    /// TODO: support delegation or not? currently unsupported
    public entry fun transfer<CoinType>(
        from: &signer,
        to: address,
        amount_au: u64
    ) acquires Vault, CoinBalance {
        // TODO: Account health check must be done before users can transfer funds.
        let from_addr = signer::address_of(from);
        assert!(
            exists<AuxUserAccount>(to),
            EACCOUNT_NOT_FOUND
        );
        decrease_user_balance<CoinType>(from_addr, (amount_au as u128));
        increase_user_balance<CoinType>(to, (amount_au as u128));

        let vault_events = borrow_global_mut<Vault>(@aux);
        event::emit_event<TransferEvent>(
            &mut vault_events.transfer_events,
            TransferEvent {
                coinType: type_info::type_name<CoinType>(),
                from: signer::address_of(from),
                to,
                amount_au,
            }
        );
    }

    /// Deposit funds. Returns user's new balance. Can only deposit to sender's
    /// own AuxUserAccount or an AuxUserAccount that sender's address is
    /// whitelisted.
    public entry fun deposit<CoinType>(
        sender: &signer,
        to: address,
        amount: u64
    ) acquires AuxUserAccount, CoinBalance, Vault {
        // Confirm whether can deposit
        assert_trader_is_authorized_for_account(sender, to);
        assert!(exists<AuxUserAccount>(to), error::not_found(EACCOUNT_NOT_FOUND));
        if (!coin::is_account_registered<CoinType>(@aux)) {
            coin::register<CoinType>(&authority::get_signer_self());
        };
        coin::transfer<CoinType>(sender, @aux, amount);
        increase_user_balance<CoinType>(to, (amount as u128));

        let vault_events = borrow_global_mut<Vault>(@aux);
        event::emit_event<DepositEvent>(
            &mut vault_events.deposit_events,
            DepositEvent {
                coinType: type_info::type_name<CoinType>(),
                depositor: signer::address_of(sender),
                to: to,
                amount_au: amount,
            }
        );
    }

    /// Withdraw funds. Returns user's new balance.
    public entry fun withdraw<CoinType>(
        sender: &signer,
        amount_au: u64
    ) acquires CoinBalance, Vault {
        let owner_addr = signer::address_of(sender);
        assert!(exists<AuxUserAccount>(owner_addr), error::not_found(EACCOUNT_NOT_FOUND));
        decrease_user_balance<CoinType>(owner_addr, (amount_au as u128));
        let vault_signer = authority::get_signer_self();
        coin::transfer<CoinType>(&vault_signer, owner_addr, amount_au);

        let vault_events = borrow_global_mut<Vault>(@aux);
        event::emit_event<WithdrawEvent>(
            &mut vault_events.withdraw_events,
            WithdrawEvent {
                coinType: type_info::type_name<CoinType>(),
                owner: signer::address_of(sender),
                amount_au,
            }
        );
    }

    /// Adds an authorized trader for the account owned by sender. The sender is
    /// automatically authorized for the sender's own account, so adding is
    /// unnecessary. Fails if the input trader is already authorized.
    public entry fun add_authorized_trader(
        sender: &signer,
        trader: address
    ) acquires AuxUserAccount {
        let owner = signer::address_of(sender);
        let account = borrow_global_mut<AuxUserAccount>(owner);
        table::add(&mut account.authorized_traders, trader, Nothing {});
    }

    // Removes an authorized trader from the account owned by sender. The sender
    // is automatically authorized for the sender's own account, and removing
    // has no effect. Fails if the input trader isn't currently authorized.
    public entry fun remove_authorized_trader(
        sender: &signer,
        trader: address
    ) acquires AuxUserAccount {
        let owner = signer::address_of(sender);
        let account = borrow_global_mut<AuxUserAccount>(owner);
        table::remove(&mut account.authorized_traders, trader);
    }

    /********************/
    /* PUBLIC FUNCTIONS */
    /********************/

    /// Asserts that the trader has authority for the given account. Authority
    /// is granted by add_authorized_trader and removed by
    /// remove_authorized_trader.
    public fun assert_trader_is_authorized_for_account(
        trader: &signer,
        account: address
    ) acquires AuxUserAccount {
        let trader_address = signer::address_of(trader);
        // You are always authorized to trade your own account.
        if (trader_address == account) {
            return
        };
        let target_account = borrow_global<AuxUserAccount>(account);
        assert!(
            table::contains(
                &target_account.authorized_traders,
                trader_address
            ),
            ETRADER_NOT_AUTHORIZED
        );
    }

    public fun has_aux_account(addr: address): bool {
        exists<AuxUserAccount>(addr)
    }

    /// Return's the user balance in CoinType. Returns zero if no amount of
    /// CoinType has ever been transferred to the user.
    public fun balance<CoinType>(user_addr: address): u128 acquires CoinBalance {
        let balance_address = onchain_signer::get_signer_address(user_addr);
        if (exists<CoinBalance<CoinType>>(balance_address)) {
            let balance = borrow_global<CoinBalance<CoinType>>(balance_address);
            balance.balance
        } else {
            0
        }
    }

    /// Return's the user available balance in CoinType. Returns zero if no
    /// amount of CoinType has ever been transferred to the user.
    public fun available_balance<CoinType>(user_addr: address): u128 acquires CoinBalance {
        let balance_address = onchain_signer::get_signer_address(user_addr);
        if (exists<CoinBalance<CoinType>>(balance_address)) {
            let balance = borrow_global<CoinBalance<CoinType>>(balance_address);
            balance.available_balance
        } else {
            0
        }
    }

    public fun withdraw_coin<CoinType>(
        sender: &signer,
        amount_au: u64
    ): coin::Coin<CoinType> acquires CoinBalance, Vault {
        let owner_addr = signer::address_of(sender);
        assert!(exists<AuxUserAccount>(owner_addr), error::not_found(EACCOUNT_NOT_FOUND));
        decrease_user_balance<CoinType>(owner_addr, (amount_au as u128));
        let vault_signer = authority::get_signer_self();
        let coin = coin::withdraw<CoinType>(&vault_signer, amount_au);

        let vault_events = borrow_global_mut<Vault>(@aux);
        event::emit_event<WithdrawEvent>(
            &mut vault_events.withdraw_events,
            WithdrawEvent {
                coinType: type_info::type_name<CoinType>(),
                owner: signer::address_of(sender),
                amount_au,
            }
        );
        coin
    }

    public fun deposit_coin<CoinType>(
        to: address,
        coin: coin::Coin<CoinType>,
    ) acquires CoinBalance, Vault {
        assert!(exists<AuxUserAccount>(to), error::not_found(EACCOUNT_NOT_FOUND));
        if (!coin::is_account_registered<CoinType>(@aux)) {
            coin::register<CoinType>(&authority::get_signer_self());
        };
        let amount = coin::value<CoinType>(&coin);
        coin::deposit<CoinType>(@aux, coin);
        increase_user_balance<CoinType>(to, (amount as u128));

        let vault_events = borrow_global_mut<Vault>(@aux);
        event::emit_event<DepositEvent>(
            &mut vault_events.deposit_events,
            DepositEvent {
                coinType: type_info::type_name<CoinType>(),
                depositor: to,
                to: to,
                amount_au: amount,
            }
        );
    }


    /********************/
    /* FRIEND FUNCTIONS */
    /********************/

    /// add position
    public(friend) fun increase_user_balance<CoinType>(
        user_addr: address,
        amount: u128
    ): u128 acquires CoinBalance {
        let balance_address = onchain_signer::get_signer_address(user_addr);
        if (exists<CoinBalance<CoinType>>(balance_address)) {
            let coin_balance = borrow_global_mut<CoinBalance<CoinType>>(balance_address);
            coin_balance.balance = coin_balance.balance + amount;
            coin_balance.available_balance = coin_balance.available_balance + amount;
            coin_balance.balance
        } else {
            let signer_address = onchain_signer::get_signer(user_addr);
            move_to(
                &signer_address,
                CoinBalance<CoinType> {
                    balance: amount,
                    available_balance: amount,
                }
            );
            amount
        }
    }

    /// decrease balance
    public(friend) fun decrease_user_balance<CoinType>(user_addr: address, amount: u128): u128 acquires CoinBalance {
        let balance_address = onchain_signer::get_signer_address(user_addr);
        let coin_balance = borrow_global_mut<CoinBalance<CoinType>>(balance_address);
        assert!(
            coin_balance.balance >= amount,
            EINSUFFICIENT_FUNDS
        );
        coin_balance.balance = coin_balance.balance - amount;
        assert!(
            coin_balance.available_balance >= amount,
            EINSUFFICIENT_FUNDS
        );
        coin_balance.available_balance = coin_balance.available_balance - amount;
        coin_balance.balance
    }

    /// decrease balance that was previously marked unavailable
    public(friend) fun decrease_unavailable_balance<CoinType>(user_addr: address, amount: u128): u128 acquires CoinBalance {
        let balance_address = onchain_signer::get_signer_address(user_addr);
        let coin_balance = borrow_global_mut<CoinBalance<CoinType>>(balance_address);
        assert!(
            coin_balance.balance >= amount,
            EINSUFFICIENT_FUNDS
        );
        coin_balance.balance = coin_balance.balance - amount;
        assert!(
            coin_balance.available_balance <= coin_balance.balance,
            error::invalid_state(EBALANCE_INVARIANT_VIOLATION)
        );
        coin_balance.balance
    }

    /// Note for vault-delegation PR: since decrease_user_balance and  already passed in user_addr, change this signer to user_addr doesn't decrease security, depend on the caller / wrapper that do all the proper check
    public(friend) fun decrease_available_balance<CoinType>(user_addr: address, amount: u128): u128 acquires CoinBalance {
        // TODO: Account health check must be done before available balance can be decreased
        let balance_address = onchain_signer::get_signer_address(user_addr);
        let coin_balance = borrow_global_mut<CoinBalance<CoinType>>(balance_address);
        assert!(
            coin_balance.available_balance >= amount,
            EINSUFFICIENT_FUNDS
        );
        coin_balance.available_balance = coin_balance.available_balance - amount;
        coin_balance.available_balance
    }

    public(friend) fun increase_available_balance<CoinType>(user_addr: address, amount: u128): u128 acquires CoinBalance {
        let balance_address = onchain_signer::get_signer_address(user_addr);
        let coin_balance = borrow_global_mut<CoinBalance<CoinType>>(balance_address);

        coin_balance.available_balance = coin_balance.available_balance + amount;
        // Available balance can be at most == total balance
        if (coin_balance.available_balance > coin_balance.balance) {
            coin_balance.available_balance = coin_balance.balance;
        };
        coin_balance.available_balance
    }

    /*********/
    /* TESTS */
    /*********/
    #[test_only]
    use aux::util::{Self, QuoteCoin, BaseCoin};

    #[test_only]
    const ETEST_FAILURE: u64 = 8;

    #[test_only]
    use deployer::deployer::create_resource_account;

    #[test_only]
    public fun create_vault_for_test(sender: &signer) {
        if (!account::exists_at(@aux)) {
            create_resource_account(sender, b"amm");
            authority::init_module_for_test(&deployer::deployer::get_signer_for_address(sender, @aux));
        };

        let vault_signer = if (signer::address_of(sender) == @aux) {
            sender
        } else {
            &authority::get_signer(sender)
        };

        init_module(vault_signer);
    }

    #[test_only]
    public fun init_accounts_for_test(alice: &signer): address {
        let alice_addr = signer::address_of(alice);
        account::create_account_for_test(alice_addr);
        alice_addr
    }

    #[test(sender = @0x5e7c3, aux = @aux, alice = @0x123)]
    fun test_aux_vault(sender: &signer, aux: &signer, alice: &signer) acquires AuxUserAccount, Vault, CoinBalance {
        // create test accounts
        let alice_addr = init_accounts_for_test(alice);

        util::init_coin_for_test<QuoteCoin>(aux, 6);
        create_vault_for_test(sender);

        // Register AuxCoin

        util::init_coin_for_test<BaseCoin>(aux, 6);
        // aux_coin::initialize_for_test(aux);

        // Create AuxUserAccount for alice
        create_aux_account(alice);
        assert!(exists<AuxUserAccount>(signer::address_of(alice)), ETEST_FAILURE);

        // Test deposit

        coin::register<QuoteCoin>(alice);
        coin::register<BaseCoin>(alice);
        util::mint_coin_for_test<QuoteCoin>(aux, alice_addr, 1000);
        util::mint_coin_for_test<BaseCoin>(aux, alice_addr, 1000);

        // Test fund coin
        deposit<QuoteCoin>(alice, alice_addr, 300);
        assert!(balance<QuoteCoin>(alice_addr) == 300, ETEST_FAILURE);
        assert!(coin::balance<QuoteCoin>(alice_addr) == 700, ETEST_FAILURE);

        // Test non-fund coin
        deposit<BaseCoin>(alice, alice_addr, 400);
        assert!(balance<BaseCoin>(alice_addr) == 400, ETEST_FAILURE);
        assert!(coin::balance<BaseCoin>(alice_addr) == 600, ETEST_FAILURE);

        // Test withdraw

        // Test fund coin
        withdraw<QuoteCoin>(alice, 100);
        assert!(balance<QuoteCoin>(alice_addr) == 200, ETEST_FAILURE);
        assert!(coin::balance<QuoteCoin>(alice_addr) == 800, ETEST_FAILURE);

        // Test non-fund coin

        withdraw<BaseCoin>(alice, 300);
        assert!(balance<BaseCoin>(alice_addr) == 100, ETEST_FAILURE);
        assert!(coin::balance<BaseCoin>(alice_addr) == 900, ETEST_FAILURE);
        withdraw<BaseCoin>(alice, 100);
        assert!(balance<BaseCoin>(alice_addr) == 0, ETEST_FAILURE);
        assert!(coin::balance<BaseCoin>(alice_addr) == 1000, ETEST_FAILURE);
    }

    #[test(sender = @0x123)]
    #[expected_failure]
    fun test_only_publisher_can_create_vault(sender: &signer) {
        create_vault_for_test(sender);
    }

    #[test(sender = @0x5e7c3, aux = @aux, alice = @0x123)]
    #[expected_failure]
    fun test_cannot_overdraw_account(sender: &signer, aux: &signer, alice: &signer) acquires CoinBalance, Vault {
        init_accounts_for_test(alice);
        util::init_coin_for_test<QuoteCoin>(aux, 3);
        create_vault_for_test(sender);
        create_aux_account(alice);
        coin::register<QuoteCoin>(alice);
        withdraw<QuoteCoin>(alice, 100);
    }

    #[test(alice = @0x123, bob = @0x456)]
    #[expected_failure]
    fun test_missing_authority(alice: &signer, bob: &signer) acquires AuxUserAccount {
        init_accounts_for_test(alice);
        init_accounts_for_test(bob);
        create_aux_account(alice);
        assert_trader_is_authorized_for_account(bob, signer::address_of(alice));
    }

    #[test(alice = @0x123, bob = @0x456)]
    fun test_authority_granted(alice: &signer, bob: &signer) acquires AuxUserAccount {
        init_accounts_for_test(alice);
        init_accounts_for_test(bob);
        create_aux_account(alice);
        assert_trader_is_authorized_for_account(alice, signer::address_of(alice));
        add_authorized_trader(alice, signer::address_of(bob));
        assert_trader_is_authorized_for_account(bob, signer::address_of(alice));
    }

    #[test(alice = @0x123, bob = @0x456)]
    fun test_authority_removed(alice: &signer, bob: &signer) acquires AuxUserAccount {
        init_accounts_for_test(alice);
        init_accounts_for_test(bob);
        create_aux_account(alice);
        assert_trader_is_authorized_for_account(alice, signer::address_of(alice));
        add_authorized_trader(alice, signer::address_of(bob));
        assert_trader_is_authorized_for_account(bob, signer::address_of(alice));
        remove_authorized_trader(alice, signer::address_of(bob));
    }

    #[test(alice = @0x123, bob = @0x456)]
    #[expected_failure]
    fun test_authority_removed_eliminated_authority(alice: &signer, bob: &signer) acquires AuxUserAccount {
        init_accounts_for_test(alice);
        init_accounts_for_test(bob);
        create_aux_account(alice);
        assert_trader_is_authorized_for_account(alice, signer::address_of(alice));
        add_authorized_trader(alice, signer::address_of(bob));
        assert_trader_is_authorized_for_account(bob, signer::address_of(alice));
        remove_authorized_trader(alice, signer::address_of(bob));
        assert_trader_is_authorized_for_account(bob, signer::address_of(alice));
    }

    #[test(sender = @0x5e7c3, aux = @aux, alice = @0x123)]
    #[expected_failure]
    fun test_unwhitelisted_user_cannot_deposit(sender: &signer, aux: &signer, alice: &signer) acquires AuxUserAccount, CoinBalance, Vault {
        // create test accounts
        let alice_addr = init_accounts_for_test(alice);

        util::init_coin_for_test<QuoteCoin>(aux, 6);
        create_vault_for_test(sender);

        // Register AuxCoin

        util::init_coin_for_test<BaseCoin>(aux, 6);
        // aux_coin::initialize_for_test(aux);

        // Create AuxUserAccount for alice
        create_aux_account(alice);
        assert!(exists<AuxUserAccount>(signer::address_of(alice)), ETEST_FAILURE);

        // Test deposit
        util::mint_coin_for_test<QuoteCoin>(aux, alice_addr, 1000);
        util::mint_coin_for_test<BaseCoin>(aux, alice_addr, 1000);

        // Deposit its own account
        deposit<QuoteCoin>(alice, alice_addr, 300);

        // This will fail
        deposit<QuoteCoin>(alice, signer::address_of(sender), 300);
    }

    #[test(sender = @0x5e7c3, aux = @aux, alice = @0x123)]
    fun test_authorized_user_can_deposit(sender: &signer, aux: &signer, alice: &signer) acquires AuxUserAccount, CoinBalance, Vault  {
        // create test accounts
        let alice_addr = init_accounts_for_test(alice);
        init_accounts_for_test(sender);
        util::init_coin_for_test<QuoteCoin>(aux, 6);
        create_vault_for_test(sender);

        // Register AuxCoin

        util::init_coin_for_test<BaseCoin>(aux, 6);
        // aux_coin::initialize_for_test(aux);

        // Create AuxUserAccount for alice
        create_aux_account(alice);
        create_aux_account(sender);
        coin::register<QuoteCoin>(alice);
        coin::register<BaseCoin>(alice);
        coin::register<QuoteCoin>(sender);
        coin::register<BaseCoin>(sender);
        assert!(exists<AuxUserAccount>(signer::address_of(alice)), ETEST_FAILURE);

        // Test deposit
        util::maybe_register_coin<QuoteCoin>(alice);
        util::maybe_register_coin<BaseCoin>(alice);
        util::mint_coin_for_test<QuoteCoin>(aux, alice_addr, 1000);
        util::mint_coin_for_test<BaseCoin>(aux, alice_addr, 1000);
                // Test deposit
        util::mint_coin_for_test<QuoteCoin>(aux, signer::address_of(sender), 1000);
        util::mint_coin_for_test<BaseCoin>(aux, signer::address_of(sender), 1000);

        // Deposit its own account
        deposit<QuoteCoin>(alice, alice_addr, 300);

        // Sender add alice in acl
        add_authorized_trader(sender, alice_addr);

        // Alice able to deposit to sender
        deposit<QuoteCoin>(alice, signer::address_of(sender), 300);
    }

    #[test(sender = @0x5e7c3)]
    fun test_create_vault_for_test(sender: &signer) {
        create_vault_for_test(sender);
    }
}
