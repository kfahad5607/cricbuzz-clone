import { useParams } from "react-router-dom";
import TabWithLink, { TabLinkType } from "../components/tabs/TabWithLink";
import useSeriesInfo from "../hooks/useSeriesInfo";
import { formatDateTime } from "../utils/converters";
import { Fragment } from "react/jsx-runtime";
import { MatchFormat } from "../types/matches";

const tabs: TabLinkType[] = [
  {
    title: "Schedule & Results",
    link: "matches",
  },
  {
    title: "Squads",
    link: "squads",
  },
  {
    title: "Venues",
    link: "venues",
  },
];

const MATCH_FORMATS: Record<MatchFormat, string> = {
  test: "Tests",
  odi: "ODIs",
  t20: "T20s",
};

const SeriesPage = () => {
  const { seriesId } = useParams();
  const { data, error, isLoading } = useSeriesInfo(parseInt(seriesId!));

  if (isLoading)
    return <div className="text-center mx-2 my-3 text-xl">Loading...</div>;

  if (error) return <h3>{"Something went wrong " + error.message}</h3>;
  if (!data) return <h3>{"Unable to get match page"}</h3>;

  const startDate = formatDateTime(data.startTime, "MMM DD");
  const endDate = formatDateTime(data.endTime, "MMM DD");

  return (
    <div className="px-3 py-2 border-2 border-red-400 bg-white">
      <div>
        <div className="font-medium text-2xl text-slate-950 mb-2">
          {data.title}
        </div>
        <div className="text-slate-600 text-sm">
          {/* <span>
              {fallOfWicket.teamScore}-{fallOfWicket.teamWickets} (
              <PlayerLink name={batter.shortName} />, {fallOfWicket.overs})
            </span>
            {itemIdx !== _val.length - 1 && <span className="mr-1">,</span>} */}
          {data.matches.map((item, itemIdx) => (
            <Fragment key={item.format}>
              <span>
                {item.count} {MATCH_FORMATS[item.format]}
              </span>
              {itemIdx !== data.matches.length - 1 && (
                <span className="mr-1">,</span>
              )}
            </Fragment>
          ))}
          <span className="ml-1.5 mr-0.5 font-bold">.</span>{" "}
          <span>
            {startDate} - {endDate}
          </span>
        </div>
      </div>
      <div className="mt-3">
        <TabWithLink tabs={tabs} />
      </div>
    </div>
  );
};

export default SeriesPage;
