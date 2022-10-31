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

### Initialization of the pool

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

Notice that if we set $p_h$ to $+\infty$ and $p_l$ to 0, the form of $p$ and $C$ will devolve into vanilla constant product amm.

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

## Swap with Concentrated Liquidity

### Unchanged Virtual Reserve

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

### Readjust After Each Swap

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
