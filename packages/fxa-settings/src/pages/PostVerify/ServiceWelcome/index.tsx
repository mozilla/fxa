/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import AppLayout from '../../../components/AppLayout';
import Banner from '../../../components/Banner';
import CardHeader from '../../../components/CardHeader';
import { useFtlMsgResolver } from '../../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import { LocationState, ServiceWelcomeProps } from './interfaces';
import { VpnWelcomeImage } from '../../../components/images';

const ServiceWelcome = ({
  integration,
}: ServiceWelcomeProps & RouteComponentProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: LocationState;
  };
  const isSignIn = location?.state?.origin === 'signin';

  return (
    <AppLayout>
      <Banner
        type="success"
        content={{
          localizedHeading: isSignIn
            ? ftlMsgResolver.getMsg(
                'service-welcome-signin-success-banner',
                'Signed in successfully!'
              )
            : ftlMsgResolver.getMsg(
                'service-welcome-signup-success-banner',
                'Mozilla account confirmed'
              ),
        }}
      />

      <VpnWelcomeImage className="w-full mt-10 mb-7" />

      <CardHeader
        headingTextFtlId="service-welcome-vpn-heading"
        headingText="Next: Turn on VPN"
      />

      <FtlMsg id="service-welcome-vpn-description">
        <p className="mt-2 text-sm">
          One more step to boost your browser’s privacy. Go to the open panel
          and turn it on.
        </p>
      </FtlMsg>
    </AppLayout>
  );
};

export default ServiceWelcome;
