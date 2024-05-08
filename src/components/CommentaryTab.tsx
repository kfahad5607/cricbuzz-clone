import Commentary from "./Commentary";
import Table from "./Table";

const CommentaryTab = () => {
  return (
    <div>
      {/* Header */}
      <div>
        {/* Summary */}
        <div>
          <div className="text-gray-500 mb-2">ZIM 138/7 (20)</div>
          <div className="flex items-end">
            <div className="font-bold text-xl leading-5">BAN 41/1 (5.5)</div>
            <div className="flex text-xs text-gray-700 leading-3 ml-2">
              <div>
                <span className="font-bold">CRR:</span> 7.03
              </div>
              <div className="ml-1">
                <span className="font-bold">REQ:</span> 6.92
              </div>
            </div>
          </div>
          <div className="text-red-600 text-sm mt-2">
            Bangladesh need 83 runs in 70 balls
          </div>
        </div>
        {/* scoreboard */}
        <div className="w-3/5 mt-2">
          <Table />
          <div className="w-full py-3.5 my-4 border-y border-slate-60"></div>
          {/* Commentary */}
          <div className="mt-2">
            <Commentary />
          </div>
        </div>
      </div>
      {/* Body */}
    </div>
  );
};

export default CommentaryTab;
