import React from 'react';
import { ReactComponent as Spinner } from './spinner.svg';

export const LoadingSpinner = ({ className }: { className?: string }) => (
  <div {...{ className }} data-testid="loading-spinner">
    <Spinner
      className="spinner-image w-10 h-10 animate-rotate animate-timing-linear animate-duration-800 animate-repeat-infinite"
      role="img"
      aria-label="Loading..."
    />
  </div>
);

export default LoadingSpinner;
