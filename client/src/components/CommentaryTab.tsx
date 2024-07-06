import { useState } from "react";
import { useParams } from "react-router-dom";
import { Column } from "../entities/table";
import {
  useLatestCommentary,
  useOlderCommentary,
} from "../hooks/useCommentary";
import { CommentaryData } from "../types/commentary";
import {
  ScorecardBatterWithName,
  ScorecardBowlerWithName,
} from "../types/matchData";
import { MATCH_STATES } from "../utils/constants";
import {
  formatOversToInt,
  getEconomyRate,
  getRunRate,
  getStrikeRate,
  oversToballNum,
} from "../utils/helpers";
import Commentary from "./Commentary";
import MatchStatus, { StatusColor } from "./MatchStatus";
import PlayerLink from "./PlayerLink";
import Table from "./Table";
import Spinner from "./elements/Spinner";

const batterColumns: Column<ScorecardBatterWithName>[] = [
  {
    title: "Batter",
    classNames: "w-full",
    dataKey: "name",
    render: (val) => {
      return <PlayerLink name={val} />;
    },
  },
  {
    title: "R",
    classNames: "w-12",
    dataKey: "batRuns",
  },
  {
    title: "B",
    classNames: "w-12",
    dataKey: "ballsPlayed",
  },
  {
    title: "4s",
    classNames: "w-12",
    dataKey: "batFours",
  },
  {
    title: "6s",
    classNames: "w-12",
    dataKey: "batSixes",
  },
  {
    title: "SR",
    classNames: "w-16",
    dataKey: "id",
    render: (val, record) => {
      return getStrikeRate(record.batRuns, record.ballsPlayed);
    },
  },
];

const bowlerColumns: Column<ScorecardBowlerWithName>[] = [
  {
    title: "Bowler",
    classNames: "w-full",
    dataKey: "name",
    render: (val) => {
      return <PlayerLink name={val} />;
    },
  },
  {
    title: "O",
    classNames: "w-12",
    dataKey: "bowlOvers",
  },
  {
    title: "M",
    classNames: "w-12",
    dataKey: "bowlMaidens",
  },
  {
    title: "R",
    classNames: "w-12",
    dataKey: "bowlRuns",
  },
  {
    title: "W",
    classNames: "w-12",
    dataKey: "bowlWickets",
  },
  {
    title: "ECO",
    classNames: "w-16",
    dataKey: "id",
    render: (val, record) => {
      return getEconomyRate(record.bowlRuns, record.bowlOvers);
    },
  },
];

interface Props {
  data: CommentaryData;
}

const MatchScoreHeader = ({ data }: Props) => {
  const batters: ScorecardBatterWithName[] = [];
  if (data.batsmanStriker) batters.push(data.batsmanStriker);
  if (data.batsmanNonStriker) batters.push(data.batsmanNonStriker);

  const bowlers: ScorecardBowlerWithName[] = [];
  if (data.bowlerStriker) bowlers.push(data.bowlerStriker);
  if (data.bowlerNonStriker) bowlers.push(data.bowlerNonStriker);

  let header = null;

  if (data.state === MATCH_STATES.PREVIEW) {
    header = (
      <div>
        <div className="flex items-baseline font-semibold mb-6">
          <div className="text-4xl">20:47</div>
          <div className="text-lg ml-1">30</div>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-sm text-gray-600">START TIME</div>
            <div className="font-medium text-xl">7:30 PM</div>
          </div>
          <div className="font-medium text-xl">
            2:00 PM <span className="text-sm text-gray-500">GMT</span>
          </div>{" "}
          <div className="font-medium text-xl">
            7:30 PM <span className="text-sm text-gray-500">LOCAL</span>
          </div>
        </div>
      </div>
    );
  } else if (data.innings.length === 1) {
    header = (
      <div className="flex items-end">
        <div className="font-bold text-xl leading-5">
          <span className="uppercase">{data.innings[0].team.shortName}</span>{" "}
          {data.innings[0].score}/{data.innings[0].wickets} (
          {formatOversToInt(data.innings[0].oversBowled)})
        </div>

        {data.state !== MATCH_STATES.COMPLETE && (
          <div className="flex text-xs text-gray-700 leading-3 ml-2">
            <div>
              <span className="font-bold">CRR:</span>{" "}
              {getRunRate(
                data.innings[0].score,
                oversToballNum(data.innings[0].oversBowled)
              )}
            </div>
          </div>
        )}
      </div>
    );
  } else if (data.innings.length === 2) {
    const classNames =
      data.state === MATCH_STATES.COMPLETE
        ? "text-gray-500 font-medium mb-2"
        : "font-bold text-xl leading-5 mb-2.5";

    header = (
      <div>
        <div className={`"text-gray-500 ${classNames}`}>
          <span className="uppercase">{data.innings[0].team.shortName}</span>{" "}
          {data.innings[0].score}/{data.innings[0].wickets} (
          {formatOversToInt(data.innings[0].oversBowled)})
        </div>
        <div className="flex items-end">
          <div className="font-bold text-xl leading-5">
            <span className="uppercase">{data.innings[1].team.shortName}</span>{" "}
            {data.innings[1].score}/{data.innings[1].wickets} (
            {formatOversToInt(data.innings[1].oversBowled)})
          </div>
          {data.state === MATCH_STATES.COMPLETE && (
            <div className="flex text-xs text-gray-700 leading-3 ml-2">
              <div>
                <span className="font-bold">CRR:</span>{" "}
                {getRunRate(
                  data.innings[0].score,
                  oversToballNum(data.innings[0].oversBowled)
                )}
              </div>
              <div className="ml-1">
                <span className="font-bold">REQ:</span>{" "}
                {getRunRate(
                  data.innings[0].score - data.innings[1].score + 1,
                  oversToballNum(
                    data.innings[1].overs - data.innings[1].oversBowled
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  let statusColor: StatusColor = "red";
  if (data.state === MATCH_STATES.COMPLETE) statusColor = "blue";
  else if (data.state === MATCH_STATES.PREVIEW) statusColor = "yellow";

  return (
    <div>
      {header}
      {data.status && (
        <div className="mt-4">
          <MatchStatus color={statusColor}>{data.status}</MatchStatus>
        </div>
      )}
      <div className="mt-3">
        <Table data={batters} columns={batterColumns} />
        <Table data={bowlers} columns={bowlerColumns} />
      </div>
    </div>
  );
};

const CommentaryTab = () => {
  const params = useParams();
  const matchId = parseInt(params.matchId!);

  const { data, error, isLoading } = useLatestCommentary(matchId);
  const { refetch } = useOlderCommentary(matchId);
  const [isLoadingOldData, setIsLoadingOldData] = useState(false);

  const handleLoadMore = async () => {
    setIsLoadingOldData(true);
    await refetch();
    setIsLoadingOldData(false);
  };

  if (isLoading)
    return <div className="text-center mx-2 my-3 text-xl">Loading...</div>;

  if (error && !data) return <h3>{"Something went wrong " + error.message}</h3>;
  if (!data) return <h3>{"Unable to get match commentary"}</h3>;

  return (
    <div>
      {/* Header */}
      <div>
        {/* Summary */}
        <MatchScoreHeader data={data} />
        {/* scoreboard */}
        <div className="mt-2">
          {/* <Table data={battersData} columns={battersColumns} /> */}
          <div className="w-full py-3.5 my-4 border-y border-slate-60"></div>
          {/* Commentary */}
          <div className="mt-2">
            <Commentary commentaryList={data.commentaryList} />
            {data.hasMore && (
              <div
                onClick={handleLoadMore}
                className="mt-2 p-1.5 text-sm text-center text-gray-950 rounded border border-slate-300 cursor-pointer hover:bg-gray-200"
              >
                {isLoadingOldData ? (
                  <div className="flex justify-center">
                    <Spinner />
                  </div>
                ) : error ? (
                  error.message
                ) : (
                  "Load More Commentary"
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Body */}
    </div>
  );
};

export default CommentaryTab;
