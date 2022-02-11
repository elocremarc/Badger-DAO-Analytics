import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import NumberFormat from "react-number-format";
import Box from "@mui/material/Box";
import BasicModal from "./ModalPopup";

const columns = [
  {
    field: "timeStamp",
    headerName: "Date",
    flex: 1,
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
                checkboxSelection
                components={{
                  Toolbar: GridToolbar,
                }}
                rows={props.events}
                columns={columns}
                pageSize={10}
              />
            ) : (
              <>Loading</>
            )}
          </div>{" "}
        </div>
      </div>
    </Box>
  );
}
