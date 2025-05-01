/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import AuthClient from 'fxa-auth-client';
import { SessionVerifiedState } from 'fxa-shared/db/models/auth/session-token';
import { MozLoggerService } from '@fxa/shared/mozlog';

import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { GqlCustomsGuard } from '../auth/gql-customs.guard';
import { AuthClientService } from '../backend/auth-client.service';
import {
  GqlSessionToken,
  GqlUserId,
  GqlUserState,
  GqlXHeaders,
} from '../decorators';
import { DestroySessionInput } from './dto/input';
import { BasicMutationInput } from './dto/input/basic-mutation';
import { SessionReauthInput } from './dto/input/session-reauth';
import { BasicPayload } from './dto/payload';
import { SessionReauthedAccountPayload } from './dto/payload/session-reauthed-account';
import { CatchGatewayError } from './lib/error';
import { Session as SessionType, SessionStatus } from './model/session';
import { SessionVerifyCodeInput } from './dto/input/session-verify-code';
import { ConsumeRecoveryCodePayload } from './dto/payload/consume-recovery-code';
import { ConsumeRecoveryCodeInput } from './dto/input/consume-recovery-code';
import { UnverifiedSessionGuard } from '../auth/unverified-session-guard';
import { validateSessionToken } from '../auth/session-token.strategy';

@Resolver((of: any) => SessionType)
export class SessionResolver {
  constructor(
    private log: MozLoggerService,
    @Inject(AuthClientService) private authAPI: AuthClient
  ) {}

  @Mutation((returns) => BasicPayload, {
    description: 'Logs out the current session',
  })
  @UseGuards(GqlAuthGuard)
  public async destroySession(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => DestroySessionInput })
    input: DestroySessionInput
  ): Promise<BasicPayload> {
    await this.authAPI.sessionDestroy(token, undefined, headers);
    return {
      clientMutationId: input.clientMutationId,
    };
  }

  @Query((returns) => SessionType)
  @UseGuards(GqlAuthGuard)
  session(@GqlUserId() uid: string, @GqlUserState() state: string) {
    this.log.info('session', { uid });
    return {
      verified: state === 'verified',
    } as SessionType;
  }

  @Query((returns) => Boolean)
  async isValidToken(
    @Args('sessionToken', { nullable: false }) sessionToken: string
  ) {
    try {
      await validateSessionToken(sessionToken);
      return true;
    } catch (err) {
      return false;
    }
  }

  @Query((returns) => SessionStatus)
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  public sessionStatus(
    @GqlUserId() uid: hexstring,
    @GqlUserState() state: SessionVerifiedState
  ): SessionStatus {
    return { state, uid };
  }

  @Mutation((returns) => SessionReauthedAccountPayload, {
    description: 'Re-authenticate an existing session token.',
  })
  @CatchGatewayError
  public async reauthSession(
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => SessionReauthInput }) input: SessionReauthInput
  ): Promise<SessionReauthedAccountPayload> {
    const result = await this.authAPI.sessionReauthWithAuthPW(
      input.sessionToken,
      input.email,
      input.authPW,
      input.options,
      headers
    );
    return {
      clientMutationId: input.clientMutationId,
      ...result,
    };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Resend a verify code.',
  })
  @UseGuards(GqlAuthGuard)
  @CatchGatewayError
  public async resendVerifyCode(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => BasicMutationInput }) input: BasicMutationInput
  ): Promise<BasicPayload> {
    await this.authAPI.sessionResendVerifyCode(token, headers);
    return {
      clientMutationId: input.clientMutationId,
    };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Verify a OTP code.',
  })
  @UseGuards(GqlAuthGuard)
  @CatchGatewayError
  public async verifyCode(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => SessionVerifyCodeInput })
    input: SessionVerifyCodeInput
  ): Promise<BasicPayload> {
    await this.authAPI.sessionVerifyCode(
      token,
      input.code,
      input.options,
      headers
    );
    return {
      clientMutationId: input.clientMutationId,
    };
  }

  @Mutation((returns) => ConsumeRecoveryCodePayload, {
    description:
      'Verify session with a 2FA backup authentication (recovery) code',
  })
  @UseGuards(UnverifiedSessionGuard)
  @CatchGatewayError
  public async consumeRecoveryCode(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => ConsumeRecoveryCodeInput })
    input: ConsumeRecoveryCodeInput
  ): Promise<ConsumeRecoveryCodePayload> {
    const result = await this.authAPI.consumeRecoveryCode(
      token,
      input.code,
      headers
    );
    return {
      clientMutationId: input.clientMutationId,
      ...result,
    };
  }
}
