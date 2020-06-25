import React from 'react';
import Header from './Header';

const Page = ({ title, children }) => (
  <div className="p-8 pt-0 min-h-screen">
    <Header />
    <h2 className="mt-6 mb-4 text-xxxl">{title}</h2>
    {children}
  </div>
);

export default Page;
