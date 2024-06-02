import { Fragment } from "react/jsx-runtime";
import { Column, RowData } from "../entities/table";
import { formatBallNum } from "../utils/helpers";
import MatchStatus from "./MatchStatus";
import PlayerLink from "./PlayerLink";
import Table from "./Table";

const battersColumns: Column[] = [
  {
    title: "Batter",
    classNames: "w-1/4",
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
    title: "",
    classNames: "w-2/6",
    dataKey: "dismissal",
    render: (val) => {
      return <div className="text-gray-600"> {val}</div>;
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
  {
    player: "Marcus Stoinis",
    dismissal: "c Sanvir Singh b Bhuvneshwar",
    runsScored: 29,
    ballsPlayed: 33,
    fours: 1,
    sixes: 1,
    sr: 87.88,
  },
  {
    player: "Krunal Pandya",
    dismissal: "run out (Cummins)",
    runsScored: 24,
    ballsPlayed: 21,
    fours: 0,
    sixes: 2,
    sr: 114.29,
  },
];

const remainingBatters = [
  "Rohit Sharma",
  "Virat Kohli",
  "Surya Kumar Yadav",
  "Sanju Samson",
];

const fallOfWicketsColumns: Column[] = [
  {
    title: "Fall of Wickets",
    classNames: "w-full",
    dataKey: "fallOfWickets",
  },
];

const fallOfWicketsData: RowData[] = [
  {
    fallOfWickets:
      "13-1 (de Kock, 2.1), 21-2 (Stoinis, 4.2), 57-3 (Rahul, 9.6), 66-4 (Krunal Pandya, 11.2)",
  },
];

const bowlersColumns: Column[] = [
  {
    title: "Bowler",
    classNames: "flex-grow",
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
    title: "O",
    classNames: "w-12",
    dataKey: "ballsBowled",
    render: (val) => {
      return <>{formatBallNum(val as number)}</>;
    },
  },
  {
    title: "M",
    classNames: "w-12",
    dataKey: "maidens",
  },
  {
    title: "R",
    classNames: "w-12",
    dataKey: "runsConceded",
  },
  {
    title: "W",
    classNames: "w-12",
    dataKey: "wickets",
  },
  {
    title: "NB",
    classNames: "w-12",
    dataKey: "noBalls",
  },
  {
    title: "WD",
    classNames: "w-12",
    dataKey: "wideBalls",
  },
  {
    title: "Eco",
    classNames: "w-16",
    dataKey: "economy",
  },
];

const bowlersData: RowData[] = [
  {
    player: "KL Rahul",
    ballsBowled: 29,
    maidens: 33,
    runsConceded: 1,
    wickets: 1,
    noBalls: 0,
    wideBalls: 2,
    economy: 10.5,
    captain: true,
    isKeeper: true,
  },
  {
    player: "Quinton de Kock",
    ballsBowled: 29,
    maidens: 33,
    runsConceded: 1,
    wickets: 1,
    noBalls: 1,
    wideBalls: 2,
    economy: 10.5,
  },
  {
    player: "Marcus Stoinis",
    ballsBowled: 29,
    maidens: 33,
    runsConceded: 1,
    wickets: 1,
    noBalls: 0,
    wideBalls: 0,
    economy: 8.0,
  },
  {
    player: "Krunal Pandya",
    ballsBowled: 29,
    maidens: 33,
    runsConceded: 1,
    wickets: 1,
    noBalls: 1,
    wideBalls: 0,
    economy: 6.5,
  },
];

const ScorecardTab = () => {
  return (
    <div>
      <div className="mb-2">
        <MatchStatus>Lorem ipsum dolor sit amet.</MatchStatus>
      </div>
      <div className="flex justify-between bg-gray-600 text-white text-sm px-2 py-2">
        <div>Lucknow Super Giants Innings</div>
        <div>165-4 (20 Ov)</div>
      </div>
      {/* Scorecard table */}
      {/* Batters starts */}
      <Table data={battersData} columns={battersColumns} rowStripes />
      {/* Batters ends */}
      {/* extras starts */}
      <div className="flex border-t text-sm px-3 py-1.5">
        <div className="mr-5 flex-grow">Extras</div>
        <div className="font-bold mr-1">4</div>
        <div className="w-1/3 pr-8">(b 0, lb 1, w 3, nb 0, p 0)</div>
      </div>
      {/* extras ends */}
      {/* total starts */}
      <div className="flex border-t text-sm px-3 py-1.5">
        <div className="mr-5 flex-grow">Total</div>
        <div className="font-bold mr-1">165</div>
        <div className="w-1/3 pr-8">(4 wkts, 20 Ov)</div>
      </div>
      {/* total ends */}

      {/* remaining batters starts */}
      <div className="flex justify-between border-t text-sm px-3 py-1.5">
        <div className="mr-5 min-w-fit">Yet to Bat</div>
        <div>
          {remainingBatters.map((player, playerIdx) => (
            <Fragment key={playerIdx}>
              <PlayerLink name={player} />
              {playerIdx + 1 != remainingBatters.length && ", "}
            </Fragment>
          ))}
        </div>
      </div>
      {/* remaining batters ends */}
      {/* FOW starts */}
      <Table data={fallOfWicketsData} columns={fallOfWicketsColumns} />
      {/* FOW ends */}
      {/* Bowler starts */}
      <Table data={bowlersData} columns={bowlersColumns} rowStripes />
      {/* Bowler ends */}
    </div>
  );
};

export default ScorecardTab;
