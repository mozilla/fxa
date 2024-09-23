/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import sinon from 'sinon';
const assert = { ...sinon.assert, ...require('chai').assert };
import * as uuid from 'uuid';
import { getRoute } from '../../routes_helpers';
import mocks from '../../mocks';
import nock from 'nock';
import { supportRoutes } from '../../../lib/routes/subscriptions/support';
import AppError from '../../../lib/error';

let config,
  log,
  db,
  customs,
  routes,
  route,
  request,
  requestOptions,
  zendeskClient;

import { OAUTH_SCOPE_SUBSCRIPTIONS } from 'fxa-shared/oauth/constants';

const TEST_EMAIL = 'test@email.com';
const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');
const REQUESTER_ID = 987654321;
const SUBDOMAIN = 'test';

const MOCK_SCOPES = ['profile:email', OAUTH_SCOPE_SUBSCRIPTIONS];

const ORG_ID = 123456789;
// Returns a 201
const MOCK_CREATE_REPLY = {
  url: `https://${SUBDOMAIN}.zendesk.com/api/v2/requests/91.json`,
  id: 91,
  status: 'new',
  priority: 'normal',
  type: null,
  subject: 'Data loss',
  description: 'Lost allmy data, oh noes!',
  organization_id: ORG_ID,
  via: {
    channel: 'api',
    source: {
      from: {},
      to: {},
      rel: null,
    },
  },
  custom_fields: [],
  requester_id: REQUESTER_ID,
  collaborator_ids: [],
  email_cc_ids: [],
  is_public: true,
  due_at: null,
  can_be_solved_by_me: false,
  created_at: '2019-07-01T17:17:00Z',
  updated_at: '2019-07-01T17:17:00Z',
  recipient: null,
  followup_source_id: null,
  assignee_id: null,
  fields: [],
};

const MOCK_NEW_SHOW_REPLY = {
  id: 384164869571,
  url: `https://${SUBDOMAIN}.zendesk.com/api/v2/users/${REQUESTER_ID}.json`,
  name: TEST_EMAIL,
  email: TEST_EMAIL,
  created_at: '2019-07-01T17:27:01Z',
  updated_at: '2019-07-01T17:27:02Z',
  time_zone: 'Central America',
  iana_time_zone: 'America/Guatemala',
  phone: null,
  shared_phone_number: null,
  photo: null,
  locale_id: 1,
  locale: 'en-US',
  organization_id: ORG_ID,
  role: 'end-user',
  verified: false,
  external_id: null,
  tags: [],
  alias: null,
  active: true,
  shared: false,
  shared_agent: false,
  last_login_at: null,
  two_factor_auth_enabled: false,
  signature: null,
  details: null,
  notes: null,
  role_type: null,
  custom_role_id: null,
  moderator: false,
  ticket_restriction: 'requested',
  only_private_comments: false,
  restricted_agent: true,
  suspended: false,
  chat_only: false,
  default_group_id: null,
  report_csv: false,
  user_fields: {
    user_id: null,
  },
};

const MOCK_EXISTING_SHOW_REPLY = {
  ...MOCK_NEW_SHOW_REPLY,
  user_fields: {
    user_id: UID,
  },
};

const MOCK_UPDATE_REPLY = {
  ...MOCK_NEW_SHOW_REPLY,
  user_fields: {
    user_id: UID,
  },
};

function runTest(routePath, requestOptions) {
  routes = supportRoutes(log, db, config, customs, zendeskClient);
  route = getRoute(routes, routePath, requestOptions.method || 'GET');
  request = mocks.mockRequest(requestOptions);
  request.emitMetricsEvent = sinon.spy(() => Promise.resolve({}));

  return route.handler(request);
}

describe('support', () => {
  beforeEach(() => {
    config = {
      subscriptions: {
        enabled: true,
      },
      zendesk: {
        subdomain: 'test',
        productNameFieldId: '192837465',
      },
      support: {
        ticketPayloadLimit: 131072,
      },
    };

    log = mocks.mockLog();
    customs = mocks.mockCustoms();

    db = mocks.mockDB({
      uid: UID,
      email: TEST_EMAIL,
    });

    zendeskClient = require('../../../lib/zendesk-client').createZendeskClient(
      config
    );
  });

  requestOptions = {
    auth: { strategy: 'oauthToken' },
    metricsContext: mocks.mockMetricsContext(),
    credentials: {
      user: UID,
      email: TEST_EMAIL,
      scope: MOCK_SCOPES,
    },
    log: log,
    method: 'POST',
    payload: {
      plan: '123done',
      productName: 'FxA - 123done Pro',
      product: '',
      productPlatform: 'BeOS',
      productVersion: '5',
      topic: 'Payments & Billing',
      category: 'payment',
      app: 'FxOS Client',
      subject: 'Change of address',
      message: 'How do I change it?',
    },
  };

  describe('with config.subscriptions.enabled = false', () => {
    const setupNockForSuccess = () => {
      nock(`https://${SUBDOMAIN}.zendesk.com`)
        .post('/api/v2/requests.json')
        .reply(201, MOCK_CREATE_REPLY);
      nock(`https://${SUBDOMAIN}.zendesk.com`)
        .get(`/api/v2/users/${REQUESTER_ID}.json`)
        .reply(200, MOCK_NEW_SHOW_REPLY);
      nock(`https://${SUBDOMAIN}.zendesk.com`)
        .put(`/api/v2/users/${REQUESTER_ID}.json`)
        .reply(200, MOCK_UPDATE_REPLY);
    };

    const customFieldsOnTicket = [
      'FxA - 123done Pro',
      '',
      requestOptions.payload.productPlatform,
      requestOptions.payload.productVersion,
      requestOptions.payload.topic,
      'payment',
      requestOptions.payload.app,
      'Mountain View',
      'California',
      'United States',
    ];

    it('should not set up any routes', async () => {
      config.subscriptions.enabled = false;
      routes = supportRoutes(log, db, config, customs, zendeskClient);
      assert.deepEqual(routes, []);
    });

    describe('POST /support/ticket', () => {
      it('should accept a first ticket for a subscriber', async () => {
        config.subscriptions.enabled = true;
        setupNockForSuccess();
        const spy = sinon.spy(zendeskClient.requests, 'create');
        const res = await runTest('/support/ticket', requestOptions);
        const zendeskReq = spy.firstCall.args[0].request;
        assert.equal(
          zendeskReq.subject,
          `${requestOptions.payload.productName}: ${requestOptions.payload.subject}`
        );
        assert.equal(zendeskReq.comment.body, requestOptions.payload.message);
        assert.deepEqual(
          zendeskReq.custom_fields.map((field) => field.value),
          customFieldsOnTicket
        );
        assert.deepEqual(res, { success: true, ticket: 91 });
        nock.isDone();
        spy.restore();
      });

      it('should accept a second ticket for a subscriber', async () => {
        config.subscriptions.enabled = true;
        nock(`https://${SUBDOMAIN}.zendesk.com`)
          .post('/api/v2/requests.json')
          .reply(201, MOCK_CREATE_REPLY);
        nock(`https://${SUBDOMAIN}.zendesk.com`)
          .get(`/api/v2/users/${REQUESTER_ID}.json`)
          .reply(200, MOCK_EXISTING_SHOW_REPLY);
        const res = await runTest('/support/ticket', requestOptions);
        assert.deepEqual(res, { success: true, ticket: 91 });
        nock.isDone();
      });

      it('#integration - should handle retrying an update user call', async () => {
        config.subscriptions.enabled = true;
        nock(`https://${SUBDOMAIN}.zendesk.com`)
          .post('/api/v2/requests.json')
          .reply(201, MOCK_CREATE_REPLY);
        nock(`https://${SUBDOMAIN}.zendesk.com`)
          .get(`/api/v2/users/${REQUESTER_ID}.json`)
          .reply(500)
          .get(`/api/v2/users/${REQUESTER_ID}.json`)
          .reply(200, MOCK_NEW_SHOW_REPLY);
        nock(`https://${SUBDOMAIN}.zendesk.com`)
          .put(`/api/v2/users/${REQUESTER_ID}.json`)
          .reply(200, MOCK_UPDATE_REPLY);
        const spy = sinon.spy(zendeskClient.requests, 'create');
        const res = await runTest('/support/ticket', requestOptions);
        const zendeskReq = spy.firstCall.args[0].request;
        assert.equal(
          zendeskReq.subject,
          `${requestOptions.payload.productName}: ${requestOptions.payload.subject}`
        );
        assert.equal(zendeskReq.comment.body, requestOptions.payload.message);
        assert.deepEqual(
          zendeskReq.custom_fields.map((field) => field.value),
          customFieldsOnTicket
        );
        assert.deepEqual(res, { success: true, ticket: 91 });
        nock.isDone();
        spy.restore();
      });

      it('should reject tickets for a non-subscriber', async () => {
        config.subscriptions.enabled = true;
        try {
          await runTest('/support/ticket', {
            ...requestOptions,
            credentials: {
              user: UID,
              email: TEST_EMAIL,
              scope: ['profile:email'],
            },
          });
          assert.fail();
        } catch (err) {
          assert.equal(
            err.toString(),
            'Error: Requested scopes are not allowed'
          );
        }
      });

      it('should accept a ticket from another service using a shared secret', async () => {
        config.subscriptions.enabled = true;
        setupNockForSuccess();
        const spy = sinon.spy(zendeskClient.requests, 'create');
        const res = await runTest('/support/ticket', {
          ...requestOptions,
          auth: { strategy: 'supportSecret' },
          payload: { ...requestOptions.payload, email: TEST_EMAIL },
        });
        const zendeskReq = spy.firstCall.args[0].request;
        assert.equal(
          zendeskReq.subject,
          `${requestOptions.payload.productName}: ${requestOptions.payload.subject}`
        );
        assert.equal(zendeskReq.comment.body, requestOptions.payload.message);
        assert.deepEqual(
          zendeskReq.custom_fields.map((field) => field.value),
          customFieldsOnTicket
        );
        assert.deepEqual(res, { success: true, ticket: 91 });
        nock.isDone();
        spy.restore();
      });

      it('should work for someone who is not a FxA user', async () => {
        const dbAccountRecord = db.accountRecord;
        db.accountRecord = sinon.stub().throws(AppError.unknownAccount());

        config.subscriptions.enabled = true;
        setupNockForSuccess();
        const spy = sinon.spy(zendeskClient.requests, 'create');
        const res = await runTest('/support/ticket', {
          ...requestOptions,
          auth: { strategy: 'supportSecret' },
          payload: { ...requestOptions.payload, email: TEST_EMAIL },
        });
        const zendeskReq = spy.firstCall.args[0].request;
        assert.equal(
          zendeskReq.subject,
          `${requestOptions.payload.productName}: ${requestOptions.payload.subject}`
        );
        assert.equal(zendeskReq.comment.body, requestOptions.payload.message);
        assert.deepEqual(
          zendeskReq.custom_fields.map((field) => field.value),
          customFieldsOnTicket
        );
        assert.deepEqual(res, { success: true, ticket: 91 });
        nock.isDone();
        spy.restore();

        db.accountRecord = dbAccountRecord;
      });

      it('should expect an email address in the payload from another service', async () => {
        config.subscriptions.enabled = true;
        try {
          await runTest('/support/ticket', {
            ...requestOptions,
            auth: { strategy: 'supportSecret' },
          });
          assert.fail('an error should have been thrown');
        } catch (e) {
          assert.deepEqual(e, AppError.missingRequestParameter('email'));
        }
      });
    });
  });
});
