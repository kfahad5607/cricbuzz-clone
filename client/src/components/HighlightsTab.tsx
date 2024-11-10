import { useState } from "react";
import { useParams } from "react-router-dom";
import useHighlights from "../hooks/useHighlights";
import {
  SCORECARD_INNINGS_TYPES,
  ScorecardInningsTypes,
} from "../types/matchData";
import { getNumberWithOrdinal } from "../utils/converters";
import Commentary from "./Commentary";
import { BALL_EVENTS } from "../utils/constants";
import { BallEvents, CommentaryItem } from "../types/commentary";

type Filter = {
  keys: BallEvents[];
  val: string;
};

type SelectedFilter = {
  filterItemIdx: number;
  keys: Filter["keys"];
};

interface FilterProps {
  selectedFilter: SelectedFilter;
  onFilterClick: (filter: SelectedFilter) => void;
}

const filterItems: Filter[] = [
  { keys: [], val: "All" },
  { keys: [BALL_EVENTS.FOUR], val: "Fours" },
  {
    keys: [BALL_EVENTS.SIX],
    val: "Sixes",
  },
  {
    keys: [BALL_EVENTS.WICKET],
    val: "Wickets",
  },
  {
    keys: [BALL_EVENTS.FIFTY],
    val: "Fifties",
  },
  {
    keys: [BALL_EVENTS.HUNDRED],
    val: "Centuries",
  },
  {
    keys: [BALL_EVENTS.DROPPED],
    val: "Dropped Catches",
  },
  {
    keys: [BALL_EVENTS.UDRS],
    val: "UDRS",
  },
  {
    keys: [BALL_EVENTS.PARTNERSHIP, BALL_EVENTS.RUNOUT_MISS],
    val: "Others",
  },
];

const defaultSelectedFilter = {
  filterItemIdx: 0,
  keys: filterItems[0].keys,
};

const getFilteredCommentary = (
  commentaryList: CommentaryItem[],
  keys: BallEvents[]
) => {
  if (keys.length === 0) return commentaryList;

  return commentaryList.filter((commentaryItem) => {
    for (let i = 0; i < keys.length; i++) {
      if (commentaryItem.events.includes(keys[i])) return true;
    }

    return false;
  });
};

const Filter = ({ selectedFilter, onFilterClick }: FilterProps) => {
  return (
    <div className="mb-4 flex items-center">
      {filterItems.map((filterItem, filterItemIdx) => (
        <div
          key={filterItemIdx}
          onClick={() =>
            onFilterClick({
              filterItemIdx: filterItemIdx,
              keys: filterItem.keys,
            })
          }
          className={`px-2.5 py-1 bg-gray-200 cursor-pointer hover:bg-gray-300 ${
            filterItemIdx === selectedFilter.filterItemIdx
              ? "bg-slate-300 font-medium"
              : ""
          }`}
        >
          {filterItem.val}
        </div>
      ))}
    </div>
  );
};

const HighlightsTab = () => {
  const params = useParams();
  const matchId = parseInt(params.matchId!);

  const [currentInningsType, setCurrentInningsType] =
    useState<ScorecardInningsTypes>(SCORECARD_INNINGS_TYPES[0]);
  const [selectedFilter, setSelectedFilter] = useState<SelectedFilter>(
    defaultSelectedFilter
  );

  const { data, error, isLoading } = useHighlights(matchId, currentInningsType);

  if (isLoading)
    return <div className="text-center mx-2 my-3 text-xl">Loading...</div>;

  if (error && !data) return <h3>{"Something went wrong " + error.message}</h3>;
  if (!data) return <h3>{"Unable to get match commentary"}</h3>;

  if (data.innings.length === 0)
    return <p>There are no highlights for this match.</p>;

  const handleInningsClick = (inningsType: ScorecardInningsTypes) => {
    setCurrentInningsType(inningsType);
    handleFilterClick(defaultSelectedFilter);
  };

  const handleFilterClick = (filter: SelectedFilter) => {
    setSelectedFilter(filter);
  };

  const filteredCommentaryList = getFilteredCommentary(
    data.commentaryList,
    selectedFilter.keys
  );

  return (
    <div className="w-3/5 py-4">
      <div className="flex items-center mb-4">
        {data.innings.map((item) => (
          <div
            key={item.inningsType}
            onClick={() => handleInningsClick(item.inningsType)}
            className={`leading-4 text-sm rounded-full cursor-pointer py-1 px-5 mr-3 capitalize ${
              currentInningsType === item.inningsType
                ? "text-white bg-green-800"
                : "text-gray-800 bg-gray-300"
            }`}
          >
            {
              <>
                <span className="uppercase">{item.team.shortName}</span>
                <span> {getNumberWithOrdinal(item.teamInningsNo)} Inns</span>
              </>
            }
          </div>
        ))}
      </div>
      <Filter
        selectedFilter={selectedFilter}
        onFilterClick={handleFilterClick}
      />
      <div>
        {filteredCommentaryList.length === 0 ? (
          <p>There are no highlights of this category in this innings</p>
        ) : (
          <Commentary commentaryList={filteredCommentaryList} />
        )}
      </div>
    </div>
  );
};

export default HighlightsTab;
