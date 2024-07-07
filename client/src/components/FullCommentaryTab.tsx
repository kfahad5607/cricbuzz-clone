import { useParams } from "react-router-dom";
import { useFullCommentary } from "../hooks/useCommentary";
import Commentary from "./Commentary";
import { useState } from "react";
import {
  BallEvents,
  COMMENTARY_INNINGS_TYPES,
  CommentaryInningsTypes,
  CommentaryItem,
} from "../types/commentary";
import { getNumberWithOrdinal } from "../utils/helpers";
import { BALL_EVENTS } from "../utils/constants";

type Filter = {
  id: number;
  title: string;
  filter: (commentaryItem: CommentaryItem, keys: unknown) => boolean;
  items: {
    keys: unknown;
    val: string;
  }[];
};

type SelectedFilter = {
  categoryId: number;
  filterItemIdx: number;
  keys: Filter["items"][number]["keys"];
  filter: Filter["filter"];
};

interface FilterProps {
  data: Filter;
  selectedFilter: SelectedFilter;
  onFilterClick: (filter: SelectedFilter) => void;
}

const filterCategories: Filter[] = [
  {
    id: 1,
    title: "HIGHLIGHTS",
    filter: (commentaryItem: CommentaryItem, keys: unknown) => {
      const _keys = keys as BallEvents[];
      for (let i = 0; i < _keys.length; i++) {
        if (commentaryItem.events.includes(_keys[i])) return true;
      }

      return false;
    },
    items: [
      {
        keys: [],
        val: "All",
      },
      {
        keys: [BALL_EVENTS.FOUR],
        val: "Four",
      },
      {
        keys: [BALL_EVENTS.SIX],
        val: "Six",
      },
      {
        keys: [BALL_EVENTS.WICKET],
        val: "Wicket",
      },
      {
        keys: [BALL_EVENTS.FIFTY],
        val: "Fifty",
      },
      {
        keys: [BALL_EVENTS.HUNDRED],
        val: "Century",
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
        val: "Other",
      },
    ],
  },
  {
    id: 2,
    title: "BATTER",
    items: [],
    filter(commentaryItem: CommentaryItem, key: unknown) {
      return commentaryItem.batsmanStriker.id === (key as number);
    },
  },
  {
    id: 3,
    title: "BOWLER",
    items: [],
    filter(commentaryItem: CommentaryItem, key: unknown) {
      return commentaryItem.bowlerStriker.id === (key as number);
    },
  },
];

const defaultSelectedFilter = {
  categoryId: filterCategories[0].id,
  filterItemIdx: 0,
  filter: filterCategories[0].filter,
  keys: filterCategories[0].items[0].keys,
};

const getFilteredCommentary = (
  commentaryList: CommentaryItem[],
  filterData: SelectedFilter
) => {
  if (Array.isArray(filterData.keys) && filterData.keys.length === 0)
    return commentaryList;

  return commentaryList.filter((commentaryItem) => {
    return filterData.filter(commentaryItem, filterData.keys);
  });
};

const Filter = ({ data, selectedFilter, onFilterClick }: FilterProps) => {
  const isSelected = selectedFilter.categoryId === data.id;
  return (
    <div>
      <div className="bg-gray-700 text-white px-2.5 py-1.5">{data.title}</div>
      {data.items.map((item, itemIdx) => (
        <div
          key={itemIdx}
          onClick={() =>
            onFilterClick({
              categoryId: data.id,
              filterItemIdx: itemIdx,
              keys: item.keys,
              filter: data.filter,
            })
          }
          className={`hover:bg-slate-300 border-b px-2.5 py-1.5 cursor-pointer ${
            isSelected && itemIdx === selectedFilter.filterItemIdx
              ? "bg-slate-300 font-medium"
              : ""
          } `}
        >
          {item.val}
        </div>
      ))}
    </div>
  );
};

const FullCommentaryTab = () => {
  const params = useParams();
  const matchId = parseInt(params.matchId!);

  const [currentInningsType, setCurrentInningsType] =
    useState<CommentaryInningsTypes>(COMMENTARY_INNINGS_TYPES[0]);
  const [selectedFilter, setSelectedFilter] = useState<SelectedFilter>(
    defaultSelectedFilter
  );

  const { data, error, isLoading } = useFullCommentary(
    matchId,
    currentInningsType
  );

  if (isLoading)
    return <div className="text-center mx-2 my-3 text-xl">Loading...</div>;

  if (error && !data) return <h3>{"Something went wrong " + error.message}</h3>;
  if (!data) return <h3>{"Unable to get match commentary"}</h3>;

  const handleInningsClick = (inningsType: CommentaryInningsTypes) => {
    setCurrentInningsType(inningsType);
    handleFilterClick(defaultSelectedFilter);
  };

  const handleFilterClick = (filter: SelectedFilter) => {
    setSelectedFilter(filter);
  };

  const filteredCommentaryList = getFilteredCommentary(
    data.commentaryList,
    selectedFilter
  );

  const inningsIdx = COMMENTARY_INNINGS_TYPES.indexOf(currentInningsType);
  const currentInnings = data.innings[inningsIdx];
  if (currentInnings.inningsType !== "preview") {
    filterCategories[1].items = currentInnings.batters.map((batter) => {
      return {
        id: 1,
        keys: batter.id,
        val: batter.name,
      };
    });
    filterCategories[2].items = currentInnings.bowlers.map((bowler) => {
      return {
        id: 1,
        keys: bowler.id,
        val: bowler.name,
      };
    });
  }

  return (
    <div className="w-3/4">
      <div className="flex items-center mb-6">
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
            {item.inningsType === COMMENTARY_INNINGS_TYPES[0] ? (
              item.inningsType
            ) : (
              <>
                <span className="uppercase">{item.team.shortName}</span>
                <span> {getNumberWithOrdinal(item.teamInningsNo)} Inns</span>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex">
        <div className="mr-6 w-1/5 shrink-0">
          {/* filter starts */}
          {filterCategories.map((category) =>
            category.items.length > 0 ? (
              <Filter
                key={category.title}
                data={category}
                selectedFilter={selectedFilter}
                onFilterClick={handleFilterClick}
              />
            ) : null
          )}
          {/* filter ends */}
        </div>
        <div className="grow">
          {filteredCommentaryList.length === 0 ? (
            <p>There are no highlights of this category in this innings</p>
          ) : (
            <Commentary commentaryList={filteredCommentaryList} />
          )}
        </div>
      </div>
    </div>
  );
};

export default FullCommentaryTab;
