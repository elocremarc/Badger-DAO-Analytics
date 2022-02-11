import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import NumberFormat from "react-number-format";
import { Divider } from "@mui/material";

export default function TotalDisplay(props) {
  return (
    <>
      <Grid
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        container
      >
        <Grid item>
          <Typography sx={{ fontSize: 14 }} component="div">
            Total USD
          </Typography>
        </Grid>
        <Grid item>
          <Typography sx={{ fontSize: 14 }} component="div">
            <NumberFormat
              value={Math.round(props.totalUSD)}
              displayType={"text"}
              thousandSeparator={true}
              prefix={"$"}
            />
          </Typography>
        </Grid>
      </Grid>
      <Divider />
    </>
  );
}
