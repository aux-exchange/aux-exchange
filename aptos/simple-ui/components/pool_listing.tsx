import { Pool } from "@/lib/basic";
import { Typography, Button, AvatarGroup, Avatar, Box } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { NextLinkComposed } from "./link";

export function PoolListing(pools: Pool[]) {
  let cols: GridColDef[] = [
    {
      field: "pool-image",
      headerName: "",
      renderCell: (x: GridRenderCellParams<Pool>) => {
        let pool = x.row;
        return (
          <>
            <AvatarGroup>
              <Avatar
                src={pool.x_info?.coin_info?.logo_url || ""}
                alt={pool.x_info?.coin_type_str || ""}
                sx={{ width: 32, height: 32 }}
              />
              <Avatar
                src={pool.y_info?.coin_info?.logo_url || ""}
                alt={pool.y_info?.coin_type_str || ""}
                sx={{ width: 32, height: 32 }}
              />
            </AvatarGroup>
          </>
        );
      },
      valueGetter: (x) => x.row.id,
      flex: 0.1,
    },
    {
      field: "coin-x",
      headerName: "Coin X",
      renderCell: (x: GridRenderCellParams<Pool>) => {
        const pool = x.row;
        const coinPair = `${pool.x_info?.coin_info?.symbol}`;
        return <Typography>{coinPair}</Typography>;
      },
      valueGetter: (x) => x.row.x_info?.coin_info?.symbol,
      flex: 0.1,
    },
    {
      field: "reserve-x",
      headerName: "Reserve X",
      valueGetter: (x) => (x.row as Pool).x_info?.number_reserve,
      flex: 0.1,
    },
    {
      field: "coin-y",
      headerName: "Coin Y",
      renderCell: (x: GridRenderCellParams<Pool>) => {
        const pool = x.row;
        const coinPair = `${pool.y_info?.coin_info?.symbol}`;
        return <Typography>{coinPair}</Typography>;
      },
      valueGetter: (x) => x.row.y_info?.coin_info?.symbol,
      flex: 0.1,
    },
    {
      field: "reserve-y",
      headerName: "Reserve Y",
      valueGetter: (x) => (x.row as Pool).y_info?.number_reserve,
      flex: 0.1,
    },
    {
      field: "go-to-pool",
      headerName: "",
      renderCell: (x: GridRenderCellParams<Pool>) => {
        const pool = x.row as Pool;
        return (
          <Button
            variant="contained"
            component={NextLinkComposed}
            to={{ pathname: "/pool", query: { coins: `${pool.id}` } }}
          >
            Go to Pool
          </Button>
        );
      },
      flex: 0.1,
    },
  ];
  return (
    <Box sx={{ minWidth: 600, minHeight: 500, width: "100%" }}>
      <DataGrid rows={pools} columns={cols} autoHeight></DataGrid>
    </Box>
  );
}
