/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Footer from 'fxa-react/components/Footer';
import { PageCannotCreateAccount } from '../PageCannotCreateAccount';
import { RouteComponentProps } from '@reach/router';

export const WrapperBeta = (props: RouteComponentProps) => {
  return (
    <div className="flex flex-col justify-between min-h-screen">
      <PageCannotCreateAccount path="/cannot_create_account" />
      <Footer />
    </div>
  );
};

export default WrapperBeta;
