
import math
from os import remove


class Amm:
    def __init__(self, x_in, y_in):
        self.x_reserve = x_in
        self.y_reserve = y_in
        self.lp_reserve = math.sqrt(x_in*y_in)
        print(f"x: {self.x_reserve}, y: {self.y_reserve}, lp: {self.lp_reserve}")
        self.lp_reserve = math.floor(self.lp_reserve)

    def add_liquidity(self, x_in, y_in):
        lp = min(x_in * self.lp_reserve / self.x_reserve, y_in * self.lp_reserve / self.y_reserve)
        self.x_reserve += x_in
        self.y_reserve += y_in
        self.lp_reserve += lp
        print(f"x: {self.x_reserve}, y: {self.y_reserve}, lp: {self.lp_reserve}")
        self.lp_reserve = math.floor(self.lp_reserve)

    def remove_liquidity(self, lp):
        x_out = float(lp*self.x_reserve / self.lp_reserve)
        y_out = float(lp * self.y_reserve / self.lp_reserve)
        print(f"x_out: {x_out}, y_out: {y_out}")
        self.x_reserve -= math.floor(x_out)
        self.y_reserve -= math.floor(y_out)
        self.lp_reserve -= math.floor(lp)
        print(f"x: {self.x_reserve}, y: {self.y_reserve}, lp: {self.lp_reserve}")

    def swap_x_for_y(self, x):
        new_x = self.x_reserve + x
        y = math.floor((self.y_reserve*new_x - self.x_reserve*self.y_reserve) / new_x)

        self.x_reserve = new_x
        self.y_reserve = self.y_reserve - y

        print(f"x_in: {x}, y_out: {y}")
        print(f"x: {self.x_reserve}, y: {self.y_reserve}, lp: {self.lp_reserve}")
        
        return (y, x)

    def swap_y_for_x(self, y):
        new_y = self.y_reserve + y
        x = math.floor((self.x_reserve*new_y - self.y_reserve*self.x_reserve) / new_y)

        self.x_reserve = self.x_reserve - x
        self.y_reserve = self.y_reserve + y

        print(f"x_out: {x}, y_in: {y}")
        print(f"x: {self.x_reserve}, y: {self.y_reserve}, lp: {self.lp_reserve}")

        return (x, y)

    def swap_x_for_y_limit(self, x, limit_num, limit_denom):
        max_y = compute_limit_quantity(self.y_reserve, limit_num, limit_denom, self.x_reserve*self.y_reserve, 1, 1)
        if max_y == 0:
            return (0, 0)
        new_y = self.y_reserve - max_y
        max_x = math.floor((self.x_reserve * self.y_reserve - self.x_reserve * new_y) / new_y)
        if max_x < x:
            x = max_x
        if x == 0:
            return (0, 0)

        return self.swap_x_for_y(x)

    def swap_y_for_x_limit(self, y, limit_num, limit_denom):
        max_x = compute_limit_quantity(self.x_reserve, limit_num, limit_denom, self.x_reserve*self.y_reserve, 1, 1)
        if max_x == 0:
            return (0, 0)
        new_x = self.x_reserve - max_x
        max_y = math.floor((self.x_reserve * self.y_reserve - self.y_reserve * new_x) / new_x)
        if max_y < y:
            y = max_y
        if y == 0:
            return (0, 0)
        
        return self.swap_y_for_x(y)
    

def compute_limit_quantity(starting_quantity, limit_price_numerator, limit_price_denominator, product, fee_numerator, fee_denominator):
    inside_root = math.floor((4*fee_numerator * product * limit_price_denominator) / (fee_denominator * limit_price_numerator)) + 1
    root_term = integer_square_root(inside_root) 
    if (root_term*root_term == inside_root and root_term % 2 == 1): 
        sn = 1
    else:
        sn = 0
    positive_part = starting_quantity + sn
    negative_part = math.floor((1 + root_term) / 2)
    if (positive_part > negative_part):
        return positive_part - negative_part
    else:
        return 0

def integer_square_root(s):
    x0 = math.floor(s/2)
    if not x0 == 0:
        x1 = math.floor((x0 + math.floor(s/x0))/2)
        while (x1 < x0):
            x0 = x1
            x1 = math.floor((x0 + math.floor(s/x0))/2)
        s = x0
    return s


# Test limit functions
def test_limit_functions():
    amm = Amm(1000, 1000)
    (y_received, x_paid) = amm.swap_x_for_y_limit(10000, 2, 1)
    print(y_received)
    assert(y_received == 292)
    assert(x_paid == 414)

    amm = Amm(1000, 1000)
    (y_received, x_paid) = amm.swap_x_for_y_limit(10, 1, 1)
    assert(y_received == 0)
    assert(x_paid == 0)

    amm = Amm(1000, 1000)
    (y_received, x_paid) = amm.swap_x_for_y_limit(10, 2, 1)
    assert(y_received == 9)
    assert(x_paid == 10)

        
test_limit_functions()



# Test base in quote out

# BTC, USDC
# Pool balances are base: 1e8 (1.00), quote: 22600e6 (22,600.00), so gives
amm = Amm(1e8, 22600e6)


# IN ORDER BOOK
# alice buys .25 BTC @ 20,900
# bob buys .5 BTC @ 21,500

lot_size = 10000
total_usdc_received = 0
total_btc_spent = 0

# Test selling .75 BTC for > 16000
(usdc_received, btc_spent) = amm.swap_x_for_y_limit(.75e8, 1e8, math.floor(21500e6*.9995))
print("")
print("0: swap")
print("-------")
print(f"usdc received: {usdc_received}")
print(f"btc spent: {btc_spent}")

total_usdc_received += usdc_received 
total_btc_spent += btc_spent 
print(f"total usdc received: {total_usdc_received}")
print(f"total btc spent: {total_btc_spent}")

print("")
print("1: market sell")
print("--------------")
usdc_received = math.floor(21500e6*.9995 * .5)
btc_spent = .5e8

print(f"usdc received: {usdc_received}")
print(f"btc spent: {btc_spent}")
total_usdc_received += usdc_received
total_btc_spent += btc_spent

print(f"total usdc received: {total_usdc_received}")
print(f"total btc spent: {total_btc_spent}")

(usdc_received, btc_spent) = amm.swap_x_for_y_limit(.75e8 - total_btc_spent, 1e8, math.floor(20900e6*.9995))
print("")
print("2: swap")
print("-------")
print(f"usdc received: {usdc_received}")
print(f"btc spent: {btc_spent}")

total_usdc_received += usdc_received 
total_btc_spent += btc_spent 
print(f"total usdc received: {total_usdc_received}")
print(f"total btc spent: {total_btc_spent}")


print("")
print("3: market sell")
print("--------------")

btc_remaining = .75e8 - total_btc_spent
btc_remaining = btc_remaining - btc_remaining % lot_size
btc_remaining = min(btc_remaining, .25e8)
usdc_for_remaining_btc =math.floor(20900e6*btc_remaining / 1e8 *.9995)  

total_btc_spent += btc_remaining
total_usdc_received += usdc_for_remaining_btc

print(f"total usdc received: {total_usdc_received}")
print(f"total btc spent: {total_btc_spent}")

(usdc_received, btc_spent) = amm.swap_x_for_y(.75e8 - total_btc_spent)
print("")
print("4: swap")
print("-------")
print(f"usdc received: {usdc_received}")
print(f"btc spent: {btc_spent}")

total_usdc_received += usdc_received 
total_btc_spent += btc_spent 
print(f"total usdc received: {total_usdc_received}")
print(f"total btc spent: {total_btc_spent}")