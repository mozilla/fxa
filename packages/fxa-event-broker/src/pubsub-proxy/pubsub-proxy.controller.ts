/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  Inject,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Request } from 'express';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import { StatsD } from 'hot-shots';

import { GoogleJwtAuthGuard } from '../auth/google-jwt-auth.guard';
import { ClientWebhooksService } from '../client-webhooks/client-webhooks.service';
import { JwtsetService } from '../jwtset/jwtset.service';
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
    @Body() body: Request['body'],
    @Param('clientId') clientId: string
  ): Promise<void> {
    const webhookEndpoint = this.lookupWebhookEndpoint(clientId);
    const message = this.extractMessage(body.message.data);
    const queueDelay = Date.now() - message.timestamp;
    const jwtPayload = await this.generateSET(message, clientId);
    const { status, data } = await this.proxyMessage({
      clientId,
      jwtPayload,
      webhookEndpoint,
      message,
    });

    this.log.debug('proxyDeliverSuccess', {
      statusCode: status,
    });

    // Timing for how long the message was in the queue, reported here
    // only if the message was sent successfully to avoid repeat metrics
    // for failures.
    this.metrics.timing(`proxy.queueDelay`, queueDelay);

    throw new HttpException(data, status);
  }

  /**
   * Lookup a given clientId for its webhook endpoint and return it.
   *
   * @param clientId Client ID to lookup
   */
  private lookupWebhookEndpoint(clientId: string): string {
    const webhookData = this.webhookService.webhooks;
    if (!Object.keys(webhookData).includes(clientId)) {
      this.log.debug('proxyDelivery', {
        message: 'webhook for clientId not found',
        clientId,
      });
      throw new NotFoundException();
    }
    return webhookData[clientId];
  }

  /**
   * Extract the Google PubSub message from its encoded published format.
   *
   * See https://cloud.google.com/pubsub/docs/push#receiving_messages for message
   * encoding details.
   *
   * @param messageData Raw string message data from Google PubSub message body
   */
  private extractMessage(messageData: string): Record<string, any> {
    try {
      // The message is a unicode string encoded in base64.
      const rawMessage = Buffer.from(messageData, 'base64').toString('utf-8');
      const message = JSON.parse(rawMessage);
      this.log.debug('proxyDelivery', { message });
      return message;
    } catch (err) {
      this.log.error('proxyDelivery', {
        message: 'Failure to load message payload',
        err,
      });
      throw new BadRequestException('Invalid message');
    }
  }

  /**
   * Proxy a message from Google PubSub through to the Relying Party for the
   * provided clientId.
   *
   * @param options
   */
  private async proxyMessage(options: {
    clientId: string;
    jwtPayload: string;
    webhookEndpoint: string;
    message: Record<string, any>;
  }): Promise<AxiosResponse> {
    const { jwtPayload, webhookEndpoint, clientId, message } = options;
    const requestOptions: AxiosRequestConfig = {
      headers: { Authorization: 'Bearer ' + jwtPayload },
      url: webhookEndpoint,
      method: 'post',
    };
    try {
      const response = await axios(requestOptions);
      const now = Date.now();
      this.metrics.timing('proxy.success', now - message.changeTime, {
        clientId,
        statusCode: response.status.toString(),
        type: message.event,
      });
      if (message.event === dto.SUBSCRIPTION_UPDATE_EVENT) {
        this.metrics.timing(`proxy.sub.eventDelay`, now - message.changeTime);
      }
      return response;
    } catch (err) {
      if (err.response) {
        // Proxy normal HTTP responses that aren't 200.
        this.metrics.increment(`proxy.fail`, {
          clientId,
          statusCode: (err.response as AxiosResponse).status.toString(),
        });
        this.log.debug('proxyDeliverFail', {
          response: err.response,
          message: 'failed to proxy message',
        });
        return err.response;
      } else {
        this.log.error('proxyDeliverError', { err });
        throw err;
      }
    }
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
