/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import { StatsD } from 'hot-shots';
import * as Sentry from '@sentry/node';
import { ExtendedError } from 'fxa-shared/nestjs/error';

import { GoogleJwtAuthGuard } from '../auth/google-jwt-auth.guard';
import { ClientWebhooksService } from '../client-webhooks/client-webhooks.service';
import { JwtsetService } from '../jwtset/jwtset.service';
import * as dto from '../queueworker/sqs.dto';

/**
 * Parse a fetch Response body the way axios did by default: attempt to parse
 * it as JSON, falling back to the raw text when the body isn't valid JSON.
 */
async function parseResponseBody(response: Response): Promise<any> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

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
    const webhookEndpoint = this.webhookService.getWebhookForClientId(clientId);
    if (!webhookEndpoint) {
      this.log.debug('proxyDelivery', {
        message: 'webhook for clientId not found',
        clientId,
      });
      this.metrics.increment('proxy.webhookNotFound', { clientId });
      // Return a 200 to avoid retrying if no webhook is found.
      throw new HttpException('Webhook not found', 200);
    }
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
      Sentry.captureException(err);
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
  }): Promise<{ status: number; data: any }> {
    const { jwtPayload, webhookEndpoint, clientId, message } = options;
    let response: Response;
    try {
      response = await fetch(webhookEndpoint, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + jwtPayload },
      });
    } catch (err) {
      // fetch only rejects on network-level failures; HTTP error responses
      // (4xx/5xx) resolve normally and are proxied back below.
      this.log.error('proxyDeliverError', { err });
      Sentry.captureException(err);
      throw ExtendedError.withCause('Proxy delivery error', err);
    }

    const data = await parseResponseBody(response);
    const now = Date.now();
    if (response.ok) {
      this.metrics.timing('proxy.success', now - message.timestamp, {
        clientId,
        statusCode: response.status.toString(),
        type: message.event,
      });
      if (message.event === dto.SUBSCRIPTION_UPDATE_EVENT) {
        this.metrics.timing(`proxy.sub.eventDelay`, now - message.changeTime);
      }
    } else {
      // Proxy normal HTTP responses that aren't successful.
      this.metrics.increment(`proxy.fail`, {
        clientId,
        statusCode: response.status.toString(),
        type: message.event,
      });
      this.log.debug('proxyDeliverFail', {
        statusCode: response.status,
        body: data,
        message: 'failed to proxy message',
      });
    }
    return { status: response.status, data };
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
          email: message.email,
          locale: message.locale,
          metricsEnabled: message.metricsEnabled,
          totpEnabled: message.totpEnabled,
          accountDisabled: message.accountDisabled,
          accountLocked: message.accountLocked,
        });
      }
      default:
        throw Error(`Invalid event: ${message.event}`);
    }
  }
}
