import { useParams, useSearchParams } from "react-router-dom";
import useSeriesInfo from "../hooks/useSeriesInfo";
import useSeriesTeams from "../hooks/useSeriesTeams";
import useSeriesTeamSquad from "../hooks/useSeriesTeamSquad";
import { SeriesTeamsItem } from "../types/series";
import { MATCH_FORMATS, PLAYER_ROLES_LABEL } from "../utils/constants";
import Filter, { BaseFilter, BaseSelectedFilter } from "./elements/Filter";

type Filter = BaseFilter;
type SelectedFilter = BaseSelectedFilter;

const getTeamParams = (
  data: SeriesTeamsItem[] | undefined,
  location: { parentIdx: number; itemIdx: number }
) => {
  if (
    !data ||
    !data[location.parentIdx] ||
    !data[location.parentIdx].teams[location.itemIdx]
  )
    return { id: 0, matchFormat: MATCH_FORMATS.TEST };

  return {
    id: data[location.parentIdx].teams[location.itemIdx].id,
    matchFormat: data[location.parentIdx].matchFormat,
  };
};

const SeriesSquads = () => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get("catId")
    ? parseInt(searchParams.get("catId")!)
    : 0;
  const filterItemIdx = searchParams.get("filterItemId")
    ? parseInt(searchParams.get("filterItemId")!)
    : 0;

  const seriesId = parseInt(params.seriesId!);

  const { data: seriesInfo } = useSeriesInfo(seriesId);
  const { data, error, isLoading } = useSeriesTeams(seriesId);

  const teamParams = getTeamParams(data, {
    parentIdx: categoryId,
    itemIdx: filterItemIdx,
  });
  const teamSquad = useSeriesTeamSquad(
    seriesId,
    teamParams.id,
    teamParams.matchFormat
  );

  const handleFilterClick = (filterData: SelectedFilter) => {
    setSearchParams({
      catId: filterData.categoryId.toString(),
      filterItemId: filterData.filterItemIdx.toString(),
    });
  };

  if (isLoading) return <h3>Loading...</h3>;
  if (error) return <h3>{"Something went wrong " + error.message}</h3>;
  if (!data) return null;

  if (teamSquad.isLoading) return <h3>Loading Team...</h3>;
  if (teamSquad.error)
    return <h3>{"Something went wrong in team " + teamSquad.error.message}</h3>;
  if (!teamSquad.data) return null;

  const filters = data.map((item, itemIdx) => {
    return {
      id: itemIdx,
      title: item.matchFormat.toUpperCase(),
      items: item.teams.map((team) => ({ keys: [team.id], val: team.name })),
    };
  });

  return (
    <div>
      <h2 className="uppercase mb-5 text-xl font-medium">
        Squads for {seriesInfo?.title}
      </h2>
      <div className="flex">
        <div className="mr-8 w-1/5 shrink-0">
          {filters.map((category) =>
            category.items.length > 0 ? (
              <Filter
                key={category.id}
                data={category}
                selectedFilter={{
                  categoryId,
                  filterItemIdx,
                }}
                onFilterClick={handleFilterClick}
              />
            ) : null
          )}
        </div>
        <div className="grow border border-pink-300 px-3">
          {teamSquad.data.playerByRoles.map((role, roleIdx) => (
            <div key={roleIdx} className="mb-7">
              <h3 className="uppercase font-medium text-lg mb-2">
                {role.title}
              </h3>
              <div className="flex flex-wrap gap-x-5 gap-y-6">
                {role.players.map((player) => (
                  <div
                    key={player.id}
                    className="flex gap-x-4 w-[calc(50%-10px)]"
                  >
                    <div className="w-20 rounded-md overflow-hidden">
                      <img
                        className="block w-full"
                        src="https://static.cricbuzz.com/a/img/v1/75x75/i1/c174146/sakib-hussain.jpg"
                        alt=""
                      />
                    </div>
                    <div>
                      <div>
                        {player.name} {player.isCaptain && "(Captain)"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {PLAYER_ROLES_LABEL[player.roleInfo.role]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeriesSquads;
