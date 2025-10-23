/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { fireEvent, screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import GleanMetrics from '../../../lib/glean';
import FlowSetup2faComplete from './index';

describe('FlowSetup2faComplete', () => {
  const serviceName = '123Done';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders backup code version with 3 codes as expected', () => {
    renderWithLocalizationProvider(
      <FlowSetup2faComplete
        backupType="code"
        numCodesRemaining={3}
        serviceName={serviceName}
        onContinue={jest.fn()}
      />
    );
    expect(screen.getByText('Backup authentication codes')).toBeInTheDocument();
    expect(screen.getByText('3 codes remaining')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This is the safest recovery method if you can’t sign in with your mobile device or authenticator app.'
      )
    ).toBeInTheDocument();
  });

  it('renders backup code version with 1 code as expected', () => {
    renderWithLocalizationProvider(
      <FlowSetup2faComplete
        backupType="code"
        numCodesRemaining={1}
        serviceName={serviceName}
        onContinue={jest.fn()}
      />
    );
    expect(screen.getByText('Backup authentication codes')).toBeInTheDocument();
    expect(screen.getByText('1 code remaining')).toBeInTheDocument();
  });

  it('renders recovery phone type', () => {
    renderWithLocalizationProvider(
      <FlowSetup2faComplete
        backupType="phone"
        lastFourPhoneDigits="1234"
        serviceName={serviceName}
        onContinue={jest.fn()}
      />
    );
    expect(screen.getByText('Recovery phone')).toBeInTheDocument();
    expect(screen.getByText('•••••• 1234')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This is the easiest recovery method if you can’t sign in with your authenticator app.'
      )
    ).toBeInTheDocument();
  });

  it('emits and sets up Glean metrics correctly', () => {
    const spy = jest.spyOn(GleanMetrics.accountPref, 'twoStepAuthCompleteView');
    renderWithLocalizationProvider(
      <FlowSetup2faComplete
        backupType="code"
        numCodesRemaining={3}
        serviceName={serviceName}
        onContinue={jest.fn()}
      />
    );
    expect(spy).toHaveBeenCalledWith({
      event: { reason: 'inline setup' },
    });
    const btn = screen.getByRole('button', {
      name: 'Continue to 123Done',
    });
    expect(btn).toHaveAttribute(
      'data-glean-id',
      'two_step_auth_complete_continue'
    );
    expect(btn).toHaveAttribute('data-glean-type', 'inline setup');
  });

  it('calls onContinue for on button click', () => {
    const onContinue = jest.fn();
    renderWithLocalizationProvider(
      <FlowSetup2faComplete
        backupType="code"
        numCodesRemaining={3}
        serviceName={serviceName}
        onContinue={onContinue}
      />
    );
    const btn = screen.getByRole('button', {
      name: 'Continue to 123Done',
    });
    fireEvent.click(btn);
    expect(onContinue).toHaveBeenCalled();
  });
});
