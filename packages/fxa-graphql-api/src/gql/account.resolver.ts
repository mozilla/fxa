/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import AuthClient, { deriveHawkCredentials } from 'fxa-auth-client';
import {
  Account,
  AccountOptions,
  EmailBounce,
  SessionToken,
} from 'fxa-shared/db/models/auth';
import { profileByUid, selectedAvatar } from 'fxa-shared/db/models/profile';
import {
  ExtraContext,
  reportRequestException,
} from 'fxa-shared/nestjs/sentry/reporting';
import { GraphQLResolveInfo } from 'graphql';
import {
  parseResolveInfo,
  ResolveTree,
  simplifyParsedResolveInfoFragmentWithType,
} from 'graphql-parse-resolve-info';

import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { UnverifiedSessionGuard } from '../auth/unverified-session-guard';
import { GqlCustomsGuard } from '../auth/gql-customs.guard';
import { AuthClientService } from '../backend/auth-client.service';
import { ProfileClientService } from '../backend/profile-client.service';
import { GqlSessionToken, GqlUserId, GqlXHeaders } from '../decorators';
import {
  AttachedClientDisconnectInput,
  ChangeRecoveryCodesInput,
  CreateTotpInput,
  DeleteRecoveryKeyInput,
  DeleteTotpInput,
  EmailInput,
  SendSessionVerificationInput,
  UpdateDisplayNameInput,
  VerifyEmailInput,
  VerifyEmailCodeInput,
  VerifySessionInput,
  VerifyTotpInput,
  PasswordForgotSendCodeInput,
  PasswordForgotVerifyCodeInput,
  PasswordForgotCodeStatusInput,
  AccountResetInput,
  AccountStatusInput,
  RecoveryKeyBundleInput,
  PasswordChangeStartInput,
  PasswordChangeFinishInput,
} from './dto/input';
import { DeleteAvatarInput } from './dto/input/delete-avatar';
import { MetricsOptInput } from './dto/input/metrics-opt';
import { RejectUnblockCodeInput } from './dto/input/reject-unblock-code';
import { SignInInput } from './dto/input/sign-in';
import { SignUpInput } from './dto/input/sign-up';
import {
  BasicPayload,
  ChangeRecoveryCodesPayload,
  CreateTotpPayload,
  UpdateDisplayNamePayload,
  VerifyTotpPayload,
  PasswordForgotSendCodePayload,
  PasswordForgotVerifyCodePayload,
  PasswordForgotCodeStatusPayload,
  AccountResetPayload,
  AccountStatusPayload,
  RecoveryKeyBundlePayload,
  CredentialStatusPayload,
  PasswordChangeStartPayload,
  WrappedKeysPayload,
  PasswordChangeFinishPayload,
} from './dto/payload';
import { SignedInAccountPayload } from './dto/payload/signed-in-account';
import { SignedUpAccountPayload } from './dto/payload/signed-up-account';
import { CatchGatewayError } from './lib/error';
import { Account as AccountType } from './model/account';
import { uuidTransformer } from 'fxa-shared/db/transformers';
import { FinishedSetupAccountPayload } from './dto/payload/finished-setup-account';
import { FinishSetupInput } from './dto/input/finish-setup';
import { EmailBounceStatusPayload } from './dto/payload/email-bounce';
import { NotifierService } from '@fxa/shared/notifier';
import { MozLoggerService } from '@fxa/shared/mozlog';

function snakeToCamel(str: string) {
  return str.replace(/(_\w)/g, (m: string) => m[1].toUpperCase());
}

/**
 * Converts an object with keys that are possibly snake_cased to an
 * object with keys that are camelCased.
 *
 * @param obj Object with string keys
 */
export function snakeToCamelObject(obj: { [key: string]: any }) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [snakeToCamel(k), v])
  );
}

@Resolver((of: any) => AccountType)
export class AccountResolver {
  constructor(
    @Inject(AuthClientService) private authAPI: AuthClient,
    private notifier: NotifierService,
    private profileAPI: ProfileClientService,
    private log: MozLoggerService
  ) {}

  private shouldIncludeEmails(info: GraphQLResolveInfo): boolean {
    // Introspect the query to determine if we should load the emails
    const parsed: ResolveTree = parseResolveInfo(info) as ResolveTree;
    const simplified = simplifyParsedResolveInfoFragmentWithType(
      parsed,
      info.returnType
    );
    return simplified.fields.hasOwnProperty('emails');
  }

  private shouldIncludeLinkedAccounts(info: GraphQLResolveInfo): boolean {
    // Introspect the query to determine if we should load the linked accounts
    const parsed: ResolveTree = parseResolveInfo(info) as ResolveTree;
    const simplified = simplifyParsedResolveInfoFragmentWithType(
      parsed,
      info.returnType
    );
    return simplified.fields.hasOwnProperty('linkedAccounts');
  }

  private shouldIncludeSecurityEvents(info: GraphQLResolveInfo): boolean {
    // Introspect the query to determine if we should load account events
    const parsed: ResolveTree = parseResolveInfo(info) as ResolveTree;
    const simplified = simplifyParsedResolveInfoFragmentWithType(
      parsed,
      info.returnType
    );
    return simplified.fields.hasOwnProperty('securityEvents');
  }

  @Mutation((returns) => CreateTotpPayload, {
    description:
      'Create a new randomly generated TOTP token for a user if they do not currently have one.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  public async createTotp(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => CreateTotpInput })
    input: CreateTotpInput
  ): Promise<CreateTotpPayload> {
    const result = await this.authAPI.createTotpToken(
      token,
      {
        metricsContext: input.metricsContext,
      },
      headers
    );
    return {
      clientMutationId: input.clientMutationId,
      ...result,
    };
  }

  @Mutation((returns) => VerifyTotpPayload, {
    description:
      'Verifies the current session if the passed TOTP code is valid.',
  })
  @UseGuards(UnverifiedSessionGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async verifyTotp(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => VerifyTotpInput })
    input: VerifyTotpInput
  ): Promise<VerifyTotpPayload> {
    const result = await this.authAPI.verifyTotpCode(
      token,
      input.code,
      input.service ? { service: input.service } : undefined,
      headers
    );
    return {
      clientMutationId: input.clientMutationId,
      ...result,
    };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Deletes the current TOTP token for the user.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async deleteTotp(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => DeleteTotpInput })
    input: DeleteTotpInput
  ): Promise<BasicPayload> {
    await this.authAPI.deleteTotpToken(token, headers);
    return {
      clientMutationId: input.clientMutationId,
    };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Deletes the current recovery key for the user.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async deleteRecoveryKey(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => DeleteRecoveryKeyInput })
    input: DeleteRecoveryKeyInput
  ): Promise<BasicPayload> {
    await this.authAPI.deleteRecoveryKey(token, headers);
    return {
      clientMutationId: input.clientMutationId,
    };
  }

  @Mutation((returns) => ChangeRecoveryCodesPayload, {
    description:
      'Return new backup authentication codes while removing old ones.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async changeRecoveryCodes(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => ChangeRecoveryCodesInput })
    input: ChangeRecoveryCodesInput
  ): Promise<ChangeRecoveryCodesPayload> {
    const result = await this.authAPI.replaceRecoveryCodes(token, headers);
    return {
      clientMutationId: input.clientMutationId,
      recoveryCodes: result.recoveryCodes,
    };
  }

  @Mutation((returns) => UpdateDisplayNamePayload, {
    description: 'Update the display name.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async updateDisplayName(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => UpdateDisplayNameInput })
    input: UpdateDisplayNameInput
  ): Promise<UpdateDisplayNamePayload> {
    const result = await this.profileAPI.updateDisplayName(
      token,
      input.displayName,
      headers
    );
    return {
      clientMutationId: input.clientMutationId,
      displayName: result ? input.displayName : undefined,
    };
  }

  // UpdateAvatar is disabled while uploads go directly to profile server.
  // We need further testing of this implementation at scale before
  // we enable it in production.

  // @Mutation((returns) => UpdateAvatarPayload, {
  //   description: 'Update the avatar in use.',
  // })
  // @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  // @CatchGatewayError
  // public async updateAvatar(
  //   @GqlSessionToken() token: string,
  //   @Args('input', { type: () => UpdateAvatarInput }) input: UpdateAvatarInput
  // ): Promise<UpdateAvatarPayload> {
  //   const file = await input.file;
  //   const fileData = await getStream.buffer(file.createReadStream());
  //   const avatar = await this.profileAPI.avatarUpload(
  //     token,
  //     file.mimetype,
  //     fileData
  //   );
  //   return { clientMutationId: input.clientMutationId, avatar };
  // }

  @Mutation((returns) => BasicPayload, {
    description: 'Delete the avatar.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async deleteAvatar(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => DeleteAvatarInput }) input: DeleteAvatarInput
  ): Promise<BasicPayload> {
    await this.profileAPI.avatarDelete(token, input.id, headers);
    return { clientMutationId: input.clientMutationId };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Create a secondary email for the signed in account.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async createSecondaryEmail(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => EmailInput }) input: EmailInput
  ): Promise<BasicPayload> {
    await this.authAPI.recoveryEmailCreate(
      token,
      input.email,
      {
        verificationMethod: 'email-otp',
      },
      headers
    );
    return { clientMutationId: input.clientMutationId };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Reset the verification code to a secondary email.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async resendSecondaryEmailCode(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => EmailInput }) input: EmailInput
  ): Promise<BasicPayload> {
    await this.authAPI.recoveryEmailSecondaryResendCode(
      token,
      input.email,
      headers
    );
    return { clientMutationId: input.clientMutationId };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Verify the email address with a code.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async verifySecondaryEmail(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => VerifyEmailInput }) input: VerifyEmailInput
  ) {
    await this.authAPI.recoveryEmailSecondaryVerifyCode(
      token,
      input.email,
      input.code,
      headers
    );
    return { clientMutationId: input.clientMutationId };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Remove the secondary email for the signed in account.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async deleteSecondaryEmail(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => EmailInput }) input: EmailInput
  ): Promise<BasicPayload> {
    await this.authAPI.recoveryEmailDestroy(token, input.email, headers);
    return { clientMutationId: input.clientMutationId };
  }

  @Mutation((returns) => BasicPayload, {
    description:
      'Change users primary email address, this email address must belong to the user and be verified.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async updatePrimaryEmail(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => EmailInput }) input: EmailInput
  ): Promise<BasicPayload> {
    await this.authAPI.recoveryEmailSetPrimaryEmail(
      token,
      input.email,
      headers
    );
    return { clientMutationId: input.clientMutationId };
  }

  @Mutation((returns) => BasicPayload, {
    description:
      "Destroy all tokens held by a connected client, disconnecting it from the user's account.",
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async attachedClientDisconnect(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => AttachedClientDisconnectInput })
    input: AttachedClientDisconnectInput
  ) {
    await this.authAPI.attachedClientDestroy(token, input, headers);
    return { clientMutationId: input.clientMutationId };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Send a session verification email.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async sendSessionVerificationCode(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => SendSessionVerificationInput })
    input: SendSessionVerificationInput
  ) {
    await this.authAPI.sessionResendVerifyCode(token, headers);
    return { clientMutationId: input.clientMutationId };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Verify the session via an email code.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async verifySession(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => VerifySessionInput }) input: VerifySessionInput
  ) {
    await this.authAPI.sessionVerifyCode(token, input.code, undefined, headers);
    return { clientMutationId: input.clientMutationId };
  }

  @Mutation((returns) => BasicPayload, {
    description:
      'Set the metrics opt in or out state, and notify RPs of the change',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async metricsOpt(
    @GqlUserId() uid: string,
    @Args('input', { type: () => MetricsOptInput })
    input: MetricsOptInput
  ): Promise<BasicPayload> {
    await Account.setMetricsOpt(uid, input.state);

    if (!['in', 'out'].includes(input.state)) {
      throw new Error(
        `Invalid metrics opt state! State must be in or out, but recieved ${input.state}.`
      );
    }

    await this.notifier.send({
      event: 'profileDataChange',
      data: {
        ts: Date.now() / 1000,
        uid,
        metricsEnabled: input.state === 'in',
      },
    });

    return { clientMutationId: input.clientMutationId };
  }

  @Query((returns) => AccountType, { nullable: true })
  @UseGuards(GqlAuthGuard)
  public account(@GqlUserId() uid: string, @Info() info: GraphQLResolveInfo) {
    this.log.info('account', { uid });

    const options: AccountOptions = this.shouldIncludeEmails(info)
      ? { include: ['emails'] }
      : { include: [] };

    if (this.shouldIncludeLinkedAccounts(info)) {
      options?.include?.push('linkedAccounts');
    }

    if (this.shouldIncludeSecurityEvents(info)) {
      options?.include?.push('securityEvents');
    }

    return Account.findByUid(uid, options);
  }

  @Query((returns) => EmailBounceStatusPayload, {
    description: 'Check if bounces exist for an account, using email address.',
  })
  @CatchGatewayError
  public async emailBounceStatus(
    @Args('input', { type: () => String! })
    input: string
  ): Promise<EmailBounceStatusPayload> {
    const bounces = await EmailBounce.findByEmail(input);
    const hasHardBounce = bounces.some((bounce) => bounce.bounceType === 1);
    return { hasHardBounce };
  }

  @Mutation((returns) => PasswordForgotSendCodePayload, {
    description: 'Send a password reset email.',
  })
  @CatchGatewayError
  public async passwordForgotSendCode(
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => PasswordForgotSendCodeInput })
    input: PasswordForgotSendCodeInput
  ) {
    return this.authAPI.passwordForgotSendCode(input.email, input, headers);
  }

  @Mutation((returns) => PasswordForgotVerifyCodePayload, {
    description: 'Verify password forgot token, returns account reset token',
  })
  @CatchGatewayError
  public async passwordForgotVerifyCode(
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => PasswordForgotVerifyCodeInput })
    input: PasswordForgotVerifyCodeInput
  ) {
    return this.authAPI.passwordForgotVerifyCode(
      input.code,
      input.token,
      {},
      headers
    );
  }

  @Mutation((returns) => PasswordForgotCodeStatusPayload, {
    description: 'Verify password forgot token, returns account reset token',
  })
  @CatchGatewayError
  public async passwordForgotCodeStatus(
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => PasswordForgotCodeStatusInput })
    input: PasswordForgotCodeStatusInput
  ) {
    return this.authAPI.passwordForgotStatus(input.token, headers);
  }

  @Mutation((returns) => AccountResetPayload, {
    description: 'Resets an account',
  })
  @CatchGatewayError
  public async accountReset(
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => AccountResetInput })
    input: AccountResetInput
  ): Promise<AccountResetPayload> {
    const result = await this.authAPI.accountResetAuthPW(
      input.newPasswordAuthPW,
      input.accountResetToken,
      input.newPasswordV2 || {},
      input.options,
      headers
    );
    return {
      clientMutationId: input.clientMutationId,
      ...result,
    };
  }

  @Mutation((returns) => SignedUpAccountPayload, {
    description: 'Call auth-server to sign up an account',
  })
  @CatchGatewayError
  public async signUp(
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => SignUpInput })
    input: SignUpInput
  ): Promise<SignedUpAccountPayload> {
    const result = await this.authAPI.signUpWithAuthPW(
      input.email,
      input.authPW,
      input.passwordV2 || {},
      input.options,
      headers
    );
    return {
      clientMutationId: input.clientMutationId,
      ...result,
    };
  }

  @Mutation((returns) => FinishedSetupAccountPayload, {
    description: 'Call auth-server to finish signing up a "stub" account',
  })
  @CatchGatewayError
  public async finishSetup(
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => FinishSetupInput })
    input: FinishSetupInput
  ): Promise<FinishedSetupAccountPayload> {
    const result = await this.authAPI.finishSetupWithAuthPW(
      input.token,
      input.authPW,
      input.passwordV2 || {},
      headers
    );
    return {
      clientMutationId: input.clientMutationId,
      ...result,
    };
  }

  @Mutation((returns) => SignedInAccountPayload, {
    description: 'Call auth-server to sign in an account',
  })
  @CatchGatewayError
  public async signIn(
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => SignInInput })
    input: SignInInput
  ): Promise<SignedInAccountPayload> {
    const result = await this.authAPI.signInWithAuthPW(
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

  @Query((returns) => AccountStatusPayload, {
    description:
      'Check the status of an account using session token or uid. ' +
      'This query is equivalent to the GET /account/status endpoint in auth-server.',
  })
  @CatchGatewayError
  public async accountStatus(
    @Args('input', { type: () => AccountStatusInput })
    input: AccountStatusInput
  ): Promise<AccountStatusPayload> {
    if (input.token) {
      const { id } = await deriveHawkCredentials(input.token, 'sessionToken');
      const sessionToken = await SessionToken.query()
        .select('uid')
        .where('tokenId', uuidTransformer.to(id))
        .first();

      return { exists: !!sessionToken };
    }

    if (input.uid) {
      const account = await Account.findByUid(input.uid);
      return { exists: !!account };
    }
    return { exists: false };
  }

  @Mutation((returns) => BasicPayload, {
    description:
      'Used to reject and report unblock codes that were not requested by the user.',
  })
  @CatchGatewayError
  public async rejectUnblockCode(
    @Args('input', { type: () => RejectUnblockCodeInput })
    input: RejectUnblockCodeInput
  ): Promise<BasicPayload> {
    await Account.consumeUnblockCode(
      input.uid,
      input.unblockCode.toUpperCase()
    );
    this.log.info('account.login.rejectedUnblockCode', {
      uid: input.uid,
      unblockCode: input.unblockCode,
    });
    return {
      clientMutationId: input.clientMutationId,
    };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Used to verify a users primary email address.',
  })
  @CatchGatewayError
  public async emailVerifyCode(
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => VerifyEmailCodeInput })
    input: VerifyEmailCodeInput
  ): Promise<BasicPayload> {
    await this.authAPI.verifyCode(
      input.uid,
      input.code,
      {
        service: input.service,
      },
      headers
    );

    return {
      clientMutationId: input.clientMutationId,
    };
  }

  @Query((returns) => RecoveryKeyBundlePayload, {
    description:
      'Retrieves a user recovery key bundle from its recovery key id. The bundle contains an encrypted copy for the sync key.',
  })
  @CatchGatewayError
  public async getRecoveryKeyBundle(
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => RecoveryKeyBundleInput })
    input: RecoveryKeyBundleInput
  ): Promise<RecoveryKeyBundlePayload> {
    const { recoveryData } = await this.authAPI.getRecoveryKey(
      input.accountResetToken,
      input.recoveryKeyId,
      headers
    );

    return { recoveryData };
  }

  @ResolveField()
  public accountCreated(@Parent() account: Account) {
    return account.createdAt;
  }

  @ResolveField()
  public passwordCreated(@Parent() account: Account) {
    return account.verifierSetAt;
  }

  @ResolveField()
  public async displayName(@Parent() account: Account) {
    const profile = await profileByUid(account.uid);
    return profile ? profile.displayName : null;
  }

  @ResolveField()
  public async avatar(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers,
    @Parent() account: Account
  ) {
    try {
      const avatar = await selectedAvatar(account.uid);
      if (avatar) {
        return avatar;
      }

      const profile = await this.profileAPI.getProfile(token, headers);
      const url = profile.avatar;
      return {
        id: `default-${url[url.length - 1]}`,
        url,
      };
    } catch (error) {
      const accountContext: ExtraContext = {
        name: 'account',
        fieldData: {
          accountId: account.uid,
          verifierSetAt: account.verifierSetAt.toString(),
        },
      };
      this.log.error(error, { uid: account.uid });
      reportRequestException(error, [accountContext]);
      return {};
    }
  }

  @ResolveField()
  public emails(@Parent() account: Account) {
    if (account.emails) {
      return account.emails.map((e) => {
        return {
          email: e.email,
          isPrimary: e.isPrimary,
          verified: e.isVerified,
        };
      });
    } else {
      return null;
    }
  }

  @ResolveField()
  public metricsEnabled(@Parent() account: Account) {
    return !account.metricsOptOutAt;
  }

  @ResolveField()
  public async subscriptions(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers
  ) {
    const account = await this.authAPI.account(token, headers);
    return account.subscriptions.map(snakeToCamelObject);
  }

  @ResolveField()
  public async recoveryKey(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers
  ) {
    const result = await this.authAPI.recoveryKeyExists(
      token,
      undefined,
      headers
    );
    return result.exists;
  }

  @ResolveField()
  public totp(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers
  ) {
    return this.authAPI.checkTotpTokenExists(token, headers);
  }

  @ResolveField()
  public attachedClients(
    @GqlSessionToken() token: string,
    @GqlXHeaders() headers: Headers
  ) {
    return this.authAPI.attachedClients(token, headers);
  }

  @ResolveField()
  public linkedAccounts(@Parent() account: Account) {
    if (account.linkedAccounts) {
      return account.linkedAccounts.map((item) => {
        return {
          providerId: item.providerId,
          authAt: item.authAt,
          enabled: item.enabled,
        };
      });
    }
    return [];
  }

  @ResolveField()
  public securityEvents(@Parent() account: Account) {
    if (account.securityEvents) {
      return account.securityEvents.map((item) => {
        return {
          name: item.name,
          createdAt: item.createdAt,
          verified: item.verified,
          ipAddr: item.ipAddr,
        };
      });
    }
    return [];
  }

  @Mutation((returns) => CredentialStatusPayload, {
    description:
      'Check the status of an account using session token or uid. ' +
      'This query is equivalent to the GET /account/credentials/status endpoint in auth-server.',
  })
  @CatchGatewayError
  public async credentialStatus(
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => String! })
    input: string
  ) {
    return this.authAPI.getCredentialStatusV2(input, headers);
  }

  @Mutation((returns) => PasswordChangeStartPayload)
  @CatchGatewayError
  public async passwordChangeStart(
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => PasswordChangeStartInput! })
    input: PasswordChangeStartInput
  ) {
    return this.authAPI.passwordChangeStartWithAuthPW(
      input.email,
      input.oldAuthPW,
      {},
      headers
    );
  }

  @Mutation((returns) => PasswordChangeFinishPayload)
  @CatchGatewayError
  public async passwordChangeFinish(
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => PasswordChangeFinishInput })
    input: {
      passwordChangeToken: string;
      authPW: string;
      wrapKb: string;
      sessionToken?: string;
      wrapKbVersion2?: string;
      authPWVersion2?: string;
      clientSalt?: string;
      keys?: boolean;
    }
  ) {
    const resp = await this.authAPI.passwordChangeFinish(
      input.passwordChangeToken,
      {
        authPW: input.authPW,
        wrapKb: input.wrapKb,
        sessionToken: input.sessionToken,
        wrapKbVersion2: input.wrapKbVersion2,
        authPWVersion2: input.authPWVersion2,
        clientSalt: input.clientSalt,
      },
      {
        keys: input.keys,
      },
      headers
    );
    return resp;
  }

  @Mutation((returns) => WrappedKeysPayload)
  @CatchGatewayError
  public async wrappedAccountKeys(
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => String! })
    input: string
  ) {
    return this.authAPI.wrappedAccountKeys(input, headers);
  }
}
