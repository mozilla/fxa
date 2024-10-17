import React from 'react';
import Header from './Header';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';

const Page = ({ title, children }) => (
  <AppLocalizationProvider>
    <div className="p-8 pt-0 min-h-screen">
      <Header />
      <h2 className="mt-6 mb-4 text-xl font-bold">{title}</h2>
      {children}
    </div>
  </AppLocalizationProvider>
);

export default Page;
