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

In curve's implementation, the value $D_p = \frac{D^{n+1}}{n^n\prod_i x_i}$ is calculated as follows

- set initial $D_p = D$.
- iterate through each $x_i$.
  $$
  D_p = \frac{D_p\times D}{nx_i}
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
x_i^\ast = x_i - \frac{f\left(x_i\right)}{df/dx_i} = \frac{An^nx_i^2+\frac{D^n+1}{n^n\prod_{j\neq i}x_j}}{An^n\sum_{j\neq i}x_j + 2An^nx_i +D - An^nD}
$$

Let $C=\frac{D^{n+1}}{An^nn^n\prod_{j\neq i}x_j}$, $B=\sum_{j\neq i}x_j + \frac{D}{An^n}$

$$
x^\ast = \frac{x_i^2+C}{B+2x_i-D}
$$
