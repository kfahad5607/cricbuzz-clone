import { useParams } from "react-router-dom";
import TabWithLink, { TabLinkType } from "../components/tabs/TabWithLink";

const tabs: TabLinkType[] = [
  {
    title: "Schedule & Results",
    link: "matches",
  },
  {
    title: "Squads",
    link: "squads",
  },
  {
    title: "Venues",
    link: "venues",
  },
];

const SeriesPage = () => {
  const { seriesId } = useParams();

  return (
    <div className="px-3 py-2 border-2 border-red-400 bg-white">
      <div>
        <div className="font-medium text-2xl text-slate-950 mb-2">
          Indian Premier League 2023
        </div>
        <div className="text-slate-600 text-sm">
          <span>75 T20s</span> <span className="mx-0.5 font-bold">.</span>{" "}
          <span>Mar 31 - May 29</span>
        </div>
      </div>
      <div className="mt-3">
        <TabWithLink tabs={tabs} />
      </div>
    </div>
  );
};

export default SeriesPage;
