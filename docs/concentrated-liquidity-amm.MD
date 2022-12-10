# Concentrated Liquidity AMM

This provide the mathematical process for concentrated liquidity on [aux exchange](https://aux.exchange), modelled partially on Uniswap's implementation.

## Constant Product AMM with Fee

### Pool State Before and After Swap

Constant product AMM is very straight forward, the reserves of the pool for two coins, $x$ and $y$ are required to be

$$
xy=C
$$

Pool also has an indicative price $p$, which is

$$
p = \frac{x}{y}
$$

Pool state ($x$ and $y$) can also be defined as $C$ and $p$:

$$
x = \sqrt{Cp}
$$

$$
y = \sqrt{C/p}
$$

To swap $\Delta x$ for $\Delta y$, the invariant must hold

$$
\left(x + \Delta x\right)\left(y - \Delta y\right) = C
$$

However, to encourage liquidity provision, liquidity provider must be provided a fee: $f$ Now the following must hold

$$
\left(x + \left(1-f\right)\Delta x\right)\left(y-\Delta y\right) = C
$$

After swap, $y$ is decreased to

$$
y^\ast=\frac{xy}{x+\left(1-f\right)\Delta x} = \frac{C}{\sqrt{Cp}+\left(1-f\right)\Delta x}
$$

The amount $\Delta y$ (the amount of $y$ that the user swapped from the pool)

$$
\Delta y = y - y^\ast = \frac{\left(1-f\right)\Delta x}{x+\left(1-f\right)\Delta x}y =  \frac{\left(1-f\right)\Delta x}{\sqrt{Cp}+\left(1-f\right)\Delta x}\sqrt{C/p}
$$

Trivially, $x$ is increased to

$$
x^\ast=x+\Delta x = \sqrt{Cp} + \Delta x
$$

After the swap, $C$ is increased due to the fee $f$

$$
{C^\ast} = {{x}^\ast} {{y}^\ast}=\frac{x+\Delta x}{x+\left(1-f\right)\Delta x} xy = C\frac{\sqrt{Cp}+\Delta x}{\sqrt{Cp}+\left(1-f\right)\Delta x}
$$

and finally $p$ after swap - pool indicative price is higher than without fee.

$$
p^\ast = \frac{x^\ast}{y^\ast} = \frac{\left(x+\Delta x\right)\left(x+\left(1-f\right)\Delta x\right)}{xy} = \frac{\left(\sqrt{Cp}+\Delta x\right)\left(\sqrt{Cp}+\left(1-f\right)\Delta x\right)}{C}
$$

### Calculate required input amount for a given output

Sometimes the user has a specific $\Delta y$ to target, the required amount $\Delta x$ is

$$
\Delta x = \frac{\Delta y}{\left(y-\Delta y\right)\left(1-f\right)} x = \frac{\Delta y}{\left(1-f\right)\left(\sqrt{C/p}-\Delta y\right)}\sqrt{Cp}
$$

$$
x^\ast = x + \Delta x = \frac{\left(1-f\right)y-f\Delta y}{\left(y-\Delta y\right)\left(1-f\right)} x = \frac{\left(1-f\right)\sqrt{C/p}-f\Delta y}{\left(\sqrt{C/p}-\Delta y\right)\left(1-f\right)}\sqrt{Cp}
$$

$$
C^\ast = x^\ast y^\ast = \frac{\left(1-f\right)y-f\Delta y}{1-f} x = \frac{\left(1-f\right)\sqrt{C/p}-f\Delta y}{1-f} \sqrt{Cp}
$$

$$
p^\ast=\frac{\left(1-f\right)y-f\Delta y}{\left(y-\Delta y\right)^2\left(1-f\right)} x=\frac{\left(1-f\right)\sqrt{C/p}-f\Delta y}{\left(\sqrt{C/p}-\Delta y\right)^2\left(1-f\right)} \sqrt{Cp}
$$

### Two Swaps

If two swaps are done in place of one, $\Delta x = \Delta x_1 + \Delta x_2$

$$
{y^\ast}_1 = \frac{xy}{x+\left(1-f\right)\Delta x_1}
$$

$$
\Delta y_1 = \frac{\left(1-f\right)\Delta x_1}{x+\left(1-f\right)\Delta x_1} y
$$

$$
{y^\ast}_2 = \frac{\left(x+\Delta x_1\right){y^\ast}_1}{x+\Delta x_1 + \left(1-f\right)\Delta x_2} = \frac{xy}{x+\left(1-f\right)\Delta x_1} \frac{x+\Delta x_1}{x+\Delta x_1 + \left(1-f\right)\Delta x_2}
$$

$$
\Delta y_2 =\frac{ \left(1-f\right) \Delta x_2 }{x+\Delta x_1 + \left(1-f\right)\Delta x_2} y^\ast_1 = \frac{ \left(1-f\right) \Delta x_2 }{x+\Delta x_1 + \left(1-f\right)\Delta x_2} \frac{xy}{x+\left(1-f\right)\Delta x_1}
$$

and total amount $\Delta y$ is

$$
\Delta y = \Delta y_1 + \Delta y_2 = \frac{\left[x+\left(1-f\right)\Delta x_1\right]\left[x+\Delta x_1 + \left(1-f\right)\Delta x_2\right] - x \left(x+\Delta x_1\right)}{\left[x+\left(1-f\right)\Delta x_1\right]\left[x+\Delta x_1 + \left(1-f\right)\Delta x_2\right]} y = \frac{\left(1-f\right)\left[\Delta x_1 \left(x + \Delta x_1 + \Delta x_2\left(1-f\right)\right) + x\Delta x_2\right]}{\left[x+\left(1-f\right)\Delta x_1\right]\left[x+\Delta x_1 + \left(1-f\right)\Delta x_2\right]}y
$$

If we swap for $\Delta x_1 + \Delta x_2$ directly

$$
\Delta y = \frac{\left(1-f\right)\left(\Delta x_1 + \Delta x_2\right)}{x+\left(1-f\right)\left(\Delta x_1 + \Delta x_2\right)}y
$$

and

$$
\frac{\left(1-f\right)\left(\Delta x_1 + \Delta x_2\right)}{x+\left(1-f\right)\left(\Delta x_1 + \Delta x_2\right)}y - \Delta y_1 - \Delta y_2 = \frac{f\left(1-f\right)\Delta x_1 \Delta x_2 x y}{\left[x+\left(1-f\right)\Delta x_1\right]\left[x+\Delta x_1 + \left(1-f\right)\Delta x_2\right]\left[x+\left(1-f\right)\left(\Delta x_1 + \Delta x_2\right)\right]} > 0
$$

which means swapping one time is always better than swapping multiple times if there is a fee.

## Concentrated Liquidity

### Invariant

Let $x$ and $y$ are the virtual reserves, and they form the constant product invariant.
Let the real reserve be $x'$ and $y'$

$$
x = x' + \sqrt{Cp_l}
$$

$$
y = y' + \sqrt{\frac{C}{p_h}}
$$

where $p_l$ is the lower bound price of the pool, and $p_h$ is the upper bound price of the pool.

When $x'=0$, the pool only contains $y$ and price as indicated by the pool is at its lower bound, therefore

$$
x = \sqrt{Cp_l}
$$

$$
y = \sqrt{\frac{C}{p_l}}
$$

$$
y' = \sqrt{\frac{C}{p_l}} - \sqrt{\frac{C}{p_h}}
$$

Similarly, when $y'=0$, the pool only contains $x$ and the price as indicated pool is at its upper bound, therefore

$$
x = \sqrt{Cp_h}
$$

$$
x' = \sqrt{Cp_h} - \sqrt{Cp_l}
$$

$$
y = \sqrt{\frac{C}{p_h}}
$$

$p_l$ and $p_h$ are the parameters of the pool, and $C$ is an indication of how much reserves there are in the pool

### Pool Initialization without Predefined Price

For a given $p_l$ and $p_h$, and $x'$ and $y'$ are added to an empty pool, a $C$ needs to be calculated, which will also establish the pool indicative price $p$, we have

$$
x' = \sqrt{C}\left(\sqrt{p} - \sqrt{p_l}\right)
$$

$$
y' = \sqrt{C}\left(\sqrt{1/p} - \sqrt{1/p_h}\right)
$$

We can now solve for $C$ and $p$.

When $y'=0$, the price must be at the upper bound

$$
p = p_h
$$

$$
\sqrt{C} = \frac{x'}{\sqrt{p_h}-\sqrt{p_l}}
$$

when $x'=0$, the price must be at the lower bound

$$
p = p_l
$$

$$
\sqrt{C} = \frac{y'}{\sqrt{1/p_l}-\sqrt{1/p_h}}
$$

With both of $x'$ and $y'$ non-zero

$$
\frac{x'}{y'} \left(\sqrt{1/p} - \sqrt{1/p_h}\right) = \sqrt{p} - \sqrt{p_l} \Rightarrow p  +\left( \frac{x'}{y'} \sqrt{1/p_h} - \sqrt{p_l}\right)\sqrt{p} - \frac{x'}{y'}
$$

The above equation has two solutions, but only one of them is greater than 0 (notice the constant term $x'/y' > 0$), and

$$
\sqrt{p} =  \frac{\sqrt{p_l}}{2} - \frac{x'}{2y'}\sqrt{1/p_h} +\frac{1}{2}\sqrt{\frac{x'^2}{y'^2p_h}+p_l-\frac{2x'}{y'}\sqrt\frac{p_l}{p_h} + \frac{4x'}{y'}}
$$

And for $C$

$$
\sqrt{C} = \frac{1}{-\frac{\sqrt{p_l}}{2}-\frac{x'}{2y'\sqrt{p_h}}+\frac{1}{2}\sqrt{\frac{x'^2}{y'^2p_h}+p_l-\frac{2x'}{y'}\sqrt\frac{p_l}{p_h} + \frac{4x'}{y'}}}x' =\frac{2x'y'\sqrt{p_h}}{-y'\sqrt{p_lp_h}-x'+\sqrt{x'^2+p_lp_hy'^2-2x'y'\sqrt{p_lp_h}+4x'y'p_h}}
$$

Notice that if we set $p_h$ to $+\infty$ and $p_l$ to 0, the form of $p$ and $C$ will reduce to vanilla constant product amm.

Since terms $C$ and $p$ showing up mostly as their squre roots $\sqrt{C}$ and $\sqrt{p}$, we will express the pool states with those instead.

### Numerical Solution

$\sqrt{p}$ and $\sqrt{C}$ can also be solved numerically

For Newton Raphson method:

$$
f = \sqrt{p}^2 - \sqrt{p_l}\sqrt{p} - \frac{x'}{y'}\left(1 - \frac{\sqrt{p}}{\sqrt{p_h}}\right)
$$

$$
\frac{df}{d\sqrt{p}} = 2\sqrt{p} - \sqrt{p_l} +\frac{x'}{y'}\frac{1}{\sqrt{p_h}}
$$

and

$$
\sqrt{p}^\ast = \sqrt{p} - \frac{f\left(\sqrt{p}\right)}{df/d\sqrt{p}} = \frac{\sqrt{p}^2+\frac{x'}{y'}}{2\sqrt{p}-\sqrt{p_l}+\frac{x'}{y'}\frac{1}{\sqrt{p_h}}}
$$

Given $p$ is bounded by $p_l$ and $p_h$, binary search method can also be used.

### Pool Initialization with Predefined Price

If the price $p$ is already established, we have

$$
\sqrt{C} = \text{min}\left(\frac{x'}{\sqrt{p}-\sqrt{p_l}},\frac{y'}{\sqrt{1/p}-\sqrt{1/p_h}}\right)
$$

## Swap with Concentrated Liquidity

### Unchanged Virtual Reserve with Fee

If the swap doesn't push the price out of $\left(p_l, p_h\right)$, the formulation is exactly the same as constant product. Given swap quantity $\Delta x$, we have

$$
C^\ast = \frac{\sqrt{Cp} + \Delta x}{\sqrt{Cp} + \left(1-f\right)\Delta x} C
$$

$$
p^\ast = \frac{\left(\sqrt{Cp} + \Delta x\right)^2}{C^\ast}=\frac{\left(\sqrt{Cp} + \left(1-f\right)\Delta x\right)\left(\sqrt{Cp} + \Delta x\right)}{C}
$$

Assuming pool current is at $C$ and $p$, the maximum $y$ amount that can be swapped for is simply the entire reserve

$$
\Delta y_m = \sqrt{C}\left(\sqrt{1/p} - \sqrt{1/p_h}\right)
$$

$$
y^\ast_m = \sqrt{C/p_h}, \quad y'^\ast_m=0
$$

$$
\Delta x_m = \frac{\sqrt{C}}{1-f}\left(\sqrt{p_h}-\sqrt{p}\right)
$$

$$
x^\ast_m = \frac{\sqrt{C}}{1-f}\left(\sqrt{p_h}-f\sqrt{p}\right), \quad x'^\ast_m=\frac{\sqrt{C}}{1-f}\left(\sqrt{p_h}-f\sqrt{p}-\sqrt{p_l}\left(1-f\right)\right)
$$

$$
C^\ast_m = x^\ast_my^\ast_m = C\frac{1-f\sqrt{p/p_h}}{1-f}
$$

$$
p^\ast_m = x^\ast_m/y^\ast_m = \frac{p_h}{1-f}\left(1-f\sqrt\frac{p}{p_h}\right)
$$

Notice the last equation shows the price of the pool when $y$ is exhausted is actually slighter higher than $p_h$. This is expected because $C^*$ is increasing due to fee, and the virtual reserves are not adjusted to account for that. However, $f$ is generally very small, and if spacing of the $p_l$ and $p_h$ are small, which makes $\sqrt{p/p_h} \sim 1$, so the final price of the pool is very close to $p_h$.

When $y$ is exhausted, we can readjust $C$ to

$$
\sqrt{C}=\frac{x'}{\sqrt{p_h}-\sqrt{p_l}}
$$

### Readjust After Each Swap with Fee

The existence of fee makes $C$ increase, and the price range the pool will expand. Just like when the pool exhausted liquidity, $C$ and $p$ can be readjusted to restore the price band to $p_l$ and $p_h$.

Recall that

$$
x'=\sqrt{C}\left(\sqrt{p}-\sqrt{p_l}\right)
$$

$$
y'=\sqrt{C}\left(\sqrt{1/p}-\sqrt{1/p_h}\right)
$$

After the swap, the reserves become

$$
\sqrt{C^\ast}\left(\sqrt{p^\ast}-\sqrt{p_l}\right)=x'=\sqrt{C}\left(\sqrt{p}-\sqrt{p_l}\right) + \Delta x
$$

$$
\sqrt{C^\ast}\left(\sqrt{1/p^\ast}-\sqrt{1/p_h}\right)=y'=\frac{C}{\sqrt{Cp} + \left(1-f\right)\Delta x} - \sqrt{C/p_h}
$$

And we can solve for the new $C$ and $p$.

### Excluding Fee from the Pool

Another way to return fee to liquidity provider is move fee into a separate tracking structure (such as the `aux::reward_dsitributor`). This way $C$ doesn't change after swap.

$$
y' = \frac{C}{\sqrt{Cp} + \Delta x} - \sqrt{C/p_h}
$$

$$
\Delta y = \frac{C}{\sqrt{Cp}} - \frac{C}{\sqrt{Cp} + \Delta x}
$$

## Integer Math

### Ticks

Given price bands always appear in square root, we use square price instead of the price itself. Further we require that

$$
p\left(i\right) = 1.0001^{i}
$$

where $i$ is the tick index. So the square price is

$$
\sqrt{p\left(i\right)} = \sqrt{1.0001^i}
$$

We are going to use 128-bit unsigned integer as fixed point number. If the value is $d$, the represented fixed point value is $\frac{d}{2^{64}}$.

In aptos, all coin values are 64 bit integers, and therefore 128 bit fixed point number has 64 bit after decimal point if price $p=x/y$ is the ratio between two coins. In this case, square price therefore only needs 32 bits before decimal point.

Notice 128-bit fixed point number has an upper bound of $2^{64}-1/2^{64}=18446744073709551616-\frac{1}{18446744073709551616}$, and the max tick $i$ is bounded by

$$
\frac{\text{ln}\left(2^{64}-1/2^{64}\right)}{\text{ln}\left(1.0001\right)}\approx 443636.4 < 2^{19} = 524288
$$

The smallest non negative value for 128-bit fixed point number is $1/2^{64}$, and the min tick $i$ is

$$
\frac{\text{ln}\left(1/2^{64}\right)}{\text{ln}\left(1.0001\right)} \approx - 443636.4 \Rightarrow i < -2^{19} = -524288
$$

### From Tick to Square Price

From a tick index $i$, the price is simply $1.0001^i$ and square price $1.0001^{i/2}$. Provided that $\left|i\right| < 19$, the exponential term can be calculate with at most 19 multiplications

$$
q^i = \prod_j q_j
$$

for $i>0$ and $i \leq 443636$

$$
q_j = \left\{\begin{matrix} 1 & 2^j \& i = 0 \\
q^{2^j} & 2^j\& i > 0
\end{matrix}\right.
$$

All $\sqrt{1.0001}^{2^j}$ for $j$ between 0 and 18 are precalculated.

and for $i<0$ and $i \geq -443636$

$$
q_j = \left\{\begin{matrix}
1 & 2^j \& (-i) = 0 \\
\frac{1}{q^{2^j}} & 2^j \& (-i) > 0
\end{matrix}\right.
$$

All $\sqrt{1.0001}^{-2^j}$ for $j$ between 0 and 18 are precalculated.

Any $i$ outside $\left[-443636, 443636\right]$ will either overflow or underflow.

The calculations of $\sqrt{1.0001}^{2^n}$ are provided [here](./concliq/tick.go#L7-L41)

### From Square Price to Tick

From a price $p$, we need to find $i$ such that $\sqrt{1.0001}^{i} \leq \sqrt{p} \leq \sqrt{1.0001}^{i+1}$. Take binary logarithm

$$
i \log_{2}\sqrt{1.0001} \leq \log_2\sqrt{p} \leq \left(i+1\right)\log_{2}\sqrt{1.0001}
$$

or

$$
i=\left\lfloor \frac{\log_2 \sqrt{p}}{\log_2 \sqrt{1.0001}}\right\rfloor
$$

The problem reduces to calculating $\log_2 \sqrt{p}$ if $\log_2\sqrt{1.0001}$ is precalculated.

### Binary Logirithm

We are looking for $x/2^N=\log_2 y$ where $x$ is an integer and $N$ is desired precision.
Let $y$ be a fixed point number with 64 bits before and after decimal point, and it is stored in a 128 bit integer.

The method is as follows

- **Make sure** $1\leq y < 2$ - this can be checked by making sure there are exactly 63 leading zeros in $y$.

  If $y$ is not within $\left[1, 2\right)$, we can shift $y$ $n_0$ bits to be within that range

- Square $y$ $m$ times so that $y^{2^m}$ is within $\left[2, 4\right)$ (if this is fixed point with 128 bit integers, we will square the number - need to handle the overflow here - and right shift 64 bits). Let the result be $z=y^{2^m}$.

- Notice $\log_2 z = 2^m\log_2 y$, and

  $$
  \log_2 y = \frac{1}{2^m}\left(\log_2 \frac{z}{2} + 1\right)
  $$

  where $\frac{z}{2} \in \left[1, 2\right)$. Now we can reapply the same treat with new $y=\frac{z}{2}$.

Sum everything up

$$
\log_2 y = n_0 + \frac{1}{2^{m_1}}\left(1 + \frac{1}{2^{m_2}}\left(1+\frac{1}{2^{m_3}}\left(...\right)\right)\right)
$$

where $n_0\geq 0$ if $y \geq 2$ and $n_0 < 0 $ when $y<1$. However, move-lang doesn't support signed integers, and we do need special treatment when $n_0$ is added to the result.

### Tick Spacing

Pool also has a parameter **tick spacing**, which requires tick $i = nt$, where $t$ is tick spacing, and $n$ is an integer. This is for widening the price band when the asset price is highly volatile. The minimal $t$ is 1.
