/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatsD } from 'hot-shots';

import { GoogleJwtAuthGuard } from '../auth/google-jwt-auth.guard';
import { ClientWebhooksService } from '../client-webhooks/client-webhooks.service';
import { JwtsetService } from '../jwtset/jwtset.service';
import { MozLoggerService } from '../logger/logger.service';
import * as dto from '../queueworker/sqs.dto';

@Controller('v1/proxy')
export class PubsubProxyController {
  constructor(
    private log: MozLoggerService,
    @Inject('METRICS') private metrics: StatsD,
    private webhookService: ClientWebhooksService,
    private jwtset: JwtsetService
  ) {}

  @UseGuards(GoogleJwtAuthGuard)
  @Post(':clientId')
  async proxy(
    @Res() res: Response,
    @Body() body: Request['body'],
    @Param('clientId') clientId: string
  ): Promise<void> {
    const webhookData = this.webhookService.webhooks;
    if (!Object.keys(webhookData).includes(clientId)) {
      res.status(404).send();
      return;
    }

    const webhookEndpoint = webhookData[clientId];

    let message: any;

    try {
      // The message is a unicode string encoded in base64.
      const rawMessage = Buffer.from(body.message.data, 'base64').toString(
        'utf-8'
      );
      message = JSON.parse(rawMessage);
      this.log.debug('proxyDelivery', { message });
    } catch (err) {
      this.log.error('proxyDelivery', {
        message: 'Failure to load message payload',
        err,
      });
      res.status(400).send('Invalid message');
      return;
    }

    // Timing for how long the message was in the queue
    this.metrics.timing(`proxy.queueDelay`, Date.now() - message.timestamp);

    const jwtPayload = await this.generateSET(message, clientId);

    const options: AxiosRequestConfig = {
      headers: { Authorization: 'Bearer ' + jwtPayload },
      url: webhookEndpoint,
      method: 'post',
    };

    let response: AxiosResponse;
    try {
      response = await axios(options);
      const now = Date.now();
      this.metrics.timing('proxy.success', now - message.changeTime, {
        clientId,
        statusCode: response.status.toString(),
        type: message.event,
      });
      if (message.event === dto.SUBSCRIPTION_UPDATE_EVENT) {
        this.metrics.timing(`proxy.sub.eventDelay`, now - message.changeTime);
      }
    } catch (err) {
      if (err.response) {
        // Proxy normal HTTP responses that aren't 200.
        this.metrics.increment(`proxy.fail`, {
          clientId,
          statusCode: (err.response as AxiosResponse).status.toString(),
        });
        response = err.response;
      } else {
        throw err;
      }
    }

    this.log.debug('proxyDeliverSuccess', {
      statusCode: response.status,
    });
    res.status(response.status).set(response.headers).send(response.data);
  }

  /**
   * Generate an appropriate SET based off the pubsub message.
   *
   * These need to be generated during delivery as they have limited
   * lifespans of validity.
   *
   * @todo It would be better to use a union type for the message.
   *
   * @param message
   * @param clientId
   */
  private async generateSET(message: any, clientId: string) {
    switch (message.event) {
      case dto.SUBSCRIPTION_UPDATE_EVENT: {
        return await this.jwtset.generateSubscriptionSET({
          capabilities: message.capabilities,
          changeTime: message.changeTime,
          clientId,
          isActive: message.isActive,
          uid: message.uid,
        });
      }
      case dto.DELETE_EVENT: {
        return await this.jwtset.generateDeleteSET({
          clientId,
          uid: message.uid,
        });
      }
      case dto.PASSWORD_RESET_EVENT:
      case dto.PASSWORD_CHANGE_EVENT: {
        return await this.jwtset.generatePasswordSET({
          changeTime: message.changeTime,
          clientId,
          uid: message.uid,
        });
      }
      case dto.PRIMARY_EMAIL_EVENT:
      case dto.PROFILE_CHANGE_EVENT: {
        return await this.jwtset.generateProfileSET({
          clientId,
          uid: message.uid,
        });
      }
      default:
        throw Error(`Invalid event: ${message.event}`);
    }
  }
}
