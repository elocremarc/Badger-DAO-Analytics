import "./App.css";
import React, { useState, useEffect } from "react";
import { ReactComponent as Logo } from "./logo.svg";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Graph from "./Graph";
import EventTable from "./EventTable";
import TokenDisplay from "./TokenDisplay";
import NumberFormat from "react-number-format";
import BasicModal from "./ModalPopup";
import moment from "moment";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { Link } from "@mui/material";
import { SvgIcon } from "@mui/material";
import { CircularProgress } from "@mui/material";
import { Skeleton } from "@mui/material";
import { ButtonGroup } from "@mui/material";
import { Divider } from "@mui/material";
import { color, height } from "@mui/system";
import { red } from "@mui/material/colors";
import { Alert } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

function App() {
  const [events, setEvents] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [eventsReversed, setEventsReversed] = useState([]);
  const [eventsRanged, seteventsRanged] = useState([]);
  const [range, setRange] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentEvent, setRecentEvent] = useState({});
  const [strategies, setStrategies] = useState([]);
  const [strategy, setStrategy] = useState("native.bcrvIbBTC");
  const [button, setButton] = useState("All");
  const [gasTotal, setGasTotal] = useState(0);
  const [feeGovernanceTotal, setFeeGovernanceTotal] = useState(0);
  const [treeTotal, setTreeTotal] = useState(0);
  const [tokenDictionary, setTokenDictionary] = useState([]);
  const handleChange = (event) => {
    setStrategy(event.target.value);
  };

  useEffect(() => {
    console.log("useEffect");
    const calcTotal = (dataName) => {
      return eventsRanged.reduce((total, event) => {
        return (total += parseFloat(event[dataName]));
      }, 0);
    };
    let gasTotal = calcTotal("gas");
    let PerformanceFeeGovernanceTotal = calcTotal(
      "PerformanceFeeGovernanceTotal"
    );
    let TreeDistributionTotal = calcTotal("TreeDistributionTotal");
    console.log("gasTotal", gasTotal);

    setTreeTotal(TreeDistributionTotal);
    setFeeGovernanceTotal(PerformanceFeeGovernanceTotal);
    setGasTotal(gasTotal);
  }, [eventsRanged]);

  useEffect(() => {
    if (button === "Week") {
      let eventsWeek = events.filter((event) =>
        moment(event.timeStamp).isAfter(
          moment().subtract(1, "week").startOf("day")
        )
      );
      seteventsRanged(eventsWeek);
      let eventsRangedReversed = eventsWeek.slice().reverse();
      setEventsReversed(eventsRangedReversed);
      console.log("gasTotal", gasTotal);
      console.log("eventsWeek", eventsWeek);
    } else if (button === "Month") {
      let eventsMonth = events.filter((event) =>
        moment(event.timeStamp).isAfter(
          moment().subtract(1, "month").startOf("day")
        )
      );
      seteventsRanged(eventsMonth);

      let eventsRangedReversed = eventsMonth.slice().reverse();
      setEventsReversed(eventsRangedReversed);
      console.log("eventsMonth", eventsMonth);
    } else if (button === "All") {
      seteventsRanged(events);
      let eventsAll = events.slice().reverse();
      setEventsReversed(eventsAll);
      console.log("events", events);
    }
  }, [button, strategy]);

  useEffect(() => {
    const getStrategies = async () => {
      let strategies = await axios
        .get("/strategies", strategy)
        .then((response) => {
          console.log(response.data);
          return response.data;
        });
      setStrategies(strategies);
    };
    getStrategies();
  }, []);

  useEffect(() => {
    const getEvents = async () => {
      setLoading(false);
      setButton("All");
      console.log("strategy", strategy);
      let res = await axios.get("/events", { params: { strategy } });
      console.log(res.data);
      let events = res.data;
      let tokenDictionary = await axios.get("/tokenDictionary");
      let tokenDictionaryRes = tokenDictionary.data;
      setTokenDictionary(tokenDictionaryRes);

      // filter out events that are not in the last month

      setEvents(events);
      seteventsRanged(events);

      setEventsReversed(events.slice().reverse());
      setTableData(events);
      setLoading(true);
    };

    getEvents();
  }, [strategy]);

  // useEffect(() => {
  //   if (events.length > 0) {
  //     setRecentEvent(events[events.length - 1]);
  //     console.log(recentEvent);
  //   }
  // }, [recentEvent, events]);

  const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  }));

  return (
    <div className="App">
      {/* <Graph events={events} /> */}
      <Toolbar>
        <Grid
          container
          direction="row-reverse"
          justifyContent="flex-end"
          alignItems="center"
        >
          <Grid item>
            <Logo style={{ height: 45 }} />
          </Grid>
          <Grid item>
            <Typography variant="h6" noWrap component="div">
              Badger Analytics
            </Typography>
          </Grid>
        </Grid>
      </Toolbar>
      <Box mx={2}>
        {" "}
        <Box sx={{ flexGrow: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Item sx={{ m: 2 }}>
                <Card sx={{ minWidth: 275 }}>
                  <CardContent>
                    <Grid container justifyContent={"space-around"}>
                      <Grid item>
                        <Typography variant="h5" component="div">
                          {strategy}
                        </Typography>
                        <Typography variant="body2">
                          <Link
                            target="_blank"
                            href={`https://etherscan.io/address/${strategies[strategy]}`}
                          >
                            {strategies[strategy] ? (
                              <>
                                {strategies[strategy].slice(0, 5)}...
                                {strategies[strategy].slice(-4)}
                              </>
                            ) : (
                              <>"Loading"</>
                            )}
                          </Link>
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Grid
                          sx={{
                            display: "grid",
                            gridAutoColumns: "1fr",
                            gap: 1,
                          }}
                          container
                        >
                          <Grid
                            item
                            sx={{ gridRow: "1", gridColumn: "span 1" }}
                          >
                            <Typography
                              sx={{ fontSize: 14, textAlign: "left" }}
                            >
                              <b>Tree Distribution Total </b>
                              <br />
                              <b>Performance Fee Total </b>
                              <br />
                              <b>Gas Spent Total</b>
                            </Typography>
                          </Grid>

                          <Grid
                            item
                            sx={{ gridRow: "1", gridColumn: "sidebar" }}
                          >
                            {loading ? (
                              <>
                                {" "}
                                <Typography
                                  sx={{ fontSize: 14, textAlign: "right" }}
                                >
                                  <NumberFormat
                                    value={feeGovernanceTotal}
                                    displayType={"text"}
                                    thousandSeparator={true}
                                    prefix={"$"}
                                  />
                                  <br />
                                  {
                                    <NumberFormat
                                      value={treeTotal}
                                      displayType={"text"}
                                      thousandSeparator={true}
                                      prefix={"$"}
                                    />
                                  }
                                  <br></br>
                                  {gasTotal >= feeGovernanceTotal ? (
                                    <Typography
                                      sx={{ fontSize: 14, color: "red" }}
                                    >
                                      {
                                        <b>
                                          <NumberFormat
                                            value={gasTotal}
                                            displayType={"text"}
                                            thousandSeparator={true}
                                            prefix={"$"}
                                          />
                                        </b>
                                      }
                                    </Typography>
                                  ) : (
                                    <Typography
                                      sx={{ fontSize: 14, color: "primary" }}
                                    >
                                      {
                                        <NumberFormat
                                          value={gasTotal}
                                          displayType={"text"}
                                          thousandSeparator={true}
                                          prefix={"$"}
                                        />
                                      }
                                    </Typography>
                                  )}
                                </Typography>
                              </>
                            ) : (
                              <>
                                {" "}
                                <Grid
                                  item
                                  sx={{ gridRow: "1", gridColumn: "4 / 5" }}
                                >
                                  <Skeleton sx={{ m: 1 }} />
                                  <Skeleton sx={{ m: 1 }} />
                                  <Skeleton sx={{ m: 1 }} />{" "}
                                </Grid>
                              </>
                            )}{" "}
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={4}>
                        <Item>
                          <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">
                              Strategy
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={strategy}
                              label="Strategy"
                              onChange={handleChange}
                            >
                              {Object.keys(strategies).map((key) => (
                                <MenuItem value={key}>
                                  {key.split(".")[1]}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Item>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Item>
              <Item sx={{ m: 2 }}>
                {loading ? (
                  <>
                    {" "}
                    <Box sx={{ m: 2 }}>
                      <ButtonGroup
                        variant="contained"
                        aria-label="outlined primary button group"
                      >
                        {button === "Week" ? (
                          <Button onClick={() => setButton("Week")}>
                            Week
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            onClick={() => setButton("Week")}
                          >
                            Week
                          </Button>
                        )}
                        {button === "Month" ? (
                          <Button onClick={() => setButton("Month")}>
                            Month
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            onClick={() => setButton("Month")}
                          >
                            Month
                          </Button>
                        )}
                        {button === "All" ? (
                          <Button onClick={() => setButton("All")}>All</Button>
                        ) : (
                          <Button
                            variant="outlined"
                            onClick={() => setButton("All")}
                          >
                            All
                          </Button>
                        )}
                      </ButtonGroup>
                    </Box>
                    <Graph events={eventsRanged} />
                  </>
                ) : (
                  <>
                    <CircularProgress sx={{ m: 2 }} />
                    <h3> Analyzing Harvest Events</h3>
                  </>
                )}
              </Item>
            </Grid>
            <Grid item xs={12}>
              <Item sx={{ m: 2 }}>
                {" "}
                <Typography variant="h5" component="div">
                  Harvest Events
                </Typography>
              </Item>
              <div style={{ height: 400, width: "100%" }}>
                {loading ? (
                  <EventTable loading={loading} events={tableData} />
                ) : (
                  <CircularProgress />
                )}
              </div>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </div>
  );
}

export default App;
