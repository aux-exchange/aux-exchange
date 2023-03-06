import { Pool } from "@/lib/basic";
import { Avatar, AvatarGroup, Button, ButtonGroup, Grid } from "@mui/material";

export default function PoolView(pool: Pool) {
  return (
    <Grid container sx={{ maxWidth: 600 }}>
      <Grid item xs={12} sx={{ flexDirection: "column", alignItems: "center" }}>
        <AvatarGroup sx={{ justifyContent: "center" }}>
          <Avatar
            src={pool.x_info?.coin_info?.logo_url}
            alt={`${pool.x_info?.coin_info?.symbol}`}
          />
          <Avatar
            src={pool.y_info?.coin_info?.logo_url}
            alt={`${pool.y_info?.coin_info?.symbol}`}
          />
        </AvatarGroup>
        <ButtonGroup variant="text" sx={{ flexGrow: 1 }}>
          <Button size="large">{`${pool.x_info?.coin_info?.symbol}`}</Button>
          <Button size="large">{`${pool.y_info?.coin_info?.symbol}`}</Button>
        </ButtonGroup>
      </Grid>
      <Grid item xs={12} sx={{ justifyContent: "center" }}></Grid>
      <Grid item xs={1}></Grid>
      <Grid item xs={2}>
        Name
      </Grid>
      <Grid item xs={1}>
        Symbol
      </Grid>
      <Grid item xs={2}>
        Reserve
      </Grid>
      <Grid item xs={6}>
        Type
      </Grid>

      <Grid item xs={1}>
        <Avatar src={pool.x_info?.coin_info?.logo_url} />
      </Grid>
      <Grid item xs={2}>
        {pool.x_info?.coin_info?.name}
      </Grid>
      <Grid item xs={1}>
        {pool.x_info?.coin_info?.symbol}
      </Grid>
      <Grid item xs={2}>
        {pool.x_info?.number_reserve}
      </Grid>
      <Grid item xs={6}>
        {pool.x_info?.coin_type_str}
      </Grid>

      <Grid item xs={1}></Grid>
      <Grid item xs={2}>
        {pool.y_info?.coin_info?.name}
      </Grid>
      <Grid item xs={1}>
        {pool.y_info?.coin_info?.symbol}
      </Grid>
      <Grid item xs={2}>
        {pool.y_info?.number_reserve}
      </Grid>
      <Grid item xs={6}>
        {pool.y_info?.coin_type_str}
      </Grid>
    </Grid>
  );
}
