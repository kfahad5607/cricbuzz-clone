import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div>
      <Header />
      <Sidebar />
      <main className="p-4 sm:ml-64 bg-white">
        <div className="p-4 mt-14">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
