/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import configModule from '../../../config';
import emailDomains from '../../../config/popular-email-domains';
import { Container } from 'typedi';
import { AccountEventsManager } from '../../account-events';
import amplitudeModule from '../../metrics/amplitude';

let amplitude, accountEventsManager;

function getInsensitiveHeaderValueFromArray(headerName, headers) {
  let value = '';
  const headerNameNormalized = headerName.toLowerCase();
  headers.some((header) => {
    if (header.name.toLowerCase() === headerNameNormalized) {
      value = header.value;
      return true;
    }

    return false;
  });

  return value;
}

function getInsensitiveHeaderValueFromObject(headerName, headers) {
  const headerNameNormalized = headerName.toLowerCase();
  let value = '';
  Object.keys(headers).some((name) => {
    if (name.toLowerCase() === headerNameNormalized) {
      value = headers[name];
      return true;
    }

    return false;
  });
  return value;
}

function getHeaderValue(headerName, message) {
  const headers = getHeaders(message);

  if (Array.isArray(headers)) {
    return getInsensitiveHeaderValueFromArray(headerName, headers);
  }

  if (headers) {
    return getInsensitiveHeaderValueFromObject(headerName, headers);
  }

  return '';
}

function getHeaders(message) {
  return (message.mail && message.mail.headers) || message.headers;
}

function logErrorIfHeadersAreWeirdOrMissing(log, message, origin) {
  const headers = getHeaders(message);
  if (headers) {
    const type = typeof headers;
    if (type === 'object') {
      const deviceId = getHeaderValue('X-Device-Id', message);
      const uid = getHeaderValue('X-Uid', message);
      if (!deviceId && !uid) {
        log.warn('emailHeaders.keys', {
          keys: Object.keys(headers).join(','),
          template: getHeaderValue('X-Template-Name', message),
          origin,
        });
      }
    } else {
      log.error('emailHeaders.weird', { type, origin });
    }
  } else {
    log.error('emailHeaders.missing', { origin });
  }
}

function logEmailEventSent(log, message) {
  const emailEventInfo = {
    template: message.template,
    templateVersion: message.templateVersion,
    type: 'sent',
    flow_id: message.flowId,
  };

  if (message.productId) {
    emailEventInfo.productId = message.productId;
    emailEventInfo.planId = message.planId;
  }

  emailEventInfo.locale = getHeaderValue('Content-Language', message);

  const addrs = [message.email].concat(message.ccEmails || []);

  addrs.forEach((addr) => {
    const msg = Object.assign({}, emailEventInfo);
    msg.domain = getAnonymizedEmailDomain(addr);
    log.info('emailEvent', msg);
  });

  logAmplitudeEvent(
    log,
    message,
    Object.assign(
      {
        domain: getAnonymizedEmailDomain(message.email),
      },
      emailEventInfo
    )
  );
}

function logAmplitudeEvent(log, message, eventInfo) {
  if (!amplitude) {
    amplitude = amplitudeModule(log, configModule.config.getProperties());
  }

  amplitude(
    `email.${eventInfo.template}.${eventInfo.type}`,
    {
      app: {
        devices: Promise.resolve([]),
        geo: {
          location: {},
        },
        locale: eventInfo.locale,
        ua: {},
      },
      auth: {},
      query: {},
      payload: {},
    },
    {
      email_domain: eventInfo.domain,
      service: message.service || getHeaderValue('X-Service-Id', message),
      plan_id: eventInfo.planId,
      product_id: eventInfo.productId,
      templateVersion: eventInfo.templateVersion,
      uid: message.uid || getHeaderValue('X-Uid', message),
    },
    {
      device_id: message.deviceId || getHeaderValue('X-Device-Id', message),
      flowBeginTime:
        message.flowBeginTime || getHeaderValue('X-Flow-Begin-Time', message),
      flow_id: eventInfo.flow_id,
      time: Date.now(),
    }
  );
}

function logAccountEventFromMessage(message, type) {
  // Log email metrics to Firestore
  const templateName = getHeaderValue('X-Template-Name', message);
  const flowId = getHeaderValue('X-Flow-Id', message);
  const uid = getHeaderValue('X-Uid', message);
  const service = getHeaderValue('X-Service-Id', message);

  if (uid && Container.has(AccountEventsManager)) {
    accountEventsManager = Container.get(AccountEventsManager);
    accountEventsManager.recordEmailEvent(
      uid,
      {
        template: templateName,
        flowId,
        service,
      },
      type
    );
  }
}

function logEmailEventFromMessage(log, message, type, emailDomain) {
  const templateName = getHeaderValue('X-Template-Name', message);
  const templateVersion = getHeaderValue('X-Template-Version', message);
  const flowId = getHeaderValue('X-Flow-Id', message);
  const locale = getHeaderValue('Content-Language', message);

  const emailEventInfo = {
    domain: emailDomain,
    locale,
    template: templateName,
    templateVersion,
    type,
  };

  if (message.productId) {
    emailEventInfo.productId = message.productId;
    emailEventInfo.planId = message.planId;
  }

  if (flowId) {
    emailEventInfo['flow_id'] = flowId;
  }

  if (message.bounce) {
    emailEventInfo.bounced = true;
  }

  if (message.complaint) {
    emailEventInfo.complaint = true;
  }

  log.info('emailEvent', emailEventInfo);

  logAmplitudeEvent(log, message, emailEventInfo);
}

function logFlowEventFromMessage(log, message, type) {
  const currentTime = Date.now();
  const templateName = getHeaderValue('X-Template-Name', message);

  // Log flow metrics if `flowId` and `flowBeginTime` specified in headers
  const flowId = getHeaderValue('X-Flow-Id', message);
  const flowBeginTime = getHeaderValue('X-Flow-Begin-Time', message);
  const elapsedTime = currentTime - flowBeginTime;

  if (flowId && flowBeginTime && elapsedTime > 0 && type && templateName) {
    const eventName = `email.${templateName}.${type}`;

    // Flow events have a specific event and structure that must be emitted.
    // Ref `gather` in https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/lib/metrics/context.js
    const flowEventInfo = {
      event: eventName,
      time: currentTime,
      flow_id: flowId,
      flow_time: elapsedTime,
    };

    log.flowEvent(flowEventInfo);
  } else {
    log.error('handleBounce.flowEvent', {
      templateName,
      type,
      flowId,
      flowBeginTime,
      currentTime,
    });
  }
}

function getAnonymizedEmailDomain(email) {
  // This function returns an email domain if it is considered a popular domain,
  // which means it is in `./config/popular-email-domains.js`. Otherwise, it
  // return `other` as domain.
  const tokens = email.split('@');
  const emailDomain = tokens[1];
  let anonymizedEmailDomain = 'other';
  if (emailDomain && emailDomains.has(emailDomain)) {
    anonymizedEmailDomain = emailDomain;
  }

  return anonymizedEmailDomain;
}

export default {
  logEmailEventSent,
  logEmailEventFromMessage,
  logErrorIfHeadersAreWeirdOrMissing,
  logFlowEventFromMessage,
  logAccountEventFromMessage,
  getHeaderValue,
  getAnonymizedEmailDomain,
};
