/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NavigateFn, NavigateOptions } from '@reach/router';
import {
  ModelDataStore,
  StorageData,
  UrlHashData,
  UrlQueryData,
  GenericData,
} from '../../../lib/model-data';
import { MozServices } from '../../../lib/types';
import { Account } from '../../../models';
import { mockAppContext, MOCK_ACCOUNT } from '../../../models/mocks';
import { WindowWrapper } from '../../../lib/model-data/data-stores/url-data';
import { DefaultRelierFlags, RelierFactory } from '../../../lib/reliers';

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

  constructor(window: WindowWrapper) {
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

  constructor(window: WindowWrapper) {
    super(window);
    this.state = window.location.hash.replace(/^#/, '');
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

export function mockUrlQueryData() {
  const ctx = new UrlSearchDataMock(window);
  const params: Record<string, string> = {
    uid: MOCK_ACCOUNT.uid,
    email: MOCK_ACCOUNT.primaryEmail.email,
    emailToHashWith: MOCK_ACCOUNT.primaryEmail.email,
    token: '1111111111111111111111111111111111111111111111111111111111111111',
    code: '11111111111111111111111111111111',
    subscriptionProductName: '',
    subscriptionProductId: '',
    context: 'fx_desktop_v3',
  };

  for (const p of Object.keys(params)) {
    ctx.set(p, params[p]);
  }

  return ctx;
}

export function mockLocationData() {
  return new GenericData({
    kB: '123',
    accountResetToken: '123',
    recoveryKeyId: '123',
  });
}

export function mockUrlHashData() {
  const ctx = new UrlHashDataMock(window);
  const params: Record<string, string> = {};
  for (const p of Object.keys(params)) {
    ctx.set(p, params[p]);
  }
  return ctx;
}

export function mockStorageData() {
  return new StorageDataMock(window);
}

export function mockRelier(
  urlQueryData: UrlQueryData,
  urlHashData: UrlHashData,
  storageData: StorageData
) {
  const factory = mockRelierFactory(urlQueryData, urlHashData, storageData);
  return factory.getRelier();
}

export function mockRelierFactory(
  urlQueryData: UrlQueryData,
  urlHashData: UrlHashData,
  storageData: StorageData
) {
  const factory = new RelierFactoryMock({
    delegates: {
      async getClientInfo(clientId: any) {
        return {};
      },
      async getProductInfo(subscriptionId: string) {
        return { productName: 'foo' };
      },
      getProductIdFromRoute() {
        return 'bar';
      },
    },
    data: urlQueryData,
    channelData: urlHashData,
    flags: new DefaultRelierFlags(urlQueryData, storageData),
  });
  return factory;
}

export function mockAccount() {
  return {
    ...MOCK_ACCOUNT,
    setLastLogin: () => {},
    resetPasswordWithRecoveryKey: () => {},
    resetPassword: () => {},
  } as unknown as Account;
}

export type NavOpts = {};
export const mockNavigate: NavigateFn = async (
  to: string | number,
  options?: NavigateOptions<NavOpts>
) => {
  console.log('Would have called navigate with', { to, options });
};

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
