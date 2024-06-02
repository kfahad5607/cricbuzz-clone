import { Column, RowData } from "../entities/table";
import Commentary from "./Commentary";
import MatchStatus from "./MatchStatus";
import PlayerLink from "./PlayerLink";
import Table from "./Table";

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
  return (
    <div>
      {/* Header */}
      <div>
        {/* Summary */}
        <div>
          <div className="text-gray-500 mb-2">ZIM 138/7 (20)</div>
          <div className="flex items-end">
            <div className="font-bold text-xl leading-5">BAN 41/1 (5.5)</div>
            <div className="flex text-xs text-gray-700 leading-3 ml-2">
              <div>
                <span className="font-bold">CRR:</span> 7.03
              </div>
              <div className="ml-1">
                <span className="font-bold">REQ:</span> 6.92
              </div>
            </div>
          </div>
          <div className="mt-2">
            <MatchStatus>Lorem ipsum dolor sit amet consectetur.</MatchStatus>
          </div>
        </div>
        {/* scoreboard */}
        <div className="mt-2">
          <Table data={battersData} columns={battersColumns} />
          <div className="w-full py-3.5 my-4 border-y border-slate-60"></div>
          {/* Commentary */}
          <div className="mt-2">
            <Commentary />
          </div>
        </div>
      </div>
      {/* Body */}
    </div>
  );
};

export default CommentaryTab;
