/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { ReactComponent as IconClose } from 'fxa-react/images/close.svg';
import { FIREFOX_NOREPLY_EMAIL } from 'fxa-settings/src/constants';

export enum BannerType {
  info = 'info',
  success = 'success',
  error = 'error',
}

type DefaultProps = { type: BannerType; children: ReactElement };

type OptionalProps =
  | {
      dismissible: boolean;
      setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
    }
  | { dismissible?: never; setIsVisible?: never };

export type BannerProps = DefaultProps & OptionalProps;

const Banner = ({ type, children, dismissible, setIsVisible }: BannerProps) => {
  const baseClassNames = 'text-xs font-bold p-3 my-3 rounded';

  return (
    <div
      className={classNames(
        baseClassNames,
        type === BannerType.info && 'bg-grey-50 text-black',
        type === BannerType.success && 'bg-green-500 text-grey-900',
        type === BannerType.error && 'bg-red-700 text-white',
        dismissible && 'flex gap-2 items-center '
      )}
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
              <IconClose className="fill-black w-3 h-3" role="img" />
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

export const ResendEmailSuccessBanner = () => {
  return (
    <Banner type={BannerType.success}>
      <FtlMsg
        id="link-expired-resent-link-success-message"
        vars={{ accountsEmail: FIREFOX_NOREPLY_EMAIL }}
      >
        {`Email resent. Add ${FIREFOX_NOREPLY_EMAIL} to your contacts to ensure a
    smooth delivery.`}
      </FtlMsg>
    </Banner>
  );
};

export const ResendLinkErrorBanner = () => {
  return (
    <Banner type={BannerType.error}>
      <FtlMsg id="link-expired-resent-link-error-message">
        Something went wrong. A new link could not be sent.
      </FtlMsg>
    </Banner>
  );
};

export const ResendCodeErrorBanner = () => {
  return (
    <Banner type={BannerType.error}>
      <FtlMsg id="link-expired-resent-code-error-message">
        Something went wrong. A new code could not be sent.
      </FtlMsg>
    </Banner>
  );
};
