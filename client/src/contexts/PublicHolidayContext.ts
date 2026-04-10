import React from 'react';

export interface PublicHolidayContextData {
  holidays: any[];
  setHolidays: (data: any[]) => void;
}

export const PublicHolidayContext = React.createContext<PublicHolidayContextData>({ holidays: [], setHolidays: () => {} });

export const PublicHolidayProvider = PublicHolidayContext.Provider;
export const PublicHolidayConsumer = PublicHolidayContext.Consumer;
