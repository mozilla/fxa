import { useLocalization } from '@fluent/react';
import React from 'react';
import { ReactComponent as Spinner } from './spinner.svg';
import { ReactComponent as SpinnerWhite } from './spinnerwhite.svg';

export enum SpinnerType {
  Blue,
  White,
}

export type LoadingSpinnerProps = {
  className?: string;
  imageClassName?: string;
  spinnerType?: SpinnerType;
};

export const LoadingSpinner = ({
  className,
  imageClassName = 'w-10 h-10 animate-spin',
  spinnerType = SpinnerType.Blue,
}: LoadingSpinnerProps) => {
  const { l10n } = useLocalization();
  const loadingAriaLabel = l10n.getString(
    'app-loading-spinner-aria-label-loading',
    null,
    'Loading…'
  );
  let spinnerImage;
  switch (spinnerType) {
    case SpinnerType.White:
      spinnerImage = (
        <SpinnerWhite
          className={imageClassName}
          role="img"
          aria-label={loadingAriaLabel}
          data-testid="loading-spinner-white"
        />
      );
      break;
    case SpinnerType.Blue:
    default:
      spinnerImage = (
        <Spinner
          className={imageClassName}
          role="img"
          aria-label={loadingAriaLabel}
          data-testid="loading-spinner-blue"
        />
      );
  }

  return (
    <div {...{ className }} data-testid="loading-spinner">
      {spinnerImage}
    </div>
  );
};

export default LoadingSpinner;
