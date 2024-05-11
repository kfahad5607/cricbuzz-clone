import { ReactNode } from "react";

// export type CellValue = string | number | boolean ;
export type CellValue = any;

export interface RowData {
  [key: string | number]: CellValue;
}

export interface Column {
  title: string;
  classNames: string;
  dataKey: string;
  render?: (val: CellValue, record?: RowData, index?: number) => ReactNode;
}
