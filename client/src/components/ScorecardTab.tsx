import { useParams } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";
import { Column } from "../entities/table";
import useScorecard from "../hooks/useScorecard";
import {
  fallOfWicketWithPlayerInfo,
  ScorecardBatterWithName,
  ScorecardBowlerWithName,
  ScorecardInnings as ScorecardInningsType,
} from "../types/matchData";
import { DISMISSAL_TYPES } from "../utils/constants";
import { getEconomyRate, getStrikeRate } from "../utils/helpers";
import MatchStatus from "./MatchStatus";
import PlayerLink from "./PlayerLink";
import Table from "./Table";

const batterColumns: Column<ScorecardBatterWithName>[] = [
  {
    title: "Batter",
    classNames: "w-full",
    dataKey: "shortName",
    render: (val) => {
      return <PlayerLink name={val} />;
    },
  },
  {
    title: "",
    classNames: "w-2/6",
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

const fallOfWicketsColumns: Column<{
  batters: ScorecardBatterWithName[];
}>[] = [
  {
    title: "Fall of Wickets",
    classNames: "w-full",
    dataKey: "batters",
    render: (val) => {
      console.log("val is ", val);
      const _val = val as ScorecardBatterWithName[];

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

const bowlerColumns: Column<ScorecardBowlerWithName>[] = [
  {
    title: "Bowler",
    classNames: "w-full",
    dataKey: "shortName",
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
    title: "NB",
    classNames: "w-12",
    dataKey: "bowlNoBalls",
  },
  {
    title: "WD",
    classNames: "w-12",
    dataKey: "bowlWides",
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

interface ScorecardInningsProps {
  innings: ScorecardInningsType;
}

const ScorecardInnings = ({ innings }: ScorecardInningsProps) => {
  const { extras, batters, bowlers, didNotBatBatters } = innings;
  const fallOfWicketBatters = batters
    .filter((batter) => Boolean(batter.fallOfWicket))
    .sort((a, b) => a.fallOfWicket!.teamWickets - b.fallOfWicket!.teamWickets);

  return (
    <div>
      <div className="flex justify-between bg-gray-600 text-white text-sm px-2 py-2">
        <div>{innings.team.name} Innings</div>
        <div>
          {innings.score}-{innings.wickets} ({innings.oversBowled} Ov)
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
          ({innings.wickets} wkts, {innings.oversBowled} Ov)
        </div>
      </div>
      {/* total ends */}

      {/* remaining batters starts */}
      <div className="flex justify-between border-t text-sm px-3 py-1.5">
        <div className="mr-5 min-w-fit">Yet to Bat</div>
        <div>
          {didNotBatBatters.map((batter, batterIdx) => (
            <Fragment key={batter.id}>
              <PlayerLink name={batter.name} />
              {batterIdx + 1 !== didNotBatBatters.length && ", "}
            </Fragment>
          ))}
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

const ScorecardTab = () => {
  const params = useParams();
  const matchId = parseInt(params.matchId!);

  const { data, error, isLoading } = useScorecard(matchId);

  if (isLoading)
    return <div className="text-center mx-2 my-3 text-xl">Loading...</div>;

  if (error && !data) return <h3>{"Something went wrong " + error.message}</h3>;
  if (!data) return <h3>{"Unable to get match commentary"}</h3>;

  return (
    <div>
      <div className="mb-2">
        <MatchStatus>{data.status}</MatchStatus>
      </div>
      {data.innings.map((inn, innIdx) => (
        <ScorecardInnings key={innIdx} innings={inn} />
      ))}
    </div>
  );
};

export default ScorecardTab;
