/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import helpers from '../../lib/helpers';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';
import {
  BLOCKED_SIGNIN_SUPPORT_URL,
  UID_LENGTH,
  UNBLOCK_CODE_LENGTH,
} from 'lib/constants';
import User from 'models/user';
import View from 'views/report_sign_in';
import WindowMock from '../../mocks/window';

const { createRandomHexString } = helpers;

const VALID_UID = createRandomHexString(UID_LENGTH);
const INVALID_UID = createRandomHexString(UID_LENGTH + 1);

const VALID_UNBLOCK_CODE = createRandomHexString(UNBLOCK_CODE_LENGTH);
const INCORRECT_UNBLOCK_CODE = createRandomHexString(UNBLOCK_CODE_LENGTH + 1);

describe('views/report_sign_in', () => {
  let user;
  let view;
  let windowMock;

  function createAndRender(uid, unblockCode) {
    user = new User();

    windowMock = new WindowMock();
    windowMock.location.search = `?uid=${uid}&unblockCode=${unblockCode}`;

    view = new View({
      notifier: new Notifier(),
      user,
      window: windowMock,
    });

    sinon.spy(view, 'logError');

    return view.render();
  }

  beforeEach(() => {
    return createAndRender(VALID_UID, VALID_UNBLOCK_CODE);
  });

  afterEach(() => {
    view.remove();
    view.destroy();
  });

  describe('render', () => {
    it('renders correctly', () => {
      assert.lengthOf(view.$('#fxa-report-sign-in-header'), 1);

      const $supportLinkEl = view.$('#support-link');
      assert.lengthOf($supportLinkEl, 1);
      assert.equal(
        $supportLinkEl.attr('href'),
        encodeURI(BLOCKED_SIGNIN_SUPPORT_URL)
      );
    });

    describe('with an invalid uid', () => {
      beforeEach(() => {
        return createAndRender(INVALID_UID, VALID_UNBLOCK_CODE);
      });

      it('renders link damaged, logs the error', () => {
        assert.lengthOf(view.$('#fxa-report-sign-in-link-damaged-header'), 1);

        assert.isTrue(view.logError.calledOnce);
        const reportedError = view.logError.args[0][0];
        assert.isTrue(
          AuthErrors.is(reportedError, 'DAMAGED_REJECT_UNBLOCK_LINK')
        );
      });
    });

    describe('with an invalid unblockCode', () => {
      beforeEach(() => {
        return createAndRender(VALID_UID, INCORRECT_UNBLOCK_CODE);
      });

      it('renders link damaged, logs the error', () => {
        assert.lengthOf(view.$('#fxa-report-sign-in-link-damaged-header'), 1);

        assert.isTrue(view.logError.calledOnce);
        const reportedError = view.logError.args[0][0];
        assert.isTrue(
          AuthErrors.is(reportedError, 'DAMAGED_REJECT_UNBLOCK_LINK')
        );
      });
    });
  });

  describe('submit', () => {
    beforeEach(() => {
      sinon.stub(view, 'navigate').callsFake(() => {});
      sinon
        .stub(user, 'rejectAccountUnblockCode')
        .callsFake(() => Promise.resolve());

      return view.submit();
    });

    it('reports the signin, redirects to `signin_reported`', () => {
      assert.isTrue(user.rejectAccountUnblockCode.calledOnce);
      const args = user.rejectAccountUnblockCode.args[0];
      assert.equal(args[0].get('uid'), VALID_UID);
      assert.equal(args[1], VALID_UNBLOCK_CODE);

      assert.isTrue(view.navigate.calledWith('signin_reported'));
    });
  });
});
