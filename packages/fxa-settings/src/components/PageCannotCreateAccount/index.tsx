/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { RouteComponentProps } from '@reach/router';

export const PageCannotCreateAccount = (_: RouteComponentProps) => {
  return (
    <div
      className={`w-96 mx-auto p-7 pb-7 tablet:my-20 flex flex-col items-start bg-white shadow-lg tablet:rounded-xl`}
    >
      <div className="flex items-center flex-col w-full">
        <h1 className="font-header font-bold mb-4 relative text-xl">
          Cannot create account
        </h1>
        <p className="mb-4 text-sm text-center p-auto max-w-xs">
          You must meet certain age requirements to create a Firefox account.
        </p>
        <LinkExternal
          className="text-blue-500 underline text-sm mt-4"
          href="https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy"
        >
          Learn more
        </LinkExternal>
      </div>
    </div>
  );
};

export default PageCannotCreateAccount;
