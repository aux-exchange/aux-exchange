# Thought Experiment on Derivative Risk Management for Exchanges

Derivatives trading comes with leverage by design, and with leverage comes with risk. This risk is generally managed through margin requirement. One setup has two types of margins, initial margin (the margin required to open new positions), and maintenance margin (the margin required to maintain the position open).

## Example of a Future Contract

Let's have an illustrative example. Assume asset X has initial margin requirement of 20% and maintenance margin requirement of 10%, and X is trading at 10,000 currently. A wants to long and B wants to short 1 X. A and B can enter into a future contract. The price of the contract will be X's current price of 10,000. Note, there is no money or asset changing hand yet - A and B simply agree on the term that A will buy from B 1 X at price 10,000 at a future date. At the end, A and B may simply exchange the price different of 1 X instead of exchange 1 X with 10,000 cash. If X ends up trading at 11,000, B will transfer A 1,000. If X ends up trading at 9,500, A will transfer B 500. The end result is that **economically** it's as if A and B traded 1 X at price of 10,000 on a future date, and A or B never needs X in possession - this is called cash settlement. Real world may have interest payment, funding rates, or various other details, but the idea is simple, and applies to both traditional derivative exchanges such as CME or DeFi venues like Mango Markets.

**Note**: there are contracts that are not cash-settled. For example, an oil future may be physical settled, so A will need to find storage space for the oil, and B will need to find oil to deliver to A if X is oil.

### Net account value, margin, and liquidation

Continue our example. At the start of the contract, there is no exchange of assets - therefore technically speaking, A and B don't need to post any asset to enter into the contract. However, it will be too easy to back out of the contract if A and B don't post asset and the price moves against either party. A and B will need to post 2,000 each - 20% initial margin requirement, per the exchange rule - to enter the contract. Exchange (or broker dealer) will mark the position to market continously. Let the price of the contract to be $p_0$, and current price to be $p$. Let $x$ be the position, and cash in the position to be $c$. The net accont value of the A or B's account are

$$
\left(p-p_0\right)x+c
$$

$\left(p-p_0\right)x$ is the pnl of the position, $c$ is the cash of the position. A and B will deposit the 2,000 cash into exchange, and exchange will record their cash amount. Their cash amount is updated when they close the position - and this will simply be a line item update on the exchange accounting book. Also, purely technically speaking again, cash is not needed until A or B withdraws.

Initial margin and maintenance margin are calculated based on the gross market value of the account excluding cash (or we can consider cash to have 0 margin requirement). Let $m$ be the margin requirement percentage, exchange requires a user's net account value be greater than the margin requirement

$$
m p\left|x\right| \leq \left(p-p_0\right)x+c
$$

If X is trading at 11,500, A's net account value is

$$
v_A=1 \times \left(11500-10000\right) + 2000 = 3500
$$

and B's net account value is

$$
v_B = -1 \times \left(11500-10000\right) + 2000 = 500
$$

Now, the margin requirement for the position is

$$
0.1 \times 1 \times 11500 = 1150
$$

A's account value is greater than that, so A doesn't need to post any extra margin. However, B's account is 650 short, so B needs to post 650 extra cash. What if B doesn't want to post the extra 650? Exchange will liquidate the position by selling it to another user. **Assuming** B's position is sold at the current price of 11,500 (this is a very strong assumption), it will free up B's 500 net account value - the exchange can return a portion of the 500 to B, retain a portion of the 500, and/or distribute a portion of the 500 to the one who initiated the liquidation trade (DeFi exchanges only use this mechanism to encourage bots to liquidate positions instead of run the liquidation crank).

### Shortfall

Continue our example - instead of 11,500, assume X is trading at 15,000. A's net account value is 7,000, while B's is at -3000. B is required to post 3,000 + 1,500 to maintain the open position. Or more likely, B's position will be liquidated. However, there is no equity in B's position. If A is to withdraw the 7,000 cash, the exchange must cover that or risk a default. The exchange can cover that from the fees, equities of exchange members, or the liquidation proceeds mentioned earlier.

### Lending

Notice A has net account value of 3,500 when X is at 11,500. A can withdraw up to 2,350 and still maintain the margin. But if the price moves against A, A needs to post more right away.

### Advantage and Risk of the Exchange

It looks risky - but an exchange centrally managing all those does have advantages comparing with A, B, C, D, etc... all enter contract with each other

- the risk of the system cannot be fully observed because
  - there is no holistic view of the whole system
  - the contract details of each pair may be different enough that netting or managing the risk is impossible
- the system can be brought down by a single link
  - if B is the conterparty to A and C, and C is also counter party to D, B defaulting may lead to C and A defaulting and also bring down D. However, a central exchange may protect A, C, D to an extend (and their exposure may be netted out).
- liquidation is much more difficult.
- capital inefficiency. The positions of a user with different counterparties cannot net out each other even if they offset.

For the exchange, the risk is that the market moves too fast before the losing position can be liquidated, there are many faucets to how to manage the risk

1. decide margin requirement based on the volatility of the asset.
1. decide margin requirement based on the position of the user - the bigger the position, the more difficult a liquidation it will be.
1. decide margin requirement based on some trading statistics.

Essentially, exchange is betting on that price movement is within the margin requirement before it can act.

Does 100% margin requirement help? No, if X roses to 30,000, B will still be wiped out and exchange still has a 10,000 hole to fill.

However, generally, this system works

- the price will not move that fast (how many days does S&P500 move more than 5% - well, not a good example recently, but you got the gist)
- there are many users on the exchange, and not every one will wiped out at the same time (well, unless contract is dominated by some big whales or there is a systematic event).

That being said, if there is an observable risk that the exchange may not be able to fulfill all the withdraws, the users may start withdrawing their money, which may cause a run on the exchange.

This is essential a feature of the exchange because all the users' balances are **aggregated into one single number** and their balances are just slices of the big number based on the net account value. When A and B enter into a contract, the balances will be mixed with the contract entered into by C and D. The cash value of the exchange cannot drop below zero, but the individual line item for A, B, C, D definitely can.

## Meet Your Counterparties

Is there a way to build an exchange with all the advantanges of an exchange without the possibility of a run? What if instead of mixing A and B's contract, we keep it separate? So A and B will never make or lose what the total contract value is?

With blockchain, it is Yes!

- When a contract is created, both users are required to deposit into the contract. Their individual net account values in the contract are tracked.
- When one party decides to execute a trade to reduce the position, they can choose which portion of the position to reduce from, and the net account value locked into that position is release to the user.
- When one party decides to execute a trade to increase the position, the newly added position is locked into a different contract.

At the end, instead of one position, the user's position is linked to many conterparties independently, and each component of the positions are individual tracked, and their collateral individually containerized.

This way, A and B will never make more than what is in the contract, but exchange and all the other customers will be safe from either counter party default - actually, in this case, the default will be on each individual position.

This is daunting for a traditional exchange to maintain so many links. However, blockchains, where the balance and settlement happens instantaneously, maintaining those links are simpler and easy to program.

This approach can also be combined with other risk checks to make sure the smooth running of the market, this combines

- containerization of the risk to each pair of counter party
- a holistic view and management of exchange level risk.

By running this on a blockchain where every one can acces, the system allows users to actively manage their risk too. This also makes sure the exchange can always have the cash available to withdraw - well, the cash is in the contract itself.
