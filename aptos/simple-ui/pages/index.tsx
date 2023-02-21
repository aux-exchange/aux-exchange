import { AppBar, Toolbar, Typography, Alert, Container } from "@mui/material";
import Head from "next/head";

import AuxIcon from "@/components/aux_icon";
import { PoolListing } from "@/components/pool_listing";
import { getPools } from "@/lib/dataservice";
import getNetworkConfig from "@/lib/network-config";

export default function Home() {
  const { pools, isLoading, error } = getPools(getNetworkConfig("devnet"));

  let content;

  if (isLoading) {
    content = <Alert severity="warning">Still Loading...</Alert>;
  } else if (error) {
    content = <Alert severity="error">{JSON.stringify(error)}</Alert>;
  } else if (pools) {
    content = PoolListing(pools);
  } else {
    content = <Alert severity="error">Empty Pool!</Alert>;
  }

  return (
    <>
      <Head>
        <title>amm pools on aux.exchange</title>
      </Head>
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar>
            <AuxIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="xl">{content}</Container>
    </>
  );
}
