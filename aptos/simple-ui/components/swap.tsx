import { Typography } from "@mui/material";

export interface SwapProps {
  coin_x: string;
  coin_y: string;
}
export default function SwapWidget(props: SwapProps) {
  return (
    <div>
      <Typography variant="h6">Add Swap Function</Typography>
    </div>
  );
}
