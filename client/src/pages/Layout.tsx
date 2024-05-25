import Navbar from "../components/Navbar";
import HomePage from "./HomePage";
import MatchPage from "./MatchPage";

const Layout = () => {
  return (
    <div className=" max-w-6xl mx-auto">
      <Navbar />
      <div className="my-2 ">
        <HomePage />
        {/* <MatchPage /> */}
      </div>
    </div>
  );
};

export default Layout;
