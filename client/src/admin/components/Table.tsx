import { ReactNode } from "react";
import { BiSearch } from "react-icons/bi";
import { Pagination } from "../../types/common";
import { generatePagination } from "../../utils/converters";
import { debounce } from "../../utils/helpers";
import Spinner from "./Spinner";
import clsx from "clsx";

export type Column<TItem> = {
  title: string;
  dataKey: keyof TItem;
  render?: (
    val: TItem[Column<TItem>["dataKey"]],
    record: TItem,
    index: number
  ) => ReactNode;
};

type BaseProps<TItem> = {
  columns: Column<TItem>[];
  data: TItem[] | undefined;
  renderKey?: keyof TItem;
  isLoading: boolean;
  error: Error | null;
  searchQuery: string;
  onSearch: (query: string) => void;
};

type Props<TItem> =
  | (BaseProps<TItem> & {
      pagination: Pagination;
      onPagination: (page: number) => void;
    })
  | BaseProps<TItem>;

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

const Table = <TItem,>(props: Props<TItem>) => {
  const { columns, data, renderKey, searchQuery, isLoading, error, onSearch } =
    props;

  if (isLoading && !data) return <p>Data is loading...</p>;
  if (error) return <p>Something went wrong. {error.message}</p>;
  if (!searchQuery && (!data || data.length === 0))
    return <p>No data to show here.</p>;

  let pagination: Pagination | null = null;
  let onPagination = (page: number) => {};
  let paginationButtons: (string | number)[] = [];
  let lastPage = 10;
  let firstRecord = 1;
  let lastRecord = 10;

  if ("pagination" in props) {
    pagination = props.pagination;
    onPagination = props.onPagination;

    paginationButtons = generatePagination(
      pagination.currentPage,
      pagination.pageSize,
      pagination.totalRecords
    );

    if (paginationButtons.length > 0) {
      lastPage = Math.ceil(pagination.totalRecords / pagination.pageSize);
      firstRecord = (pagination.currentPage - 1) * pagination.pageSize + 1;
      lastRecord = pagination.currentPage * pagination.pageSize;
      lastRecord = Math.min(lastRecord, pagination.totalRecords);
    } else {
      pagination = null;
    }
  }

  const handlePageClick = (page: number | string) => {
    if (typeof page === "string") return;
    onPagination(page);
  };

  const handleSearchInput = debounce(onSearch, 450);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50">
          <Spinner className="flex justify-center mt-24" />
        </div>
      )}
      <div className="pb-4 bg-white dark:bg-gray-900">
        <label htmlFor="table-search" className="sr-only">
          Search
        </label>
        <div className="relative inline-block mt-1">
          <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
            <BiSearch className="text-gray-500 text-xl" />
          </div>
          <input
            type="text"
            onChange={(e) => {
              console.log("e.target ", e.currentTarget.value);
              const val = e.currentTarget.value.trim();
              handleSearchInput(val);
            }}
            id="table-search"
            className="block py-2 ps-10 pe-9 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search for items"
            defaultValue={searchQuery}
            autoComplete="off"
          />
        </div>
      </div>
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
          {!data ||
            (data.length === 0 ? (
              <tr className="bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td colSpan={columns.length}>
                  <div className="text-2xl text-center mt-5">
                    No data to show
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, itemIdx) => (
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
              ))
            ))}
        </tbody>
      </table>
      {pagination && (
        <nav
          className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4"
          aria-label="Table navigation"
        >
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto">
            Showing{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {firstRecord}-{lastRecord}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {pagination?.totalRecords}
            </span>
          </span>
          <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
            <li>
              <button
                onClick={() => handlePageClick(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg enabled:hover:bg-gray-100 enabled:hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:enabled:hover:bg-gray-700 dark:enabled:hover:text-white disabled:opacity-65"
              >
                Previous
              </button>
            </li>
            {paginationButtons.map((btn, btnIdx) => (
              <li key={btnIdx}>
                <button
                  onClick={() => handlePageClick(btn)}
                  className={clsx(
                    "flex items-center justify-center px-3 h-8 leading-tight bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700",
                    pagination.currentPage === btn
                      ? "text-blue-900 bg-blue-100"
                      : "text-gray-500"
                  )}
                >
                  {btn}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => handlePageClick(pagination.currentPage + 1)}
                disabled={pagination.currentPage === lastPage}
                className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:enabled:bg-gray-100 hover:enabled:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:enabled:hover:bg-gray-700 dark:enabled:hover:text-white disabled:opacity-65"
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Table;
