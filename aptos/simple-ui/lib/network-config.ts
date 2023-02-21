import { PoolServiceConfig } from "./basic";

export default function getNetworkConfig(
  network: string,
  config?: PoolServiceConfig
): PoolServiceConfig | undefined {
  if (config !== undefined) {
    let { network: overridenetwork, module_address, url } = config;
    let new_config = getNetworkConfig(network);
    if (new_config !== undefined) {
      if (!overridenetwork) {
        overridenetwork = new_config.network;
      }
      if (!module_address) {
        module_address = new_config.module_address;
      }
      if (!url) {
        url = new_config.url;
      }
    }

    return {
      network: overridenetwork,
      url,
      module_address,
    };
  } else {
    switch (network) {
      case "mainnet":
        return {
          network: "mainnet",
          url: "https://fullnode.mainnet.aptoslabs.com/",
          module_address:
            "0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541",
        };
      case "testnet":
        return {
          network: "testnet",
          url: "https://fullnode.testnet.aptoslabs.com/",
          module_address:
            "0x8b7311d78d47e37d09435b8dc37c14afd977c5cfa74f974d45f0258d986eef53",
        };
      case "devnet":
        return {
          network: "devnet",
          url: "https://fullnode.devnet.aptoslabs.com/",
          module_address:
            "0xea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a",
        };
    }
  }
}
