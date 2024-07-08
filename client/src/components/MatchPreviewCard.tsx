import { Link } from "react-router-dom";
import slugify from "slugify";
import teamOne from "../assets/images/team-1.webp";
import teamTwo from "../assets/images/team-2.webp";
import type { MatchCard } from "../types/matches";
import {
  formatDateTime,
  formatOversToInt,
  getStatusTextColor,
} from "../utils/helpers";
import MatchStatus from "./MatchStatus";

interface Props {
  match: MatchCard;
}

type MatchSlugInput = Pick<
  MatchCard,
  "homeTeam" | "awayTeam" | "description" | "series"
>;

const getMatchSlug = (data: MatchSlugInput): string => {
  const { homeTeam, awayTeam, description, series } = data;
  const slugInput = `${homeTeam.shortName}-vs-${awayTeam.shortName}-${description}-${series.title}`;

  return slugify(slugInput, { lower: true });
};

const MatchPreviewCard = ({ match }: Props) => {
  const { series, homeTeam, awayTeam, innings } = match;

  const [firstTeam, secondTeam] =
    innings[0].teamId === homeTeam.id
      ? [homeTeam, awayTeam]
      : [awayTeam, homeTeam];

  return (
    <div className="w-72 flex-shrink-0 rounded overflow-hidden bg-white shadow">
      <div className="bg-white p-2">
        <Link to={`/matches/${match.id}/${getMatchSlug(match)}`}>
          <div className="flex justify-between items-center text-[0.67rem] mb-2">
            <div className="text-gray-700 font-medium">
              <span>{match.description}</span>
              <span className="mx-1">•</span>
              <span>{series.title}</span>
            </div>
            <div className="bg-gray-700 px-1.5 ml-2 text-[10px] uppercase rounded-2xl text-white">
              {match.matchFormat}
            </div>
          </div>
          <div className="flex justify-between text-gray-500">
            <div className="flex items-center w-full">
              <div title={firstTeam.name} className="w-5 mr-1">
                <img className="block w-full" src={teamOne} alt="" />
              </div>
              <div title={firstTeam.name} className="uppercase">
                {firstTeam.shortName}
              </div>
            </div>
            <div className="w-full font-medium">
              {innings[0].score}-{innings[0].wickets} (
              {formatOversToInt(innings[0].oversBowled)})
            </div>
          </div>
          <div className="flex justify-between text-slate-900 mt-2">
            <div className="flex items-center w-full">
              <div title={secondTeam.name} className="w-5 mr-1">
                <img className="block w-full" src={teamTwo} alt="" />
              </div>
              <div title={secondTeam.name} className="uppercase">
                {secondTeam.shortName}
              </div>
            </div>
            <div className="w-full font-medium">
              {innings[1].score}-{innings[1].wickets} (
              {formatOversToInt(innings[1].oversBowled)})
            </div>
          </div>
          {
            <MatchStatus
              className="mt-2"
              size="sm"
              color={getStatusTextColor(match.state)}
            >
              {match.status || formatDateTime(match.startTime)}
            </MatchStatus>
          }
        </Link>
      </div>
      <div className="bg-slate-200 px-1.5 py-2 text-gray-600 text-[0.7rem] text-right">
        <span className="ml-2">SCHEDULE</span>
      </div>
    </div>
  );
};

export default MatchPreviewCard;
