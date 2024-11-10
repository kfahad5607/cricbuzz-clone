import clsx from "clsx";
import { FiChevronRight } from "react-icons/fi";
import { Link, useParams, useSearchParams } from "react-router-dom";
import slugify from "slugify";
import { ScheduleType, useScheduledMatches } from "../hooks/useMatches";
import myDayjs from "../services/dayjs";
import { MatchFullCard, MatchType } from "../types/matches";
import { MATCH_TYPES, MATCH_TYPES_VALUES } from "../utils/constants";
import {
  getMatchSlug,
  getStatusText,
  getStatusTextColor,
} from "../utils/converters";
import MatchStatus from "./MatchStatus";
import FilterChips from "./elements/FilterChips";

interface MatchCardProps {
  match: MatchFullCard;
}

type MatchTypeFilterType = {
  label: string;
  key: "all" | MatchType;
};

const MATCH_CARD_LINKS = {
  started: [
    {
      label: "Live Score",
      href: "commentary",
    },
    {
      label: "Scorecard",
      href: "scorecard",
    },
    {
      label: "Full Commentary",
      href: "full-commentary",
    },
  ],
  notStarted: [
    {
      label: "Match Facts",
      href: "scorecard",
    },
  ],
};

const MATCH_TYPE_FILTERS: MatchTypeFilterType[] = [
  {
    label: "All",
    key: "all",
  },
  {
    label: "International",
    key: MATCH_TYPES.INTERNATIONAL,
  },
  {
    label: "Domestic",
    key: MATCH_TYPES.DOMESTIC,
  },
  {
    label: "T20 Leagues",
    key: MATCH_TYPES.LEAGUE,
  },
];

const SchedulesMatchesTab = () => {
  const { scheduleType = "live" } = useParams<{
    scheduleType: ScheduleType;
  }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const rawScheduleType = (searchParams.get("scheduleType") || "") as MatchType;
  const matchType: MatchTypeFilterType["key"] = MATCH_TYPES_VALUES.includes(
    rawScheduleType
  )
    ? rawScheduleType
    : "all";

  const { data, error, isLoading } = useScheduledMatches(scheduleType);

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
    <div>
      <div className="border-b-2 mb-4 py-3.5">
        <FilterChips
          items={MATCH_TYPE_FILTERS}
          isItemSelected={(item) => item.key === matchType}
          renderItem={renderFilterItem}
          onFilterClick={(item) =>
            setSearchParams({
              scheduleType: item.key,
            })
          }
        />
      </div>
      <div className="w-3/4">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))
        ) : (
          <p>There are no matches in this category.</p>
        )}
      </div>
    </div>
  );
};

const MatchCard = ({ match }: MatchCardProps) => {
  let firstTeam = match.homeTeam;
  let secondTeam = match.awayTeam;

  if (match.innings[0]?.team.id === secondTeam.id) {
    [firstTeam, secondTeam] = [secondTeam, firstTeam];
  }

  const matchCardLinkKey = match.innings.length > 0 ? "started" : "notStarted";
  const matchSlug = getMatchSlug(match);
  const baseMatchPageUrl = `/matches/${match.id}/${matchSlug}`;

  const currentTime = myDayjs().utc().local();
  const startTime = myDayjs(match.startTime).utc().local();
  const diff = startTime.diff(currentTime, "d");
  const day = diff === 0 ? "Today" : startTime.format("MMM DD");
  const time = startTime.format("H:M A");

  return (
    <div key={match.id} className="mb-6">
      <div className="px-2.5 py-1.5 bg-gray-300 font-medium">
        <Link
          to={`/series/${match.series.id}/${slugify(match.series.title)}`}
          className="hover:underline"
        >
          {match.series.title}
        </Link>
      </div>
      <div className="px-2 py-3">
        <div>
          <span className="font-semibold">
            <Link to={baseMatchPageUrl} className="hover:underline">
              {match.homeTeam.name} vs {match.awayTeam.name}
            </Link>
          </span>
          <span className="text-sm text-gray-600">, {match.description}</span>
        </div>
        <div className="mb-2.5 text-sm text-gray-600">
          {day} <span className="mx-1">•</span> {time} at{" "}
          <span className="capitalize">{match.venue.city}</span>,{" "}
          {match.venue.name}
        </div>
        <Link to={baseMatchPageUrl}>
          <div className="inline-flex items-center gap-x-6 bg-gray-200 border-l-2 border-gray-200 border-l-red-600 py-3 pl-3.5 pr-1">
            <div className="pr-5 text-sm">
              {match.innings.length > 0 && (
                <div className="mb-1 font-semibold">
                  <div
                    className={clsx(
                      "mb-0.5",
                      match.innings.length === 1
                        ? "text-slate-900"
                        : "text-slate-600"
                    )}
                  >
                    <span className="mr-6 uppercase">
                      {firstTeam.shortName}
                    </span>
                    <span>
                      {match.innings[0].score}-{match.innings[0].wickets} (
                      {match.innings[0].oversBowled} Ovs)
                    </span>
                  </div>
                  <div
                    className={clsx(
                      match.innings.length === 2
                        ? "text-slate-900"
                        : "text-slate-600"
                    )}
                  >
                    <span className="mr-6 uppercase">
                      {secondTeam.shortName}
                    </span>
                    {match.innings[1] && (
                      <span>
                        {match.innings[1].score}-{match.innings[1].wickets} (
                        {match.innings[1].oversBowled} Ovs)
                      </span>
                    )}
                  </div>
                </div>
              )}
              <MatchStatus color={getStatusTextColor(match.state)}>
                {getStatusText(match) ||
                  (match.state === "preview" ? "Read Preview" : "Match Facts")}
              </MatchStatus>
            </div>
            <div>
              <FiChevronRight size={22} />
            </div>
          </div>
        </Link>
        <div className="mt-4 text-sm flex items-center">
          {MATCH_CARD_LINKS[matchCardLinkKey].map((link, linkIdx) => (
            <div
              key={linkIdx}
              className="text-blue-600 leading-none px-2.5 border-l first:border-l-0 first:pl-0 border-gray-950"
            >
              <Link
                to={`${baseMatchPageUrl}/${link.href}`}
                className="hover:underline"
              >
                {link.label}{" "}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchedulesMatchesTab;
