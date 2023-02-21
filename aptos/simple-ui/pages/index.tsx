import { PoolListing } from "@/components/pool_listing";
import { getPools } from "@/lib/dataservice";
import Layout from "../components/layout";

export default function Home() {
  const { pools, isLoading, error } = getPools({
    network: "mainnet",
    url: "https://fullnode.mainnet.aptoslabs.com/",
    module_address:
      "0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541",
  });

  let content = null;
  if (isLoading) {
    content = <h1>Loading</h1>;
  } else if (error) {
    content = (
      <h1>
        <p className="error">error</p>
      </h1>
    );
  } else if (pools === undefined) {
    <h1>
      <p className="error">no pools!</p>
    </h1>;
  } else {
    content = PoolListing(pools);
  }
  return (
    <Layout home={true}>
      <div className="container-xxl">{content}</div>
    </Layout>
  );
}
