import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Graph from "./Graph";
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

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentEvent, setRecentEvent] = useState({});
  const [strategies, setStrategies] = useState([]);
  const [strategy, setStrategy] = useState("native.renCrv");

  const handleChange = (event) => {
    setStrategy(event.target.value);
  };

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
      console.log("strategy", strategy);
      let res = await axios.get("/events", { params: { strategy } });
      console.log(res.data);

      setEvents(res.data);
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
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={3}></Grid>
          <Grid item xs={5}>
            <Item>
              <Card sx={{ minWidth: 275 }}>
                <CardContent>
                  <Typography
                    sx={{ fontSize: 14 }}
                    color="text.secondary"
                    gutterBottom
                  ></Typography>
                  <Typography variant="h5" component="div">
                    {strategy}
                  </Typography>

                  <Typography variant="body2">
                    <Link
                      target="_blank"
                      href={`https://etherscan.io/address/${strategies[strategy]}`}
                    >
                      {strategies[strategy]}
                    </Link>
                  </Typography>
                </CardContent>
              </Card>
            </Item>
            <Item>
              {loading ? (
                <Graph events={events} />
              ) : (
                <>
                  <CircularProgress />
                  <h3> Analyzing Harvest Events</h3>
                </>
              )}
            </Item>
            <Item>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Strategy</InputLabel>
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
          <Grid item xs={4}></Grid>
        </Grid>
      </Box>
    </div>
  );
}

export default App;
