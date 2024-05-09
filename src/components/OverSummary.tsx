const OverSummary = () => {
  return (
    <div className="bg-gray-200 pt-6 pb-3 my-5 text-xs">
      <div className="border-t border-gray-300 py-2 flex divide-x divide-gray-300">
        <div className="px-3 text-xl font-bold w-12">5</div>
        <div className="px-3 w-1/4">
          <div>
            Runs Scored: <span className="font-bold">23</span>
          </div>
          <div className="font-bold">1 4 4 6 4 4</div>
        </div>{" "}
        <div className="px-3 w-44">
          <div>Score after 5 overs</div>
          <div className="font-bold">SRH 87-0</div>
        </div>
        <div className="px-3 w-1/4">
          <div className="flex justify-between mb-1">
            <div className="mr-4">Travis Head</div>
            <div>58(18)</div>
          </div>
          <div className="flex justify-between">
            <div className="mr-4">Abhishek Sharma</div>
            <div>26(13)</div>
          </div>
        </div>
        <div className="px-3 w-1/5">
          <div>Naveen-ul-Haq</div>
          <div>1-0-23-0</div>
        </div>
      </div>
    </div>
  );
};

export default OverSummary;
