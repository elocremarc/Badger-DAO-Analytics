import React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import NumberFormat from "react-number-format";
import Box from "@mui/material/Box";
import BasicModal from "./ModalPopup";
import moment from "moment";

const columns = [
  {
    field: "timeStamp",
    headerName: "Date",
    flex: 1,
    renderCell(params) {
      return <>{moment(params.value).format("MM/DD/YY")}</>;
    },
  },
  {
    field: "PerformanceFeeGovernanceTotal",
    flex: 1,

    headerName: "Performance Fee",
    renderCell(params) {
      return (
        <NumberFormat
          value={params.value}
          displayType={"text"}
          thousandSeparator={true}
          prefix={"$"}
        />
      );
    },
  },
  {
    field: "TreeDistributionTotal",
    headerName: "Tree Distribution",
    flex: 1,

    renderCell(params) {
      return (
        <NumberFormat
          value={params.value}
          displayType={"text"}
          thousandSeparator={true}
          prefix={"$"}
        />
      );
    },
  },

  {
    field: "action",
    headerName: "Details",
    sortable: false,
    renderCell: (params) => {
      console.log("params", params.row);
      return <BasicModal event={params.row} />;
    },
  },
];

export default function EventTable(props, loading) {
  const [sortModel, setSortModel] = React.useState([
    {
      field: "timeStamp",
      sort: "desc",
    },
  ]);

  console.log("EventTable events", props.events[0]);
  return (
    <Box sx={{ m: 2 }}>
      <div style={{ height: 400 }}>
        <div
          style={{
            display: "flex",
            height: "100%",
          }}
        >
          <div style={{ flexGrow: 1 }}>
            {loading ? (
              <DataGrid
                sortModel={sortModel}
                onSortModelChange={(model) => setSortModel(model)}
                checkboxSelection
                components={{
                  Toolbar: GridToolbar,
                }}
                rows={props.events}
                columns={columns}
                pageSize={20}
              />
            ) : (
              <>Loading</>
            )}
          </div>
        </div>
      </div>
    </Box>
  );
}
