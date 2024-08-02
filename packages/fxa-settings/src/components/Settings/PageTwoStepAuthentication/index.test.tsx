/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import { act, fireEvent, screen } from '@testing-library/react';
import {
  renderWithRouter,
  mockSession,
  mockAppContext,
  mockSettingsContext,
} from '../../../models/mocks';
import React from 'react';
import PageTwoStepAuthentication, { metricsPreInPostFix } from '.';
import { checkCode, getCode } from '../../../lib/totp';
import { SETTINGS_PATH } from '../../../constants';
import * as Metrics from '../../../lib/metrics';
import { Account, AppContext } from '../../../models';
import { AuthUiErrors } from 'fxa-settings/src/lib/auth-errors/auth-errors';
import { SettingsContext } from '../../../models/contexts/SettingsContext';

jest.mock('../../../models/AlertBarInfo');
jest.mock('../../../lib/totp', () => ({
  ...jest.requireActual('../../../lib/totp'),
  getCode: jest.fn(),
  checkCode: jest.fn().mockResolvedValue(true),
}));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

const totp = {
  qrCodeUrl: 'qr:url',
  secret: 'JFXE6ULUGM4U4WDHOFVFIRDPKZITATSK',
  recoveryCodes: ['3594s0tbsq', '0zrg82sdzm', 'wx88yxenfc'],
};

const account = {
  primaryEmail: {
    email: 'ibicking@mozilla.com',
  },
  createTotp: jest.fn().mockResolvedValue(totp),
  verifyTotp: jest.fn().mockResolvedValue(true),
} as unknown as Account;

window.URL.createObjectURL = jest.fn();

const render = (acct: Account = account, verified: boolean = true) =>
  renderWithRouter(
    <AppContext.Provider
      value={mockAppContext({ account: acct, session: mockSession(verified) })}
    >
      <PageTwoStepAuthentication />
    </AppContext.Provider>
  );

const inputTotp = async (totp: string) => {
  await act(async () => {
    await fireEvent.input(screen.getByTestId('totp-input-field'), {
      target: { value: totp },
    });
  });
};

const submitTotp = async (totp: string) => {
  await inputTotp(totp);
  await act(async () => {
    await fireEvent.click(screen.getByTestId('submit-totp'));
  });
};

const resetCheckcodeMock = () => {
  (checkCode as jest.Mock).mockReset();
  (checkCode as jest.Mock).mockResolvedValue(true);
};

describe('step 1', () => {
  it('renders', async () => {
    await act(async () => {
      render();
    });
    expect(screen.getByTestId('flow-container')).toBeInTheDocument();
    expect(screen.getByTestId('flow-container-back-btn')).toBeInTheDocument();
    expect(screen.getByTestId('totp-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-totp')).toBeInTheDocument();
  });

  it('updates the disabled state of the continue button', async () => {
    await act(async () => {
      render();
    });
    const button = screen.getByTestId('submit-totp');

    // default
    expect(button).toBeDisabled();

    // not all numbers
    await inputTotp('bigcat');
    expect(button).toBeDisabled();

    // not enough numbers
    await inputTotp('90210');
    expect(button).toBeDisabled();

    // valid code format
    await inputTotp('867530');
    expect(button).not.toBeDisabled();
  });

  it('displays the QR code', async () => {
    await act(async () => {
      render();
    });
    expect(screen.getByTestId('2fa-qr-code')).toBeInTheDocument();
    expect(screen.getByTestId('2fa-qr-code')).toHaveAttribute(
      'alt',
      expect.stringContaining('JFXE6ULUGM4U4WDHOFVFIRDPKZITATSK')
    );
  });

  it('does not display the QR code for the unverified', async () => {
    await act(async () => {
      render(account, false);
    });
    expect(screen.queryByTestId('2fa-qr-code')).toBeNull();
  });
});

describe('step 2', () => {
  beforeEach(() => {
    resetCheckcodeMock();
  });

  it('shows the backup authentication codes when valid auth code is submitted', async () => {
    await act(async () => {
      render();
    });
    await submitTotp('867530');
    expect(checkCode).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('2fa-recovery-codes')).toBeInTheDocument();
    expect(screen.getByTestId('2fa-recovery-codes')).toHaveTextContent(
      totp.recoveryCodes[0]
    );
    expect(screen.getByTestId('datablock').textContent?.trim()).toEqual(
      totp.recoveryCodes.join(' ')
    );
    expect(screen.getByTestId('databutton-download')).toHaveAttribute(
      'download',
      expect.stringContaining('Backup authentication codes')
    );
  });

  it('shows an error when an invalid auth code is entered', async () => {
    await act(async () => {
      render();
    });
    (checkCode as jest.Mock).mockResolvedValue(false);
    await submitTotp('867530');
    expect(checkCode).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });
});

describe('step 3', () => {
  const getRecoveryCodes = async (acct: Account = account) => {
    await act(async () => {
      render(acct);
    });
    await submitTotp('867530');
    await act(async () => {
      await fireEvent.click(screen.getByTestId('ack-recovery-code'));
    });
  };

  beforeEach(async () => {
    // suppress the console output
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    resetCheckcodeMock();
  });

  it('renders the backup authentication code form', async () => {
    await getRecoveryCodes();
    expect(screen.getByTestId('recovery-code-input-field')).toBeInTheDocument();
  });

  it('shows an error when an incorrect backup authentication code is entered', async () => {
    await getRecoveryCodes();
    await act(async () => {
      await fireEvent.input(screen.getByTestId('recovery-code-input-field'), {
        target: { value: 'bogus' },
      });
    });
    await act(async () => {
      await fireEvent.click(screen.getByTestId('submit-recovery-code'));
    });
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toHaveTextContent(
      'Incorrect backup authentication code'
    );
  });

  it('shows an generic error when the code cannot be verified', async () => {
    const error = new Error('unexpected');
    const account = {
      primaryEmail: {
        email: 'ibicking@mozilla.com',
      },
      createTotp: jest.fn().mockResolvedValue(totp),
      verifyTotp: jest.fn().mockRejectedValue(error),
    } as unknown as Account;
    await getRecoveryCodes(account);
    (getCode as jest.Mock).mockResolvedValue('999911');
    await act(async () => {
      await fireEvent.input(screen.getByTestId('recovery-code-input-field'), {
        target: {
          value: totp.recoveryCodes[0],
        },
      });
    });
    await act(async () => {
      await fireEvent.click(screen.getByTestId('submit-recovery-code'));
    });
  });

  it('shows the api error when the code cannot be verified', async () => {
    const error: any = new Error();
    error.errno = AuthUiErrors.TOTP_TOKEN_NOT_FOUND.errno;
    const account = {
      primaryEmail: {
        email: 'ibicking@mozilla.com',
      },
      createTotp: jest.fn().mockResolvedValue(totp),
      verifyTotp: jest.fn().mockRejectedValue(error),
    } as unknown as Account;
    await getRecoveryCodes(account);
    (getCode as jest.Mock).mockResolvedValue('009001');
    await act(async () => {
      await fireEvent.input(screen.getByTestId('recovery-code-input-field'), {
        target: {
          value: totp.recoveryCodes[0],
        },
      });
    });
    await act(async () => {
      await fireEvent.click(screen.getByTestId('submit-recovery-code'));
    });
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('verifies and enable two step auth', async () => {
    const alertBarInfo = {
      success: jest.fn(),
    } as any;
    await act(async () => {
      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <SettingsContext.Provider
            value={mockSettingsContext({ alertBarInfo })}
          >
            <PageTwoStepAuthentication />
          </SettingsContext.Provider>
        </AppContext.Provider>
      );
    });

    await submitTotp('867530');
    await act(async () => {
      await fireEvent.click(screen.getByTestId('ack-recovery-code'));
    });

    (getCode as jest.Mock).mockClear();
    (getCode as jest.Mock).mockResolvedValue('001980');
    await act(async () => {
      await fireEvent.input(screen.getByTestId('recovery-code-input-field'), {
        target: {
          value: totp.recoveryCodes[0],
        },
      });
    });
    await act(async () => {
      await fireEvent.click(screen.getByTestId('submit-recovery-code'));
    });
    expect(getCode).toBeCalledTimes(1);

    expect(mockNavigate).toHaveBeenCalledWith(
      SETTINGS_PATH + '#two-step-authentication',
      { replace: true }
    );
    expect(alertBarInfo.success).toHaveBeenCalledTimes(1);
    expect(alertBarInfo.success).toHaveBeenCalledWith(
      'Two-step authentication enabled'
    );
  });
});

describe('metrics', () => {
  it('emits the correct metric events', async () => {
    const mockLogViewEvent = jest.fn();
    const mockLogPageViewEvent = jest.fn();
    jest.spyOn(Metrics, 'useMetrics').mockReturnValue({
      logViewEventOnce: mockLogViewEvent,
      logPageViewEventOnce: mockLogPageViewEvent,
    });
    const logViewEventSpy = jest.spyOn(Metrics, 'logViewEvent');

    // Hey kid, stop all the printing!
    window.open = jest.fn().mockReturnValue({
      document: { write: jest.fn(), close: jest.fn() },
      focus: jest.fn(),
      print: jest.fn(),
      close: jest.fn(),
    });

    await act(async () => {
      render();
    });
    await submitTotp('867530');

    await act(async () => {
      await fireEvent.click(screen.getByTestId('databutton-copy'));
    });
    await act(async () => {
      await fireEvent.click(screen.getByTestId('databutton-print'));
    });
    await act(async () => {
      await fireEvent.click(screen.getByTestId('databutton-download'));
    });

    await act(async () => {
      await fireEvent.click(screen.getByTestId('ack-recovery-code'));
    });

    (getCode as jest.Mock).mockResolvedValue('001980');
    await act(async () => {
      await fireEvent.input(screen.getByTestId('recovery-code-input-field'), {
        target: {
          value: totp.recoveryCodes[0],
        },
      });
    });
    await act(async () => {
      await fireEvent.click(screen.getByTestId('submit-recovery-code'));
    });

    expect(mockLogPageViewEvent).toBeCalledTimes(2);
    expect(mockLogPageViewEvent).toHaveBeenCalledWith(metricsPreInPostFix);
    expect(mockLogPageViewEvent).toHaveBeenCalledWith(
      `${metricsPreInPostFix}.recovery-codes`
    );

    expect(mockLogViewEvent).toBeCalledTimes(1);
    expect(mockLogViewEvent).toHaveBeenCalledWith(
      metricsPreInPostFix,
      'submit'
    );

    expect(logViewEventSpy).toBeCalledTimes(3);
    expect(logViewEventSpy).toHaveBeenCalledWith(
      `flow.${metricsPreInPostFix}.recovery-codes`,
      `print-option`
    );
    expect(logViewEventSpy).toHaveBeenCalledWith(
      `flow.${metricsPreInPostFix}.recovery-codes`,
      `copy-option`
    );
    expect(logViewEventSpy).toHaveBeenCalledWith(
      `flow.${metricsPreInPostFix}.recovery-codes`,
      `download-option`
    );
  });
});

describe('back button', () => {
  it('goes back a step with the flow container back button', async () => {
    await act(async () => {
      render();
    });
    await submitTotp('867530');
    await act(async () => {
      await fireEvent.click(screen.getByTestId('ack-recovery-code'));
    });
    await act(async () => {
      await fireEvent.input(screen.getByTestId('recovery-code-input-field'), {
        target: {
          value: totp.recoveryCodes[0],
        },
      });
    });

    expect(screen.getByTestId('recovery-code-input-field')).toBeInTheDocument();

    // back to step two
    await act(async () => {
      await fireEvent.click(screen.getByTestId('flow-container-back-btn'));
    });
    expect(screen.getByTestId('2fa-recovery-codes')).toBeInTheDocument();

    // back to step one
    await act(async () => {
      await fireEvent.click(screen.getByTestId('flow-container-back-btn'));
    });
    expect(screen.getByTestId('totp-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-totp')).toBeInTheDocument();
  });
});
