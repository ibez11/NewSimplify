import React from 'react';

export interface PhoneCodeContextData {
  countries: any[];
  setCountries: (data: any[]) => void;
}

export const PhoneCodeContext = React.createContext<PhoneCodeContextData>({ countries: [], setCountries: () => {} });

export const PhoneCodeProvider = PhoneCodeContext.Provider;
export const PhoneCodeConsumer = PhoneCodeContext.Consumer;
