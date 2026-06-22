/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { isAuthStateMachineEnabled } from './flag';

describe('isAuthStateMachineEnabled', () => {
  describe('?authStateMachine=true', () => {
    it('returns true even when configEnabled is false', () => {
      expect(isAuthStateMachineEnabled('?authStateMachine=true', false)).toBe(
        true
      );
    });

    it('returns true when configEnabled is also true', () => {
      expect(isAuthStateMachineEnabled('?authStateMachine=true', true)).toBe(
        true
      );
    });
  });

  describe('?authStateMachine=false', () => {
    it('returns false even when configEnabled is true', () => {
      expect(isAuthStateMachineEnabled('?authStateMachine=false', true)).toBe(
        false
      );
    });

    it('returns false when configEnabled is also false', () => {
      expect(isAuthStateMachineEnabled('?authStateMachine=false', false)).toBe(
        false
      );
    });
  });

  describe('param absent (falls back to configEnabled)', () => {
    it('returns true when configEnabled is true', () => {
      expect(isAuthStateMachineEnabled('?other=1', true)).toBe(true);
    });

    it('returns false when configEnabled is false', () => {
      expect(isAuthStateMachineEnabled('?other=1', false)).toBe(false);
    });
  });

  describe('empty or undefined search string', () => {
    it('returns configEnabled when search is undefined', () => {
      expect(isAuthStateMachineEnabled(undefined, true)).toBe(true);
      expect(isAuthStateMachineEnabled(undefined, false)).toBe(false);
    });

    it('returns configEnabled when search is an empty string', () => {
      expect(isAuthStateMachineEnabled('', true)).toBe(true);
      expect(isAuthStateMachineEnabled('', false)).toBe(false);
    });
  });
});
