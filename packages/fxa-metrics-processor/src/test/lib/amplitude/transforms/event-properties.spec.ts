/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import 'mocha';

import { createAmplitudeEventPropertiesMapper } from '../../../../lib/amplitude/transforms/event-properties';
import { Event, GROUPS, EventContext } from '../../../../lib/amplitude/transforms/types';
import { createServiceNameAndClientIdMapper } from '../../../../lib/amplitude/transforms/common';

const services = { foo: 'bar', fizz: 'buzz', level: 'over9000' };
const mockEvent: Event = { type: 'a', group: 'bs' };
const mockContext: EventContext = {
  eventSource: 'content',
  version: '1.165.1',
};
const mapper = createAmplitudeEventPropertiesMapper(createServiceNameAndClientIdMapper(services));

describe('Amplitude event properties mapper', () => {
  describe('with subscription plan id and product id in the event context', () => {
    it('should map the plan id and product id into the Amplitude event properties', () => {
      const eventProperties = mapper(mockEvent, {
        ...mockContext,
        planId: 'quux',
        productId: 'wibble',
      });
      assert.equal(eventProperties.plan_id, 'quux');
      assert.equal(eventProperties.product_id, 'wibble');
    });
  });

  describe('service name and client id mapping', () => {
    it('should map properties to "service" and "oauth_client_id"', () => {
      const eventProperties = mapper(mockEvent, {
        ...mockContext,
        service: 'level',
      });
      assert.equal(eventProperties.service, 'over9000');
      assert.equal(eventProperties.oauth_client_id, 'level');
    });
  });

  describe('Connect device flow properties mapping', () => {
    it('should return an empty object when event category is not in connect device flow', () => {
      const eventProperties = mapper({ ...mockEvent, category: 'disco' }, mockContext);
      assert.isUndefined(eventProperties.connect_device_flow);
      assert.isUndefined(eventProperties.connect_device_os);
    });

    it('should return the correct flow', () => {
      const eventProperties = mapper(
        { ...mockEvent, group: GROUPS.connectDevice, category: 'sms' },
        mockContext
      );
      assert.equal(eventProperties.connect_device_flow, 'sms');
      assert.isUndefined(eventProperties.connect_device_os);
    });

    it('should return the correct flow and os', () => {
      const eventProperties = mapper(
        {
          ...mockEvent,
          group: GROUPS.connectDevice,
          category: 'sms',
          target: 'os2',
        },
        mockContext
      );
      assert.equal(eventProperties.connect_device_flow, 'sms');
      assert.equal(eventProperties.connect_device_os, 'os2');
    });
  });

  describe('Email type mapping', () => {
    it('should return an empty object when there is no event category', () => {
      const eventProperties = mapper(
        { ...mockEvent, group: GROUPS.email },
        {
          ...mockContext,
          emailTypes: { 'complete-reset-password': 'reset_password' },
        }
      );
      assert.isUndefined(eventProperties.email_type);
      assert.isUndefined(eventProperties.email_provider);
      assert.isUndefined(eventProperties.email_sender);
      assert.isUndefined(eventProperties.email_service);
      assert.isUndefined(eventProperties.email_template);
      assert.isUndefined(eventProperties.email_version);
    });

    it('should return an empty object when "emailTypes" is not in the context', () => {
      const eventProperties = mapper({ ...mockEvent, group: GROUPS.email }, mockContext);
      assert.isUndefined(eventProperties.email_type);
      assert.isUndefined(eventProperties.email_provider);
      assert.isUndefined(eventProperties.email_sender);
      assert.isUndefined(eventProperties.email_service);
      assert.isUndefined(eventProperties.email_template);
      assert.isUndefined(eventProperties.email_version);
    });

    it('should return an empty object when event category is not in "emailTypes"', () => {
      const eventProperties = mapper(
        { ...mockEvent, group: GROUPS.email, category: 'xyz' },
        {
          ...mockContext,
          emailTypes: { 'complete-reset-password': 'reset_password' },
        }
      );
      assert.isUndefined(eventProperties.email_type);
      assert.isUndefined(eventProperties.email_provider);
      assert.isUndefined(eventProperties.email_sender);
      assert.isUndefined(eventProperties.email_service);
      assert.isUndefined(eventProperties.email_template);
      assert.isUndefined(eventProperties.email_version);
    });

    it('should return the correct email type properties', () => {
      const eventProperties = mapper(
        {
          ...mockEvent,
          group: GROUPS.email,
          category: 'complete-reset-password',
        },
        {
          ...mockContext,
          emailTypes: { 'complete-reset-password': 'reset_password' },
          emailDomain: 'gg.fail',
          emailSender: 'abc',
          emailService: 'xyz',
        }
      );
      assert.equal(eventProperties.email_type, 'reset_password');
      assert.equal(eventProperties.email_provider, 'gg.fail');
      assert.equal(eventProperties.email_sender, 'abc');
      assert.equal(eventProperties.email_service, 'xyz');
      assert.isUndefined(eventProperties.email_template);
      assert.isUndefined(eventProperties.email_version);
    });

    it('should return the correct email type properties with email template info', () => {
      const eventProperties = mapper(
        {
          ...mockEvent,
          group: GROUPS.email,
          category: 'complete-reset-password',
        },
        {
          ...mockContext,
          emailTypes: { 'complete-reset-password': 'reset_password' },
          emailDomain: 'gg.fail',
          emailSender: 'abc',
          emailService: 'xyz',
          templateVersion: '9000',
        }
      );
      assert.equal(eventProperties.email_type, 'reset_password');
      assert.equal(eventProperties.email_provider, 'gg.fail');
      assert.equal(eventProperties.email_sender, 'abc');
      assert.equal(eventProperties.email_service, 'xyz');
      assert.equal(eventProperties.email_template, 'complete-reset-password');
      assert.equal(eventProperties.email_version, '9000');
    });
  });

  describe('Disconnect reason mapping', () => {
    it('should be undefined when the event type is not "disconnect_device"', () => {
      const eventProperties = mapper(
        { ...mockEvent, group: GROUPS.settings, category: 'gg' },
        mockContext
      );
      assert.isUndefined(eventProperties.reason);
    });

    it('should be undefined when the there is no event category', () => {
      const eventProperties = mapper(
        {
          ...mockEvent,
          group: GROUPS.settings,
          type: 'disconnect_device',
        },
        mockContext
      );
      assert.isUndefined(eventProperties.reason);
    });

    it('should map the disconnect reason correctly', () => {
      const eventProperties = mapper(
        {
          ...mockEvent,
          group: GROUPS.settings,
          type: 'disconnect_device',
          category: 'gg',
        },
        mockContext
      );
      assert.equal(eventProperties.reason, 'gg');
    });
  });

  describe('Domain validation result mapping', () => {
    it('should be undefined when the event type is not "domain_validation_result"', () => {
      const eventProperties = mapper(
        { ...mockEvent, group: GROUPS.registration, category: 'oops' },
        mockContext
      );
      assert.isUndefined(eventProperties.validation_result);
    });

    it('should be undefined when the there is no event category', () => {
      const eventProperties = mapper(
        {
          ...mockEvent,
          group: GROUPS.registration,
          type: 'domain_validation_result',
        },
        mockContext
      );
      assert.isUndefined(eventProperties.validation_result);
    });

    it('should map the domain validation result correctly', () => {
      const eventProperties = mapper(
        {
          ...mockEvent,
          group: GROUPS.registration,
          type: 'domain_validation_result',
          category: 'oops',
        },
        mockContext
      );
      assert.equal(eventProperties.validation_result, 'oops');
    });
  });
});
