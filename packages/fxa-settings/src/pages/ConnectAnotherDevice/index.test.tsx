/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import { MOCK_ACCOUNT, renderWithRouter } from '../../models/mocks';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import ConnectAnotherDevice, { Devices, viewName } from '.';
import { usePageViewEvent } from '../../lib/metrics';
import {
  MOCK_BASIC_PROPS,
  MOCK_BROWSER_SIGNED_IN_USER,
  MOCK_DEVICE_BASIC_PROPS,
  MOCK_DEFAULTS,
  MOCK_PAIRING_ELIGIBLE_ROUTE,
  mockFxAStatus,
  mockPairingAppContext,
} from './mocks';
import { UseFxAStatusResult } from '../../lib/hooks';
import { ENTRYPOINTS, REACT_ENTRYPOINT } from '../../constants';
import firefox from '../../lib/channels/firefox';
import * as ReactUtils from 'fxa-react/lib/utils';

jest.mock('../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

jest.mock('../../lib/channels/firefox', () => ({
  ...jest.requireActual('../../lib/channels/firefox'),
  __esModule: true,
  default: {
    requestSignedInUser: jest.fn(),
    fxaOAuthFlowBegin: jest.fn(),
    fxaStatus: jest.fn(),
  },
}));

jest.mock('../../lib/glean', () => ({
  __esModule: true,
  default: {
    cad: {
      view: jest.fn(),
      submit: jest.fn(),
      startbrowsingSubmit: jest.fn(),
    },
  },
}));

describe('ConnectAnotherDevice', () => {
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders default content as expected', () => {
    renderWithRouter(
      <ConnectAnotherDevice isSignIn isSignUp={false} {...MOCK_BASIC_PROPS} />
    );
    // testAllL10n(screen, bundle);
    screen.getByText('You’re signed into Firefox');

    expect(
      screen.getByRole('img', {
        name: 'A computer and a mobile phone and a tablet with a pulsing heart on each',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Want to get your tabs, bookmarks, and passwords on another device?'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'Connect another device' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Not now' })).toBeInTheDocument();
  });

  it('hides the success message when desired', () => {
    renderWithRouter(
      <ConnectAnotherDevice
        isSignIn
        isSignUp={false}
        showSuccessMessage={false}
        isSignedIn
        canSignIn={false}
        {...MOCK_DEFAULTS}
        fxaStatus={mockFxAStatus()}
      />
    );
    // testAllL10n(screen, bundle);
    expect(
      screen.queryByText('You’re signed into Firefox')
    ).not.toBeInTheDocument();
  });

  it('shows the signup success message when desired', () => {
    renderWithRouter(
      <ConnectAnotherDevice
        isSignIn={false}
        isSignUp
        showSuccessMessage
        isSignedIn={false}
        canSignIn
        {...MOCK_DEFAULTS}
        fxaStatus={mockFxAStatus()}
      />
    );

    // testAllL10n(screen, bundle);

    screen.getByText('Email confirmed');
  });

  it('shows the signin success message when desired', () => {
    renderWithRouter(
      <ConnectAnotherDevice
        isSignIn
        isSignUp={false}
        showSuccessMessage
        isSignedIn={false}
        canSignIn
        {...MOCK_DEFAULTS}
        fxaStatus={mockFxAStatus()}
      />
    );
    // testAllL10n(screen, bundle);
    screen.getByText('Sign-in confirmed');
  });

  it('prompts a signed out user to sign in', () => {
    renderWithRouter(
      <ConnectAnotherDevice
        isSignIn
        isSignUp={false}
        showSuccessMessage={false}
        email={MOCK_ACCOUNT.primaryEmail.email}
        entrypoint={ENTRYPOINTS.FIREFOX_FX_VIEW_ENTRYPOINT}
        device={Devices.FIREFOX_DESKTOP}
        isSignedIn={false}
        canSignIn
        fxaStatus={mockFxAStatus()}
      />
    );
    // testAllL10n(screen, bundle);
    expect(
      screen.getByText('Sign in to this Firefox to complete set-up')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders device-specific messaging for Android', () => {
    renderWithRouter(
      <ConnectAnotherDevice
        device={Devices.OTHER_ANDROID}
        {...MOCK_DEVICE_BASIC_PROPS}
      />
    );
    // testAllL10n(screen, bundle);
    screen.getByText('Sign in to Firefox for Android to complete set-up');
  });

  it('renders device-specific messaging for iOS', () => {
    renderWithRouter(
      <ConnectAnotherDevice
        device={Devices.OTHER_IOS}
        {...MOCK_DEVICE_BASIC_PROPS}
      />
    );
    // testAllL10n(screen, bundle);
    screen.getByText('Sign in to Firefox for iOS to complete set-up');
  });

  it('emits the expected metrics on render', () => {
    renderWithRouter(<ConnectAnotherDevice {...MOCK_DEVICE_BASIC_PROPS} />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  // The pairing version the browser supports now arrives as props (sourced from
  // the App-level useFxAStatus web channel call) instead of being requested by
  // this page. These tests cover the resulting v1/v2 routing decision.
  describe('pairing bootstrap', () => {
    const FXA_PAIRING_V1 = 1;
    const FXA_PAIRING_V2 = 2;

    const renderPairingEligible = (
      fxaStatus: Partial<UseFxAStatusResult>,
      fxaPairingVersion: number,
      route: string = MOCK_PAIRING_ELIGIBLE_ROUTE
    ) =>
      renderWithRouter(
        <ConnectAnotherDevice fxaStatus={mockFxAStatus(fxaStatus)} />,
        { route },
        mockPairingAppContext(fxaPairingVersion)
      );

    let hardNavigate: jest.SpyInstance;

    beforeEach(() => {
      jest.clearAllMocks();
      hardNavigate = jest
        .spyOn(ReactUtils, 'hardNavigate')
        .mockImplementation(() => {});
      (firefox.requestSignedInUser as jest.Mock).mockResolvedValue(
        MOCK_BROWSER_SIGNED_IN_USER
      );
      (firefox.fxaOAuthFlowBegin as jest.Mock).mockResolvedValue(null);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('navigates to the v2 pairing flow when FxA and the browser both support version 2', async () => {
      renderPairingEligible(
        { pairingEnabled: true, pairingVersion: 2 },
        FXA_PAIRING_V2
      );

      await waitFor(() =>
        expect(hardNavigate).toHaveBeenCalledWith(
          '/pair/authority/scan_qr',
          {},
          true
        )
      );
      expect(hardNavigate).not.toHaveBeenCalledWith('/pair');
    });

    it('reads the browser pairing capabilities from props instead of requesting fxaStatus', async () => {
      renderPairingEligible(
        { pairingEnabled: true, pairingVersion: 2 },
        FXA_PAIRING_V2
      );

      await waitFor(() =>
        expect(hardNavigate).toHaveBeenCalledWith(
          '/pair/authority/scan_qr',
          {},
          true
        )
      );
      expect(firefox.fxaStatus).not.toHaveBeenCalled();
    });

    it('navigates to the v1 pairing flow when the browser only supports pairing version 1', async () => {
      renderPairingEligible(
        { pairingEnabled: true, pairingVersion: 1 },
        FXA_PAIRING_V2
      );

      await waitFor(() => expect(hardNavigate).toHaveBeenCalledWith('/pair'));
      expect(hardNavigate).not.toHaveBeenCalledWith(
        '/pair/authority/scan_qr',
        {},
        true
      );
    });

    it('navigates to the v1 pairing flow when the browser has pairing disabled', async () => {
      renderPairingEligible(
        { pairingEnabled: false, pairingVersion: 2 },
        FXA_PAIRING_V2
      );

      await waitFor(() => expect(hardNavigate).toHaveBeenCalledWith('/pair'));
      expect(hardNavigate).not.toHaveBeenCalledWith(
        '/pair/authority/scan_qr',
        {},
        true
      );
    });

    it('navigates to the v1 pairing flow when FxA pairing version is 1', async () => {
      renderPairingEligible(
        { pairingEnabled: true, pairingVersion: 2 },
        FXA_PAIRING_V1
      );

      await waitFor(() => expect(hardNavigate).toHaveBeenCalledWith('/pair'));
      expect(hardNavigate).not.toHaveBeenCalledWith(
        '/pair/authority/scan_qr',
        {},
        true
      );
    });

    it('navigates to the v1 pairing flow when the browser reports no pairing capability', async () => {
      renderPairingEligible({}, FXA_PAIRING_V2);

      await waitFor(() => expect(hardNavigate).toHaveBeenCalledWith('/pair'));
      expect(hardNavigate).not.toHaveBeenCalledWith(
        '/pair/authority/scan_qr',
        {},
        true
      );
    });

    it('navigates to the v2 pairing flow when the v=2 query param forces it, despite a v1 browser', async () => {
      renderPairingEligible(
        { pairingEnabled: true, pairingVersion: 1 },
        FXA_PAIRING_V2,
        `${MOCK_PAIRING_ELIGIBLE_ROUTE}&v=2`
      );

      await waitFor(() =>
        expect(hardNavigate).toHaveBeenCalledWith(
          '/pair/authority/scan_qr',
          {},
          true
        )
      );
      expect(hardNavigate).not.toHaveBeenCalledWith('/pair');
    });

    it('renders the loading spinner while the browser capabilities are unresolved', async () => {
      renderPairingEligible(
        { pairingEnabled: undefined, pairingVersion: undefined },
        FXA_PAIRING_V2
      );

      expect(await screen.findByLabelText('Loading…')).toBeInTheDocument();
      expect(hardNavigate).not.toHaveBeenCalled();
    });

    it('renders the page without pairing when the flow is not pairing-eligible', async () => {
      renderPairingEligible(
        { pairingEnabled: true, pairingVersion: 2 },
        FXA_PAIRING_V2,
        '/connect_another_device'
      );

      expect(
        await screen.findByRole('img', {
          name: 'A computer and a mobile phone and a tablet with a pulsing heart on each',
        })
      ).toBeInTheDocument();
      expect(hardNavigate).not.toHaveBeenCalled();
    });
  });
});
