/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import classNames from 'classnames';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { ReactComponent as OpenExternal } from './open-external.svg';

type NavProps = {
  hasSubscription: boolean;
  primaryEmail: string;
};

const activeClasses = 'bg-grey-100 font-bold text-blue-500 rounded-sm';

// mobile classes start when working on FXA-1583
// `nav`: bg-white w-full inset-0 mt-18 mr-24 desktop:bg-transparent text-xl desktop:text-base
// `nav ul`: px-6 py-7 tablet:px-8 desktop:p-0

export const Nav = ({ hasSubscription, primaryEmail }: NavProps) => (
  <nav className="font-header fixed mt-11 w-auto" data-testid="nav">
    <ul>
      <li className="mb-5">
        <h2 className="font-bold">Settings</h2>
        <ul className="ml-4">
          <li className="mt-3">
            <a
              data-testid="nav-link-profile"
              href="#profile"
              className={classNames(activeClasses, 'py-1 px-2')}
            >
              Profile
            </a>
          </li>
          <li className="mt-3">
            <a
              href="#security"
              data-testid="nav-link-security"
              className="py-1 px-2"
            >
              Security
            </a>
          </li>
          <li className="mt-3">
            <a
              href="#connected-services"
              data-testid="nav-link-connected-services"
              className="py-1 px-2"
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
          href={`https://basket.mozilla.org/fxa/?email=${primaryEmail}`}
        >
          Newsletters
          <OpenExternal
            className="inline-block w-3 h-3 ml-1"
            aria-hidden="true"
          />
        </LinkExternal>
      </li>
    </ul>
  </nav>
);

export default Nav;
