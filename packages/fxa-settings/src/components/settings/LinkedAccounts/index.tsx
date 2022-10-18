/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useAccount } from '../../models';
import { Localized } from '@fluent/react';
import { LinkedAccount as LinkedAccountSection } from './LinkedAccount';

export const LinkedAccounts = () => {
  const account = useAccount();
  const linkedAccounts = account.linkedAccounts;

  return (
    <>
      {!!linkedAccounts.length && (
        <section className="mt-11" data-testid="settings-linked-accounts">
          <h2 className="font-header font-bold ltr:ml-4 rtl:mr-4 mb-4 relative">
            <span id="linked-accounts" className="nav-anchor"></span>
            <Localized id="la-heading">Linked Accounts</Localized>
          </h2>
          <div className="bg-white tablet:rounded-xl shadow px-4 tablet:px-6 pt-7 pb-8">
            <div className="flex justify-between mb-4">
              <Localized id="la-description">
                <p>
                  You have linked and authorized access to the following
                  accounts.
                </p>
              </Localized>
            </div>

            {linkedAccounts.map((linkedAccount) => (
              <LinkedAccountSection
                {...{
                  key: linkedAccount.providerId,
                  providerId: linkedAccount.providerId,
                }}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default LinkedAccounts;
