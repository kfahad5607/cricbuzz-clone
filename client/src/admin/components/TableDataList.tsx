import Table, { Column } from "./Table";

interface Props<TItem> {
  entityName: {
    singular: string;
    plural: string;
  };
  data: TItem[] | undefined;
  isLoading: boolean;
  error: Error | null;
  columns: Column<TItem>[];
}

const TableDataList = <TItem,>({
  entityName,
  data,
  columns,
  isLoading,
  error,
}: Props<TItem>) => {
  if (isLoading) return <p>Data is loading...</p>;
  if (error) return <p>Soemthing went wrong. {error.message}</p>;
  if (!data || data.length === 0) return <p>No data to show here.</p>;

  return (
    <div className="border border-slate-900/10 py-10 px-8 rounded-xl">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-base font-medium text-slate-900 capitalize">
            {entityName.plural}
          </h1>
          <div className="text-sm text-gray-700 mt-1">
            A list of all the {entityName.plural} in your account including
            their name, title, email and role.
          </div>
        </div>
        <div>
          <button
            type="button"
            className="block rounded-md px-3 py-2 text-center text-sm font-medium text-white bg-blue-600 shadow-sm"
          >
            Add {entityName.singular}
          </button>
        </div>
      </div>

      <div className="relative overflow-x-auto mt-8 sm:rounded-lg">
        <Table data={data} columns={columns} />
      </div>
    </div>
  );
};

export default TableDataList;
