import Navbar from "../components/Navbar";
import HomePage from "./HomePage";

const Layout = () => {
  return (
    <div className=" max-w-6xl mx-auto">
      <Navbar />
      <div className="my-2 px-3 py-2 border-2 border-red-400 bg-white">
        <HomePage />
      </div>
    </div>
  );
};

export default Layout;
