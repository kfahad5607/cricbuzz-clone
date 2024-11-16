import { useSearchParams } from "react-router-dom";
import { useSeriesPaginated } from "../../hooks/useSeries";
import { Series } from "../../types/series";
import Table, { Column } from "../components/Table";

const columns: Column<Series>[] = [
  {
    title: "Title",
    dataKey: "title",
    render: (val) => {
      return (
        <div className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
          {val}
        </div>
      );
    },
  },
  {
    title: "Type",
    dataKey: "seriesType",
    render: (val) => {
      return <span>{val}</span>;
    },
  },
];

const AllSeries = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);

  const { data, error, isLoading, isPlaceholderData } = useSeriesPaginated(
    query,
    page
  );

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
          <h1 className="text-base font-medium text-slate-900">Series</h1>
          <div className="text-sm text-gray-700 mt-1">
            A list of all the series
          </div>
        </div>
        <div>
          <button
            type="button"
            className="block rounded-md px-3 py-2 text-center text-sm font-medium text-white bg-blue-600 shadow-sm"
          >
            Add series
          </button>
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

export default AllSeries;
