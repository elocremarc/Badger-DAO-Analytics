import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import NumberFormat from "react-number-format";
import { Divider } from "@mui/material";
import { Link } from "@mui/material";

export default function TokenDisplay(props) {
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
            <Link
              target="_blank"
              href={`https://etherscan.io/address/${props.token.address}`}
            >
              {props.token.tokenSymbol}{" "}
            </Link>
          </Typography>
        </Grid>
        <Grid item>
          <Typography sx={{ fontSize: 14 }} component="div">
            <NumberFormat
              value={Math.round(props.token.amountUnitsEther)}
              displayType={"text"}
              thousandSeparator={true}
            />
          </Typography>
        </Grid>
      </Grid>
      <Divider />
    </>
  );
}
