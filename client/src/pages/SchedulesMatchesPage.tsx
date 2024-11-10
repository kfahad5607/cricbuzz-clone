import { NavLink } from "react-router-dom";
import TabWithLink, { TabLinkType } from "../components/tabs/TabWithLink";

const navLinks: TabLinkType[] = [
  {
    title: "Current Matches",
    link: "/matches",
  },
  {
    title: "Current & Future Series",
    link: "squads",
  },
  {
    title: "Matches By Day",
    link: "venues",
  },
];

const tabs: TabLinkType[] = [
  {
    title: "Live",
    link: "live",
  },
  {
    title: "Recent",
    link: "recent",
  },
  {
    title: "Upcoming",
    link: "upcoming",
  },
];

const SchedulesMatchesPage = () => {
  return (
    <div className="px-3 py-2 border-2 border-red-400 bg-white">
      <div>
        <div className="text-slate-600 text-sm"></div>
      </div>
      <div className="mt-3">
        <div>
          <div className="flex items-center text-sm border-b-2">
            {navLinks.map((tab, tabIdx) => (
              <div key={tabIdx} className="font-bold cursor-pointer mr-4 ">
                <NavLink
                  to={tab.link}
                  className={({ isActive }) => {
                    let classNames = "block border-b-4 py-1";
                    if (isActive)
                      classNames += " border-green-700 text-green-700";
                    else classNames += " border-transparent text-gray-600";

                    return classNames;
                  }}
                >
                  {tab.title}
                </NavLink>
              </div>
            ))}
          </div>
          <div className="py-3">
            <h3 className="mb-2 text-2xl font-semibold">Live Cricket Score</h3>
            <TabWithLink tabs={tabs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulesMatchesPage;
