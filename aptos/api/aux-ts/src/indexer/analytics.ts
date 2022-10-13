import * as aux from "../../src";
import { AuxClient } from "../../src/client";

import fs from "fs";
import _ from "lodash";
import type { OrderFillEvent } from "../../src/clob/core/events";
import type { Types } from "aptos";

const PATH = "src/indexer/data/analytics.json";
export interface Bar {
  open: number | undefined;
  high: number | undefined;
  low: number | undefined;
  close: number | undefined;
  volume: number | undefined;
  fills: {
    price: number;
    quantity: number;
    timestamp: number;
  }[];
  cursor: number;
}


type Resolution = "15s" | "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w";

export async function getBar({
  baseCoinType,
  quoteCoinType,
  resolution,
}: {
  baseCoinType: Types.MoveStructTag;
  quoteCoinType: Types.MoveStructTag;
  resolution: Resolution;
}): Promise<Bar> {
  const [auxClient, _moduleAuthority] = AuxClient.createFromEnvForTesting({});
  const market = await aux.Market.read(auxClient, {
    baseCoinType,
    quoteCoinType,
  });
  const convert = (fill: OrderFillEvent) => ({
    price: fill.price.toDecimalUnits(market.quoteCoinInfo.decimals).toNumber(),
    quantity: fill.baseQuantity
      .toDecimalUnits(market.baseCoinInfo.decimals)
      .toNumber(),
    timestamp: fill.timestamp.toNumber(),
  });

  let { cursor, fills }: Bar = fs.existsSync(PATH)
    ? JSON.parse(fs.readFileSync(PATH, "utf-8"))
    : {
        cursor: 0,
        fills: [],
      };

  const now = Date.now();
  fills = _.dropWhile(
    fills,
    (fill) => fill.timestamp < now - resolutionSeconds(resolution)
  );

  while (true) {
    // pagination logic
    // start: 0, limit: 100
    // server will return starting from lowest seq num
    // if there are multiple pages, keep paging until the cursor overlaps
    // only process the records within a page that are > cursor
    // move the cursor forward after processing
    const moreFills = await market.fills({ start: cursor, limit: 100 });
    const fillsSince =
      cursor === 0
        ? moreFills
        : _.dropWhile(
            moreFills,
            (fill) => fill.sequenceNumber.toNumber() <= cursor
          );
    fills = fills.concat(fillsSince.map(convert));
    cursor =
      fillsSince[fillsSince.length - 1]?.sequenceNumber.toNumber() ?? cursor;
    if (fillsSince.length === 0 || fillsSince.length < moreFills.length) {
      break;
    }
  }

  const prices = fills.map((fill) => fill.price);
  const bar: Bar = {
    open: _.first(prices),
    high: _.max(prices),
    low: _.max(prices),
    close: _.last(prices),
    volume: _(fills)
      .map((fill) => fill.price * fill.quantity)
      .sum(),
    fills,
    cursor,
  };

  fs.writeFileSync(PATH, JSON.stringify(bar));
  return bar;
}

function resolutionSeconds(resolution: Resolution): number {
  switch (resolution) {
    case "15s":
      return 15;
    case "1m":
      return 60;
    case "5m":
      return 5 * 60;
    case "15m":
      return 15 * 60;
    case "1h":
      return 60 * 60;
    case "4h":
      return 4 * 60 * 60;
    case "1d":
      return 24 * 60 * 60;
    case "1w":
      return 7 * 24 * 60 * 60;
    default:
      const _exhaustiveCheck: never = resolution;
      return _exhaustiveCheck;
  }
}
