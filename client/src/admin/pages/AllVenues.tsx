import { Link } from "react-router-dom";
import { useVenues } from "../../hooks/useVenues";
import { Venue } from "../../types/venue";
import { Column } from "../components/Table";
import TableDataList from "../components/TableDataList";

const columns: Column<Venue>[] = [
  {
    title: "Name",
    dataKey: "name",
    render: (val) => {
      return (
        <div className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
          {val}
        </div>
      );
    },
  },
  {
    title: "City",
    dataKey: "city",
  },
  {
    title: "Country",
    dataKey: "country",
  },
  {
    title: "",
    dataKey: "id",
    render: (val) => {
      return (
        <div className="text-right">
          <Link
            to="#"
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          >
            Edit
          </Link>
        </div>
      );
    },
  },
];

const AllVenues = () => {
  const { data, error, isLoading } = useVenues();

  return (
    <TableDataList
      entityName={{ singular: "venue", plural: "venues" }}
      isLoading={isLoading}
      data={data}
      error={error}
      columns={columns}
    />
  );
};

export default AllVenues;
