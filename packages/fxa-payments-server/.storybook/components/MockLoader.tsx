import React, { ReactNode } from 'react';

type MockLoaderProps = {
  children: ReactNode
};

export const MockLoader = ({ children }: MockLoaderProps) => (
  <React.Suspense fallback={<div>Loading</div>}>
    {children}
  </React.Suspense>
);

export default MockLoader;