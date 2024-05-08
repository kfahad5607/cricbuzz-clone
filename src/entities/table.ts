import { ReactNode } from "react";

export type CellValue = string | number;

export interface RowData {
  [key: string | number]: CellValue;
}

export interface Column {
  title: string;
  classNames: string;
  dataKey: string;
  render?: (val: CellValue, index?: number) => ReactNode;
}
