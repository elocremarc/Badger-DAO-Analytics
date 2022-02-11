import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TokenDisplay from "./TokenDisplay";
import TotalDisplay from "./TotalDisplay";
import NumberFormat from "react-number-format";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Link } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function BasicModal(props) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  //console.log("modal Props", props.event);

  return (
    <div>
      <Button onClick={handleOpen}>More</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {props.event ? (
          <>
            <Box sx={style}>
              <Box sx={{ m: 2 }}>
                <Typography variant="h5" sx={{ textAlign: "Left" }}>
                  <b>Transaction Details </b>
                </Typography>
                <Grid
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  container
                >
                  <Grid item>
                    <Grid
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      container
                    >
                      <Grid
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        container
                      >
                        <Grid item>
                          <Typography sx={{ fontSize: 14 }} component="div">
                            Transaction
                          </Typography>
                        </Grid>

                        <Grid item>
                          <>
                            <Link
                              target="_blank"
                              href={`https://etherscan.io/tx/${props.event.transactionHash}`}
                            >
                              {props.event.transactionHash.slice(0, 5)}...
                              {props.event.transactionHash.slice(-4)}
                            </Link>
                          </>
                        </Grid>
                      </Grid>
                      <Grid
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        container
                      >
                        <Grid item>
                          <Typography sx={{ fontSize: 14 }} component="div">
                            Block Number
                          </Typography>
                        </Grid>
                        {props.event.blockNumber}
                      </Grid>
                    </Grid>
                    <Grid
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      container
                    >
                      <Grid item>
                        <Typography sx={{ fontSize: 14 }} component="div">
                          Date
                        </Typography>
                      </Grid>
                      {props.event.timeStamp}
                    </Grid>{" "}
                    <Grid
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      container
                    >
                      <Grid item>
                        <Typography sx={{ fontSize: 14 }} component="div">
                          Gas Spent USD
                        </Typography>
                      </Grid>
                      <NumberFormat
                        value={Math.round(props.event.gas)}
                        displayType={"text"}
                        thousandSeparator={true}
                        prefix={"$"}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ m: 2 }}>
                <Typography variant="h5" sx={{ textAlign: "Left" }}>
                  <b>Tokens Harvested </b>
                </Typography>
                <Grid
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  container
                >
                  <Grid item>
                    <Typography sx={{ textAlign: "left" }}>
                      <b>Performance Fee </b>
                    </Typography>
                    {props.event.TokensFee.map((token) => (
                      <>
                        {token.amountUnitsEther > 0 ? (
                          <TokenDisplay token={token} />
                        ) : (
                          <></>
                        )}
                      </>
                    ))}{" "}
                    <TotalDisplay
                      totalUSD={props.event.PerformanceFeeGovernanceTotal}
                    />
                  </Grid>
                  <Grid item>
                    <Grid item>
                      <Typography sx={{ textAlign: "left" }}>
                        <b>Tree Distribution </b>
                      </Typography>
                      {props.event.TokensTree.map((token) => (
                        <>
                          {token.amountUnitsEther > 0 ? (
                            <TokenDisplay token={token} />
                          ) : (
                            <></>
                          )}
                        </>
                      ))}
                      <TotalDisplay
                        totalUSD={props.event.TreeDistributionTotal}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </>
        ) : (
          <Box>...Loading</Box>
        )}
      </Modal>
    </div>
  );
}
