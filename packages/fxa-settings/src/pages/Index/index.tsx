/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { IndexProps } from './interfaces';
import AppLayout from '../../components/AppLayout';
import CardHeader from '../../components/CardHeader';
import InputText from '../../components/InputText';
import { FtlMsg } from 'fxa-react/lib/utils';
import ThirdPartyAuth from '../../components/ThirdPartyAuth';
import TermsPrivacyAgreement from '../../components/TermsPrivacyAgreement';
import {
  isClientMonitor,
  isClientPocket,
} from '../../models/integrations/client-matching';
import { isOAuthIntegration } from '../../models';

export const Index = ({
  integration,
  serviceName,
}: IndexProps & RouteComponentProps) => {
  const clientId = integration.getService();
  const isSync = integration.isSync();
  const isOAuth = isOAuthIntegration(integration);
  const isPocketClient = isOAuth && isClientPocket(clientId);
  const isMonitorClient = isOAuth && isClientMonitor(clientId);
  return (
    <AppLayout>
      {isSync ? (
        <>
          <h1 className="card-header">
            <FtlMsg id="index-sync-header">
              Continue to your Mozilla account
            </FtlMsg>
          </h1>
          <p className="mt-1 mb-9 text-sm">
            <FtlMsg id="index-sync-subheader">
              Sync your passwords, tabs, and bookmarks everywhere you use
              Firefox.
            </FtlMsg>
          </p>
        </>
      ) : (
        <CardHeader
          headingText="Enter your email"
          headingTextFtlId="index-header"
          subheadingWithDefaultServiceFtlId="index-subheader-default"
          subheadingWithCustomServiceFtlId="index-subheader-with-servicename"
          subheadingWithLogoFtlId="index-subheader-with-logo"
          {...{ clientId, serviceName }}
        />
      )}
      <FtlMsg id="index-email-input" attrs={{ label: true }}>
        <InputText className="mt-8" type="email" label="Enter your email" />
      </FtlMsg>
      <div className="flex mt-5">
        <button className="cta-primary cta-xl" type="submit">
          <FtlMsg id="index-cta">Sign up or sign in</FtlMsg>
        </button>
      </div>
      {isSync ? (
        <p className="mt-5 text-xs text-grey-500">
          <FtlMsg id="index-account-info">
            A Mozilla account also unlocks access to more privacy-protecting
            products from Mozilla.
          </FtlMsg>
        </p>
      ) : (
        <ThirdPartyAuth showSeparator viewName="index" />
      )}
      <TermsPrivacyAgreement {...{ isPocketClient, isMonitorClient }} />
    </AppLayout>
  );
};

export default Index;
