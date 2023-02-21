/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UrlSearchContext } from '../../lib/context';
import { BaseRelier } from './base-relier';

describe('BaseRelier Model', function () {
  let model: BaseRelier;
  beforeEach(function () {
    const context = new UrlSearchContext(window);
    model = new BaseRelier(context);
  });

  describe('isOAuth', function () {
    it('returns `false`', function () {
      expect(model.isOAuth()).toBeFalsy();
    });
  });

  describe('isSync', function () {
    it('returns `false`', async function () {
      expect(await model.isSync()).toBeFalsy();
    });
  });

  describe('wantsKeys', function () {
    it('returns `false`', function () {
      expect(model.wantsKeys()).toBeFalsy();
    });
  });

  describe('pickResumeTokenInfo', function () {
    it('returns an empty object by default', function () {
      expect(model.pickResumeTokenInfo()).toEqual({});
    });
  });

  describe('isTrusted', function () {
    it('returns `true`', function () {
      expect(model.isTrusted()).toBeTruthy();
    });
  });

  // TODO: Move elsewhere
  // describe('accountNeedsPermissions', function () {
  //   it('returns `false`', function () {
  //     expect(relier.accountNeedsPermissions).toBeFalsy();
  //   });
  // });
});
