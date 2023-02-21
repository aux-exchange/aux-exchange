import { useRouter } from "next/router";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Alert,
} from "@mui/material";
import Head from "next/head";

import PoolView from "@/components/pool_view";
import { getPool } from "@/lib/dataservice";
import AuxIcon from "@/components/aux_icon";
import { NextLinkComposed } from "@/components/link";
import { isText } from "@/lib/basic";
import getNetworkConfig from "@/lib/network-config";

export default function Pool() {
  const router = useRouter();
  const { coins } = router.query;

  let content;
  let title: string = "simple ui for aux exchange";

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
    getNetworkConfig("devnet"),
    coin1,
    coin2
  );

  if (isLoading) {
    content = <Alert severity="warning">Still Loading</Alert>;
  } else if (error) {
    content = <Alert severity="error">{JSON.stringify(error)}</Alert>;
  } else if (pool) {
    content = PoolView(pool);
    title = `Pool for ${pool?.x_info?.coin_info?.symbol}-${pool?.y_info?.coin_info?.symbol}`;
  } else {
    content = content = <Alert severity="error">Empty Pool!</Alert>;
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar>
            <AuxIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
            <Typography variant="h6" component="div">
              <Button
                component={NextLinkComposed}
                to={{ pathname: "/" }}
                color="inherit"
                size="large"
              >
                Pools
              </Button>
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="xl">{content}</Container>
    </>
  );
}
