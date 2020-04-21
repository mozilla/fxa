/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import { assert } from 'chai';
import 'mocha';
import sinon from 'sinon';

import {
  createServiceNameAndClientIdMapper,
  mapLocation,
  tee,
  sha256Hmac,
  prune
} from '../../../../lib/amplitude/transforms/common';
import { EventContext } from '../../../../lib/amplitude/transforms/types';

const mockContext: EventContext = {
  eventSource: 'content',
  version: '1.165.1'
};
const services = { foo: 'bar', fizz: 'buzz', level: 'over9000' };
const mapper = createServiceNameAndClientIdMapper(services);

describe('service name and client id mapping', () => {
  it('should return a undefined service name and client id when "service" is not in the event context', () => {
    const props = mapper(mockContext);
    assert.isUndefined(props.serviceName);
    assert.isUndefined(props.clientId);
  });

  it('should return a undefined service name and client id when "service" in context is "content-server"', () => {
    const props = mapper({
      ...mockContext,
      service: 'content-server'
    });
    assert.isUndefined(props.serviceName);
    assert.isUndefined(props.clientId);
  });

  it('should return "sync" as service name when "service" in context is "sync"', () => {
    const props = mapper({
      ...mockContext,
      service: 'sync'
    });
    assert.equal(props.serviceName, 'sync');
    assert.isUndefined(props.clientId);
  });

  it('should return service name from services map when found', () => {
    const props = mapper({
      ...mockContext,
      service: 'level'
    });
    assert.equal(props.serviceName, 'over9000');
    assert.equal(props.clientId, 'level');
  });

  it('should return "undefined_oauth" when service is not in services map', () => {
    const props = mapper({
      ...mockContext,
      service: 'wibble'
    });
    assert.equal(props.serviceName, 'undefined_oauth');
    assert.equal(props.clientId, 'wibble');
  });
});

describe('location properties mapper', () => {
  it('should be empty if given location is undefined', () => {
    const actual = mapLocation(mockContext);
    assert.deepEqual(actual, {});
  });

  it('should be empty if given location is empty', () => {
    const actual = mapLocation({ ...mockContext, location: {} });
    assert.deepEqual(actual, {});
  });

  it('should map the country correctly', () => {
    const actual = mapLocation({
      ...mockContext,
      location: { country: 'United Devices of von Neumann', state: null }
    });
    assert.deepEqual(actual, {
      country: 'United Devices of von Neumann',
      region: null
    });
  });

  it('should map the region correctly', () => {
    const actual = mapLocation({
      ...mockContext,
      location: { country: null, state: 'Memory Palace' }
    });
    assert.deepEqual(actual, {
      country: null,
      region: 'Memory Palace'
    });
  });

  it('should map the country and region correctly', () => {
    const actual = mapLocation({
      ...mockContext,
      location: {
        country: 'United Devices of von Neumann',
        state: 'Memory Palace'
      }
    });
    assert.deepEqual(actual, {
      country: 'United Devices of von Neumann',
      region: 'Memory Palace'
    });
  });
});

describe('property pruning', () => {
  it('should remove null, undefined, and "none"', () => {
    const actual = prune({
      foo: 'bar',
      fuuz: null,
      fizz: undefined,
      extra: 'none',
      level: 9001
    });
    assert.deepEqual(actual, { foo: 'bar', level: 9001 });
  });
});

describe('property copying', () => {
  it('should copy specified values correctly', () => {
    const actual = tee(
      { type: 'fake.io.event', time: 9001 },
      {
        ...mockContext,
        deviceId: 'wibble',
        flowBeginTime: 1586282556983,
        lang: 'gd',
        uid: 'quuz'
      }
    );
    assert.deepEqual(actual, {
      time: 9001,
      device_id: 'wibble',
      session_id: 1586282556983,
      language: 'gd',
      user_id: 'quuz'
    });
  });
});

describe('sha256 HMAC', () => {
  it('should hmac with crypto correctly', () => {
    const hmacMock = { update: sinon.stub(), digest: sinon.stub() };
    const stub = sinon.stub(crypto, 'createHmac').returns(hmacMock as any); // :(
    sha256Hmac('coolkey', 'quuz', 'message');
    sinon.assert.calledOnceWithExactly(stub, 'sha256', 'coolkey');
    assert.deepEqual(hmacMock.update.args, [['quuz'], ['message']]);
    sinon.assert.calledOnceWithExactly(hmacMock.digest, 'hex');
    stub.restore();
  });
});
