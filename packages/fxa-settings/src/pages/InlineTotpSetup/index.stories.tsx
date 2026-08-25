/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import InlineTotpSetup from '.';
import { Meta } from '@storybook/react';
import { MozServices } from '../../lib/types';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { action } from '@storybook/addon-actions';
import { Integration } from '../../models';
import FlowSetup2faApp from '../../components/Settings/FlowSetup2faApp';
import { MOCK_TOTP_TOKEN } from './mocks';

export default {
  title: 'Pages/InlineTotpSetup',
  component: InlineTotpSetup,
  decorators: [withLocalization],
} as Meta;

const commonProps = {
  onContinue: () => action('onContinue')(),
  serviceName: MozServices.Addons,
  integration: {} as Integration,
  enrolment: null,
};

// Step 0: the intro the container renders before gating enrolment behind the guard.
export const Default = () => (
  <InlineTotpSetup {...commonProps} currentStep={0} />
);

// Step 1: what the user sees once the guard passes and the TOTP token is created.
// The real page composes this behind MfaGuardCore; here we render FlowSetup2faApp
// directly for a visual reference (see its own stories for more variants).
export const EnrolmentStep = () => (
  <InlineTotpSetup
    {...commonProps}
    currentStep={1}
    enrolment={
      <FlowSetup2faApp
        localizedPageTitle="Two-step authentication"
        totpInfo={MOCK_TOTP_TOKEN}
        verifyCode={async () => ({})}
        showProgressBar
        currentStep={1}
        numberOfSteps={4}
      />
    }
  />
);
