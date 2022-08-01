import React from 'react';
import { ReactComponent as Spinner } from './spinner.svg';

export const LoadingSpinner = ({ className }: { className?: string }) => (
  <div {...{ className }} data-testid="loading-spinner">
    <Spinner
      className="w-10 h-10 animate-spin"
      role="img"
      aria-label="Loading..."
    />
  </div>
);

export default LoadingSpinner;
