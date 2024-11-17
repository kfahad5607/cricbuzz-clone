import { Link, useSearchParams } from "react-router-dom";
import { useVenues } from "../../hooks/useVenues";
import { VenueWithId } from "../../types/venue";
import Table, { Column } from "../components/Table";
import { MdDelete, MdEdit } from "react-icons/md";

const columns: Column<VenueWithId>[] = [
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
        <div className="flex justify-center gap-x-1">
          <Link to="#" className="font-medium text-blue-500">
            <MdEdit className="text-lg" />
          </Link>
          <Link to="#" className="font-medium text-gray-700">
            <MdDelete className="text-lg" />
          </Link>
        </div>
      );
    },
  },
];

const AllVenues = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);

  const { data, error, isLoading, isPlaceholderData } = useVenues(query, page);

  const handlePaginationClick = (page: number) => {
    setSearchParams({
      page: page.toString(),
    });
  };

  const handleSearch = (query: string) => {
    setSearchParams({
      query,
    });
  };

  return (
    <div className="border border-slate-900/10 py-10 px-8 rounded-xl">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-base font-medium text-slate-900">Venues</h1>
          <div className="text-sm text-gray-700 mt-1">
            A list of all the venues
          </div>
        </div>
        <div>
          <Link
            to="/admin/venues/create"
            type="button"
            className="block rounded-md px-3 py-2 text-center text-sm font-medium text-white bg-blue-600 shadow-sm"
          >
            Add venue
          </Link>
        </div>
      </div>

      <div className="relative overflow-x-auto mt-8 sm:rounded-lg">
        <Table
          data={data?.data}
          columns={columns}
          isLoading={isLoading || isPlaceholderData}
          error={error}
          searchQuery={query}
          onSearch={handleSearch}
          pagination={
            data
              ? {
                  totalRecords: data.totalRecords,
                  currentPage: data.currentPage,
                  pageSize: data.pageSize,
                }
              : undefined
          }
          onPagination={handlePaginationClick}
        />
      </div>
    </div>
  );
};

export default AllVenues;
