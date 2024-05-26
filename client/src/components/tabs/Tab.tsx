import { ReactNode, useState } from "react";

export type TabType = {
  title: string;
  element: ReactNode;
};

interface Props {
  tabs: TabType[];
}

const Tab = ({ tabs }: Props) => {
  const [selectedTabIdx, setSelectedTabIdx] = useState(1);

  const selectedTab = tabs[selectedTabIdx];

  return (
    <div>
      <div className="flex items-center text-sm border-b-2">
        {tabs.map((tab, tabIdx) => (
          <div
            key={tabIdx}
            onClick={() => setSelectedTabIdx(tabIdx)}
            className={`font-bold cursor-pointer mr-4 py-1 border-b-4 ${
              tabIdx === selectedTabIdx
                ? "border-green-700 text-green-700"
                : "border-transparent text-gray-600"
            }`}
          >
            {tab.title}
          </div>
        ))}
      </div>
      <div className="py-3 w-3/5">{selectedTab.element}</div>
    </div>
  );
};

export default Tab;
