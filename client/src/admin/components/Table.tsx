import { ReactNode } from "react";

export type Column<TItem> = {
  title: string;
  dataKey: keyof TItem;
  render?: (
    val: TItem[Column<TItem>["dataKey"]],
    record: TItem,
    index: number
  ) => ReactNode;
};

interface Props<TItem> {
  data: TItem[];
  renderKey?: keyof TItem;
  columns: Column<TItem>[];
}

const defaultColumnRender = (val: any) => <>{val}</>;

const getRenderer = <TItem,>(column: Column<TItem>) =>
  column.render || defaultColumnRender;

const getRenderKeyVal = <TItem,>(
  item: TItem,
  key: keyof TItem | undefined,
  defaultVal: number
) => {
  if (key === undefined) return defaultVal;
  return JSON.stringify(item[key]);
};

const Table = <TItem,>({ data, columns, renderKey }: Props<TItem>) => {
  return (
    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          {columns.map((column, columnIdx) => (
            <th
              key={columnIdx}
              scope="col"
              className="px-6 py-3 first:pl-0 last:pr-0"
            >
              {column.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, itemIdx) => (
          <tr
            key={getRenderKeyVal(item, renderKey, itemIdx)}
            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {columns.map((column, columnIdx) => (
              <td
                key={columnIdx}
                scope="row"
                className="px-6 py-4 first:pl-0 last:pr-0"
              >
                {getRenderer(column)(item[column.dataKey], item, itemIdx)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
