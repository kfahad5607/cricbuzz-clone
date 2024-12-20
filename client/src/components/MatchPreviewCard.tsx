import clsx from "clsx";
import { Link } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";
import teamOne from "../assets/images/team-1.webp";
import teamTwo from "../assets/images/team-2.webp";
import myDayjs from "../services/dayjs";
import type { MatchCard } from "../types/matches";
import {
  formatOversToInt,
  getMatchSlug,
  getStatusText,
  getStatusTextColor,
} from "../utils/converters";
import MatchStatus from "./MatchStatus";

interface Props {
  match: MatchCard;
}

const MatchPreviewCard = ({ match }: Props) => {
  const { series, homeTeam, awayTeam, innings } = match;

  let firstTeam = homeTeam;
  let secondTeam = awayTeam;

  if (innings[0]?.team.id === secondTeam.id) {
    [firstTeam, secondTeam] = [secondTeam, firstTeam];
  }

  const currentTime = myDayjs().utc().local();
  const startTime = myDayjs(match.startTime).utc().local();
  const diff = startTime.diff(currentTime, "d");
  const day = diff === 0 ? "Today" : startTime.format("dddd, DD MMM");
  const time = startTime.format("hh:mm A");
  const formattedTime = `${day}, ${time}`;

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
          {innings.length === 0 && (
            <Fragment>
              <div className="flex justify-between text-slate-900 text-sm">
                <div className="flex items-center w-full">
                  <div title={firstTeam.name} className="w-5 mr-1">
                    <img className="block w-full" src={teamOne} alt="" />
                  </div>
                  <div title={firstTeam.name} className="capitalize">
                    {firstTeam.name}
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-slate-900 text-sm mt-2">
                <div className="flex items-center w-full">
                  <div title={secondTeam.name} className="w-5 mr-1">
                    <img className="block w-full" src={teamTwo} alt="" />
                  </div>
                  <div title={secondTeam.name} className="capitalize">
                    {secondTeam.name}
                  </div>
                </div>
              </div>
            </Fragment>
          )}
          {innings.length > 0 && (
            <Fragment>
              <div
                className={clsx(
                  "flex justify-between text-sm",
                  innings.length === 1 ? "text-slate-900" : "text-slate-600"
                )}
              >
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
              <div
                className={clsx(
                  "flex justify-between text-sm  mt-2",
                  innings.length === 2 ? "text-slate-900" : "text-slate-600"
                )}
              >
                <div className="flex items-center w-full">
                  <div title={secondTeam.name} className="w-5 mr-1">
                    <img className="block w-full" src={teamTwo} alt="" />
                  </div>
                  <div title={secondTeam.name} className="uppercase">
                    {secondTeam.shortName}
                  </div>
                </div>
                {innings[1] && (
                  <div className="w-full font-medium">
                    {innings[1].score}-{innings[1].wickets} (
                    {formatOversToInt(innings[1].oversBowled)})
                  </div>
                )}
              </div>
            </Fragment>
          )}
          {
            <MatchStatus
              className="mt-2"
              size="sm"
              color={getStatusTextColor(match.state)}
            >
              {getStatusText(match) || formattedTime}
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
