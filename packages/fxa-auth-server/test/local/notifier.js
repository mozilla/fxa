/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const proxyquire = require('proxyquire');
const sinon = require('sinon');
const { NotifierService } = require('@fxa/shared/notifier');
const { Container } = require('typedi');

describe.only('notifier', () => {
  const log = {
    error: sinon.spy(),
    trace: sinon.spy(),
  };
  let notifierServiceSendSpy = sinon.spy();
  let config;
  let notifier;

  beforeEach(async () => {
    log.error.resetHistory();
    log.trace.resetHistory();
    config = {
      config: {
        get: (key) => {
          if (key === 'snsTopicArn') {
            return 'arn:aws:sns:us-west-2:927034868275:foo';
          }
        },
      },
    };

    const { getAppModuleInstance, bridgeTypeDi } = proxyquire(
      `../../lib/bridge-nestjs`,
      {
        '../config': config,
      }
    );
    await getAppModuleInstance();
    await bridgeTypeDi();

    const notifierService = Container.get(NotifierService);
    notifierServiceSendSpy = sinon.spy(notifierService, 'send');
    notifier = proxyquire(`${ROOT_DIR}/lib/notifier`, {
      '../config': config,
    })(log);
  });

  afterEach(() => {
    sinon.reset();
  });

  it('sends event to notifier service', () => {
    const event = {
      event: 'stuff',
    };
    const cb = () => {};
    notifier.send(event, cb);
    sinon.assert.calledWith(notifierServiceSendSpy, event, cb);
  });
});
