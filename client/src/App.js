import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Graph from "./Graph";
import NumberFormat from "react-number-format";
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

function App() {
  const [events, setEvents] = useState([]);
  const [eventsReversed, setEventsReversed] = useState([]);
  const [eventsRanged, seteventsRanged] = useState([]);
  const [range, setRange] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentEvent, setRecentEvent] = useState({});
  const [strategies, setStrategies] = useState([]);
  const [strategy, setStrategy] = useState("native.renCrv");
  const [button, setButton] = useState("All");
  const [gasTotal, setGasTotal] = useState(0);

  const handleChange = (event) => {
    setStrategy(event.target.value);
  };

  useEffect(() => {
    let gasTotal = eventsRanged.reduce((total, event) => {
      return (total += parseFloat(event.gasSpent));
    }, 0);
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
      // filter out events that are not in the last month

      setEvents(events);
      seteventsRanged(events);

      let eventsRangedReversed = events.slice().reverse();
      setEventsReversed(eventsRangedReversed);
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
  const bull = (
    <Box
      component="span"
      sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
    >
      •
    </Box>
  );

  return (
    <div className="App">
      {/* <Graph events={events} /> */}
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Badger Analytics
        </Typography>
      </Toolbar>
      <Box mx={2}>
        {" "}
        <Box sx={{ flexGrow: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <Item sx={{ m: 2 }}>
                <Card sx={{ minWidth: 275 }}>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      {strategy}
                    </Typography>

                    <Typography variant="body2">
                      <Link
                        target="_blank"
                        href={`https://etherscan.io/address/${strategies[strategy]}`}
                      >
                        {`${strategies[strategy]}`}
                      </Link>
                    </Typography>
                  </CardContent>
                </Card>
              </Item>
              <Item sx={{ m: 2 }}>
                {loading ? (
                  <>
                    <ButtonGroup
                      variant="contained"
                      aria-label="outlined primary button group"
                    >
                      {button === "Week" ? (
                        <Button onClick={() => setButton("Week")}>Week</Button>
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
                    </ButtonGroup>{" "}
                    <Graph events={eventsRanged} />
                  </>
                ) : (
                  <>
                    <CircularProgress sx={{ m: 2 }} />
                    <h3> Analyzing Harvest Events</h3>
                  </>
                )}
              </Item>
              <Item sx={{ m: 2 }}>
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
                      <MenuItem value={key}>{key.split(".")[1]}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Item>
            </Grid>
            <Grid item xs={6}>
              <Item sx={{ m: 2 }}>
                {" "}
                <Typography variant="h5" component="div">
                  Harvest Events
                </Typography>
              </Item>
              {loading ? (
                <>
                  {eventsReversed.map((event) => (
                    <Item sx={{ m: 2 }}>
                      <Card>
                        <CardContent>
                          <Link
                            target="_blank"
                            href={`https://etherscan.io/tx/${event.transactionHash}`}
                          >
                            {event.transactionHash.slice(0, 5)}...{" "}
                            {event.transactionHash.slice(-4)}
                          </Link>
                          <Typography sx={{ fontSize: 14 }} component="div">
                            {event.timeStamp}
                          </Typography>

                          <Typography sx={{ fontSize: 14 }} component="div">
                            Tree Distribution{" "}
                            <NumberFormat
                              value={event.TreeDistributionTotal}
                              displayType={"text"}
                              thousandSeparator={true}
                              prefix={"$"}
                            />
                          </Typography>

                          <Typography sx={{ fontSize: 14 }} component="div">
                            Performance Fee Governance{" "}
                            <NumberFormat
                              value={event.PerformanceFeeGovernanceTotal}
                              displayType={"text"}
                              thousandSeparator={true}
                              prefix={"$"}
                            />
                          </Typography>
                          <Typography sx={{ fontSize: 14 }} component="div">
                            Gas Spent{" "}
                            <NumberFormat
                              value={event.gas}
                              displayType={"text"}
                              thousandSeparator={true}
                              prefix={"$"}
                            />
                          </Typography>
                        </CardContent>
                      </Card>
                    </Item>
                  ))}
                </>
              ) : (
                <>
                  <Card sx={{ m: 2 }}>
                    {" "}
                    <Skeleton animation="wave" sx={{ m: 2 }} />
                    <Skeleton animation="wave" sx={{ m: 2 }} />
                    <Skeleton animation="wave" sx={{ m: 2 }} />
                    <Skeleton animation="wave" sx={{ m: 2 }} />
                  </Card>
                  <Card sx={{ m: 2 }}>
                    {" "}
                    <Skeleton animation="wave" sx={{ m: 2 }} />
                    <Skeleton animation="wave" sx={{ m: 2 }} />
                    <Skeleton animation="wave" sx={{ m: 2 }} />
                    <Skeleton animation="wave" sx={{ m: 2 }} />
                  </Card>
                  <Card sx={{ m: 2 }}>
                    {" "}
                    <Skeleton animation="wave" sx={{ m: 2 }} />
                    <Skeleton animation="wave" sx={{ m: 2 }} />
                    <Skeleton animation="wave" sx={{ m: 2 }} />
                    <Skeleton animation="wave" sx={{ m: 2 }} />
                  </Card>
                </>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>
    </div>
  );
}

export default App;
