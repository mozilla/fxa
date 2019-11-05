/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import { assert } from 'chai';
import AuthorityRelier from 'models/reliers/pairing/authority';
import OAuthErrors from 'lib/oauth-errors';
import OAuthClient from 'lib/oauth-client';
import Session from 'lib/session';
import sinon from 'sinon';
import TestHelpers from '../../../../lib/helpers';
import WindowMock from '../../../../mocks/window';

const ACTION = 'email';
const ACCESS_TYPE = 'offline';
const CLIENT_ID = 'dcdb5ae7add825d2';
const SCOPE = 'profile:email profile:uid';
const SERVER_REDIRECT_URI = 'http://127.0.0.1:8080/api/oauth';
const SERVICE_NAME = '123Done';
const STATE = 'fakestatetoken';

const RESUME_INFO = {
  access_type: ACCESS_TYPE, // eslint-disable-line camelcase
  action: ACTION,
  client_id: CLIENT_ID, // eslint-disable-line camelcase
  redirect_uri: SERVER_REDIRECT_URI, // eslint-disable-line camelcase
  scope: SCOPE,
  state: STATE,
};

describe('models/reliers/pairing/authority', () => {
  let relier;
  let oAuthClient;
  let windowMock;

  beforeEach(() => {
    oAuthClient = new OAuthClient();
    windowMock = new WindowMock();

    mockGetClientInfo();

    relier = new AuthorityRelier(
      {},
      {
        config: {},
        oAuthClient: oAuthClient,
        session: Session,
        window: windowMock,
      }
    );
  });

  describe('fetch', function() {
    it('throws without channel_id', () => {
      windowMock.location.search = TestHelpers.toSearchString({
        client_id: CLIENT_ID, // eslint-disable-line camelcase
        code: '123',
        redirect_uri: SERVER_REDIRECT_URI, // eslint-disable-line camelcase
      });
      Session.set('oauth', RESUME_INFO);

      return relier.fetch().then(assert.fail, err => {
        assert.isTrue(OAuthErrors.is(err, 'MISSING_PARAMETER'));
        assert.equal(err.param, 'channel_id');
      });
    });

    it('imports params with channel_id', () => {
      windowMock.location.search = TestHelpers.toSearchString({
        channel_id: '1', // eslint-disable-line camelcase
        client_id: CLIENT_ID, // eslint-disable-line camelcase
        code: '123',
        redirect_uri: SERVER_REDIRECT_URI, // eslint-disable-line camelcase
      });
      Session.set('oauth', RESUME_INFO);

      sinon.spy(relier, 'importSearchParamsUsingSchema');
      return relier.fetch().then(() => {
        assert.isTrue(
          relier.importSearchParamsUsingSchema.firstCall.calledWith({
            channel_id: { _renameTo: 'channelId' }, // eslint-disable-line camelcase
          })
        );
      });
    });
  });

  function mockGetClientInfo(paramName, paramValue) {
    if (oAuthClient.getClientInfo.restore) {
      oAuthClient.getClientInfo.restore();
    }

    sinon.stub(oAuthClient, 'getClientInfo').callsFake(() => {
      var clientInfo = {
        id: CLIENT_ID,
        name: SERVICE_NAME,
        redirect_uri: SERVER_REDIRECT_URI, // eslint-disable-line camelcase
        trusted: true,
      };

      if (! _.isUndefined(paramName)) {
        if (_.isUndefined(paramValue)) {
          delete clientInfo[paramName];
        } else {
          clientInfo[paramName] = paramValue;
        }
      }

      return Promise.resolve(clientInfo);
    });
  }
});
