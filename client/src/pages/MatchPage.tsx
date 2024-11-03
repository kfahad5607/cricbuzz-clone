import { Link, useParams } from "react-router-dom";
import TabWithLink, { TabLinkType } from "../components/tabs/TabWithLink";
import useMatchInfo from "../hooks/useMatchInfo";
import { formatDateTime } from "../utils/converters";
import slugify from "slugify";

const tabs: TabLinkType[] = [
  {
    title: "Commentary",
    link: "commentary",
  },
  {
    title: "Scorecard",
    link: "scorecard",
  },
  {
    title: "Squads",
    link: "squads",
  },
  {
    title: "Highlights",
    link: "highlights",
  },
  {
    title: "Full Commentary",
    link: "full-commentary",
  },
];

const MatchPage = () => {
  const { matchId } = useParams();
  const { data, error, isLoading } = useMatchInfo(parseInt(matchId!));

  if (isLoading)
    return <div className="text-center mx-2 my-3 text-xl">Loading...</div>;

  if (error) return <h3>{"Something went wrong " + error.message}</h3>;
  if (!data) return <h3>{"Unable to get match page"}</h3>;

  const seriesLink = `/series/${data.series.id}/${slugify(data.series.title)}`;

  return (
    <div className="px-3 py-2 border-2 border-red-400 bg-white">
      <div>
        <div className="font-bold text-xl text-slate-950">
          {data.homeTeam.name} vs {data.awayTeam.name}, {data.description} -
          Live Cricket Score, Commentary
        </div>
        <div className="flex flex-wrap mt-1">
          <div className="text-sm text-gray-600 mr-5">
            <span className="font-bold">Series:</span>
            <Link to={seriesLink} className="ml-1 hover:underline">
              {data.series.title}
            </Link>
          </div>
          <div className="text-sm text-gray-600 mr-5">
            <span className="font-bold">Venue:</span>
            <span className="ml-1">
              {data.venue.name}, {data.venue.city}
            </span>
          </div>
          <div className="text-sm text-gray-600 mr-5">
            <span className="font-bold">Date & Time:</span>
            <span className="ml-1">{formatDateTime(data.startTime)}</span>
          </div>
        </div>
        <div className="mt-3">
          <TabWithLink tabs={tabs} />
        </div>
      </div>
    </div>
  );
};

export default MatchPage;
