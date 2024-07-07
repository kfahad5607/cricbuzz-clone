import { NavLink, Outlet } from "react-router-dom";

export type TabLinkType = {
  title: string;
  link: string;
};

interface Props {
  tabs: TabLinkType[];
}

const TabWithLink = ({ tabs }: Props) => {
  return (
    <div>
      <div className="flex items-center text-sm border-b-2">
        {tabs.map((tab, tabIdx) => (
          <div key={tabIdx} className="font-bold cursor-pointer mr-4 ">
            <NavLink
              to={tab.link}
              className={({ isActive }) => {
                let classNames = "block border-b-4 py-1";
                if (isActive) classNames += " border-green-700 text-green-700";
                else classNames += " border-transparent text-gray-600";

                return classNames;
              }}
            >
              {tab.title}
            </NavLink>
          </div>
        ))}
      </div>
      <div className="py-4">
        <Outlet />
      </div>
    </div>
  );
};

export default TabWithLink;
