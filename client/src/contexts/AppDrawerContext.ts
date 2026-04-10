import React from 'react';

export interface AppDrawerContextData {
  firstActiveMenu: string;
  setFirstActiveMenu(menu: string): void;
}

export const AppDrawerContext = React.createContext<AppDrawerContextData>({ firstActiveMenu: '', setFirstActiveMenu: () => {} });

export const AppDrawerProvider = AppDrawerContext.Provider;
export const AppDrawerConsumer = AppDrawerContext.Consumer;
