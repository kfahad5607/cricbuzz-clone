import { useState } from "react";
import { useParams } from "react-router-dom";
import { Column } from "../entities/table";
import {
  useLatestCommentary,
  useOlderCommentary,
} from "../hooks/useCommentary";
import useMatchInfo from "../hooks/useMatchInfo";
import type { CommentaryData } from "../types/commentary";
import type {
  ScorecardBatterWithInfo,
  ScorecardBowlerWithInfo,
} from "../types/matchData";
import { MatchInfo } from "../types/matches";
import { MATCH_STATES } from "../utils/constants";
import {
  formatOversToInt,
  getEconomyRate,
  getRunRate,
  getStatusText,
  getStatusTextColor,
  getStrikeRate,
  oversToballNum,
} from "../utils/converters";
import Commentary from "./Commentary";
import MatchStatus from "./MatchStatus";
import PlayerLink from "./PlayerLink";
import Table from "./Table";
import CountDown from "./elements/CountDown";
import Spinner from "./elements/Spinner";
import myDayjs from "../services/dayjs";

const batterColumns: Column<ScorecardBatterWithInfo>[] = [
  {
    title: "Batter",
    classNames: "w-full",
    dataKey: "name",
    render: (val, record) => {
      return (
        <div className="flex">
          <PlayerLink name={val} />
          {record.isStriker && <div className="ml-1 text-xs">*</div>}
        </div>
      );
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

const bowlerColumns: Column<ScorecardBowlerWithInfo>[] = [
  {
    title: "Bowler",
    classNames: "w-full",
    dataKey: "name",
    render: (val, record) => {
      return (
        <div className="flex">
          <PlayerLink name={val} />
          {record.isStriker && <div className="ml-1 text-xs">*</div>}
        </div>
      );
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
  matchInfo: MatchInfo;
}

const TIME_FORMAT = "hh:mm A";


const MatchScoreHeader = ({ data, matchInfo }: Props) => {
  const batters: ScorecardBatterWithInfo[] = [];
  if (data.batsmanStriker) batters.push(data.batsmanStriker);
  if (data.batsmanNonStriker) batters.push(data.batsmanNonStriker);

  const bowlers: ScorecardBowlerWithInfo[] = [];
  if (data.bowlerStriker) bowlers.push(data.bowlerStriker);
  if (data.bowlerNonStriker) bowlers.push(data.bowlerNonStriker);

  const isMatchComplete = data.state === MATCH_STATES.COMPLETE;
  let header = null;

  if (data.innings.length === 1) {
    header = (
      <div className="flex items-end">
        <div className="font-bold text-xl leading-5">
          <span className="uppercase">{data.innings[0].team.shortName}</span>{" "}
          {data.innings[0].score}/{data.innings[0].wickets} (
          {formatOversToInt(data.innings[0].oversBowled)})
        </div>

        {!isMatchComplete && (
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
    const classNames = isMatchComplete
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
          {!isMatchComplete && (
            <div className="flex text-xs text-gray-700 leading-3 ml-2">
              <div>
                <span className="font-bold">CRR:</span>{" "}
                {getRunRate(
                  data.innings[1].score,
                  oversToballNum(data.innings[1].oversBowled)
                )}
              </div>
              <div className="ml-1">
                <span className="font-bold">REQ:</span>{" "}
                {getRunRate(
                  data.innings[0].score - data.innings[1].score + 1,
                  oversToballNum(data.innings[1].overs) -
                    oversToballNum(data.innings[1].oversBowled)
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } else {
    const startTime = myDayjs(matchInfo.startTime).utc();
    const currentTime = myDayjs().utc();
    const utcTime = startTime.format(TIME_FORMAT);
    const userTime = startTime.local().format(TIME_FORMAT);
    const localTime = startTime.tz("Asia/Kolkata").format(TIME_FORMAT);
    const timeLeft = startTime.diff(currentTime, "s");

    header = (
      <div>
        <CountDown time={timeLeft} />
        <div className="flex justify-between items-end">
          <div>
            <div className="text-sm text-gray-600">START TIME</div>
            <div className="font-medium text-xl">{userTime}</div>
          </div>
          <div className="font-medium text-xl">
            {utcTime} <span className="text-sm text-gray-500">GMT</span>
          </div>{" "}
          <div className="font-medium text-xl">
            {localTime} <span className="text-sm text-gray-500">LOCAL</span>
          </div>
        </div>
      </div>
    );
  }

  const matchStatus = getStatusText(data);

  return (
    <div>
      {header}
      {matchStatus && (
        <div className="mt-4">
          <MatchStatus color={getStatusTextColor(data.state)}>
            {matchStatus}
          </MatchStatus>
        </div>
      )}
      {!isMatchComplete && batters.length > 0 && bowlers.length > 0 && (
        <div className="mt-3">
          <Table data={batters} columns={batterColumns} rowAlignment="center" />
          <Table data={bowlers} columns={bowlerColumns} rowAlignment="center" />
        </div>
      )}
    </div>
  );
};

const CommentaryTab = () => {
  const params = useParams();
  const matchId = parseInt(params.matchId!);

  const { data: matchInfo } = useMatchInfo(matchId!);
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

  let startTime = myDayjs(matchInfo!.startTime).utc();
  let currentTime = myDayjs().utc();
  let diff: number = startTime.diff(currentTime, "d");

  if (diff >= 1)
    return <h3>The commentary will appear once the match starts.</h3>;

  return (
    <div className="w-3/5 py-4">
      {/* Summary */}
      <MatchScoreHeader data={data} matchInfo={matchInfo!} />
      {/* scoreboard */}
      <div className="mt-2">
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
  );
};

export default CommentaryTab;
