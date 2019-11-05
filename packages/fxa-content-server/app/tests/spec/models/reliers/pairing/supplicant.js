/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import { assert } from 'chai';
import OAuthClient from 'lib/oauth-client';
import OAuthErrors from 'lib/oauth-errors';
import Session from 'lib/session';
import sinon from 'sinon';
import SupplicantRelier from 'models/reliers/pairing/supplicant';
import TestHelpers from '../../../../lib/helpers';
import Url from 'lib/url';
import WindowMock from '../../../../mocks/window';

const ACCESS_TYPE = 'offline';
const CLIENT_ID = 'dcdb5ae7add825d2';
const CODE_CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';
const CODE_CHALLENGE_METHOD = 'S256';
const KEYS_JWK = 'keysJwk';
const SCOPE = 'profile:email profile:uid';
const SERVER_REDIRECT_URI = 'http://127.0.0.1:8080/api/oauth';
const SERVICE_NAME = '123Done';
const STATE = 'fakestatetoken';
/*eslint-disable camelcase*/
const HASH_PARAMS = {
  channel_id: '1',
  channel_key: 'key',
};
const SEARCH_PARAMS = {
  access_type: ACCESS_TYPE,
  client_id: CLIENT_ID,
  code_challenge: CODE_CHALLENGE,
  code_challenge_method: CODE_CHALLENGE_METHOD,
  keys_jwk: KEYS_JWK,
  redirect_uri: SERVER_REDIRECT_URI,
  scope: SCOPE,
  state: STATE,
};
/*eslint-enable camelcase*/

describe('models/reliers/pairing/supplicant', () => {
  let relier;
  let oAuthClient;
  let windowMock;

  beforeEach(() => {
    oAuthClient = new OAuthClient();
    windowMock = new WindowMock();

    mockGetClientInfo();

    relier = new SupplicantRelier(
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
      /*eslint-disable camelcase*/
      windowMock.location.hash = Url.objToHashString({});
      windowMock.location.search = TestHelpers.toSearchString({
        client_id: CLIENT_ID,
        code: '123',
        redirect_uri: SERVER_REDIRECT_URI,
      });
      /*eslint-enable camelcase*/

      return relier.fetch().then(assert.fail, err => {
        assert.isTrue(OAuthErrors.is(err, 'MISSING_PARAMETER'));
        assert.equal(err.param, 'channel_id');
      });
    });

    it('throws without channel_key', () => {
      /*eslint-disable camelcase*/
      windowMock.location.hash = Url.objToHashString({
        channel_id: '1',
      });
      windowMock.location.search = TestHelpers.toSearchString({
        client_id: CLIENT_ID,
        code: '123',
        redirect_uri: SERVER_REDIRECT_URI,
      });
      /*eslint-enable camelcase*/
      return relier.fetch().then(assert.fail, err => {
        assert.isTrue(OAuthErrors.is(err, 'MISSING_PARAMETER'));
        assert.equal(err.param, 'channel_key');
      });
    });

    it('imports params with channel_id and channel_key from hash', () => {
      windowMock.location.hash = Url.objToHashString(HASH_PARAMS);
      windowMock.location.search = TestHelpers.toSearchString(SEARCH_PARAMS);

      sinon.spy(relier, 'importHashParamsUsingSchema');
      sinon.spy(relier, 'importSearchParamsUsingSchema');
      return relier.fetch().then(() => {
        assert.ok(
          Object.keys(relier.importSearchParamsUsingSchema.firstCall.args[0])
            .length,
          8
        );
        assert.isTrue(
          relier.importHashParamsUsingSchema.firstCall.calledWith({
            channel_id: { _renameTo: 'channelId' }, // eslint-disable-line camelcase
            channel_key: { _renameTo: 'channelKey' }, // eslint-disable-line camelcase
          })
        );
      });
    });
  });

  describe('getOAuthParams', function() {
    it('returns oauth params', () => {
      windowMock.location.hash = Url.objToHashString(HASH_PARAMS);
      windowMock.location.search = TestHelpers.toSearchString(SEARCH_PARAMS);

      return relier.fetch().then(() => {
        assert.deepEqual(relier.getOAuthParams(), {
          /*eslint-disable camelcase*/
          access_type: 'offline',
          client_id: 'dcdb5ae7add825d2',
          code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
          code_challenge_method: 'S256',
          keys_jwk: 'keysJwk',
          scope: 'profile:email profile:uid',
          state: 'fakestatetoken',
          /*eslint-enable camelcase*/
        });
      });
    });
  });

  describe('validateApprovalData', function() {
    it('validates code', () => {
      relier.set('state', 'one');
      try {
        relier.validateApprovalData({
          code: 'garbage',
          state: 'one',
        });
      } catch (err) {
        assert.isTrue(OAuthErrors.is(err, 'INVALID_PARAMETER'));
        assert.equal(err.param, 'code');
      }
    });

    it('validates state', () => {
      relier.set('state', 'one');
      try {
        relier.validateApprovalData({
          code:
            'fc46f44802b2a2ce979f39b2187aa1c0fc46f44802b2a2ce979f39b2187aa1c0',
          state: 'one',
        });
      } catch (err) {
        assert.isTrue(OAuthErrors.is(err, 'INVALID_PARAMETER'));
        assert.equal(err.param, 'state');
      }
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
