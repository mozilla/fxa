/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import sinon from 'sinon';
import UserAgentMixin from 'lib/user-agent-mixin';
import WindowMock from '../../mocks/window';

const View = BaseView.extend({});

const FORCED_USER_AGENT_STRING = 'forced user agent string';
const NAVIGATOR_USER_AGENT_STRING =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/65.0';

Cocktail.mixin(View, UserAgentMixin);

describe('lib/user-agent-mixin', function() {
  let view;
  let windowMock;

  beforeEach(function() {
    windowMock = new WindowMock();
    windowMock.navigator.userAgent = NAVIGATOR_USER_AGENT_STRING;

    view = new View({
      window: windowMock,
    });
  });

  describe('getUserAgentString', () => {
    it('fetches from forceUA query parameter, if exists', () => {
      sinon.stub(view, 'getSearchParam').callsFake(param => {
        if (param === 'forceUA') {
          return FORCED_USER_AGENT_STRING;
        }
      });

      assert.equal(view.getUserAgentString(), FORCED_USER_AGENT_STRING);
    });

    it('falls back to navigator.userAgent if forceUA query parameter does not exist', () => {
      sinon.stub(view, 'getSearchParam').callsFake(param => {});

      assert.equal(view.getUserAgentString(), NAVIGATOR_USER_AGENT_STRING);
    });
  });

  describe('getUserAgent', () => {
    it('returns a UserAgent instance', () => {
      sinon.stub(view, 'getSearchParam').callsFake(param => {});

      const uap = view.getUserAgent();

      assert.isTrue(uap.isFirefox());
    });
  });
});
