/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UrlQueryData } from '../../lib/model-data';
import { ReachRouterWindow } from '../../lib/window';
import {
  GenericIntegration,
  Integration,
  IntegrationType,
} from './integration';
import { IntegrationData } from './data/data';
import { IntegrationFeatures } from './features';

describe('Integration Model', function () {
  const window = new ReachRouterWindow();
  let model: Integration;
  beforeEach(function () {
    model = new GenericIntegration<IntegrationFeatures, IntegrationData>(
      IntegrationType.Web,
      new IntegrationData(new UrlQueryData(window)),
      {
        allowUidChange: false,
        fxaStatus: false,
        handleSignedInNotification: true,
        reuseExistingSession: false,
        supportsPairing: false,
      } satisfies IntegrationFeatures
    );
  });

  describe('isSync', function () {
    it('returns `false`', function () {
      expect(model.isSync()).toBeFalsy();
    });
  });

  describe('wantsKeys', function () {
    it('returns `false`', function () {
      expect(model.wantsKeys()).toBeFalsy();
    });
  });

  describe('requiresPasswordForLogin', function () {
    it('is true when keys are required (Sync), regardless of keys-optional support', () => {
      jest.spyOn(model, 'requiresKeys').mockReturnValue(true);
      jest.spyOn(model, 'wantsKeysIfPasswordEntered').mockReturnValue(false);
      expect(model.requiresPasswordForLogin(true)).toBe(true);
    });

    it('is true for a non-Sync client that wants keys when keys are not optional', () => {
      jest.spyOn(model, 'requiresKeys').mockReturnValue(false);
      jest.spyOn(model, 'wantsKeysIfPasswordEntered').mockReturnValue(true);
      expect(model.requiresPasswordForLogin(false)).toBe(true);
    });

    it('is false for a non-Sync client that wants keys when the browser supports keys-optional login', () => {
      jest.spyOn(model, 'requiresKeys').mockReturnValue(false);
      jest.spyOn(model, 'wantsKeysIfPasswordEntered').mockReturnValue(true);
      expect(model.requiresPasswordForLogin(true)).toBe(false);
    });

    it('is false when the client does not want keys', () => {
      jest.spyOn(model, 'requiresKeys').mockReturnValue(false);
      jest.spyOn(model, 'wantsKeysIfPasswordEntered').mockReturnValue(false);
      expect(model.requiresPasswordForLogin(false)).toBe(false);
    });

    it('treats an omitted keys-optional flag as "not supported"', () => {
      jest.spyOn(model, 'requiresKeys').mockReturnValue(false);
      jest.spyOn(model, 'wantsKeysIfPasswordEntered').mockReturnValue(true);
      expect(model.requiresPasswordForLogin()).toBe(true);
    });
  });

  describe('supportsKeylessLogin', function () {
    it('is true for a non-Sync client when the browser supports keys-optional login', () => {
      jest.spyOn(model, 'isFirefoxNonSync').mockReturnValue(true);
      expect(model.supportsKeylessLogin(true)).toBe(true);
    });

    it('is false for a Sync client even when the browser supports keys-optional login', () => {
      jest.spyOn(model, 'isFirefoxNonSync').mockReturnValue(false);
      expect(model.supportsKeylessLogin(true)).toBe(false);
    });

    it('is false when the browser does not support keys-optional login', () => {
      jest.spyOn(model, 'isFirefoxNonSync').mockReturnValue(true);
      expect(model.supportsKeylessLogin(false)).toBe(false);
    });
  });

  describe('allowsPreKeysSyncLogin', function () {
    it('is true for a desktop Sync client when the browser supports keys-optional login', () => {
      jest.spyOn(model, 'isSync').mockReturnValue(true);
      jest.spyOn(model, 'isFirefoxMobileClient').mockReturnValue(false);
      expect(model.allowsPreKeysSyncLogin(true)).toBe(true);
    });

    it('is false for a non-Sync client', () => {
      jest.spyOn(model, 'isSync').mockReturnValue(false);
      jest.spyOn(model, 'isFirefoxMobileClient').mockReturnValue(false);
      expect(model.allowsPreKeysSyncLogin(true)).toBe(false);
    });

    it('is false on Firefox mobile', () => {
      jest.spyOn(model, 'isSync').mockReturnValue(true);
      jest.spyOn(model, 'isFirefoxMobileClient').mockReturnValue(true);
      expect(model.allowsPreKeysSyncLogin(true)).toBe(false);
    });

    it('is false when the browser does not support keys-optional login', () => {
      jest.spyOn(model, 'isSync').mockReturnValue(true);
      jest.spyOn(model, 'isFirefoxMobileClient').mockReturnValue(false);
      expect(model.allowsPreKeysSyncLogin(false)).toBe(false);
    });
  });

  describe('isTrusted', function () {
    it('returns `true`', () => {
      expect(model.isTrusted()).toBeTruthy();
    });
  });
});
