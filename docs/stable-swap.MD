# Stable Swap

Stable Swap Modelled after curve

## Constant Price

For a series of coins $x_i$ and positive constants $p_i$, below invariant

$$
\sum_i p_i x_i = D
$$

provides the price of coin $i$ in coin $j$ $p_{i,j}$

$$
p_{i,j}=-\frac{dx_j}{dx_i}
$$

A pool following this invariant will have constant price.

Without losing generality, assume $p_i \equiv 1$ for all $i$, and the invariant is reduced to

$$
\sum_i x_i = D
$$

From the above formulation, $D$ can be considered the total amount of coins deposit into the pool.

(If $p_i$ is not $1$, we can scale $x_i$ to be $x'_i = p_i x_i$.)

When pool is at equilibrium, all coins have the same balance

$$
x_i = \frac{D}{n}
$$

## Stable Swap

Stable swap is a combination of constant product where price moves according to demand/supply and consant sum where price is kept at constant.

$$
\sum_i x_i + \eta \prod_i x_i = D + \eta \left(\frac{D}{n}\right)^n
$$

where $\prod_i x_i = \left(\frac{D}{n}\right)^n$ is the constant product component, and $\eta$ is scaling factor between the two invariants.

In curve, the scaler is defined as

$$
\eta = \frac{D}{A}\prod_i\left(\frac{1}{nx_i}\right)
$$

And the invariant is

$$
An^n\sum_i x_i + D = An^nD + \frac{D^{n+1}}{n^n\prod_i x_i}
$$

$x_i$ can be obtained from all the other $x_{j},j\neq i$ by

$$
x_i = \frac{An^nD-D}{2An^n}-\frac{\sum_{j\neq i}x_j}{2} +\frac{1}{2An^n\sqrt{\prod_{j\neq i}x_j}}\sqrt{D^2\prod_{j\neq i}x_i+A^2n^nn^n\prod_{j\neq i}x_j\left(D-\sum_{j\neq i}x_j\right)^2+4AD^{n+1} - 2ADn^n\prod_{j\neq i}x_i\left(D-\sum_{j\neq i} x_j\right)}
$$

$$\Downarrow$$

$$
x_i = \frac{An^nD-D}{2An^n}-\frac{\sum_{j\neq i}x_j}{2} +\frac{1}{2An^n\sqrt{\prod_{j\neq i}x_j}}\sqrt{\prod_{j\neq i}x_i\left(An^nD-D-An^n\sum_{j\neq i}x_j\right)^2 +4AD^{n+1}}
$$

price of coin $i$ in $j$ $p_{i,j}$

$$
An^n \left(dx_i + dx_j\right) = -\frac{D^{n+1}}{n^n\prod_k x_k}\left(\frac{dx_i}{x_i}+\frac{dx_j}{x_j}\right)
$$

$$\Downarrow$$

$$
p_{i,j} = -\frac{dx_j}{dx_i}= \frac{An^n + \frac{D^{n+1}}{n^n\prod_k x_k}\frac{1}{x_i}}{An^n + \frac{D^{n+1}}{n^n\prod_k x_k}\frac{1}{x_j}} = \frac{An^n x_i + \frac{D^{n+1}}{n^n\prod_k x_k}}{An^n x_j + \frac{D^{n+1}}{n^n\prod_k x_k}}\frac{x_j}{x_i}
$$

## Solving for D

Provided series of $x_i$'s and $A$, $D$ needs to be solved for. (Unless $x_i$'s are all equal with each other, in which case $D=\sum_i x_i$). $D$'s order in the invariant is at least 3 (when there are only two coins), so Newton Raphson method is used:

$$
f\left(D\right) = An^n\sum_i x_i + D - An^n D - \frac{D^{n+1}}{n^n\prod_i x_i}
$$

$$
\frac{df}{dD} = 1 - An^n - \left(n+1\right)\frac{D^n}{n^n \prod_i x_i}
$$

and therefore

$$
D^\ast = D - \frac{{f\left(D\right)}}{df/dD} =D -  \frac{An^n\sum x_i + D_t - An^nD - \frac{D^{n+1}}{n^n\prod_i x_i}}{1 - An^n - \left(n+1\right)\frac{D^n}{n^n\prod_i x_i}} = \frac{\frac{nD^{n+1}}{n^n\prod_i x_i} + An^n\sum_i x_i}{An^n - 1 +\left(n+1\right)\frac{D^n}{n^n\prod_i x_i}}
$$

## Revisiting Parameter $A$

When $A \rightarrow \infty$, the invariant is the constant sum

$$
D\equiv \sum_i x_i
$$

When $A \rightarrow 0$, the invariant is the constant product one

$$
D^\ast = \frac{nD^{n+1}}{\left(n+1\right)D^n-n^n\prod_i x_i}
$$

which has a fixed point at

$$
D^n=n^n\prod_i x_i
$$

## Add Liquidity

As mentioned before, $D$ is the total amount of the coins when the pool is at equilibrium. The LP amount $g$ of the pool is proportional to the amount of $D$. When a user added liquidity to the pool, pool will calculate a new $D^\ast$, the new total LP amount will be $\frac{D^\ast}{D}g$, and the new coin amount issued will be $\frac{D^\ast}{D}g -g$. This is determined from the relationship $\frac{g^\ast}{g} = \frac{D^\ast}{D}$.

## Swap

We can use the above equation to calculate the swap amount. However, this can also be solved iteratively with Newton Raphson method:

$$
f\left(x_i\right) = x_iAn^n\sum_j x_j + x_i^2An^n + x_iD - x_iAn^nD-\frac{D^{n+1}}{n^n\prod_{j\neq i} x_j}
$$

$$
\frac{df}{dx_i} = An^n \sum_j x_j + 2An^nx_i + D-An^nD
$$

Therefore the next iteration of $x_i$, $x_i^\ast$

$$
x_i^\ast = x_i - \frac{f\left(x_i\right)}{df/dx_i} = \frac{An^nx_i^2+\frac{D^{n+1}}{n^n\prod_{j\neq i}x_j}}{An^n\sum_{j\neq i}x_j + 2An^nx_i +D - An^nD}
$$

Let $C=\frac{D^{n+1}}{An^nn^n\prod_{j\neq i}x_j}$, $B=\sum_{j\neq i}x_j + \frac{D}{An^n}$

$$
x^\ast = \frac{x_i^2+C}{B+2x_i-D}
$$

## Integer Math

All operations on chain will done through integer math instead of float points. $D$ and all coin balance $x_i$'s will have 18 digitis after decimal point.

### Integer Bit Width

The values of $D$, $x_i$'s will be stored as **unsigned 128 bit integer**.

On aptos blockchain, coin values are stored in unsigned 64 bit integers. Most of stable coins have decimal of 6, and will multiply with $10^{12}$ before all the operations. 128 bit can express value up to $3.403\times 10^{20}$ for 18 decimals. Given that $x_i$'s have 6 decimals, the value will have upper ~24 bit all zeros.

### Integer Math for Solving $D$

Rewrite $D^\ast$ with $D_p=\frac{D^n}{n^n\prod_i x_i}$

$$
D^\ast = \frac{D\left(nD_p + An^n\sum_i x_i\right)}{D\left(An^n - 1 \right)+\left(n+1\right)D_p}
$$

$A$ and $n$ are unscaled, or zero decimals.

$D_p$ is initialized with 18 decimals (set to $D$), and in each iteration it maintains 18 decimals

- $D_p = D_p \times D$, $D_p$ is now 36 decimals
- $D_p = D_p / n / x_i$, $D_p$ is now 18 decimals

$An^n\sum_i x_i$ is 18 decimals. Their sum multiplied by $D$ will produce 36 decimals - this is the numerator.

Denominator has 18. And the final result yields 18 decimals.

### Integer Math for Solving $x_i^\ast$

With $C=\frac{D^{n+1}}{An^nn^n\prod_{j\neq i}x_j}$, $B=\sum_{j\neq i}x_j + \frac{D}{An^n}$

$$
x^\ast = \frac{x_i^2+C}{B+2x_i-D}
$$

$x_i$ has 18 decimals, therefore $x_i^2$ has 36 decimals.

To calculate $C$, similar approach to $D_p$ is employed

- $C = D$ set initial $C$ to $D$, $C$ has 18 decimals.
- $C = C \times D$ Multiply $C$ with $D$, $C$ has 36 decimals.
- $C = C / x_j / n$ Divide $C$ by $x_j$ and $n$, which reduces $C$ to 36 decimals

Finally

- $C = C \times D / A / n^n$ which multiply C with $D$, and then divided by $A$ and $n^n$, which maintains 36 decimals.

The numerator is now 36 decimals. It is easy to show that denominator is 18 decimals, and after the iteration $x_i^\ast$ is 18 decimals.

## Fee Accounting

All fees paid to the pool go to the liquidity providers. Fees are transferred into the separate fee line in the pool, and merged into `RewardDistributor` to distribute to LPs. When staking/unstaking, fee redeem tokens are returned/burned with lp coins (this is achieved through returning or burning a `LPBundle`).

## Implementation

- as in curve, all reserves are upscaled to 18 decimals. $D$ will also be stored with 18 decimals.
- lp coins will have 8 decimals. Rounding may cause lp coin issued to be less than $D$ would indicate.
- Fee rate is expressed as $f\times 10^{-10}$. However, at least one atomic unit of the coin must be paid for the fee if the fee rate is not zero. Fee always round up to the next atomic unit. (For example, fee will be 2 if fee rate is 15bps and and request amount is 1000).

`stable_[n]pool.move` is the center of the smart contract and the main entry point , which defines the basic interactions of the pool. (`[n]` in the name of the module name indicates how many coins are in the pool.) `stable_[n]pool.move`' uses `aptos_framework::coin::Coin<T>` as deposit or withdraw medium. The basic functions defined in `stable_[n]pool.move` are:

- `create_pool`: an entry function, used to create the pool.
- `add_liquidity`: add liquidity to the pool.
- `remove_liquidity_for_coin`: remove liquidity from the pool, the amounts of each coin in the pool are specified by the user.
- `remove_liquidity`: remove liquidity from the pool follows the current ratio of the pool.
- `swap_exact_coin_for_coin`: swap. Specify the input coin amounts, and let the contract calculate the output coin amount.
- `swap_coin_for_exact_coin`: swap. Specify the output coin amounts, and let the contract calculate the necessary input coin amount.

There are also two entry functions to update pool parameters

- `update_amp`: update $A$.
- `update_fee`: update `fee_numerator` of the pool.

`router_[n]pool.move` provides entry function versions for those functions that take coin in `stable_[n]pool.move`, so users off-chain can interact with them. Every function has a copy in `router_[n]pool.move`. Those functions take a `signer` and the amount to be deposit or withdraw. `router_[n]poo.move` also provides function `remove_coin`, which is similar to `remove_liquidity_for_coin`, but the max lp coin amount is read from user's balance instead of passed in.

Besides providing entry functions, `router_[n]pool.move` also provides `LPRewardTokenStore`, which entry functions utilize the store user's fee reward tokens, and the associated `deposit`, `withdraw`, and `balance` function (just like `aptos_framework::coin` module).

`quoter_[n]pool.move` is a helper module that replicates the pool logic but with integers instead of `aptos_framework::coin::Coin<T>`s. Protocols can utilize the `quoter_[n]pool.move` to calculate swap amounts, lp coins necessary or minted etc. `stable_[n]pool.move` provides a `get_quoter` function for onchain users to obtain a quoter from the pool, which they can then use to perform the calculations.

`math_[n]pool.move` contains the math for solving $D$ and $x_i$.

### Adding Liquidity

`add_liquidity` is used to add liquidity to a pool.

Pool allows adding liquidity in any combination of coins (this is unlike constant product where the ratio of the coins is required to match the ratio that is currently in pool).

- if the pool is empty, $D$ will be calculated, then lp coins will be calculated by dividing $D$ with $10^{10}$. Note the process of calculating $D$ requires all $x_i$ to be non-zero.
- if the pool is not empty, the coin coins will be raised to 18 decimals and added to the reserve. A new $D^\ast$ will be calculated, and the new lp issued will be

$$
\Delta l = l^\ast - l = \frac{D^\ast \times l}{D} - l
$$

**Note**: making pool less balanced will yield less lp coins. For example, for a balanced pool of $10^{21}$ on each side of the pool and initial $D$ of $2\times 10^{21}$. Adding $9\times 10^{21}$ to one side will increase $D$ to approximately $10.67\times 10^{21}$ with a $A=15$. The LP providing the extra $9\times 10^{21}$ coins will only get $8.67\times 10^{21}$ back (or 4% less). This encourages LPs to contribute to the pool to make it more balanced.

There is no fee for adding liquidity.

### Swap with Input Specified

User can either specify an input coin amount, and let the contract determine the output amount, or specify an output amount and let the contract determine the input account. `swap_exact_coin_for_coin` is the first case. The user can specify many input coins, but can only specify one output coin. The contract will take all the input coins, and calculate the new $x^\ast_i$ as specified above. Note the new reserve will be higher than $x^\ast_i$ above due to the fact that coins generally have less decimals than 18, and reserve is round up. The different $\Delta x$ will be dispensed from the reserve.

The user needs to pay a fee on the output coin, which is charged on the amount the user will get, not the amount of $\Delta x$.

$$
\text{fee} = \frac{f \times \Delta x}{10^{10} + f}
$$

Note fee always rounds up. User will get the remaining.

### Swap with Output Specified

Alternatively, 'swap_coin_for_exact_coinf` allows the user to specify the output amounts of the many coins, and the contract will calculate the required amount of the one input coin. Note the fee calculation is the same, where the fee is charged on the amount that user got.

$$
\text{fee} = \frac{f \times \text{requested amount}}{10^{10}}
$$

Note, multiple fees are charged for multiple output coins.

### Withdrawing Liquidity

There are two options to withdraw liquidity from the pool. The first one, `remove_liquidity`, is fee free, but the lp can only specify the lp coin amount to burn. Alternatively, `remove_liquidity_for_coin` allows the user to specify coin amounts to withdraw, with a max lp coin amount to burn - however, this will incur the same fee as swap.

## Code Generation

In [root folder](../) of the repository, run the following command

```sh
go run ./docs/stableswap/gen-pool -n NUMBER_OF_COINS_IN_POOL -o path/to/sources/of/the/move/module
```

This will generate the set of files, `stable_[n]pool.move`, `router_[n]pool.move`, `quoter_[n]pool.move`, and `math_[n]pool.move`.
