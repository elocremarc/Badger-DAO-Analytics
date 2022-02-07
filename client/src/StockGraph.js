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
import { timeParse } from "d3-time-format";
import { tsv } from "d3-request";
import { scaleTime } from "d3-scale";
import { format } from "d3-format";

var parseDate = timeParse("%Y-%m-%d");

tsv("path/to/data.tsv", function(err, data) {
    data.forEach((d, i) => {
        d.date = new Date(parseDate(d.date).getTime());
        d.close = +d.close;
    });

export default function Graph(props) {
  console.log("Graph events", props.events);
  return (<>
<ChartCanvas width={width} height={400}
        margin={{ left: 50, right: 50, top:10, bottom: 30 }}
        seriesName="MSFT"
        data={data} type="svg"
        xAccessor={d => d.date} xScale={scaleTime()}
        xExtents={[new Date(2011, 0, 1), new Date(2013, 0, 2)]}>
    <Chart id={0} yExtents={d => d.close}>
        <XAxis axisAt="bottom" orient="bottom" ticks={6}/>
        <YAxis axisAt="left" orient="left" />
        <AreaSeries yAccessor={(d) => d.close}/>
    </Chart>
</ChartCanvas></>
  );
}
