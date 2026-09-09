/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import InlineTotpSetup from '.';
import { MozServices } from '../../lib/types';
import { Integration } from '../../models';
import { InlineTotpSetupProps } from './interfaces';

const onContinue = jest.fn();

const ENROLMENT_TESTID = 'enrolment-step';
const enrolment = <div data-testid={ENROLMENT_TESTID}>enrolment</div>;

const buildProps = (
  overrides: Partial<InlineTotpSetupProps> = {}
): InlineTotpSetupProps => ({
  currentStep: 0,
  onContinue,
  serviceName: MozServices.Addons,
  integration: {} as Integration,
  signedInWithPasskey: false,
  enrolment,
  ...overrides,
});

describe('InlineTotpSetup', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
    onContinue.mockReset();
  });

  it('renders the intro at step 0', () => {
    renderWithLocalizationProvider(<InlineTotpSetup {...buildProps()} />);

    screen.getByRole('heading', { name: 'Two-step authentication' });
    expect(
      screen.getByText('Set up two-step authentication')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Add-ons requires you to set up two-step authentication to keep your account safe.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByTestId(ENROLMENT_TESTID)).not.toBeInTheDocument();
  });

  it('renders the passkey intro when signedInWithPasskey is set', () => {
    renderWithLocalizationProvider(
      <InlineTotpSetup {...buildProps({ signedInWithPasskey: true })} />
    );

    expect(
      screen.getByText('Successfully signed in with passkey')
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        'Add-ons requires you to set up two-step authentication to keep your account safe.'
      )
    ).not.toBeInTheDocument();
  });

  it('calls onContinue when the intro Continue button is clicked', async () => {
    renderWithLocalizationProvider(<InlineTotpSetup {...buildProps()} />);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onContinue).toHaveBeenCalled();
  });

  it('renders the enrolment step at step 1', () => {
    renderWithLocalizationProvider(
      <InlineTotpSetup {...buildProps({ currentStep: 1 })} />
    );

    expect(screen.getByTestId(ENROLMENT_TESTID)).toBeInTheDocument();
    expect(
      screen.queryByText('Set up two-step authentication')
    ).not.toBeInTheDocument();
  });
});
