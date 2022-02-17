import React from "react";
import {
  LineChart,
  AreaChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import moment from "moment";

export default function Graph(props) {
  const DataFormater = (number) => {
    if (number > 1000000000) {
      return (number / 1000000000).toString() + "B";
    } else if (number > 1000000) {
      return (number / 1000000).toString() + "M";
    } else if (number > 1000) {
      return (number / 1000).toString() + "K";
    } else {
      return number.toString();
    }
  };

  const DateFormater = (date) => {
    return moment(date).format("MM/DD/YY");
  };
  console.log("Graph events", props.events);
  return (
    <ResponsiveContainer width="100%" height={400}>
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
        <XAxis tickFormatter={DateFormater} dataKey="timeStamp" />
        <YAxis tickFormatter={DataFormater} />
        <Tooltip
          formatter={(value) => `$${new Intl.NumberFormat("en").format(value)}`}
        />
        <Legend />
        <Area
          type="monotone"
          name="Tree Distribution"
          dataKey="TreeDistributionTotal"
          stroke="#82ca9d"
          fill="#82ca9d"
        />
        <Area
          type="monotone"
          dataKey="PerformanceFeeGovernanceTotal"
          name="Fee Governance"
          stroke="#ffc658"
          fill="#F2BC1B"
          activeDot={{ r: 8 }}
        />
        <Area
          type="monotone"
          name="Gas Spent"
          dataKey="gas"
          stroke="red"
          fill="red"
          activeDot={{ r: 8 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
