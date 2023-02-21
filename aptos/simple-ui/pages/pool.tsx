import Layout from "@/components/layout";
import PoolView from "@/components/pool_view";
import { getPool } from "@/lib/dataservice";
import { useRouter } from "next/router";

export default function Pool() {
  const router = useRouter();
  const { coins } = router.query;

  let content = null;

  let coin1 = "";
  let coin2 = "";

  if (coins && isText(coins)) {
    const matched = coins.match(/^([^-]+)-([^-]+)$/);
    if (matched !== null) {
      content = <h1>{coins}</h1>;
      coin1 = matched[1];
      coin2 = matched[2];
    } else {
    }
  }

  const { pool, isLoading, error } = getPool(
    {
      network: "mainnet",
      url: "https://fullnode.mainnet.aptoslabs.com/",
      module_address:
        "0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541",
    },
    coin1,
    coin2
  );

  if (isLoading) {
    content = <h1>loading....</h1>;
  } else if (error) {
    content = <h1>{error}</h1>;
  } else if (pool) {
    content = PoolView(pool);
  } else {
    content = <h1>empty pool!</h1>;
  }

  return <Layout>{content}</Layout>;
}

function isText(data: any): data is string {
  return typeof data === "string";
}
