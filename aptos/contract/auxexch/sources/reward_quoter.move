// Auto generated from "go-util/aptos/cmd/gen-reward-distributor"
// Modify Manually with Caution
// Quoter version use aux::quote_coin instead of real coin,
// and can be used to perform calculations.
module aux::reward_quoter {
    use aux::quote_coin::{Self};

    const E_MISMATCH_DISTRIBUTOR_ID: u64 = 1002;
    const E_CANNOT_CREATE_DISTRIBUTOR_FOR_OTHER: u64 = 1003;
    const E_ZERO_MINT_AMOUNT: u64 = 1004;
    const E_CANNOT_SHUTDOWN_DISTRIBUTOR_WITH_OUTSTANDING_TOKEN: u64 = 1005;
    const E_REDEEM_TOKEN_NOT_FUNGIBLE: u64 = 1006;
    const E_CANNOT_DESTROY_NON_ZERO_REDEEM_TOKEN: u64 = 1007;
    const E_CANNOT_MELT_TOKEN_FOR_DIFFERNT_DISTRIBUTOR: u64 = 1008;

    const DECIMAL_MULTIPLIER: u128 = 1000000000000;

    /// RewardDistributionQuoter is a primitive for distributing rewards to token holders.
    ///
    /// Reward is given out in the form of aux::quote_quote_coin::u64.
    ///
    /// RewardDistributionQuoter keeps track of acc_reward_per_share, that is,
    /// the amount of reward per unit token if that token exists since the initialization of the distributor.
    /// When reward is added to the RewardDistrubitor,
    /// acc_reward_per_share is increased by the amount of added_reward / total_token_amount.
    ///
    /// Users' rewards are represented by QuoterRedeemToken.
    /// Users are entitled to rewards that are added after their QuoterRedeemToken are mint.
    /// This is ensured by keeping in QuoterRedeemToken last_acc_reward_per_share, which is the
    /// acc_reward_per_share when the QuoterRedeemToken is minted.
    /// When QuoterRedeemTokens are burned, the returned reward will be based on
    /// current RewardDistributionQuoter's acc_reward_per_share minus QuoterRedeemToken's last_acc_reward_per_share.
    ///
    /// In reality, acc_reward_per_share is multiplied by 10^12 to increase the precision of calculations.
    /// However, rounding is unavoidable, and there may still be reward left when total token amount is 0.
    ///
    /// When total token amount drops to 0, RewardDistributionQuoter can be shutdown and rewards returned to the authority
    /// of the distributor.
    ///
    /// W is the witness type. Only owner of the witness type can create a RewardDistributionQuoter with W.
    ///
    /// There can be multiple RewardDistributionQuoters for the same reward coin R and witness W. They are differentiated by their id.
    /// Each RewardDistributionQuoter has separate authority even if they are of same reward coin R.
    struct RewardDistributionQuoter has store, copy, drop {
        id: u128,
        /// reward coins
        reward: u64,
        /// total_token_amount is the **current** outstanding QuoterRedeemToken for this distributor.
        total_token_amount: u128,
        /// accumulative reward per share, if the token is held from initialization of the pool.
        acc_reward_per_share: u128,
    }

    /// QuoterRedeemToken contains the information useful for redeeming reward from RewardDistributionQuoter.
    ///
    /// It contains the number of tokens, and the `last_acc_reward_per_share`.
    /// When QuoterRedeemToken is burned, reward will be calculated based on
    /// value * (reward_distributor.acc_reward_per_share - token.last_acc_reward_per_share) / DECIMAL_MULTIPLIER.
    struct QuoterRedeemToken has store, copy, drop {
        // id of the distributor
        id: u128,
        value: u64,
        last_acc_reward_per_share: u128,
    }

    /// create a new RewardDistributionQuoter
    public fun create_quoter(id: u128, reward: u64, total_token_amount: u128, acc_reward_per_share: u128): RewardDistributionQuoter {
        RewardDistributionQuoter {
            id,
            reward: quote_coin::new(reward),
            total_token_amount,
            acc_reward_per_share,
        }
    }

    /// Add rewards to the distributor.
    ///
    /// To make sure no front running, only add reward when all the current token holders are entitled to the rewards.
    /// For example, if a liquidity pool is using RewardDistributionQuoter to distribute fees to its lps.
    /// The fees should be added to the pool **BEFORE** lp tokens are minted or burned.
    ///
    /// Note this function permits anyone to add reward to the pool.
    /// Once the reward is added, there is no way to retrieve the reward before all tokens are redeemed/burned.
    ///
    /// If the total token amount is 0, the reward will be not able to be redeemable for users.
    public fun add_reward(distributor: &mut RewardDistributionQuoter, reward: u64) {
        let value = (quote_coin::value(&reward) as u128);

        quote_coin::merge(&mut distributor.reward, reward);

        // only increment the acc_reward_per_share when total token amount > 0.
        // this means the reward will stuck in the distributor if total token amount is 0.
        // the authority of the pool can still retrieve the reward once there is no outstanding token holders.
        if (distributor.total_token_amount > 0) {
            distributor.acc_reward_per_share = distributor.acc_reward_per_share + (value * DECIMAL_MULTIPLIER)/distributor.total_token_amount;
        }
    }

    /// mint new redeem tokens.
    public fun mint(
        distributor: &mut RewardDistributionQuoter,
        amount: u64,
    ): QuoterRedeemToken
    {
        assert!(amount > 0, E_ZERO_MINT_AMOUNT);

        distributor.total_token_amount = distributor.total_token_amount + (amount as u128);

        QuoterRedeemToken {
            id: distributor.id,
            value: amount,
            last_acc_reward_per_share: distributor.acc_reward_per_share,
        }
    }

    /// burn QuoterRedeemTokens and get reward
    public fun burn(
        distributor: &mut RewardDistributionQuoter,
        tokens: QuoterRedeemToken,
    ): u64 {
        assert!(tokens.id == distributor.id, E_MISMATCH_DISTRIBUTOR_ID);

        distributor.total_token_amount = distributor.total_token_amount - (tokens.value as u128);
        let reward_amount = ((distributor.acc_reward_per_share - tokens.last_acc_reward_per_share) * (tokens.value as u128)) / DECIMAL_MULTIPLIER;
        let reward_amount = (reward_amount as u64);

        let rewards = quote_coin::extract(&mut distributor.reward, reward_amount);

        let QuoterRedeemToken {
            value: _,
            id: _,
            last_acc_reward_per_share: _,
        } = tokens;

        rewards
    }

    /// rebase will withdraw the current reward amount, and
    /// replace the old token with new tokens.
    public fun rebase(
        distributor: &mut RewardDistributionQuoter,
        tokens: QuoterRedeemToken,
    ): (u64, QuoterRedeemToken) {
        assert!(tokens.id == distributor.id, E_MISMATCH_DISTRIBUTOR_ID);

        let reward_amount = ((distributor.acc_reward_per_share - tokens.last_acc_reward_per_share) * (tokens.value as u128)) / DECIMAL_MULTIPLIER;
        let reward_amount = (reward_amount as u64);

        let rewards = quote_coin::extract(&mut distributor.reward, reward_amount);

         let QuoterRedeemToken {
            value,
            id,
            last_acc_reward_per_share: _,
        } = tokens;

        (
            rewards,
            QuoterRedeemToken {
                value,
                id,
                last_acc_reward_per_share: distributor.acc_reward_per_share,
            },
        )
    }

    /// shutdown the distributor. The total outstanding token amount must be 0.
    public fun shutdown(distributor: RewardDistributionQuoter): u64 {
        assert!(
            distributor.total_token_amount == 0,
            E_CANNOT_SHUTDOWN_DISTRIBUTOR_WITH_OUTSTANDING_TOKEN,
        );

        let RewardDistributionQuoter {
            reward: remaining_rewards,
            id: _,
            total_token_amount: _,
            acc_reward_per_share: _,
        } = distributor;

        remaining_rewards
    }

    /*********************************/
    /* RewardDistributionQuoter functions   */
    /*********************************/

    public fun acc_reward_per_share(distributor: &RewardDistributionQuoter): u128 {
        distributor.acc_reward_per_share
    }

    public fun distributor_id(distributor: &RewardDistributionQuoter): u128 {
        distributor.id
    }

    public fun total_token_amount(distributor: &RewardDistributionQuoter): u128 {
        distributor.total_token_amount
    }

    public fun available_reward(distributor: &RewardDistributionQuoter): u64 {
        quote_coin::value(&distributor.reward)
    }

    /// check if token is for this RewardDistributionQuoter
    public fun check_redeem_token(distributor: &RewardDistributionQuoter, token: &QuoterRedeemToken): bool {
        distributor.id == token.id
    }

    /// compute the reward amount for the given token.
    public fun reward_amount(distributor: &RewardDistributionQuoter, token: &QuoterRedeemToken): u64 {
        assert!(
            distributor.id == token.id,
            E_MISMATCH_DISTRIBUTOR_ID,
        );
        let reward_amount = ((distributor.acc_reward_per_share - token.last_acc_reward_per_share) * (token.value as u128)) / DECIMAL_MULTIPLIER;
        let reward_amount = (reward_amount as u64);

        reward_amount
    }

    public fun new(id: u128, reward: u64, total_token_amount: u128, acc_reward_per_share: u128): RewardDistributionQuoter {
        RewardDistributionQuoter {
            id,
            reward: quote_coin::new(reward),
            total_token_amount,
            acc_reward_per_share,
        }
    }

    /*********************************/
    /* QuoterRedeemToken Related functions */
    /*********************************/

    // quoter allows arbitrary creation of redeem tokens.
    public fun token_new(id: u128, value: u64, last_acc_reward_per_share: u128): QuoterRedeemToken {
        QuoterRedeemToken {
            id,
            value,
            last_acc_reward_per_share,
        }
    }

    // quoter allows destroy of any redeem tokens.
    public fun token_destroy(token: QuoterRedeemToken) {
        let QuoterRedeemToken {
            id: _,
            value: _,
            last_acc_reward_per_share: _,
        } = token;
    }

    public fun token_value(token: &QuoterRedeemToken): u64 {
        token.value
    }

    public fun token_id(token: &QuoterRedeemToken): u128 {
        token.id
    }

    public fun token_last_acc_reward_per_share(token: &QuoterRedeemToken): u128 {
        token.last_acc_reward_per_share
    }

    /// check if two tokens are fungible.
    /// if they are fungible, they can be merged.
    public fun is_fungible(l: &QuoterRedeemToken, r: &QuoterRedeemToken): bool {
        l.id == r.id && l.last_acc_reward_per_share == r.last_acc_reward_per_share
    }

    /// extract amount of token
    public fun token_extract(t: &mut QuoterRedeemToken, amount: u64): QuoterRedeemToken {
        t.value = t.value - amount;
        QuoterRedeemToken {
            value: amount,
            id: t.id,
            last_acc_reward_per_share: t.last_acc_reward_per_share,
        }
    }

    /// merge two tokens.
    /// they must be fungible
    public fun token_merge(t: &mut QuoterRedeemToken, r: QuoterRedeemToken) {
        assert!(
            is_fungible(t, &r),
            E_REDEEM_TOKEN_NOT_FUNGIBLE,
        );

        t.value = t.value + r.value;

        r.value = 0;

        destroy_zero_token(r);
    }

    public fun destroy_zero_token(t: QuoterRedeemToken) {
        assert!(
            t.value == 0,
            E_CANNOT_DESTROY_NON_ZERO_REDEEM_TOKEN,
        );

        let QuoterRedeemToken {
            value: _,
            id: _,
            last_acc_reward_per_share: _,
        } = t;
    }

    // melt two tokens into one. there will be loss for the user due to rounding.
    public fun token_melt(l: &mut QuoterRedeemToken, r: QuoterRedeemToken) {
        assert!(
            l.id == r.id,
            E_CANNOT_MELT_TOKEN_FOR_DIFFERNT_DISTRIBUTOR,
        );

        let QuoterRedeemToken {
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
