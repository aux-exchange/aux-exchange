import { Pool } from "@/lib/basic";
import { Typography, Button } from "@mui/material";
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
            <img
              src={pool.x_info?.coin_info?.logo_url || ""}
              alt={pool.x_info?.coin_type_str || ""}
              height={32}
              width={32}
            />
            <img
              src={pool.y_info?.coin_info?.logo_url || ""}
              alt={pool.y_info?.coin_type_str || ""}
              height={32}
              width={32}
            />
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
  return <DataGrid rows={pools} columns={cols} autoHeight></DataGrid>;
}
