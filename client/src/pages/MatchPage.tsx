import Tab from "../components/Tab";

const MatchPage = () => {
  return (
    <div className="px-3 py-2 border-2 border-red-400 bg-white">
      <div>
        <div className="font-bold text-xl text-slate-950">
          Bangladesh vs Zimbabwe, 2nd T20I - Live Cricket Score, Commentary
        </div>
        <div className="flex flex-wrap mt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-sm mr-5">
              <span className="text-gray-600 font-bold">Series:</span>
              <span className="ml-1">Zimbabwe tour of Bangladesh, 2024</span>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <Tab />
        </div>
      </div>
    </div>
  );
};

export default MatchPage;
