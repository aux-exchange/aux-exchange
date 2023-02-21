import useSWR from "swr";

import {
  AptosAccountResource,
  coinInfoFromHippo,
  CoinInfoMap,
  enrichPool,
  getHippoUrl,
  HippoCoinInfo,
  Pool,
  PoolServiceConfig,
} from "./pool";

export function getCoinList(network: string): {
  coinInfos: CoinInfoMap | undefined;
  isLoading: boolean;
  error: any;
} {
  const url = getHippoUrl(network);
  if (url === "") {
    return {
      coinInfos: {},
      isLoading: false,
      error: `cannot obtain url for network: ${network}`,
    };
  }

  const {
    data: coinInfos,
    isLoading,
    error,
  } = useSWR(url, (x) =>
    fetch(x)
      .then((x) => x.json())
      .then((x) => {
        let data = x as HippoCoinInfo[];
        let coinInfos: CoinInfoMap = {};
        if (data) {
          for (const ah of data) {
            coinInfos[ah.token_type.type] = coinInfoFromHippo(ah);
          }
        }

        return coinInfos;
      })
  );

  return {
    coinInfos: coinInfos,
    isLoading,
    error,
  };
}

export function getPools(config: PoolServiceConfig): {
  pools: Pool[] | undefined;
  isLoading: boolean;
  error: any;
} {
  let { coinInfos: coinMap } = getCoinList(config.network);

  let {
    data: pools,
    isLoading,
    error,
  } = useSWR(
    () => {
      if (coinMap) {
        const account_path = `v1/accounts/${config.module_address}/resources`;
        return new URL(account_path, config.url).href;
      } else {
        return null;
      }
    },
    (x) =>
      fetch(x)
        .then((x) => x.json())
        .then((x) => {
          let resources = x as AptosAccountResource[];
          const pool_regex = new RegExp(
            `${config.module_address}::amm::Pool<.*>$`
          );
          let pools = resources.filter((x) => x.type.match(pool_regex));
          if (coinMap !== undefined) {
            return pools.map((x) =>
              enrichPool(x.data as Pool, x.type, coinMap as CoinInfoMap)
            );
          } else {
            return [];
          }
        })
  );

  return {
    pools,
    isLoading,
    error,
  };
}

export function getPool(
  config: PoolServiceConfig,
  coin1: string,
  coin2: string
): { pool: Pool | undefined; error: any; isLoading: boolean } {
  let { coinInfos: coinMap } = getCoinList(config.network);

  let {
    data: pool,
    error,
    isLoading,
  } = useSWR(
    () => {
      if (!coin1 || !coin2 || !coinMap) {
        return null;
      }
      const account_path = `v1/accounts/${config.module_address}/resource/${config.module_address}::amm::Pool<${coin1},${coin2}>`;
      return new URL(account_path, config.url).href;
    },
    (x) =>
      fetch(x)
        .then((x) => x.json())
        .then((x) => enrichPool(x.data as Pool, x.type, coinMap as CoinInfoMap))
  );

  return {
    pool,
    isLoading,
    error,
  };
}
