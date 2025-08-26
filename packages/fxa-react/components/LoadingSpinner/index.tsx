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
  backgroundColor?: string;
};

export const LoadingSpinner = ({
  className,
  imageClassName = 'w-10 h-10 animate-spin',
  spinnerType = SpinnerType.Blue,
  fullScreen = false,
  backgroundColor,
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
      style={ backgroundColor ? ({'--cms-bg': backgroundColor} as React.CSSProperties) : undefined}
      className={classNames(
        className,
        fullScreen &&
          'flex items-center flex-col justify-center h-screen select-none',
        backgroundColor && 'tablet:[background:var(--cms-bg)]',
      )}
      data-testid="loading-spinner"
    >
      {spinnerImage}
    </div>
  );
};

export default LoadingSpinner;
