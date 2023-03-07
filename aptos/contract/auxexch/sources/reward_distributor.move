// Auto generated from "go-util/aptos/cmd/gen-reward-distributor"
// Modify Manually with Caution
module aux::reward_distributor {
    use std::signer;

    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::type_info;
    use aux::reward_quoter::{Self, RewardDistributionQuoter};

    const E_MISMATCH_DISTRIBUTOR_ID: u64 = 1002;
    const E_CANNOT_CREATE_DISTRIBUTOR_FOR_OTHER: u64 = 1003;
    const E_ZERO_MINT_AMOUNT: u64 = 1004;
    const E_CANNOT_SHUTDOWN_DISTRIBUTOR_WITH_OUTSTANDING_TOKEN: u64 = 1005;
    const E_REDEEM_TOKEN_NOT_FUNGIBLE: u64 = 1006;
    const E_CANNOT_DESTROY_NON_ZERO_REDEEM_TOKEN: u64 = 1007;
    const E_CANNOT_MELT_TOKEN_FOR_DIFFERNT_DISTRIBUTOR: u64 = 1008;

    const DECIMAL_MULTIPLIER: u128 = 1000000000000;

    /// RewardDistributor is a primitive for distributing rewards to token holders.
    ///
    /// Reward is given out in the form of 0x1::coin::Coin<R>.
    ///
    /// RewardDistributor keeps track of acc_reward_per_share, that is,
    /// the amount of reward per unit token if that token exists since the initialization of the distributor.
    /// When reward is added to the RewardDistrubitor,
    /// acc_reward_per_share is increased by the amount of added_reward / total_token_amount.
    ///
    /// Users' rewards are represented by RedeemToken.
    /// Users are entitled to rewards that are added after their RedeemToken are mint.
    /// This is ensured by keeping in RedeemToken last_acc_reward_per_share, which is the
    /// acc_reward_per_share when the RedeemToken is minted.
    /// When RedeemTokens are burned, the returned reward will be based on
    /// current RewardDistributor's acc_reward_per_share minus RedeemToken's last_acc_reward_per_share.
    ///
    /// In reality, acc_reward_per_share is multiplied by 10^12 to increase the precision of calculations.
    /// However, rounding is unavoidable, and there may still be reward left when total token amount is 0.
    ///
    /// When total token amount drops to 0, RewardDistributor can be shutdown and rewards returned to the authority
    /// of the distributor.
    ///
    /// W is the witness type. Only owner of the witness type can create a RewardDistributor with W.
    ///
    /// There can be multiple RewardDistributors for the same reward coin R and witness W. They are differentiated by their id.
    /// Each RewardDistributor has separate authority even if they are of same reward coin R.
    struct RewardDistributor<phantom R, phantom W> has store {
        id: u128,
        /// reward coins
        reward: Coin<R>,
        /// total_token_amount is the **current** outstanding RedeemToken for this distributor.
        total_token_amount: u128,
        /// accumulative reward per share, if the token is held from initialization of the pool.
        acc_reward_per_share: u128,
    }

    /// RedeemToken contains the information useful for redeeming reward from RewardDistributor.
    ///
    /// It contains the number of tokens, and the `last_acc_reward_per_share`.
    /// When RedeemToken is burned, reward will be calculated based on
    /// value * (reward_distributor.acc_reward_per_share - token.last_acc_reward_per_share) / DECIMAL_MULTIPLIER.
    struct RedeemToken<phantom R, phantom W> has store {
        // id of the distributor
        id: u128,
        value: u64,
        last_acc_reward_per_share: u128,
    }

    /// create a new RewardDistributor.
    public fun create_reward_distributor<R, W>(sender: &signer, id: u128): RewardDistributor<R, W> {
        assert!(
            signer::address_of(sender) == type_info::account_address(&type_info::type_of<W>()),
            E_CANNOT_CREATE_DISTRIBUTOR_FOR_OTHER,
        );
        RewardDistributor {
            id,
            reward: coin::zero(),
            total_token_amount: 0,
            acc_reward_per_share: 0,
        }
    }

    /// Add rewards to the distributor.
    ///
    /// To make sure no front running, only add reward when all the current token holders are entitled to the rewards.
    /// For example, if a liquidity pool is using RewardDistributor to distribute fees to its lps.
    /// The fees should be added to the pool **BEFORE** lp tokens are minted or burned.
    ///
    /// Note this function permits anyone to add reward to the pool.
    /// Once the reward is added, there is no way to retrieve the reward before all tokens are redeemed/burned.
    ///
    /// If the total token amount is 0, the reward will be not able to be redeemable for users.
    public fun add_reward<R, W>(distributor: &mut RewardDistributor<R, W>, reward: Coin<R>) {
        let value = (coin::value(&reward) as u128);

        coin::merge(&mut distributor.reward, reward);

        // only increment the acc_reward_per_share when total token amount > 0.
        // this means the reward will stuck in the distributor if total token amount is 0.
        // the authority of the pool can still retrieve the reward once there is no outstanding token holders.
        if (distributor.total_token_amount > 0) {
            distributor.acc_reward_per_share = distributor.acc_reward_per_share + (value * DECIMAL_MULTIPLIER)/distributor.total_token_amount;
        }
    }

    /// mint new redeem tokens.
    public fun mint<R, W>(
        distributor: &mut RewardDistributor<R, W>,
        amount: u64,
    ): RedeemToken<R, W>
    {
        assert!(amount > 0, E_ZERO_MINT_AMOUNT);

        distributor.total_token_amount = distributor.total_token_amount + (amount as u128);

        RedeemToken {
            id: distributor.id,
            value: amount,
            last_acc_reward_per_share: distributor.acc_reward_per_share,
        }
    }

    /// burn RedeemTokens and get reward
    public fun burn<R, W>(
        distributor: &mut RewardDistributor<R, W>,
        tokens: RedeemToken<R, W>,
    ): Coin<R> {
        assert!(tokens.id == distributor.id, E_MISMATCH_DISTRIBUTOR_ID);

        distributor.total_token_amount = distributor.total_token_amount - (tokens.value as u128);
        let reward_amount = ((distributor.acc_reward_per_share - tokens.last_acc_reward_per_share) * (tokens.value as u128)) / DECIMAL_MULTIPLIER;
        let reward_amount = (reward_amount as u64);

        let rewards = coin::extract(&mut distributor.reward, reward_amount);

        let RedeemToken {
            value: _,
            id: _,
            last_acc_reward_per_share: _,
        } = tokens;

        rewards
    }

    /// rebase will withdraw the current reward amount, and
    /// replace the old token with new tokens.
    public fun rebase<R, W>(
        distributor: &mut RewardDistributor<R, W>,
        tokens: RedeemToken<R, W>,
    ): (Coin<R>, RedeemToken<R, W>) {
        assert!(tokens.id == distributor.id, E_MISMATCH_DISTRIBUTOR_ID);

        let reward_amount = ((distributor.acc_reward_per_share - tokens.last_acc_reward_per_share) * (tokens.value as u128)) / DECIMAL_MULTIPLIER;
        let reward_amount = (reward_amount as u64);

        let rewards = coin::extract(&mut distributor.reward, reward_amount);

         let RedeemToken {
            value,
            id,
            last_acc_reward_per_share: _,
        } = tokens;

        (
            rewards,
            RedeemToken {
                value,
                id,
                last_acc_reward_per_share: distributor.acc_reward_per_share,
            },
        )
    }

    /// shutdown the distributor. The total outstanding token amount must be 0.
    public fun shutdown<R, W>(distributor: RewardDistributor<R, W>): Coin<R> {
        assert!(
            distributor.total_token_amount == 0,
            E_CANNOT_SHUTDOWN_DISTRIBUTOR_WITH_OUTSTANDING_TOKEN,
        );

        let RewardDistributor<R, W> {
            reward: remaining_rewards,
            id: _,
            total_token_amount: _,
            acc_reward_per_share: _,
        } = distributor;

        remaining_rewards
    }

    /*********************************/
    /* RewardDistributor functions   */
    /*********************************/

    public fun acc_reward_per_share<R, W>(distributor: &RewardDistributor<R, W>): u128 {
        distributor.acc_reward_per_share
    }

    public fun distributor_id<R, W>(distributor: &RewardDistributor<R, W>): u128 {
        distributor.id
    }

    public fun total_token_amount<R, W>(distributor: &RewardDistributor<R, W>): u128 {
        distributor.total_token_amount
    }

    public fun available_reward<R, W>(distributor: &RewardDistributor<R, W>): u64 {
        coin::value(&distributor.reward)
    }

    /// check if token is for this RewardDistributor
    public fun check_redeem_token<R, W>(distributor: &RewardDistributor<R, W>, token: &RedeemToken<R, W>): bool {
        distributor.id == token.id
    }

    /// compute the reward amount for the given token.
    public fun reward_amount<R, W>(distributor: &RewardDistributor<R, W>, token: &RedeemToken<R, W>): u64 {
        assert!(
            distributor.id == token.id,
            E_MISMATCH_DISTRIBUTOR_ID,
        );
        let reward_amount = ((distributor.acc_reward_per_share - token.last_acc_reward_per_share) * (token.value as u128)) / DECIMAL_MULTIPLIER;
        let reward_amount = (reward_amount as u64);

        reward_amount
    }

    public fun get_quoter<R, W>(distributor: &RewardDistributor<R, W>): RewardDistributionQuoter {
        reward_quoter::new(distributor.id, coin::value(&distributor.reward), distributor.total_token_amount, distributor.acc_reward_per_share)
    }

    #[test_only]
    /// destroy a distributor for for test only.
    /// the reward will be deposit into the sender account.
    public fun destroy_for_test<R, W>(distributor: RewardDistributor<R, W>): Coin<R> {
        let RewardDistributor {
            id: _,
            total_token_amount: _,
            reward,
            acc_reward_per_share: _
        } = distributor;

        reward
    }

    /*********************************/
    /* RedeemToken Related functions */
    /*********************************/
    public fun token_value<R, W>(token: &RedeemToken<R, W>): u64 {
        token.value
    }

    public fun token_id<R, W>(token: &RedeemToken<R, W>): u128 {
        token.id
    }

    public fun token_last_acc_reward_per_share<R, W>(token: &RedeemToken<R, W>): u128 {
        token.last_acc_reward_per_share
    }

    /// check if two tokens are fungible.
    /// if they are fungible, they can be merged.
    public fun is_fungible<R, W>(l: &RedeemToken<R, W>, r: &RedeemToken<R, W>): bool {
        l.id == r.id && l.last_acc_reward_per_share == r.last_acc_reward_per_share
    }

    /// extract amount of token
    public fun token_extract<R, W>(t: &mut RedeemToken<R, W>, amount: u64): RedeemToken<R, W> {
        t.value = t.value - amount;
        RedeemToken<R, W> {
            value: amount,
            id: t.id,
            last_acc_reward_per_share: t.last_acc_reward_per_share,
        }
    }

    /// merge two tokens.
    /// they must be fungible
    public fun token_merge<R, W>(t: &mut RedeemToken<R, W>, r: RedeemToken<R, W>) {
        assert!(
            is_fungible(t, &r),
            E_REDEEM_TOKEN_NOT_FUNGIBLE,
        );

        t.value = t.value + r.value;

        r.value = 0;

        destroy_zero_token(r);
    }

    public fun destroy_zero_token<R, W>(t: RedeemToken<R, W>) {
        assert!(
            t.value == 0,
            E_CANNOT_DESTROY_NON_ZERO_REDEEM_TOKEN,
        );

        let RedeemToken {
            value: _,
            id: _,
            last_acc_reward_per_share: _,
        } = t;
    }

    // melt two tokens into one. there will be loss for the user due to rounding.
    public fun token_melt<R, W>(l: &mut RedeemToken<R, W>, r: RedeemToken<R, W>) {
        assert!(
            l.id == r.id,
            E_CANNOT_MELT_TOKEN_FOR_DIFFERNT_DISTRIBUTOR,
        );

        let RedeemToken {
            id: _,
            value: r_value,
            last_acc_reward_per_share: r_acc,
        } = r;
        let r_value = (r_value as u128);
        let l_value = (l.value as u128);
        let l_acc = l.last_acc_reward_per_share;

        let old_acc = l_value * l_acc + r_value * r_acc;
        let total_value = l_value + r_value;
        let new_acc = old_acc / total_value;
        if (new_acc * total_value < old_acc) {
            new_acc = new_acc + 1;
        };

        l.value = (total_value as u64);
        l.last_acc_reward_per_share = new_acc;
    }
}
