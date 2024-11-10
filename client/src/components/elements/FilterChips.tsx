import { ReactNode } from "react";

interface Props<TItem> {
  items: TItem[];
  renderItem: (item: TItem) => ReactNode;
  isItemSelected: (item: TItem) => boolean;
  onFilterClick: (item: TItem, itemIdx: number) => void;
}

const FilterChips = <TItem,>({
  items,
  renderItem,
  isItemSelected,
  onFilterClick,
}: Props<TItem>) => {
  return (
    <div className="flex items-center">
      {items.map((item, itemIdx) => (
        <div
          key={itemIdx}
          onClick={() => onFilterClick(item, itemIdx)}
          className={`leading-4 text-sm rounded-full cursor-pointer py-1 px-5 mr-3 capitalize ${
            isItemSelected(item)
              ? "text-white bg-green-800"
              : "text-gray-800 bg-gray-300"
          }`}
        >
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
};

export default FilterChips;
