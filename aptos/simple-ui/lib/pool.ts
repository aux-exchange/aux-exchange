/**
 * Pool is a constant product amm
 */
export interface Pool {
  x_reserve: Coin;
  y_reserve: Coin;

  x_info?: PoolReserveInfo;
  y_info?: PoolReserveInfo;
}

export interface PoolReserveInfo {
  coin_type?: MoveStructType;
  coin_type_str?: string;
  coin_info?: CoinInfo;
  number_reserve?: number;
}

/**
 * Coin
 */
export interface Coin {
  value: string;
}

/**
 * Aptos CoinInfo object
 */
export interface CoinInfo {
  hippoInfo?: HippoCoinInfo;
  decimal: number;
  name: string;
  symbol: string;
  logo_url?: string;
}

export function coinInfoFromHippo(h: HippoCoinInfo): CoinInfo {
  return {
    hippoInfo: h,
    decimal: h.decimals,
    name: h.name,
    symbol: h.symbol,
    logo_url: h.logo_url,
  };
}

/**
 * CoinInfo from Hippo
 */
export interface HippoCoinInfo {
  name: string;
  symbol: string;
  official_symbol: string;
  coingecko_id: string;
  decimals: number;
  logo_url: string;
  project_url: string;
  token_type: {
    type: string;
    account_address: string;
    module_name: string;
    struct_name: string;
  };
  extensions: {
    data: any[];
  };
}

export interface CoinInfoMap {
  [key: string]: CoinInfo;
}

export interface MoveStructType {
  moduleAddress: string;
  moduleName: string;
  structName: string;
  genericParameters: MoveStructType[];
}

export function parseMoveStructType(
  structType: string
): MoveStructType | undefined {
  structType = structType.replace(/\s/g, "");
  const reg = /^([A-z0-9_]+)::([A-z0-9_]+)::([A-z0-9_]+)(<(.+)>)?$/;
  const matched = structType.match(reg);
  if (matched === null) {
    return undefined;
  }

  let result: MoveStructType = {
    moduleAddress: matched[1],
    moduleName: matched[2],
    structName: matched[3],
    genericParameters: [],
  };

  if (matched[5] !== undefined) {
    let temp = parseMoveGenericParameterList(matched[5]);
    if (temp !== undefined) {
      result.genericParameters = temp;
    } else {
      return undefined;
    }
  }

  return result;
}

/**
 * Parse the generic type parameters containing only struct types. Adopted from here:
 * https://github.com/fardream/go-aptos/blob/v0.8.5/aptos/move_struct_tag.go#L136-L176
 * @param typeParams the string for the type parameters without the surrounding <>
 */
export function parseMoveGenericParameterList(
  typeParams: string
): MoveStructType[] | undefined {
  let result: MoveStructType[] = [];

  if (typeParams.length == 0) {
    return result;
  }

  let start = 0,
    end = 0,
    leftBracketCount = 0;

  for (let i = 0; i < typeParams.length; i++) {
    switch (typeParams[i]) {
      case "<":
        leftBracketCount += 1;
        break;
      case ">":
        leftBracketCount -= 1;
        break;
      case ",":
        if (leftBracketCount == 0) {
          end = i;
          const aTypeStr = typeParams.slice(start, end);
          const aType = parseMoveStructType(aTypeStr);
          if (aType === undefined) {
            return undefined;
          }
          result.push(aType);
          start = i + 1;
          end = i + 1;
        }
        break;
    }
  }

  if (end < typeParams.length - 1) {
    const aTypeStr = typeParams.slice(start);
    const aType = parseMoveStructType(aTypeStr);
    if (aType === undefined) {
      return undefined;
    }
    result.push(aType);
  }

  return result;
}

export function formatMoveStructType(t: MoveStructType): string {
  let genericParams = "";
  if (t.genericParameters.length != 0) {
    genericParams = `<${t.genericParameters
      .map((x) => formatMoveStructType(x))
      .join(",")}>`;
  }

  return `${t.moduleAddress}::${t.moduleName}::${t.structName}${genericParams}`;
}

export function enrichPool(
  pool: Pool,
  typeStr: string,
  hippoCoins: CoinInfoMap
): Pool {
  if (pool.x_info === undefined) {
    pool.x_info = {};
  }
  if (pool.y_info === undefined) {
    pool.y_info = {};
  }
  let poolType = parseMoveStructType(typeStr);
  if (poolType !== undefined && poolType.genericParameters.length == 2) {
    pool.x_info.coin_type = poolType.genericParameters[0];
    pool.x_info.coin_type_str = formatMoveStructType(pool.x_info.coin_type);
    pool.y_info.coin_type = poolType.genericParameters[1];
    pool.y_info.coin_type_str = formatMoveStructType(pool.y_info.coin_type);
  }

  if (hippoCoins[pool.x_info?.coin_type_str || ""] !== undefined) {
    pool.x_info.coin_info = hippoCoins[pool.x_info.coin_type_str || ""];
    pool.x_info.number_reserve =
      Number(BigInt(pool.x_reserve.value)) /
      10 ** pool.x_info.coin_info.decimal;
  }
  if (hippoCoins[pool.y_info?.coin_type_str || ""] !== undefined) {
    pool.y_info.coin_info = hippoCoins[pool.y_info.coin_type_str || ""];
    pool.y_info.number_reserve =
      Number(BigInt(pool.y_reserve.value)) /
      10 ** pool.y_info.coin_info.decimal;
  }

  return pool;
}

export function getHippoUrl(network: string): string {
  switch (network) {
    case "mainnet":
      return "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/typescript/src/defaultList.mainnet.json";
    case "testnet":
      return "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/typescript/src/defaultList.testnet.json";
  }

  return "";
}

export interface PoolServiceConfig {
  network: string;
  url: string;
  module_address: string;
}

export interface AptosAccountResource {
  type: string;
  data?: any;
}
