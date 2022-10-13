import itertools
import json
import time
from dataclasses import dataclass

import pendulum
import requests


@dataclass(frozen=True)
class Resolution:
    name: str
    seconds: int


market_names = [
    "BTC/USD",
    "BTC/USDT",
    "ETH/USD",
    "ETH/USDT",
    "SOL/USD",
    "SOL/USDT",
    "SOL/USD",
]

resolutions = [
    Resolution("15s", 15),
    Resolution('1m', 60),
    Resolution("5m", 300),
    Resolution("15m", 900),
    Resolution("1h", 3600),
    Resolution("4h", 14400),
    Resolution("1d", 86400),
    Resolution("1w", 86400 * 7),
]

BEGINNING = pendulum.datetime(year=2021, month=1, day=1)


def get_bars():
    for market_name, resolution in itertools.product(market_names, resolutions):
        filename = f"data/{market_name.replace('/', '-')}_{resolution.name}.json"

        with open(filename, 'r') as f:
            data = f.read().splitlines(True)
        with open(filename, 'w') as f:
            f.writelines(data[:-1])

        try:
            with open(filename) as f:
                for line in f:
                    pass
            last_start_time = pendulum.parse(json.loads(line.strip())['startTime'])
            start_time = last_start_time.add(seconds=resolution.seconds)
            print(f"Loaded start_time from {filename}.", start_time)
        except Exception as e:
            print(f"Unable to load start_time. Reason: {e}. Defaulting to {BEGINNING}.")
            start_time = BEGINNING


        cursor = pendulum.now()
        lines = []
        while cursor > start_time:
            bars = get(
                market_name=market_name,
                resolution=resolution.seconds,
                # FTX API is unix timestamp seconds, boundary-inclusive
                start_time=round(start_time.timestamp()),
                end_time=cursor.timestamp(),
            )
            for bar in bars[::-1]:
                lines.append(json.dumps(bar))
            if bars:
                print('Processed', bars[0]['startTime'], bars[-1]['startTime'])
                cursor = pendulum.parse(bars[0]["startTime"])
            time.sleep(0.2)

        with open(filename, "a") as f:
            for line in reversed(lines):
                print(line, file=f)



def get_monthly_bars():
    """Special handling for months (variable-length bars). Note FTX only allows up to 30 days."""
    for market_name in market_names:
        filename = f"data/{market_name.replace('/', '-')}_1mo.json"
        period = pendulum.period(START, pendulum.now())

        with open(filename, "a") as f:
            for start in period.range("months"):
                bars = get(
                    market_name=market_name,
                    resolution=86400 * start.days_in_month,
                    start_time=round(start.timestamp()),
                    end_time=round(start.end_of("month").timestamp()),
                )
                for bar in bars[::-1]:
                    print(json.dumps(bar))
                    print(json.dumps(bar), file=f)
                time.sleep(0.2)


def get(*, market_name, resolution, start_time, end_time):
    r = requests.get(
        f"https://ftx.com/api/markets/{market_name}/candles",
        params={
            "resolution": resolution,
            "start_time": start_time,
            "end_time": end_time,
        },
    )
    r.raise_for_status()
    bars = r.json()["result"]
    return bars


def main():
    get_bars()
    # get_monthly_bars()


if __name__ == "__main__":
    main()
