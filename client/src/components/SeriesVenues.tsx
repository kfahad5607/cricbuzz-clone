import { useParams } from "react-router-dom";
import stadium from "../assets/images/stadium.webp";
import { useSeriesVenues } from "../hooks/useVenues";

const SeriesVenues = () => {
  const { seriesId } = useParams();

  const { data, isLoading, error } = useSeriesVenues(parseInt(seriesId!));

  if (isLoading) return <h3>Loading...</h3>;
  if (error) return <h3>{"Something went wrong " + error.message}</h3>;
  if (!data) return null;

  return (
    <div>
      {data.map((venue) => (
        <div
          key={venue.id}
          className="flex items-start gap-x-3 py-4 border-b leading-none"
        >
          <div className="max-w-60 rounded-md overflow-hidden">
            <img className="block" src={stadium} alt="" />
          </div>
          <div>
            <div className="font-medium text-xl mb-2">{venue.name}</div>
            <div className="text-gray-600 capitalize">{venue.city}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SeriesVenues;
