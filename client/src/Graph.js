import React from "react";
import {
  LineChart,
  AreaChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function Graph(props) {
  console.log("Graph events", props.events);
  return (
    <AreaChart
      width={500}
      height={300}
      data={props.events}
      margin={{
        top: 30,
        right: 10,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timeStamp" />
      <YAxis />
      <Tooltip />
      <Legend />

      <Area
        type="monotone"
        name="Tree Distribution USD"
        dataKey="TreeDistributionTotal"
        stroke="#82ca9d"
        fill="#82ca9d"
      />
      <Area
        type="monotone"
        dataKey="PerformanceFeeGovernanceTotal"
        name="Fee Governance USD"
        stroke="#ffc658"
        fill="#F2BC1B"
        activeDot={{ r: 8 }}
      />

      <Area
        type="monotone"
        name="Gas Spent USD"
        dataKey="gas"
        stroke="red"
        fill="red"
        activeDot={{ r: 8 }}
      />
    </AreaChart>
  );
}
