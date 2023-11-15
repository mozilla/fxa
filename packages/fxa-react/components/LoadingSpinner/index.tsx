import { useLocalization } from '@fluent/react';
import React from 'react';
import classNames from 'classnames';
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
  fullScreen?: boolean;
};

export const LoadingSpinner = ({
  className,
  imageClassName = 'w-10 h-10 animate-spin',
  spinnerType = SpinnerType.Blue,
  fullScreen = false,
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
    <div
      className={classNames(
        className,
        fullScreen &&
          'bg-grey-20 flex items-center flex-col justify-center h-screen select-none'
      )}
      data-testid="loading-spinner"
    >
      {spinnerImage}
    </div>
  );
};

export default LoadingSpinner;
