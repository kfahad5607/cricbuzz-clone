import { Link, NavLink, useSearchParams } from "react-router-dom";
import FilterChips from "../components/elements/FilterChips";
import {
  MATCH_TYPE_FILTERS,
  MatchTypeFilterType,
} from "../components/ScheduledMatchesTab";
import Table from "../components/Table";
import { TabLinkType } from "../components/tabs/TabWithLink";
import { Column } from "../entities/table";
import useSeries, { SeriesByMonth } from "../hooks/useSeries";
import { MatchType } from "../types/matches";
import { MATCH_TYPES_VALUES } from "../utils/constants";
import { formatDateTime, getSeriesURL } from "../utils/converters";

const navLinks: TabLinkType[] = [
  {
    title: "Current Matches",
    link: "/matches",
  },
  {
    title: "Current & Future Series",
    link: "/series/all",
  },
  {
    title: "Matches By Day",
    link: "venues",
  },
];

const seriesColumns: Column<SeriesByMonth>[] = [
  {
    title: "Month",
    classNames: "w-1/5 mr-2",
    dataKey: "month",
    render: (val) => {
      return <span className="font-semibold">{val}</span>;
    },
  },
  {
    title: "Series Name",
    classNames: "w-full mr-2",
    dataKey: "series",
    render: (val, record) => {
      return (
        <div>
          {record.series.map((series) => (
            <div
              key={series.id}
              className="border-b py-2 first:pt-0 last:pb-0 last:border-b-0"
            >
              <div>
                <Link
                  to={getSeriesURL(series.id, series.title)}
                  className="hover:underline"
                >
                  {series.title}
                </Link>
              </div>
              <div className="text-slate-600 text-xs mb-0.5">
                {formatDateTime(series.startTime, "MMM DD")} -{" "}
                {formatDateTime(series.endTime, "MMM DD")}
              </div>
            </div>
          ))}
        </div>
      );
    },
  },
];

const AllSeriesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawSeriesType = (searchParams.get("seriesType") || "") as MatchType;
  const seriesType: MatchTypeFilterType["key"] = MATCH_TYPES_VALUES.includes(
    rawSeriesType
  )
    ? rawSeriesType
    : "all";

  const { data, error, isLoading } = useSeries();

  if (isLoading) return <h3>Loading...</h3>;
  if (error) return <h3>{"Something went wrong " + error.message}</h3>;
  if (!data) return null;

  const renderFilterItem = (item: MatchTypeFilterType) => {
    return item.label;
  };

  const filteredSeries =
    seriesType === "all"
      ? data
      : data.filter((item) => item.seriesType === seriesType);

  return (
    <div className="px-3 py-2 border-2 border-red-400 bg-white">
      <div>
        <div className="text-slate-600 text-sm"></div>
      </div>
      <div className="mt-3">
        <div>
          <div className="flex items-center text-sm border-b-2">
            {navLinks.map((tab, tabIdx) => (
              <div key={tabIdx} className="font-bold cursor-pointer mr-4 ">
                <NavLink
                  to={tab.link}
                  className={({ isActive }) => {
                    let classNames = "block border-b-4 py-1";
                    if (isActive)
                      classNames += " border-green-700 text-green-700";
                    else classNames += " border-transparent text-gray-600";

                    return classNames;
                  }}
                >
                  {tab.title}
                </NavLink>
              </div>
            ))}
          </div>
          <div className="py-3">
            <h3 className="text-2xl font-semibold">Cricket Schedule</h3>
            <div className="border-b py-4">
              <FilterChips
                items={MATCH_TYPE_FILTERS}
                isItemSelected={(item) => item.key === seriesType}
                renderItem={renderFilterItem}
                onFilterClick={(item) =>
                  setSearchParams({
                    seriesType: item.key,
                  })
                }
              />
            </div>

            <div>
              {filteredSeries.length > 0 ? (
                <Table
                  data={filteredSeries}
                  columns={seriesColumns}
                  rowStripes
                />
              ) : (
                <p className="mt-3">There are no series in this category.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllSeriesPage;
