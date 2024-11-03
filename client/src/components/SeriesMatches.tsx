import { Link, useParams } from "react-router-dom";
import { Column } from "../entities/table";
import { useSeriesMatches } from "../hooks/useMatches";
import myDayjs from "../services/dayjs";
import { SeriesMatchCard } from "../types/matches";
import {
  formatDateTime,
  getMatchSlug,
  getStatusText,
  getStatusTextColor,
} from "../utils/converters";
import MatchStatus from "./MatchStatus";
import Table from "./Table";
import useSeriesInfo from "../hooks/useSeriesInfo";

interface MatchDetailsProps {
  data: SeriesMatchCard;
  series: {
    title: string;
  };
}

const MatchDetails = ({ data, series }: MatchDetailsProps) => {
  return (
    <div>
      <div className="mb-0.5">
        <Link
          to={`/matches/${data.id}/${getMatchSlug({
            description: data.description,
            series,
            homeTeam: data.homeTeam,
            awayTeam: data.awayTeam,
          })}`}
          className="hover:underline"
        >
          <span className="uppercase">{data.homeTeam.name}</span> vs{" "}
          <span className="uppercase">{data.awayTeam.name}</span>,{" "}
          {data.description}
        </Link>
      </div>
      <div className="text-slate-600 mb-0.5">
        {data.venue.name}, <span className="capitalize">{data.venue.city}</span>
      </div>
      <div>
        {
          <MatchStatus size="lg" color={getStatusTextColor(data.state)}>
            {getStatusText(data) || formatDateTime(data.startTime)}
          </MatchStatus>
        }
      </div>
    </div>
  );
};

const SeriesMatches = () => {
  const { seriesId } = useParams();

  const { data: seriesInfo } = useSeriesInfo(parseInt(seriesId!));
  const { data, isLoading, error } = useSeriesMatches(parseInt(seriesId!));

  if (isLoading) return <h3>Loading...</h3>;
  if (error) return <h3>{"Something went wrong " + error.message}</h3>;
  if (!data || !seriesInfo) return null;

  const matchesColumns: Column<SeriesMatchCard>[] = [
    {
      title: "Date",
      classNames: "w-1/3 mr-2",
      dataKey: "startTime",
      render: (val) => {
        return formatDateTime(val, "ddd, MMM DD, YYYY");
      },
    },
    {
      title: "Match Details",
      classNames: "w-full mr-2",
      dataKey: "id",
      render: (val, record) => {
        return (
          <MatchDetails data={record} series={{ title: seriesInfo!.title }} />
        );
      },
    },
    {
      title: "Time",
      classNames: "w-5/12",
      dataKey: "startTime",
      render: (val) => {
        const startTime = myDayjs(val).utc();
        const utcTime = startTime.format("hh:mm A");
        const userTime = startTime.local().format("hh:mm A");
        const localTime = startTime.tz("Asia/Kolkata").format("hh:mm A");

        return (
          <div>
            <div>{userTime}</div>
            <div className="text-slate-500 text-[13px] mt-0.5">
              {utcTime} GMT / {localTime} LOCAL
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Table data={data} columns={matchesColumns} rowStripes />
    </div>
  );
};

export default SeriesMatches;
