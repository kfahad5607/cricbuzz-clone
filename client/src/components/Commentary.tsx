import { formatBallNum } from "../utils/helpers";
import OverSummary from "./OverSummary";

const commentarData = [
  {
    ballNum: 60,
    text: "<p>Cummins to Pooran, 2 runs, slower ball outside off, Pooran toe-ends the drive to long-off and Badoni races back for the second</p>",
  },
  {
    ballNum: 61,
    text: "<p>Cummins to Pooran, 2 runs, slower ball outside off, Pooran toe-ends the drive to long-off and Badoni races back for the second</p>",
  },
  {
    ballNum: 62,
    text: "<p>Cummins to Pooran, 2 runs, slower ball outside off, Pooran toe-ends the drive to long-off and Badoni races back for the second</p>",
  },
  {
    ballNum: 63,
    text: "<p>Cummins to Pooran, 2 runs, slower ball outside off, Pooran toe-ends the drive to long-off and Badoni races back for the second</p>",
  },
  {
    ballNum: 64,
    text: "<p>Cummins to Pooran, 2 runs, slower ball outside off, Pooran toe-ends the drive to long-off and Badoni races back for the second</p>",
  },
  {
    ballNum: 65,
    text: "<p>Cummins to Pooran, 2 runs, slower ball outside off, Pooran toe-ends the drive to long-off and Badoni races back for the second</p>",
  },
  {
    ballNum: 66,
    text: "<p>Cummins to Pooran, 2 runs, slower ball outside off, Pooran toe-ends the drive to long-off and Badoni races back for the second</p>",
  },
];

const Commentary = () => {
  return (
    <div>
      <OverSummary />
      {commentarData.map((item, itemIdx) => (
        <div key={itemIdx} className="flex text-sm mb-3 leading-6">
          <div className="font-bold mr-4">{formatBallNum(item.ballNum)}</div>
          <div
            className=""
            dangerouslySetInnerHTML={{ __html: item.text }}
          ></div>
        </div>
      ))}
    </div>
  );
};

export default Commentary;
