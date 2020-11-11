/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import '@testing-library/jest-dom/extend-expect';
import { act, fireEvent, screen, wait } from '@testing-library/react';
import { AuthContext, createAuthClient } from '../../lib/auth';
import {
  renderWithRouter,
  MockedCache,
  MockedProps,
  createCache,
} from '../../models/_mocks';
import React from 'react';
import PageTwoStepAuthentication, { metricsPreInPostFix } from '.';
import { CREATE_TOTP_MOCK, VERIFY_TOTP_MOCK } from './_mocks';
import { checkCode, getCode } from '../../lib/totp';
import { MockedProvider } from '@apollo/client/testing';
import { Account, GET_ACCOUNT } from '../../models/Account';
import { HomePath } from '../../constants';
import { alertTextExternal } from '../../lib/cache';
import * as Metrics from '../../lib/metrics';

jest.mock('../../lib/totp', () => ({
  ...jest.requireActual('../../lib/totp'),
  getCode: jest.fn(),
  checkCode: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../lib/cache', () => ({
  alertTextExternal: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

window.URL.createObjectURL = jest.fn();

const client = createAuthClient('none');
// `any` to disable the error from type inference on the mis-matching shapes of
// object from each array
const mocks = CREATE_TOTP_MOCK.concat(VERIFY_TOTP_MOCK as [any]);

const render = (props: MockedProps = { mocks }) =>
  renderWithRouter(
    <AuthContext.Provider value={{ auth: client }}>
      <MockedCache {...props}>
        <PageTwoStepAuthentication />
      </MockedCache>
    </AuthContext.Provider>
  );

const inputTotp = async (totp: string) => {
  await act(async () => {
    fireEvent.input(screen.getByTestId('totp-input-field'), {
      target: { value: totp },
    });
  });
};

const submitTotp = async (totp: string) => {
  await inputTotp(totp);
  await act(async () => {
    fireEvent.click(screen.getByTestId('submit-totp'));
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
    expect(screen.getByTestId('totp-input-field')).toBeInTheDocument();
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

  it('updates the GraphQL cache', async () => {
    const cache = createCache({
      account: { totp: { exists: false, verified: false } },
    });
    const spy = jest.spyOn(cache, 'modify');

    await act(async () => {
      renderWithRouter(
        <AuthContext.Provider value={{ auth: client }}>
          <MockedProvider cache={cache} mocks={mocks}>
            <PageTwoStepAuthentication />
          </MockedProvider>
        </AuthContext.Provider>
      );
    });

    expect(spy).toBeCalledTimes(1);
    const { account } = cache.readQuery<{ account: Account }>({
      query: GET_ACCOUNT,
    })!;
    expect(account.totp.exists).toEqual(true);
  });

  it('does not display the QR code for the unverified', async () => {
    await act(async () => {
      render({ verified: false });
    });
    expect(screen.queryByTestId('2fa-qr-code')).toBeNull();
    expect(screen.queryByTestId('alert-bar')).toBeNull();
  });
});

describe('step 2', () => {
  beforeEach(() => {
    resetCheckcodeMock();
  });

  it('shows the recovery codes when valid auth code is submitted', async () => {
    await act(async () => {
      render();
    });
    await submitTotp('867530');
    expect(checkCode).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('2fa-recovery-codes')).toBeInTheDocument();
    expect(screen.getByTestId('2fa-recovery-codes')).toHaveTextContent(
      CREATE_TOTP_MOCK[0].result.data.createTotp.recoveryCodes[0]
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
  const getRecoveryCodes = async () => {
    await act(async () => {
      render();
    });
    await submitTotp('867530');
    await act(async () => {
      fireEvent.click(screen.getByTestId('ack-recovery-code'));
    });
  };

  beforeEach(async () => {
    // suppress the console output
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    resetCheckcodeMock();
  });

  it('renders the recovery code form', async () => {
    await getRecoveryCodes();
    expect(screen.getByTestId('recovery-code-input-field')).toBeInTheDocument();
  });

  it('shows an error when an incorrect recovery code is entered', async () => {
    await getRecoveryCodes();
    await act(async () => {
      fireEvent.input(screen.getByTestId('recovery-code-input-field'), {
        target: { value: 'bogus' },
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-recovery-code'));
    });
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toHaveTextContent(
      'Incorrect recovery code'
    );
  });

  it('shows an generic error when the code cannot be verified', async () => {
    await getRecoveryCodes();
    (getCode as jest.Mock).mockResolvedValue('999911');
    await act(async () => {
      fireEvent.input(screen.getByTestId('recovery-code-input-field'), {
        target: {
          value: CREATE_TOTP_MOCK[0].result.data.createTotp.recoveryCodes[0],
        },
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-recovery-code'));
    });
    await wait(() =>
      expect(screen.getByTestId('alert-bar')).toBeInTheDocument()
    );
  });

  it('shows the GraphQL error when the code cannot be verified', async () => {
    await getRecoveryCodes();
    (getCode as jest.Mock).mockResolvedValue('009001');
    await act(async () => {
      fireEvent.input(screen.getByTestId('recovery-code-input-field'), {
        target: {
          value: CREATE_TOTP_MOCK[0].result.data.createTotp.recoveryCodes[0],
        },
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-recovery-code'));
    });
    await wait(() => expect(screen.getByTestId('tooltip')).toBeInTheDocument());
  });

  it('verifies and enable two step auth', async () => {
    const cache = createCache({
      account: { totp: { exists: false, verified: false } },
    });
    const modifyCacheSpy = jest.spyOn(cache, 'modify');

    await act(async () => {
      renderWithRouter(
        <AuthContext.Provider value={{ auth: client }}>
          <MockedProvider cache={cache} mocks={mocks}>
            <PageTwoStepAuthentication />
          </MockedProvider>
        </AuthContext.Provider>
      );
    });

    await submitTotp('867530');
    await act(async () => {
      fireEvent.click(screen.getByTestId('ack-recovery-code'));
    });

    (getCode as jest.Mock).mockClear();
    (getCode as jest.Mock).mockResolvedValue('001980');
    await act(async () => {
      fireEvent.input(screen.getByTestId('recovery-code-input-field'), {
        target: {
          value: CREATE_TOTP_MOCK[0].result.data.createTotp.recoveryCodes[0],
        },
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-recovery-code'));
    });
    await wait(() => expect(modifyCacheSpy).toBeCalledTimes(2));
    expect(getCode).toBeCalledTimes(1);

    const { account } = cache.readQuery<{ account: Account }>({
      query: GET_ACCOUNT,
    })!;
    expect(account.totp.verified).toEqual(true);
    expect(mockNavigate).toHaveBeenCalledWith(HomePath, { replace: true });
    expect(alertTextExternal).toHaveBeenCalledTimes(1);
    expect(alertTextExternal).toHaveBeenCalledWith(
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
      fireEvent.click(screen.getByTestId('databutton-copy'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('databutton-print'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('databutton-download'));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('ack-recovery-code'));
    });

    (getCode as jest.Mock).mockResolvedValue('001980');
    await act(async () => {
      fireEvent.input(screen.getByTestId('recovery-code-input-field'), {
        target: {
          value: CREATE_TOTP_MOCK[0].result.data.createTotp.recoveryCodes[0],
        },
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-recovery-code'));
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
      fireEvent.click(screen.getByTestId('ack-recovery-code'));
    });
    await act(async () => {
      fireEvent.input(screen.getByTestId('recovery-code-input-field'), {
        target: {
          value: CREATE_TOTP_MOCK[0].result.data.createTotp.recoveryCodes[0],
        },
      });
    });

    expect(screen.getByTestId('recovery-code-input-field')).toBeInTheDocument();

    // back to step two
    await act(async () => {
      fireEvent.click(screen.getByTestId('flow-container-back-btn'));
    });
    expect(screen.getByTestId('2fa-recovery-codes')).toBeInTheDocument();

    // back to step one
    await act(async () => {
      fireEvent.click(screen.getByTestId('flow-container-back-btn'));
    });
    expect(screen.getByTestId('totp-input-field')).toBeInTheDocument();
    expect(screen.getByTestId('submit-totp')).toBeInTheDocument();
  });
});
