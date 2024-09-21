/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { ReactComponent as IconClose } from '@fxa/shared/assets/images/close.svg';
import { FIREFOX_NOREPLY_EMAIL } from '../../constants';

export enum BannerType {
  info = 'info',
  success = 'success',
  error = 'error',
}

type DefaultProps = {
  type: BannerType;
  children: ReactElement | string;
  additionalClassNames?: string;
  animation?: Animation;
};

type OptionalProps =
  | {
      dismissible: boolean;
      setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
    }
  | { dismissible?: never; setIsVisible?: never };

export type BannerProps = DefaultProps & OptionalProps;

type Animation = {
  className: string;
  handleAnimationEnd: () => void;
  animate: boolean;
};

const Banner = ({
  type,
  children,
  additionalClassNames,
  dismissible,
  setIsVisible,
  animation,
}: BannerProps) => {
  // Transparent border is for Windows HCM  - to ensure there is a border around the banner
  const baseClassNames =
    'text-xs font-bold p-3 my-3 rounded border border-transparent animate-fade-in';

  return (
    <div
      className={classNames(
        baseClassNames,
        type === BannerType.info && 'bg-grey-50 text-black',
        type === BannerType.success && 'bg-green-500 text-grey-900',
        type === BannerType.error && 'bg-red-700 text-white',
        dismissible && 'flex gap-2 items-center ',
        animation?.animate && animation?.className,
        additionalClassNames
      )}
      onAnimationEnd={animation?.handleAnimationEnd}
      role="status"
    >
      {dismissible ? (
        <>
          <div className="grow ltr:pl-5 rtl:pr-5">{children}</div>
          <FtlMsg id="banner-dismiss-button" attrs={{ ariaLabel: true }}>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setIsVisible(false)}
            >
              <IconClose className="text-black w-3 h-3" role="img" />
            </button>
          </FtlMsg>
        </>
      ) : (
        <>{children}</>
      )}
    </div>
  );
};
export default Banner;

export const ResendEmailSuccessBanner = ({
  animation,
}: {
  animation?: Animation;
}) => {
  return (
    <Banner type={BannerType.success} {...{ animation }}>
      <FtlMsg
        id="link-expired-resent-link-success-message"
        vars={{ accountsEmail: FIREFOX_NOREPLY_EMAIL }}
      >
        {`Email re-sent. Add ${FIREFOX_NOREPLY_EMAIL} to your contacts to ensure a
    smooth delivery.`}
      </FtlMsg>
    </Banner>
  );
};
