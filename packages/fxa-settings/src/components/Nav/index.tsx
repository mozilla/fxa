/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import classNames from 'classnames';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { ReactComponent as OpenExternal } from './open-external.svg';
import { useAccount } from '../../models';
import { useConfig } from 'fxa-settings/src/lib/config';

export const Nav = () => {
  const account = useAccount();
  const config = useConfig();
  const primaryEmail = account.primaryEmail.email;
  const hasSubscription = account.subscriptions.length > 0;
  const marketingCommPrefLink = `${
    config.marketingEmailPreferencesUrl
  }?email=${encodeURIComponent(primaryEmail)}`;

  const activeClasses = 'font-bold text-blue-500 rounded-sm';
  return (
    <nav
      className="font-header fixed bg-white w-full inset-0 mt-18 ltr:mr-24 rtl:ml-24 desktop:mt-11 desktop:static desktop:bg-transparent text-xl desktop:text-base"
      data-testid="nav"
    >
      <ul className="px-6 py-7 tablet:px-8 desktop:p-0 mobileLandscape:mt-8 ltr:text-left rtl:text-right">
        <li className="mb-5">
          <h2 className="font-bold">Settings</h2>
          <ul className="ltr:ml-4 rtl:mr-4">
            <li className="mt-3">
              <a
                data-testid="nav-link-profile"
                href="#profile"
                className={classNames(
                  activeClasses,
                  'inline-block py-1 px-2 hover:bg-grey-100'
                )}
              >
                Profile
              </a>
            </li>
            <li className="mt-3">
              <a
                href="#security"
                data-testid="nav-link-security"
                className="inline-block py-1 px-2 hover:bg-grey-100"
              >
                Security
              </a>
            </li>
            <li className="mt-3">
              <a
                href="#connected-services"
                data-testid="nav-link-connected-services"
                className="inline-block py-1 px-2 hover:bg-grey-100"
              >
                Connected Services
              </a>
            </li>
          </ul>
        </li>

        {hasSubscription && (
          <li className="mb-5">
            <LinkExternal
              className="font-bold"
              data-testid="nav-link-subscriptions"
              href="/subscriptions"
            >
              Paid Subscriptions
              <OpenExternal
                className="inline-block w-3 h-3 ml-1"
                aria-hidden="true"
              />
            </LinkExternal>
          </li>
        )}

        <li>
          <LinkExternal
            className="font-bold"
            data-testid="nav-link-newsletters"
            href={marketingCommPrefLink}
          >
            Email Communications
            <OpenExternal
              className="inline-block w-3 h-3 ltr:ml-1 rtl:mr-1 transform rtl:-scale-x-1"
              aria-hidden="true"
            />
          </LinkExternal>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
