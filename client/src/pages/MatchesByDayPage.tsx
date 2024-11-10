import { Link, NavLink, useSearchParams } from "react-router-dom";
import FilterChips from "../components/elements/FilterChips";
import {
  MATCH_TYPE_FILTERS,
  MatchTypeFilterType,
} from "../components/ScheduledMatchesTab";
import { TabLinkType } from "../components/tabs/TabWithLink";
import { MatchesByDay, useMatchesByDay } from "../hooks/useMatches";
import myDayjs from "../services/dayjs";
import { Match, MatchType } from "../types/matches";
import { MATCH_TYPES_VALUES } from "../utils/constants";
import { getMatchSlug, getSeriesURL } from "../utils/converters";

interface MatchRowProps {
  match: Match;
}

interface SeriesRowProps {
  series: MatchesByDay["series"][number];
}

const navLinks: TabLinkType[] = [
  {
    title: "Current Matches",
    link: "/matches",
  },
  {
    title: "Current & Future Series",
    link: "/series",
  },
  {
    title: "Matches By Day",
    link: "/matches-by-day",
  },
];

const MatchRow = ({ match }: MatchRowProps) => {
  const startTime = myDayjs(match.startTime).utc();
  const utcTime = startTime.format("hh:mm A");
  const userTime = startTime.local().format("hh:mm A");
  const localTime = startTime.tz("Asia/Kolkata").format("hh:mm A");

  return (
    <div className="flex">
      <div className="px-1.5 py-1.5 grow mr-2">
        <div>
          <Link
            to={`/matches/${match.id}/${getMatchSlug({
              description: match.description,
              series: match.series,
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
            })}`}
            className="hover:underline"
          >
            {match.homeTeam.name} v {match.awayTeam.name}, {match.description}
          </Link>
        </div>
        <div className="text-slate-600">
          {match.venue.name}, {match.venue.city}
        </div>
      </div>
      <div className="pe-3 px-1.5 py-1.5 w-1/3">
        <div>{userTime}</div>
        <div className="text-slate-500 text-[13px] mt-0.5">
          {utcTime} GMT / {localTime} LOCAL
        </div>
      </div>
    </div>
  );
};

const SeriesRow = ({ series }: SeriesRowProps) => {
  return (
    <div className="flex items-start py-1.5 border-b last:border-0 text-sm">
      <div className="ps-3 px-1.5 py-1.5 w-1/4 mr-2 font-semibold">
        <Link
          to={getSeriesURL(series.id, series.title)}
          className="hover:underline"
        >
          {series.title}
        </Link>
      </div>
      <div className="grow">
        {series.matches.map((match) => (
          <MatchRow key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
};

const MatchesByDayPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawMatchType = (searchParams.get("matchType") || "") as MatchType;
  const matchType: MatchTypeFilterType["key"] = MATCH_TYPES_VALUES.includes(
    rawMatchType
  )
    ? rawMatchType
    : "all";

  const { data, error, isLoading } = useMatchesByDay();

  if (isLoading) return <h3>Loading...</h3>;
  if (error) return <h3>{"Something went wrong " + error.message}</h3>;
  if (!data) return null;

  const renderFilterItem = (item: MatchTypeFilterType) => {
    return item.label;
  };

  const filteredMatches =
    matchType === "all"
      ? data
      : data.filter((item) => item.matchType === matchType);

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
                isItemSelected={(item) => item.key === matchType}
                renderItem={renderFilterItem}
                onFilterClick={(item) =>
                  setSearchParams({
                    matchType: item.key,
                  })
                }
              />
            </div>
            <div>
              {filteredMatches.length > 0 ? (
                filteredMatches.map((item, itemIdx) => (
                  <div key={itemIdx} className="mb-3">
                    <div className="px-2.5 py-1.5 bg-gray-300 font-medium">
                      {item.day}
                    </div>
                    {item.series.map((series) => (
                      <SeriesRow key={series.id} series={series} />
                    ))}
                  </div>
                ))
              ) : (
                <p className="mt-3">There are no matches in this category.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchesByDayPage;
