// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { HippoCoinInfo, isText } from "@/lib/basic";

function getHippoUrl(network: string): string {
  switch (network) {
    case "mainnet":
      return "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/typescript/src/defaultList.mainnet.json";
    case "testnet":
      return "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/typescript/src/defaultList.testnet.json";
  }

  return "";
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HippoCoinInfo[]>
) {
  let { module_address, network } = req.query;

  const on_error = (x: any) => res.status(503).json(x);
  let url, base_url;
  switch (network) {
    case "mainnet":
    case "testnet":
      url = getHippoUrl(network);
      break;
    case "devnet":
      base_url = getHippoUrl("mainnet");
      module_address =
        "0xea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a";
    case "custom":
    case "localnet":
      if (isText(module_address)) {
        base_url = getHippoUrl("mainnet");
      }

    default:
  }
  if (url) {
    return fetch(url)
      .then((x) => x.json(), on_error)
      .then((x) => {
        res.status(200).json(x as HippoCoinInfo[]);
      });
  } else if (base_url && isText(module_address)) {
    return fetch(base_url)
      .then((x) => x.json(), on_error)
      .then((x) => {
        let originals = x as HippoCoinInfo[];
        let fake_coins: HippoCoinInfo[] = [
          {
            name: "Fake Ether",
            symbol: "ETH",
            official_symbol: "ETH",
            coingecko_id: "weth",
            decimals: 8,
            logo_url:
              "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/WETH.svg",
            project_url: "",
            token_type: {
              type: `${module_address}::fake_coin::FakeCoin<${module_address}::fake_coin::ETH>`,
              account_address: module_address as string,
              module_name: "fake_coin",
              struct_name: `FakeCoin<${module_address}::fake_coin::ETH>`,
            },
            extensions: {
              data: [["bridge", "wormhole"]],
            },
          },
          {
            name: "Fake BTC",
            symbol: "BTC",
            official_symbol: "BTC",
            coingecko_id: "wbtc",
            decimals: 8,
            logo_url:
              "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/BTC.webp",
            project_url: "",
            token_type: {
              type: `${module_address}::fake_coin::FakeCoin<${module_address}::fake_coin::BTC>`,
              account_address: module_address as string,
              module_name: "fake_coin",
              struct_name: `FakeCoin<${module_address}::fake_coin::BTC>`,
            },
            extensions: {
              data: [["bridge", "wormhole"]],
            },
          },
          {
            name: "Fake SOL",
            symbol: "SOL",
            official_symbol: "SOL",
            coingecko_id: "wsol",
            decimals: 8,
            logo_url:
              "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/SOL.webp",
            project_url: "",
            token_type: {
              type: `${module_address}::fake_coin::FakeCoin<${module_address}::fake_coin::SOL>`,
              account_address: module_address as string,
              module_name: "fake_coin",
              struct_name: `FakeCoin<${module_address}::fake_coin::SOL>`,
            },
            extensions: {
              data: [["bridge", "wormhole"]],
            },
          },
          {
            name: "Fake USDC",
            symbol: "USDC",
            official_symbol: "USDC",
            coingecko_id: "wusdc",
            decimals: 6,
            logo_url:
              "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg",
            project_url: "",
            token_type: {
              type: `${module_address}::fake_coin::FakeCoin<${module_address}::fake_coin::USDC>`,
              account_address: module_address as string,
              module_name: "fake_coin",
              struct_name: `FakeCoin<${module_address}::fake_coin::USDC>`,
            },
            extensions: {
              data: [["bridge", "wormhole"]],
            },
          },
          {
            name: "Fake Tether USD",
            symbol: "USDT",
            official_symbol: "USDT",
            coingecko_id: "wusdt",
            decimals: 6,
            logo_url:
              "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDT.svg",
            project_url: "",
            token_type: {
              type: `${module_address}::fake_coin::FakeCoin<${module_address}::fake_coin::USDT>`,
              account_address: module_address as string,
              module_name: "fake_coin",
              struct_name: `FakeCoin<${module_address}::fake_coin::USDT>`,
            },
            extensions: {
              data: [["bridge", "wormhole"]],
            },
          },
        ];

        originals.push(...fake_coins);

        res.status(200).json(originals);
      });
  } else {
    on_error(
      `failed to get module address/url from query string: ${module_address} - ${network}`
    );
  }
}
