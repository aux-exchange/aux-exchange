import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of, tap, forkJoin } from 'rxjs';
import {
  coinInfoFromHippo,
  CoinInfoMap,
  enrichPool,
  HippoCoinInfo,
  Pool,
} from './pool';

function getHippoUrl(network: string): string {
  switch (network) {
    case 'mainnet':
      return 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/typescript/src/defaultList.mainnet.json';
    case 'testnet':
      return 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/typescript/src/defaultList.testnet.json';
  }

  return '';
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

@Injectable({
  providedIn: 'root',
})
export class PoolService {
  config: PoolServiceConfig = {
    network: 'mainnet',
    url: 'https://fullnode.mainnet.aptoslabs.com/',
    module_address:
      '0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541',
  };

  constructor(private http: HttpClient) {}

  updateConfig(new_config: PoolServiceConfig) {
    this.config = new_config;
  }

  getCoinList(network: string): Observable<HippoCoinInfo[]> {
    const url = getHippoUrl(network);
    if (url !== '') {
      return this.http.get<HippoCoinInfo[]>(url).pipe(tap(console.dir));
    } else {
      return of([]);
    }
  }

  getPools(): Observable<Pool[]> {
    const account_path = `v1/accounts/${this.config.module_address}/resources`;
    const url = new URL(account_path, this.config.url).href;
    const pool_regex = new RegExp(
      `${this.config.module_address}::amm::Pool<.*>$`
    );

    let pools = this.http.get<AptosAccountResource[]>(url).pipe(
      tap((values) => console.dir(values)),
      map((resources) => resources.filter((x) => x.type.match(pool_regex)))
    );
    let hippoCoins = this.getCoinList(this.config.network).pipe(
      map((hcoins) => {
        let result: CoinInfoMap = {};
        for (const ah of hcoins) {
          result[ah.token_type.type] = coinInfoFromHippo(ah);
        }

        return result;
      })
    );

    return forkJoin({
      pools,
      hippoCoins,
    }).pipe(
      map(({ pools, hippoCoins }) =>
        pools.map((x) => enrichPool(x.data as Pool, x.type, hippoCoins))
      )
    );
  }

  getPool(coin1: string, coin2: string): Observable<Pool> {
    const account_path = `v1/accounts/${this.config.module_address}/resource/${this.config.module_address}::amm::Pool<${coin1},${coin2}>`;
    const url = new URL(account_path, this.config.url).href;
    let hippoCoins = this.getCoinList(this.config.network).pipe(
      map((hcoins) => {
        let result: CoinInfoMap = {};
        for (const ah of hcoins) {
          result[ah.token_type.type] = coinInfoFromHippo(ah);
        }

        return result;
      })
    );
    return forkJoin({
      hippoCoins: hippoCoins,
      pool: this.http.get<AptosAccountResource>(url),
    }).pipe(
      map(({ hippoCoins, pool }) =>
        enrichPool(pool.data as Pool, pool.type, hippoCoins)
      )
    );
  }
}
