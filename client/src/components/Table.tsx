import clsx from "clsx";
import { CellValue, Column } from "../entities/table";

interface Props<TItem> {
  columns: Column<TItem>[];
  data: TItem[];
  rowStripes?: boolean;
  rowAlignment?: "start" | "center" | "end";
}

const BASE_CELL_CLASS = "first:ps-3 last:pe-3 px-1.5 py-1.5";

const defaultColumnRender = (val: CellValue) => <>{val}</>;

const getRenderer = <TItem,>(column: Column<TItem>): Column<TItem>["render"] =>
  column.render || defaultColumnRender;

const Table = <TItem,>({
  columns,
  data,
  rowAlignment = "start",
  rowStripes = false,
}: Props<TItem>) => {
  return (
    <div className="text-sm">
      {/* Head */}
      <div className="bg-slate-200 text-gray-600">
        {/* Head row */}
        <div className="flex items-center">
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
          <div
            key={rowIdx}
            className={clsx("flex", `items-${rowAlignment}`, {
              "border-b last:border-0": rowStripes,
            })}
          >
            {/* Cell */}
            {columns.map((column, columnIdx) => (
              <div
                key={columnIdx}
                className={`${BASE_CELL_CLASS} ${column.classNames}`}
              >
                {getRenderer<TItem>(column)!(
                  row[column.dataKey],
                  row,
                  columnIdx
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Table;
