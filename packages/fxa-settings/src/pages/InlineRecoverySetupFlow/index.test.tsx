/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import { userEvent, UserEvent } from '@testing-library/user-event';
import InlineRecoverySetupFlow from '.';
import { GleanClickEventType2FA, MozServices } from '../../lib/types';
import { renderWithRouter } from '../../models/mocks';
import { MOCK_BACKUP_CODES, MOCK_EMAIL } from '../mocks';
import GleanMetrics from '../../lib/glean';

const setRecoveryCodesFn = jest.fn();
const addRecoveryPhoneFn = jest.fn().mockResolvedValue('');
const confirmRecoveryPhoneFn = jest.fn();
const refreshFn = jest.fn();
const mockAccount = {
  addRecoveryPhone: addRecoveryPhoneFn,
  setRecoveryCodes: setRecoveryCodesFn,
  confirmRecoveryPhone: confirmRecoveryPhoneFn,
  refresh: refreshFn,
};
jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useAccount: () => mockAccount,
}));
jest.mock('../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));
jest.mock('../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: {
      twoStepAuthBackupChoiceView: jest.fn(),
      twoStepAuthCodesView: jest.fn(),
      twoStepAuthEnterCodeView: jest.fn(),
      twoStepAuthPhoneSubmitView: jest.fn(),
      twoStepAuthPhoneVerifyView: jest.fn(),
      twoStepAuthCompleteView: jest.fn(),
    },
  },
}));
const verifyTotpHandler = jest.fn();
const successSetupHandler = jest.fn();
const navigateForward = jest.fn();
const navigateBackward = jest.fn();
const backupChoiceCb = jest.fn();
const setBackupCodeError = jest.fn();
const sendSmsCode = jest.fn();
const verifyPhoneNumber = jest.fn();
const verifySmsCode = jest.fn();
const completeBackupCodeSetup = jest.fn();
const props = {
  flowHasPhoneChoice: true,
  serviceName: MozServices.Default,
  email: MOCK_EMAIL,
  backupCodes: [],
  generatingCodes: false,
  phoneData: { phoneNumber: '', nationalFormat: '' },
  verifyTotpHandler,
  currentStep: 1,
  navigateForward,
  navigateBackward,
  backupMethod: null,
  backupChoiceCb,
  backupCodeError: '',
  setBackupCodeError,
  sendSmsCode,
  verifyPhoneNumber,
  verifySmsCode,
  completeBackupCodeSetup,
  successfulSetupHandler: successSetupHandler,
};

describe('InlineRecoverySetupFlow', () => {
  let user: UserEvent;

  beforeAll(async () => {
    global.URL.createObjectURL = jest.fn();
  });

  beforeEach(() => {
    user = userEvent.setup();
    navigateForward.mockClear();
    navigateBackward.mockClear();
    verifyTotpHandler.mockClear();
    successSetupHandler.mockClear();
  });

  it('renders the choice screen', () => {
    renderWithRouter(<InlineRecoverySetupFlow {...props} />);
    screen.getByRole('heading', {
      name: 'Two-step authentication',
    });
    screen.getByRole('heading', {
      name: 'Choose a recovery method',
    });
    screen.getByText('Recovery phone');
    screen.getByText('Backup authentication codes');
    expect(
      GleanMetrics.accountPref.twoStepAuthBackupChoiceView
    ).toHaveBeenCalledWith({
      event: { reason: GleanClickEventType2FA.inline },
    });
  });

  it('does not render the choice screen when recovery phone option is N/A', async () => {
    // also the test for backup codes copy/download screen
    renderWithRouter(
      <InlineRecoverySetupFlow
        {...{
          ...props,
          flowHasPhoneChoice: false,
          backupCodes: MOCK_BACKUP_CODES,
          generatingCodes: false,
        }}
      />
    );
    screen.getByRole('heading', {
      name: 'Two-step authentication',
    });
    screen.getByRole('heading', { name: 'Save backup authentication codes' });
    MOCK_BACKUP_CODES.forEach((x) => screen.getByText(x));
    expect(GleanMetrics.accountPref.twoStepAuthCodesView).toHaveBeenCalledWith({
      event: { reason: GleanClickEventType2FA.inline },
    });
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(navigateForward).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(navigateBackward).toHaveBeenCalledTimes(1);
  });

  it('renders the backup code confirmation screen', async () => {
    verifyTotpHandler.mockResolvedValueOnce(true);
    renderWithRouter(
      <InlineRecoverySetupFlow
        {...{
          ...props,
          flowHasPhoneChoice: false,
          backupCodes: MOCK_BACKUP_CODES,
          generatingCodes: false,
          currentStep: 2,
        }}
      />
    );
    expect(
      GleanMetrics.accountPref.twoStepAuthEnterCodeView
    ).toHaveBeenCalledWith({
      event: { reason: GleanClickEventType2FA.inline },
    });
    screen.getByRole('heading', { name: 'Enter backup authentication code' });
    await waitFor(async () => {
      await user.type(
        screen.getByLabelText('Enter 10-character code'),
        MOCK_BACKUP_CODES[0]
      );
      await user.click(screen.getByRole('button', { name: 'Finish' }));
    });
    expect(completeBackupCodeSetup).toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(navigateBackward).toHaveBeenCalledTimes(1);
  });

  it('renders the recovery phone number screen', async () => {
    renderWithRouter(
      <InlineRecoverySetupFlow
        {...{ ...props, currentStep: 2, backupMethod: 'phone' }}
      />
    );
    expect(
      GleanMetrics.accountPref.twoStepAuthPhoneSubmitView
    ).toHaveBeenCalledWith({
      event: { reason: GleanClickEventType2FA.inline },
    });
    screen.getByRole('heading', { name: 'Verify your phone number' });
    await user.type(screen.getByLabelText('Enter phone number'), '2345678900');
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    expect(verifyPhoneNumber).toHaveBeenCalledWith('+12345678900');
    expect(navigateForward).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(navigateBackward).toHaveBeenCalledTimes(1);
  });

  it('renders the recovery phone confirmation screen', async () => {
    renderWithRouter(
      <InlineRecoverySetupFlow
        {...{ ...props, currentStep: 3, backupMethod: 'phone' }}
      />
    );
    expect(
      GleanMetrics.accountPref.twoStepAuthPhoneVerifyView
    ).toHaveBeenCalledWith({
      event: { reason: GleanClickEventType2FA.inline },
    });
    screen.getByRole('heading', { name: 'Enter verification code' });
    await user.type(screen.getByLabelText('Enter 6-digit code'), '246509');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(navigateForward).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(navigateBackward).toHaveBeenCalledTimes(1);
  });

  it('renders the flow complete screen for backup codes', async () => {
    renderWithRouter(
      <InlineRecoverySetupFlow
        {...{
          ...props,
          currentStep: 4,
          backupMethod: 'code',
          backupCodes: MOCK_BACKUP_CODES,
          generatingCodes: false,
        }}
      />
    );
    expect(
      GleanMetrics.accountPref.twoStepAuthCompleteView
    ).toHaveBeenCalledWith({
      event: { reason: GleanClickEventType2FA.inline },
    });
    screen.getByText('Two-step authentication enabled');
    screen.getByText('8 codes remaining');
    await user.click(
      screen.getByRole('button', { name: `Continue to ${MozServices.Default}` })
    );
    expect(successSetupHandler).toHaveBeenCalledTimes(1);
  });

  it('renders the flow complete screen for recovery phone', async () => {
    renderWithRouter(
      <InlineRecoverySetupFlow
        {...{ ...props, currentStep: 4, backupMethod: 'phone' }}
      />
    );
    expect(
      GleanMetrics.accountPref.twoStepAuthCompleteView
    ).toHaveBeenCalledWith({
      event: { reason: GleanClickEventType2FA.inline },
    });
    screen.getByText('Two-step authentication enabled');
    screen.getByText('Recovery phone');
    await user.click(
      screen.getByRole('button', { name: `Continue to ${MozServices.Default}` })
    );
    expect(successSetupHandler).toHaveBeenCalledTimes(1);
  });
});
