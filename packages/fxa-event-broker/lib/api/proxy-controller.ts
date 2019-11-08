/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import hapi from '@hapi/hapi';
import { StatsD } from 'hot-shots';
import { Logger } from 'mozlog';
import requests from 'request-promise-native';

import { JWT } from '../jwts';
import { ClientWebhookService } from '../selfUpdatingService/clientWebhookService';
import { DELETE_EVENT, SUBSCRIPTION_UPDATE_EVENT } from '../serviceNotifications';
import { version } from '../version';
import { proxyPayload } from './proxy-validator';

export default class ProxyController {
  constructor(
    private readonly logger: Logger,
    private metrics: StatsD,
    private readonly webhookService: ClientWebhookService,
    private readonly jwt: JWT
  ) {}

  public async heartbeat(request: hapi.Request, h: hapi.ResponseToolkit) {
    return h.response({}).code(200);
  }

  public async version(request: hapi.Request, h: hapi.ResponseToolkit) {
    const body = JSON.stringify(version);
    return h
      .response(body)
      .type('application/json')
      .code(200);
  }

  public async proxyDelivery(request: hapi.Request, h: hapi.ResponseToolkit) {
    const webhookData = this.webhookService.serviceData();
    const clientId = request.params.clientId;
    if (!Object.keys(webhookData).includes(clientId)) {
      return h.response().code(404);
    }

    const webhookEndpoint = webhookData[clientId];
    const payload = request.payload as proxyPayload;

    let message: any;

    try {
      // The message is a unicode string encoded in base64.
      const rawMessage = Buffer.from(payload.message.data, 'base64').toString('utf-8');
      message = JSON.parse(rawMessage);
      this.logger.debug('proxyDelivery', message);
    } catch (err) {
      this.logger.error('proxyDelivery', { message: 'Failure to load message payload', err });
      return h.response('Invalid message').code(400);
    }

    // Timing for how long the message was in the queue
    this.metrics.timing(`proxy.queueDelay`, Date.now() - message.timestamp);

    const jwtPayload = await this.generateSET(message, clientId);

    const options: requests.OptionsWithUri = {
      headers: { Authorization: 'Bearer ' + jwtPayload },
      resolveWithFullResponse: true,
      uri: webhookEndpoint
    };

    let response: requests.FullResponse;
    try {
      response = await requests.post(options);
      this.metrics.increment(`proxy.success.${clientId}.${response.statusCode}`);
      if (message.event === SUBSCRIPTION_UPDATE_EVENT) {
        this.metrics.timing(`proxy.sub.eventDelay`, Date.now() - message.changeTime * 1000);
      }
    } catch (err) {
      if (err.response) {
        // Proxy normal HTTP responses that aren't 200.
        this.metrics.increment(`proxy.fail.${clientId}.${err.response.statusCode}`);
        response = err.response;
      } else {
        throw err;
      }
    }

    let resp = h.response(response.body).code(response.statusCode);

    this.logger.debug('proxyDeliverSuccess', { statusCode: response.statusCode });

    // Copy the headers over to our hapi Response
    Object.entries(response.headers).map(([name, value]) => {
      if (!value) {
        return;
      }
      if (Array.isArray(value)) {
        for (const val of value) {
          resp = resp.header(name, val);
        }
      } else {
        resp = resp.header(name, value);
      }
    });

    return resp;
  }

  private async generateSET(message: any, clientId: string) {
    switch (message.event) {
      case SUBSCRIPTION_UPDATE_EVENT: {
        return await this.jwt.generateSubscriptionSET({
          capabilities: message.capabilities,
          changeTime: message.changeTime,
          clientId,
          isActive: message.isActive,
          uid: message.uid
        });
      }
      case DELETE_EVENT: {
        return await this.jwt.generateDeleteSET({
          clientId,
          uid: message.uid
        });
      }
      default:
        throw Error(`Invalid event: ${message.event}`);
    }
  }
}
