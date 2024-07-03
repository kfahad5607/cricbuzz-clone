import { ReactNode } from "react";

// export type CellValue = string | number | boolean ;
export type CellValue = any;

export interface RowData {
  [key: string | number]: CellValue;
}

export interface Column<TItem> {
  title: string;
  classNames: string;
  dataKey: keyof TItem;
  render?: (val: CellValue, record: TItem, index: number) => ReactNode;
}
