import { useState } from "react";
import CommentaryTab from "./CommentaryTab";
import ScorecardTab from "./ScorecardTab";
import SquadsTab from "./SquadsTab";

const tabs = [
  {
    title: "Commentary",
    element: <CommentaryTab />,
  },
  {
    title: "Scorecard",
    element: <ScorecardTab />,
  },
  {
    title: "Squads",
    element: <SquadsTab />,
  },
];

const Tab = () => {
  const [selectedTabIdx, setSelectedTabIdx] = useState(0);

  const selectedTab = tabs[selectedTabIdx];

  return (
    <div>
      <div className="flex items-center text-sm border-b-2">
        {tabs.map((tab, tabIdx) => (
          <div
            key={tabIdx}
            onClick={() => setSelectedTabIdx(tabIdx)}
            className={`font-bold cursor-pointer mr-3 py-1 ${
              tabIdx === selectedTabIdx
                ? "border-b-4 border-green-700 text-green-700"
                : "text-gray-600"
            }`}
          >
            {tab.title}
          </div>
        ))}
      </div>
      <div className="py-3">{selectedTab.element}</div>
    </div>
  );
};

export default Tab;
