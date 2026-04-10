import React from 'react';

export interface TableColumnSettingContextData {
  tableColumn: any[];
  setTableColumn: (data: any[]) => void;
}

export const TableColumnSettingContext = React.createContext<TableColumnSettingContextData>({ tableColumn: [], setTableColumn: () => {} });

export const TableColumnSettingProvider = TableColumnSettingContext.Provider;
export const TableColumnSettingConsumer = TableColumnSettingContext.Consumer;
