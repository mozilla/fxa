/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { v4 as uuidv4 } from 'uuid';

import { JWTool, PrivateJWK } from '@fxa/vendored/jwtool';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppConfig } from '../config';
import * as set from './set.interface';

/**
 * JWT SET Service
 *
 * Generates Security Event Tokens based on JWT's for relying parties.
 *
 * See: https://tools.ietf.org/html/rfc8417
 */
@Injectable()
export class JwtsetService {
  private issuer: string;
  private tokenKey: PrivateJWK;

  constructor(configService: ConfigService<AppConfig>) {
    const config = configService.get('openid') as AppConfig['openid'];
    this.issuer = config.issuer;
    this.tokenKey = JWTool.JWK.fromObject(config.key as any, {
      iss: this.issuer,
    }) as PrivateJWK;
  }

  /**
   * Generate a Security Event Token for delivery to Relying Parties.
   *
   * Base method used to build SET's for different event types.
   *
   * @param event
   */
  public generateSET(event: set.securityEvent): Promise<string> {
    const claims = {
      aud: event.clientId,
      events: event.events,
      iat: Date.now() / 1000,
      jti: uuidv4(),
      sub: event.uid,
    };
    return this.tokenKey.sign(claims);
  }

  /**
   * Generate a Password Security Event Token.
   *
   * @param  passEvent
   */
  public generatePasswordSET(passEvent: set.passwordEvent): Promise<string> {
    return this.generateSET({
      clientId: passEvent.clientId,
      events: {
        [set.PASSWORD_EVENT_ID]: {
          changeTime: passEvent.changeTime,
        },
      },
      uid: passEvent.uid,
    });
  }

  /**
   * Generate a Profile Security Event Token.
   *
   * @param  proEvent
   */
  public generateProfileSET(proEvent: set.profileEvent): Promise<string> {
    return this.generateSET({
      clientId: proEvent.clientId,
      events: {
        [set.PROFILE_EVENT_ID]: {
          email: proEvent.email,
          locale: proEvent.locale,
          metricsEnabled: proEvent.metricsEnabled,
          totpEnabled: proEvent.totpEnabled,
          accountDisabled: proEvent.accountDisabled,
          accountLocked: proEvent.accountLocked,
        },
      },
      uid: proEvent.uid,
    });
  }

  /**
   * Generate a Subscription Security Event Token.
   *
   * @param subEvent
   */
  public generateSubscriptionSET(
    subEvent: set.subscriptionEvent
  ): Promise<string> {
    return this.generateSET({
      clientId: subEvent.clientId,
      events: {
        [set.SUBSCRIPTION_STATE_EVENT_ID]: {
          capabilities: subEvent.capabilities,
          changeTime: subEvent.changeTime,
          isActive: subEvent.isActive,
        },
      },
      uid: subEvent.uid,
    });
  }

  /**
   * Generate a Delete Security Event Token.
   *
   * @param  delEvent
   */
  public generateDeleteSET(delEvent: set.deleteEvent): Promise<string> {
    return this.generateSET({
      clientId: delEvent.clientId,
      events: {
        [set.DELETE_EVENT_ID]: {},
      },
      uid: delEvent.uid,
    });
  }

  public generateAppleMigrationSET(
    appleMigrationEvent: set.appleMigrationEvent
  ): Promise<string> {
    return this.generateSET({
      uid: appleMigrationEvent.uid,
      clientId: appleMigrationEvent.clientId,
      events: {
        [set.APPLE_USER_MIGRATION_ID]: {
          fxaEmail: appleMigrationEvent.fxaEmail,
          appleEmail: appleMigrationEvent.appleEmail,
          transferSub: appleMigrationEvent.transferSub,
          success: appleMigrationEvent.success,
          err: appleMigrationEvent.err,
          uid: appleMigrationEvent.uid,
        },
      },
    });
  }
}
