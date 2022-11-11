/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { RouteComponentProps } from '@reach/router';
import AppLayout from '../AppLayout';

// NOTE: page is incomplete, was half-hacked together as a first route to serve

export const PageCannotCreateAccount = (_: RouteComponentProps) => {
  return (
    <AppLayout>
      <h1 className="card-header">Cannot create account</h1>
      <p className="mb-4 text-sm">
        You must meet certain age requirements to create a Firefox account.
      </p>
      <LinkExternal
        className="link-blue text-sm"
        href="https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy"
      >
        Learn more
      </LinkExternal>
    </AppLayout>
  );
};

export default PageCannotCreateAccount;
