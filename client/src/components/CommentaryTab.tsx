import { useState } from "react";
import { useParams } from "react-router-dom";
import { Column, RowData } from "../entities/table";
import {
  useLatestCommentary,
  useOlderCommentary,
} from "../hooks/useMatchCommentary";
import { MATCH_STATES } from "../utils/constants";
import { formatOversToInt } from "../utils/helpers";
import { getTeamById } from "../utils/query";
import Commentary from "./Commentary";
import MatchStatus from "./MatchStatus";
import PlayerLink from "./PlayerLink";
import Spinner from "./elements/Spinner";

const battersColumns: Column[] = [
  {
    title: "Batter",
    classNames: "w-full",
    dataKey: "player",
    render: (val, record) => {
      let designation = "";
      if (record?.isCaptain) designation = "c";
      if (record?.isKeeper) {
        designation = designation ? designation + " & wk" : "wk";
      }

      let playerName = `${val} ${designation && `(${designation})`}`;

      return <PlayerLink name={playerName} />;
    },
  },
  {
    title: "R",
    classNames: "w-12",
    dataKey: "runsScored",
    render: (val) => {
      return <div className="font-bold"> {val}</div>;
    },
  },
  {
    title: "B",
    classNames: "w-12",
    dataKey: "ballsPlayed",
  },
  {
    title: "4s",
    classNames: "w-12",
    dataKey: "fours",
  },
  {
    title: "6s",
    classNames: "w-12",
    dataKey: "sixes",
  },
  {
    title: "SR",
    classNames: "w-16",
    dataKey: "sr",
  },
];

const battersData: RowData[] = [
  {
    player: "KL Rahul",
    dismissal: "c T Natarajan b Cummins",
    runsScored: 29,
    ballsPlayed: 33,
    fours: 1,
    sixes: 1,
    sr: 87.88,
    isCaptain: true,
    isKeeper: true,
  },
  {
    player: "Quinton de Kock",
    dismissal: "c Nitish Reddy b Bhuvneshwar",
    runsScored: 29,
    ballsPlayed: 33,
    fours: 1,
    sixes: 1,
    sr: 87.88,
  },
];

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

  const teamOne = getTeamById(data.innings[0].teamId, matchId);
  const teamTwo = getTeamById(data.innings[1].teamId, matchId);

  return (
    <div>
      {/* Header */}
      <div>
        {/* Summary */}
        <div>
          {data.state === MATCH_STATES.COMPLETE && (
            <>
              {/* <div className="text-gray-500 mb-2">
                <span className="uppercase">{teamOne?.shortName}</span>{" "}
                {data.innings[0].score}/{data.innings[0].wickets} (
                {formatOvers(data.innings[0].oversBowled)})
              </div> */}
              <div>
                <div className="font-bold text-xl leading-5 text-gray-500 mb-2.5">
                  <span className="uppercase">{teamOne?.shortName}</span>{" "}
                  {data.innings[0].score}/{data.innings[0].wickets} (
                  {formatOversToInt(data.innings[0].oversBowled)})
                </div>
                <div className="font-bold text-xl leading-5">
                  <span className="uppercase">{teamTwo?.shortName}</span>{" "}
                  {data.innings[1].score}/{data.innings[1].wickets} (
                  {formatOversToInt(data.innings[1].oversBowled)})
                </div>
              </div>

              <div className="mt-5">
                <MatchStatus color="blue">
                  Chennai Super Kings won by 6 wkts
                </MatchStatus>
              </div>
            </>
          )}
        </div>
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
