import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import TabWithLink, { TabLinkType } from "../components/tabs/TabWithLink";
import useMatchInfo from "../hooks/useMatchInfo";
import { DATE_TIME_FORMAT } from "../utils/constants";

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
];

const MatchPage = () => {
  const { matchId } = useParams();
  const { data, error, isLoading } = useMatchInfo(parseInt(matchId!));

  if (isLoading)
    return <div className="text-center mx-2 my-3 text-xl">Loading...</div>;

  if (error) return <h3>{"Something went wrong " + error.message}</h3>;
  if (!data) return <h3>{"Unable to get match page"}</h3>;

  console.log("data ", data);

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
            <span className="ml-1">{data.series.title}</span>
          </div>
          <div className="text-sm text-gray-600 mr-5">
            <span className="font-bold">Venue:</span>
            <span className="ml-1">
              {data.venue.name}, {data.venue.city}
            </span>
          </div>
          <div className="text-sm text-gray-600 mr-5">
            <span className="font-bold">Date & Time:</span>
            <span className="ml-1">
              {dayjs(data.startTime).format(DATE_TIME_FORMAT)}
            </span>
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
