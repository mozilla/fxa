/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OAuthNativeClients, OAuthNativeServices } from './oauth';

describe('OAuthNativeClients', () => {
  it('has expected client IDs', () => {
    expect(OAuthNativeClients.FirefoxDesktop).toEqual('5882386c6d801776');
    expect(OAuthNativeClients.FirefoxIOS).toEqual('1b1a3e44c54fbb58');
    expect(OAuthNativeClients.Fenix).toEqual('a2270f727f45f648');
  });
});

describe('OAuthNativeServices', () => {
  it('has expected service names', () => {
    expect(OAuthNativeServices.Sync).toEqual('sync');
    expect(OAuthNativeServices.Relay).toEqual('relay');
    expect(OAuthNativeServices.Vpn).toEqual('vpn');
    expect(OAuthNativeServices.SmartWindow).toEqual('smartwindow');
  });
});
