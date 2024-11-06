export type BaseFilter = {
  id: number;
  title: string;
  items: {
    keys: unknown;
    val: string;
  }[];
};

export type BaseSelectedFilter = {
  categoryId: number;
  filterItemIdx: number;
};

export type RawSelectedFilter<TFilter extends BaseFilter> =
  BaseSelectedFilter & {
    filterItem: TFilter["items"][number];
    filter: TFilter;
  };

interface FilterProps<
  TFilter extends BaseFilter,
  TSelectedFilter extends BaseSelectedFilter
> {
  data: TFilter;
  selectedFilter: TSelectedFilter;
  onFilterClick: (filter: RawSelectedFilter<TFilter>) => void;
}

const Filter = <
  TFilter extends BaseFilter,
  TSelectedFilter extends BaseSelectedFilter
>({
  data,
  selectedFilter,
  onFilterClick,
}: FilterProps<TFilter, TSelectedFilter>) => {
  const isSelected = selectedFilter.categoryId === data.id;
  return (
    <div>
      <div className="bg-gray-700 text-white px-2.5 py-1.5">{data.title}</div>
      {data.items.map((item, itemIdx) => (
        <div
          key={itemIdx}
          onClick={() =>
            onFilterClick({
              categoryId: data.id,
              filterItemIdx: itemIdx,
              filterItem: item,
              filter: data,
            })
          }
          className={`hover:bg-slate-300 border-b px-2.5 py-1.5 cursor-pointer ${
            isSelected && itemIdx === selectedFilter.filterItemIdx
              ? "bg-slate-300 font-medium"
              : ""
          } `}
        >
          {item.val}
        </div>
      ))}
    </div>
  );
};

export default Filter;
