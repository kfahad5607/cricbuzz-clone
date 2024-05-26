import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const Layout = () => {
  return (
    <div className=" max-w-6xl mx-auto">
      <Navbar />
      <div className="my-2 ">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
