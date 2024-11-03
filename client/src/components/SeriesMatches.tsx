import { useParams } from "react-router-dom";
import { Column } from "../entities/table";
import { useSeriesMatches } from "../hooks/useMatches";
import myDayjs from "../services/dayjs";
import { SeriesMatchCard } from "../types/matches";
import {
  formatDateTime,
  getStatusText,
  getStatusTextColor,
} from "../utils/converters";
import MatchStatus from "./MatchStatus";
import Table from "./Table";

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
      return <MatchDetails data={record} />;
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

interface MatchDetailsProps {
  data: SeriesMatchCard;
}

const MatchDetails = ({ data }: MatchDetailsProps) => {
  return (
    <div>
      <div className="mb-0.5">
        <span className="uppercase">{data.homeTeam.name}</span> vs{" "}
        <span className="uppercase">{data.awayTeam.name}</span>,{" "}
        {data.description}
      </div>
      <div className="text-slate-600 mb-0.5">
        Narendra Modi Stadium, Ahmedabad
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

  const { data, isLoading, error } = useSeriesMatches(parseInt(seriesId!));

  if (isLoading) return <h3>Loading...</h3>;
  if (error) return <h3>{"Something went wrong " + error.message}</h3>;
  if (!data) return null;

  return (
    <div>
      <Table data={data} columns={matchesColumns} rowStripes />
    </div>
  );
};

export default SeriesMatches;
