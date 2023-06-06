/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createHistory, createMemorySource, History } from '@reach/router';
import {
  ModelDataStore,
  StorageData,
  UrlHashData,
  UrlQueryData,
} from '../../../lib/model-data';
import { MozServices } from '../../../lib/types';
import { Account, Relier } from '../../../models';
import { mockAppContext, MOCK_ACCOUNT } from '../../../models/mocks';
import { ReachRouterWindow } from '../../../lib/window';
import { DefaultRelierFlags, RelierFactory } from '../../../lib/reliers';
import AuthClient from 'fxa-auth-client/browser';
import { OAuthClient } from '../../../lib/oauth';
import { LocationStateData } from '../../../lib/model-data/data-stores/location-state-data';
import { IntegrationFactory } from '../../../lib/integrations/integration-factory';

const fxDesktopV3ContextParam = { context: 'fx_desktop_v3' };

export const defaultUrlQueryParams: Record<string, any> = {
  uid: MOCK_ACCOUNT.uid,
  email: MOCK_ACCOUNT.primaryEmail.email,
  emailToHashWith: MOCK_ACCOUNT.primaryEmail.email,
  token: '1111111111111111111111111111111111111111111111111111111111111111',
  code: '11111111111111111111111111111111',
  subscriptionProductName: '',
  subscriptionProductId: '',
  ...fxDesktopV3ContextParam,
};

export const defaultLocationState: Record<string, any> = {
  kB: '123',
  accountResetToken: '123',
  recoveryKeyId: '123',
};

export class UrlSearchDataMock extends UrlQueryData {
  // Holds an internal search state that is different than window.location.search
  // this works around the fact that the defacto implementations essentially act
  // as a singleton since they write and read from window.location.search
  private searchState: string;

  public debug() {
    return this.searchState;
  }

  protected override getParams(): URLSearchParams {
    return new URLSearchParams(this.searchState);
  }

  protected override setParams(params: URLSearchParams): void {
    this.searchState = params.toString();
  }

  constructor(window: ReachRouterWindow) {
    super(window);
    this.searchState = window.location.search.toString();
  }
}

export class UrlHashDataMock extends UrlHashData {
  // Holds an internal search state that is different than window.location.search
  // this works around the fact that the defacto implementations essentially act
  // as a singleton since they write and read from window.location.search
  private state: string;

  public debug() {
    return this.state;
  }

  protected override getParams(): URLSearchParams {
    return new URLSearchParams(this.state);
  }

  protected override setParams(params: URLSearchParams): void {
    this.state = params.toString();
  }

  constructor(window: ReachRouterWindow) {
    super(window);
    this.state = window.location.hash?.replace(/^#/, '') || '';
  }
}

export class StorageDataMock extends StorageData {
  public override persist(): void {
    // no op
  }
  public override load(): void {
    // no op
  }
}

export class RelierFactoryMock extends RelierFactory {}
export class IntegrationFactoryMock extends IntegrationFactory {}

let _history: History | undefined;
let _window: ReachRouterWindow | undefined;
let _urlQuery: UrlSearchDataMock | undefined;
let _urlHash: UrlHashDataMock | undefined;
let _locationState: LocationStateData | undefined;
let _storage: StorageDataMock | undefined;
let _relier: Relier | undefined;
let _relierFactory: RelierFactoryMock | undefined;
let _relierDelegate: any | undefined;
let _integrationFactory: IntegrationFactoryMock | undefined;
let _account: Account | undefined;

export function resetMocks() {
  _history = undefined;
  _window = undefined;
  _urlQuery = undefined;
  _urlHash = undefined;
  _locationState = undefined;
  _storage = undefined;
  _relier = undefined;
  _relierFactory = undefined;
  _relierDelegate = undefined;
  _integrationFactory = undefined;
  _account = undefined;
}

export function mockWindowHistory() {
  if (_history) {
    return _history;
  }
  const source = createMemorySource('/fake');
  _history = createHistory(source);
  return _history;
}

export function mockWindowWrapper() {
  if (_window) {
    return _window;
  }
  _window = new ReachRouterWindow();
  return _window;
}

export function mockUrlQueryData(urlQueryParams = defaultUrlQueryParams) {
  if (_urlQuery) {
    return _urlQuery;
  }
  const window = mockWindowWrapper();
  _urlQuery = new UrlSearchDataMock(window);
  for (const p of Object.keys(urlQueryParams)) {
    _urlQuery.set(p, urlQueryParams[p]);
  }
  return _urlQuery;
}

export const syncIntegrationUrlQueryData = mockUrlQueryData({
  ...fxDesktopV3ContextParam,
});

export function mockLocationStateData() {
  if (!_locationState) {
    const window = mockWindowWrapper();
    _locationState = new LocationStateData(window);
    for (const p of Object.keys(defaultLocationState)) {
      _locationState.set(p, defaultLocationState[p]);
    }
  }
  return _locationState;
}

export function mockUrlHashData() {
  if (!_urlHash) {
    _urlHash = new UrlHashDataMock(mockWindowWrapper());
  }
  return _urlHash;
}

export function mockStorageData() {
  if (!_storage) {
    const window = mockWindowWrapper();
    _storage = new StorageDataMock(window);
  }
  return _storage;
}

export function mockRelier() {
  if (!_relier) {
    _relier = mockRelierFactory().getRelier();
  }
  return _relier;
}

export function mockIntegration(urlQueryData = mockUrlQueryData({})) {
  return mockIntegrationFactory(urlQueryData).getIntegration();
}

function mockIntegrationFactory(urlQueryData: UrlSearchDataMock) {
  if (!_integrationFactory) {
    _integrationFactory = new IntegrationFactoryMock({
      window: mockWindowWrapper(),
      flags: new DefaultRelierFlags(urlQueryData, mockStorageData()),
    });
  }
  return _integrationFactory;
}

function mockRelierFactory() {
  if (!_relierFactory) {
    _relierFactory = new RelierFactoryMock({
      window: mockWindowWrapper(),
      delegates: mockRelierDelegates(),
      data: mockUrlQueryData(),
      channelData: mockUrlHashData(),
      flags: new DefaultRelierFlags(mockUrlQueryData(), mockStorageData()),
    });
  }
  return _relierFactory;
}

export function mockRelierDelegates() {
  if (!_relierDelegate) {
    _relierDelegate = {
      async getClientInfo(clientId: any) {
        return {};
      },
      async getProductInfo(subscriptionId: string) {
        return { productName: 'foo' };
      },
      getProductIdFromRoute() {
        return 'bar';
      },
    };
  }
  return _relierDelegate;
}

export function mockAccount() {
  if (!_account) {
    _account = {
      ...MOCK_ACCOUNT,
      setLastLogin: () => {},
      resetPasswordWithRecoveryKey: () => {},
      resetPassword: () => {},
      isSessionVerified: () => true,
    } as unknown as Account;
  }
  return _account;
}

export function mockAuthClient() {
  return {} as AuthClient;
}

export function mockOauthClient() {
  return {} as OAuthClient;
}

export function mockNavigate() {
  return jest.fn();
}

export function mockNotifier() {
  return {
    onAccountSignIn: jest.fn(),
  };
}

export function resetDataStore(source: ModelDataStore, target: ModelDataStore) {
  for (const k of source.getKeys()) {
    const val = source.get(k);
    target.set(k, val);
  }
}

export function mockContext() {
  return mockAppContext({});
}

export const MOCK_SERVICE_NAME = MozServices.FirefoxSync;
export const MOCK_RESET_DATA = {
  authAt: 12345,
  keyFetchToken: 'keyFetchToken',
  sessionToken: 'sessionToken',
  unwrapBKey: 'unwrapBKey',
  verified: true,
};
