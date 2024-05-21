import teamOne from "../assets/images/team-1.webp";
import teamTwo from "../assets/images/team-2.webp";

const MatchPreviewCard = () => {
  return (
    <div className="w-72 rounded overflow-hidden bg-white shadow">
      <div className="bg-white p-2">
        <div className="flex justify-between items-center text-[0.67rem] mb-2">
          <div className="text-gray-700 font-medium">
            <span>Qualifier 1</span>
            <span className="mx-1">•</span>
            <span>Indian Premier League 2024</span>
          </div>
          <div className="bg-gray-700 px-1.5 ml-2 text-[10px] rounded-2xl text-white">
            T20
          </div>
        </div>
        <div className="flex justify-between text-gray-500">
          <div className="flex items-center w-full">
            <div className="w-5 mr-1">
              <img className="block w-full" src={teamOne} alt="" />
            </div>
            <div>KKR</div>
          </div>
          <div className="w-full font-medium">159 (19.3)</div>
        </div>
        <div className="flex justify-between text-slate-900 mt-2">
          <div className="flex items-center w-full">
            <div className="w-5 mr-1">
              <img className="block w-full" src={teamTwo} alt="" />
            </div>
            <div>SRH</div>
          </div>
          <div className="w-full font-medium">63-1 (6)</div>
        </div>
        <div className="text-red-600 text-xs mt-2 truncate">
          Kolkata Knight Riders need 86 runs in 78 balls
        </div>
      </div>
      <div className="bg-gray-200 px-1 py-1.5 text-gray-600 text-[0.7rem] text-right">
        <span className="ml-2">SCHEDULE</span>
      </div>
    </div>
  );
};

export default MatchPreviewCard;
