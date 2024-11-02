import { useParams } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";
import { Column } from "../entities/table";
import useMatchInfo from "../hooks/useMatchInfo";
import useScorecard from "../hooks/useScorecard";
import type {
  fallOfWicketWithPlayerInfo,
  ScorecardBatterWithInfo,
  ScorecardBowlerWithInfo,
  ScorecardInnings as ScorecardInningsType,
} from "../types/matchData";
import { DISMISSAL_TYPES } from "../utils/constants";
import {
  formatDateTime,
  formatOversToInt,
  getEconomyRate,
  getStatusText,
  getStatusTextColor,
  getStrikeRate,
} from "../utils/helpers";
import MatchStatus from "./MatchStatus";
import PlayerLink from "./PlayerLink";
import Table from "./Table";
import { MatchInfo } from "../types/matches";

const getPlayerName = (
  player: Pick<ScorecardBatterWithInfo, "name" | "isCaptain" | "isKeeper">
) => {
  let designation = "";
  if (player.isCaptain) designation = "c";
  if (player.isKeeper) {
    designation = designation ? designation + " & wk" : "wk";
  }

  return `${player.name}${designation && ` (${designation})`}`;
};

const batterColumns: Column<ScorecardBatterWithInfo>[] = [
  {
    title: "Batter",
    classNames: "w-1/5 mr-2",
    dataKey: "shortName",
    render: (val, record) => {
      return <PlayerLink name={getPlayerName(record)} />;
    },
  },
  {
    title: "",
    classNames: "grow",
    dataKey: "fallOfWicket",
    render: (val) => {
      let statement = "not out";
      if (val) {
        const _val = val as fallOfWicketWithPlayerInfo;
        const dismissal = _val.dismissalType;

        switch (dismissal) {
          case DISMISSAL_TYPES.BOWLED:
            statement = `b ${_val.bowler?.shortName}`;
            break;
          case DISMISSAL_TYPES.CAUGHT:
            if (_val.helpers.length === 0)
              statement = `c & b ${_val.bowler?.shortName}`;
            else
              statement = `c ${_val.helpers[0].shortName} b ${_val.bowler?.shortName}`;
            break;
          case DISMISSAL_TYPES.LBW:
            statement = `lbw ${_val.bowler?.shortName}`;
            break;
          case DISMISSAL_TYPES.STUMPED:
            statement = `st ${_val.helpers[0].shortName} b ${_val.bowler?.shortName}`;
            break;
          case DISMISSAL_TYPES.RUN_OUT:
            statement = `run out ${_val.helpers
              .map((helper) => helper.shortName)
              .join("/")}`;
            break;
          case DISMISSAL_TYPES.RETIRED:
            statement = `retired`;
            break;
          case DISMISSAL_TYPES.HIT_THE_BALL_TWICE:
            statement = `hit twice b ${_val.bowler?.shortName}`;
            break;
          case DISMISSAL_TYPES.HIT_WICKET:
            statement = `hit wicket b ${_val.bowler?.shortName}`;
            break;
          case DISMISSAL_TYPES.OBSTRUCT_FIELD:
            statement = "obs";
            break;
          case DISMISSAL_TYPES.HANDLED_BALL:
            statement = "handled";
            break;
          case DISMISSAL_TYPES.TIMED_OUT:
            statement = "timed out";
            break;

          default:
            statement = dismissal;
            break;
        }
      }

      return <div className="text-gray-600"> {statement}</div>;
    },
  },
  {
    title: "R",
    classNames: "w-12 text-right",
    dataKey: "batRuns",
  },
  {
    title: "B",
    classNames: "w-12 text-right",
    dataKey: "ballsPlayed",
  },
  {
    title: "4s",
    classNames: "w-12 text-right",
    dataKey: "batFours",
  },
  {
    title: "6s",
    classNames: "w-12 text-right",
    dataKey: "batSixes",
  },
  {
    title: "SR",
    classNames: "w-1/12 ml-2 pr-4 text-right",
    dataKey: "id",
    render: (val, record) => {
      return getStrikeRate(record.batRuns, record.ballsPlayed);
    },
  },
];

const fallOfWicketsColumns: Column<{
  batters: ScorecardBatterWithInfo[];
}>[] = [
  {
    title: "Fall of Wickets",
    classNames: "w-full",
    dataKey: "batters",
    render: (val) => {
      const _val = val as ScorecardBatterWithInfo[];

      return _val.map((batter, itemIdx) => {
        const fallOfWicket = batter.fallOfWicket;

        if (!fallOfWicket) return null;

        return (
          <Fragment key={fallOfWicket.teamWickets}>
            <span>
              {fallOfWicket.teamScore}-{fallOfWicket.teamWickets} (
              <PlayerLink name={batter.shortName} />, {fallOfWicket.overs})
            </span>
            {itemIdx !== _val.length - 1 && <span className="mr-1">,</span>}
          </Fragment>
        );
      });
    },
  },
];

const bowlerColumns: Column<ScorecardBowlerWithInfo>[] = [
  {
    title: "Bowler",
    classNames: "grow",
    dataKey: "shortName",
    render: (val) => {
      return <PlayerLink name={val} />;
    },
  },
  {
    title: "O",
    classNames: "w-12 text-right",
    dataKey: "bowlOvers",
  },
  {
    title: "M",
    classNames: "w-12 text-right",
    dataKey: "bowlMaidens",
  },
  {
    title: "R",
    classNames: "w-12 text-right",
    dataKey: "bowlRuns",
  },
  {
    title: "W",
    classNames: "w-12 text-right",
    dataKey: "bowlWickets",
  },
  {
    title: "NB",
    classNames: "w-12 text-right",
    dataKey: "bowlNoBalls",
  },
  {
    title: "WD",
    classNames: "w-12 text-right",
    dataKey: "bowlWides",
  },
  {
    title: "ECO",
    classNames: "w-1/12 ml-2 pr-4 text-right",
    dataKey: "id",
    render: (val, record) => {
      return getEconomyRate(record.bowlRuns, record.bowlOvers);
    },
  },
];

interface ScorecardInningsProps {
  innings: ScorecardInningsType;
}

interface TeamSquadProps {
  team: MatchInfo["homeTeam"];
}

const ScorecardInnings = ({ innings }: ScorecardInningsProps) => {
  const { extras, batters, bowlers, didNotBatBatters } = innings;
  const fallOfWicketBatters = batters
    .filter((batter) => Boolean(batter.fallOfWicket))
    .sort((a, b) => a.fallOfWicket!.teamWickets - b.fallOfWicket!.teamWickets);

  const oversBowled = formatOversToInt(innings.oversBowled);

  return (
    <div className="mb-2.5">
      <div className="flex justify-between bg-gray-600 text-white text-sm px-2 py-2">
        <div>{innings.team.name} Innings</div>
        <div>
          {innings.score}-{innings.wickets} ({oversBowled} Ov)
        </div>
      </div>
      {/* Scorecard table */}
      {/* Batters starts */}
      <Table data={batters} columns={batterColumns} rowStripes />
      {/* Batters ends */}
      {/* extras starts */}
      <div className="flex border-t text-sm px-3 py-1.5">
        <div className="mr-5 flex-grow">Extras</div>
        <div className="font-bold mr-1">4</div>
        <div className="w-1/3 pr-8">
          (b {extras.byes}, lb {extras.legByes}, w {extras.wides}, nb{" "}
          {extras.nos}, p {extras.penalties})
        </div>
      </div>
      {/* extras ends */}
      {/* total starts */}
      <div className="flex border-t text-sm px-3 py-1.5">
        <div className="mr-5 flex-grow">Total</div>
        <div className="font-bold mr-1">{innings.score}</div>
        <div className="w-1/3 pr-8">
          ({innings.wickets} wkts, {oversBowled} Ov)
        </div>
      </div>
      {/* total ends */}

      {/* remaining batters starts */}
      <div className="flex justify-between border-t text-sm px-3 py-1.5">
        <div className="mr-5 min-w-fit">Yet to Bat</div>
        <div>
          {didNotBatBatters.map((batter, batterIdx) => {
            let designation = "";
            if (batter.isCaptain) designation = "c";
            if (batter.isKeeper) {
              designation = designation ? designation + " & wk" : "wk";
            }
            const name = `${batter.name}${designation && ` (${designation})`}`;

            return (
              <Fragment key={batter.id}>
                <PlayerLink name={name} />
                {batterIdx + 1 !== didNotBatBatters.length && ", "}
              </Fragment>
            );
          })}
        </div>
      </div>
      {/* remaining batters ends */}
      {/* FOW starts */}
      <Table
        data={[{ batters: fallOfWicketBatters }]}
        columns={fallOfWicketsColumns}
      />
      {/* FOW ends */}
      {/* Bowler starts */}
      <Table data={bowlers} columns={bowlerColumns} rowStripes />
      {/* Bowler ends */}
    </div>
  );
};

const TeamSquad = ({ team }: TeamSquadProps) => {
  if (team.players.playingXi.length + team.players.bench.length === 0)
    return null;

  return (
    <Fragment>
      <div className="flex justify-between px-2 pt-2.5 pb-1 border-t">
        {team.name} Squad
      </div>
      {team.players.playingXi.length === 0 ? (
        <div className="flex justify-between px-2 py-1.5">
          <div className="grow">
            {team.players.bench
              .concat(team.players.substitutes)
              .map((player, playerIdx, playingXi) => (
                <Fragment key={player.id}>
                  <PlayerLink
                    name={getPlayerName(player)}
                    className="text-black"
                  />
                  {playerIdx + 1 !== playingXi.length && ", "}
                </Fragment>
              ))}
          </div>
        </div>
      ) : (
        <Fragment>
          <div className="flex justify-between px-2 py-1.5">
            <div className="w-1/4 shrink-0">Playing</div>
            <div className="grow">
              {team.players.playingXi.map((player, playerIdx, playingXi) => (
                <Fragment key={player.id}>
                  <PlayerLink
                    name={getPlayerName(player)}
                    className="text-black"
                  />
                  {playerIdx + 1 !== playingXi.length && ", "}
                </Fragment>
              ))}
            </div>
          </div>
          <div className="flex justify-between px-2 pt-1.5 pb-2">
            <div className="w-1/4 shrink-0">Bench</div>
            <div className="grow">
              {team.players.substitutes
                .concat(team.players.bench)
                .map((player, playerIdx, playingXi) => (
                  <Fragment key={player.id}>
                    <PlayerLink
                      name={getPlayerName(player)}
                      className="text-black"
                    />
                    {playerIdx + 1 !== playingXi.length && ", "}
                  </Fragment>
                ))}
            </div>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

const ScorecardTab = () => {
  const params = useParams();
  const matchId = parseInt(params.matchId!);

  const {
    data: matchInfo,
    error: matchInfoErr,
    isLoading: matchInfoLoading,
  } = useMatchInfo(matchId);
  const { data, error, isLoading } = useScorecard(matchId);

  if (isLoading || matchInfoLoading)
    return <div className="text-center mx-2 my-3 text-xl">Loading...</div>;

  if (matchInfoErr)
    return <h3>{"Something went wrong " + matchInfoErr.message}</h3>;
  if (error) return <h3>{"Something went wrong " + error.message}</h3>;
  if (!data) return <h3>{"Unable to get match commentary"}</h3>;
  if (!matchInfo) return <h3>{"Unable to get match info"}</h3>;

  const matchStatus = getStatusText(data);

  return (
    <div className="w-3/5">
      {matchStatus && (
        <div className="mb-2">
          <MatchStatus color={getStatusTextColor(data.state)}>
            {matchStatus}
          </MatchStatus>
        </div>
      )}
      {data.innings.length === 0 ? (
        <h3 className="mb-3">
          The scorecard will appear once the match starts.
        </h3>
      ) : (
        data.innings.map((inn, innIdx) => (
          <ScorecardInnings key={innIdx} innings={inn} />
        ))
      )}

      {/* Match Info */}
      <div>
        <div className="bg-gray-600 text-white text-sm px-2 py-2">
          Match Info
        </div>
        <div className="text-sm">
          <div className="flex justify-between px-2 py-2 border-b">
            <div className="w-1/4 shrink-0">Match</div>
            <div className="grow">
              {matchInfo.homeTeam.shortName.toUpperCase()} vs{" "}
              {matchInfo.awayTeam.shortName.toUpperCase()},{" "}
              {matchInfo.description}, {matchInfo.series.title}
            </div>
          </div>
          <div className="flex justify-between px-2 py-2 border-b">
            <div className="w-1/4 shrink-0">Date</div>
            <div className="grow">
              {formatDateTime(matchInfo.startTime, "dddd, MMMM DD, YYYY")}
            </div>
          </div>
          {data.tossResults && (
            <div className="flex justify-between px-2 py-2 border-b">
              <div className="w-1/4 shrink-0">Toss</div>
              <div className="grow">
                {data.tossResults.winnerTeam.name} won the toss and opt to{" "}
                {data.tossResults.decision}
              </div>
            </div>
          )}
          <div className="flex justify-between px-2 py-2 border-b">
            <div className="w-1/4 shrink-0">Time</div>
            <div className="grow">
              {formatDateTime(matchInfo.startTime, "hh:mm A")}
            </div>
          </div>
          <div className="flex justify-between px-2 py-2">
            <div className="w-1/4 shrink-0">Venue</div>
            <div className="grow">
              {matchInfo.venue.name},{" "}
              <span className="capitalize">{matchInfo.venue.city}</span>
            </div>
          </div>
          <TeamSquad team={matchInfo.homeTeam} />
          <TeamSquad team={matchInfo.awayTeam} />
        </div>
      </div>
    </div>
  );
};

export default ScorecardTab;
