import { useSearchParams } from "react-router-dom";
import { usePlayers } from "../../hooks/usePlayers";
import { Player } from "../../types/players";
import Table, { Column } from "../components/Table";
import myDayjs from "../../services/dayjs";

const columns: Column<Player>[] = [
  {
    title: "Name",
    dataKey: "id",
    render: (val, record) => {
      return (
        <div className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
          {record.name}
        </div>
      );
    },
  },
  {
    title: "Team",
    dataKey: "team",
    render: (val, record) => {
      return <span>{record.team.name}</span>;
    },
  },
  {
    title: "Role",
    dataKey: "id",
    render: (val, record) => {
      return <span>{record.roleInfo.role}</span>;
    },
  },
  {
    title: "Bat Style",
    dataKey: "id",
    render: (val, record) => {
      return <span>{record.roleInfo.batStyle}</span>;
    },
  },
  {
    title: "Birth Date",
    dataKey: "id",
    render: (val, record) => {
      return (
        <span>
          {myDayjs(record.personalInfo.birthDate).format("DD MMM, YYYY")}
        </span>
      );
    },
  },
];

const AllPlayers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);

  const { data, error, isLoading, isPlaceholderData } = usePlayers(query, page);

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
          <h1 className="text-base font-medium text-slate-900">Players</h1>
          <div className="text-sm text-gray-700 mt-1">
            A list of all the players
          </div>
        </div>
        <div>
          <button
            type="button"
            className="block rounded-md px-3 py-2 text-center text-sm font-medium text-white bg-blue-600 shadow-sm"
          >
            Add player
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

export default AllPlayers;
