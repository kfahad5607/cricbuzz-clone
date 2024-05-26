import { FaRegUserCircle } from "react-icons/fa";
import cricbuzzLogo from "../assets/images/cb_logo.svg";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center px-3 text-white bg-green-700">
      <Link to="/">
        <div className="w-28">
          <img className="block w-full" src={cricbuzzLogo} alt="" />
        </div>
      </Link>
      <div className="flex items-center">
        <div className="flex text-base">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="py-4 px-2 cursor-pointer hover:bg-green-800"
            >
              Live Scores
            </div>
          ))}
        </div>
        <div className="cursor-pointer ml-5">
          <FaRegUserCircle size="1.6rem" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
