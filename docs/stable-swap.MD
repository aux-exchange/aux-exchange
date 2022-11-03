# Stable Swap

Stable Swap Modelled after curve

## Constant Price

For a series of coins $x_i$ and positive constants $p_i$, below invariant

$$
\sum_i p_i x_i = D
$$

provides the price of coin $i$ in coin $j$ $p_{i,j}$

$$
p_{i,j}=-\frac{dx_j}{dx_i} = \frac{p_i}{p_j}
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

As mentioned before, $D$ is the total amount of the coins when the pool is at equilibrium. The LP amount $g$ of the pool is proportional to the amount of $D$. When a user added liquidity to the pool, pool will calculate a new $D^*$, the new total LP amount will be $\frac{D^*}{D}g$, and the new token amount issued will be $\frac{D^*}{D}g -g$

## Swap

We can use the above equation to calculate the swap amount. However, this can also be solved iteratively with Newton Raphson method:

$$
f\left(x_i\right) = x_iAn^n\sum_j x_j + x_iD - x_iAn^nD-\frac{D^{n+1}}{n^n\prod_{j\neq i} x_j}
$$

$$
\frac{df}{dx_i} = An^n \sum_j x_j + An^nx_i + D-An^nD
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

On aptos blockchain, coin values are stored in unsigned 64 bit integers. Most of stable coins have decimal of 6, and will multiply with $10^{12}$ before all the operations ($10^{12}$ is approximately $2^40$). 128 bit can express value up to $3.403\times 10^{20}$ for 18 decimals. Given that $x_i$'s have 6 decimals, the value will have upper ~24 bit all zeros.

### Integer Math for Solving $D$

Rewrite $D^\ast$ with $D_p=\frac{D^{n+1}}{n^n\prod_i x_i}$

$$
D^\ast = \frac{D\left(nD_p + An^n\sum_i x_i\right)}{D\left(An^n - 1 \right)+\left(n+1\right)D_p}
$$

$A$ and $n$ are unscaled, or zero decimals.

$D_p$ is initialized with 18 decimals (set to $D$), and in each iteration it maintains 18 decimals

- $D_p = D_p \times D$ ($D_p$ is now 36 decimals)
- $D_p = D_p / n / x_i$ ($D_p$ is now 18 decimals)

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

- $C = C  \times D / A / n^n $ which multiply C with $D$, and then divided by $A$ and $n^n$, which maintains 36 decimals.

The numerator is now 36 decimals. It is easy to show that denominator is 18 decimals, and after the iteration $x_i^\ast$ is 18 decimals.
