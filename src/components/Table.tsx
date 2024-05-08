import { CellValue, Column, RowData } from "../entities/table";

const defaultColumnRender = (val: CellValue) => <>{val}</>;

const columns: Column[] = [
  {
    title: "Batter",
    classNames: "w-7/12",
    dataKey: "batter",
    render: (val, index) => {
      return (
        <a href="#" className="text-blue-600 hover:underline">
          {val}
        </a>
      );
    },
  },
  {
    title: "Runs",
    classNames: "w-1/6",
    dataKey: "runs",
  },
  {
    title: "Balls",
    classNames: "w-1/6",
    dataKey: "balls",
  },
  {
    title: "Fours",
    classNames: "w-1/6",
    dataKey: "fours",
  },
  {
    title: "Sixes",
    classNames: "w-1/6",
    dataKey: "sixes",
  },
  {
    title: "SR",
    classNames: "w-1/6",
    dataKey: "sr",
  },
];

const data: RowData[] = [
  {
    batter: "Rohit Sharma",
    runs: 20,
    balls: 18,
    fours: 2,
    sixes: 0,
    sr: 120,
  },
  {
    batter: "Ishan Kishan",
    runs: 45,
    balls: 23,
    fours: 2,
    sixes: 4,
    sr: 200,
  },
];

const BASE_CELL_CLASS = "first:ps-3 last:pe-3 px-1.5 py-1";

const getRenderer = (column: Column): Column["render"] =>
  column.render || defaultColumnRender;

const Table = () => {
  return (
    <div>
      {/* Head */}
      <div className="bg-slate-200 text-gray-600">
        {/* Head row */}
        <div className="flex items-center text-sm">
          {/*  Head Cell*/}
          {columns.map((column, columnIdx) => (
            <div
              key={columnIdx}
              className={`${BASE_CELL_CLASS} ${column.classNames}`}
            >
              {column.title}
            </div>
          ))}
        </div>
      </div>
      {/* Body */}
      <div>
        {/* Row */}
        {data.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-center text-sm">
            {/* Cell */}
            {columns.map((column, columnIdx) => (
              <div
                key={columnIdx}
                className={`${BASE_CELL_CLASS} ${column.classNames}`}
              >
                {getRenderer(column)!(row[column.dataKey], columnIdx)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Table;
