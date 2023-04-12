/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Inject, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  SessionToken,
} from 'fxa-shared/db/models/auth';
import { profileByUid, selectedAvatar } from 'fxa-shared/db/models/profile';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
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
import { GqlCustomsGuard } from '../auth/gql-customs.guard';
import { AuthClientService } from '../backend/auth-client.service';
import { ProfileClientService } from '../backend/profile-client.service';
import { AppConfig } from '../config';
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
  CreatePassword,
  PasswordForgotSendCodeInput,
  PasswordForgotVerifyCodeInput,
  PasswordForgotCodeStatusInput,
  AccountResetInput,
  AccountStatusInput,
  RecoveryKeyBundleInput,
  PasswordChangeInput,
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
  PasswordChangePayload,
} from './dto/payload';
import { SignedInAccountPayload } from './dto/payload/signed-in-account';
import { SignedUpAccountPayload } from './dto/payload/signed-up-account';
import { CatchGatewayError } from './lib/error';
import { Account as AccountType } from './model/account';
import { uuidTransformer } from 'fxa-shared/db/transformers';
import { FinishedSetupAccountPayload } from './dto/payload/finished-setup-account';
import { FinishSetupInput } from './dto/input/finish-setup';

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
  private profileServerUrl: string;

  constructor(
    @Inject(AuthClientService) private authAPI: AuthClient,
    private profileAPI: ProfileClientService,
    private log: MozLoggerService,
    private configService: ConfigService<AppConfig>
  ) {
    this.profileServerUrl = (
      configService.get('profileServer') as AppConfig['profileServer']
    ).url;
  }

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

  @Mutation((returns) => BasicPayload, {
    description:
      'Creates a new password for a user and overrides encryption keys',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async createPassword(
    @GqlSessionToken() token: string,
    @Args('input', { type: () => CreatePassword })
    input: CreatePassword
  ): Promise<BasicPayload> {
    await this.authAPI.createPassword(token, input.email, input.password);
    return {
      clientMutationId: input.clientMutationId,
    };
  }

  @Mutation((returns) => CreateTotpPayload, {
    description:
      'Create a new randomly generated TOTP token for a user if they do not currently have one.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  public async createTotp(
    @GqlSessionToken() token: string,
    @Args('input', { type: () => CreateTotpInput })
    input: CreateTotpInput
  ): Promise<CreateTotpPayload> {
    const result = await this.authAPI.createTotpToken(token, {
      metricsContext: input.metricsContext,
    });
    return {
      clientMutationId: input.clientMutationId,
      ...result,
    };
  }

  @Mutation((returns) => VerifyTotpPayload, {
    description:
      'Verifies the current session if the passed TOTP code is valid.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async verifyTotp(
    @GqlSessionToken() token: string,
    @Args('input', { type: () => VerifyTotpInput })
    input: VerifyTotpInput
  ): Promise<VerifyTotpPayload> {
    const result = await this.authAPI.verifyTotpCode(
      token,
      input.code,
      input.service ? { service: input.service } : undefined
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
    @Args('input', { type: () => DeleteTotpInput })
    input: DeleteTotpInput
  ): Promise<BasicPayload> {
    await this.authAPI.deleteTotpToken(token);
    return {
      clientMutationId: input.clientMutationId,
    };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Deletes the current TOTP token for the user.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async deleteRecoveryKey(
    @GqlSessionToken() token: string,
    @Args('input', { type: () => DeleteRecoveryKeyInput })
    input: DeleteRecoveryKeyInput
  ): Promise<BasicPayload> {
    await this.authAPI.deleteRecoveryKey(token);
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
    @Args('input', { type: () => ChangeRecoveryCodesInput })
    input: ChangeRecoveryCodesInput
  ): Promise<ChangeRecoveryCodesPayload> {
    const result = await this.authAPI.replaceRecoveryCodes(token);
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
    @Args('input', { type: () => UpdateDisplayNameInput })
    input: UpdateDisplayNameInput
  ): Promise<UpdateDisplayNamePayload> {
    const result = await this.profileAPI.updateDisplayName(
      token,
      input.displayName
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
    @Args('input', { type: () => DeleteAvatarInput }) input: DeleteAvatarInput
  ): Promise<BasicPayload> {
    await this.profileAPI.avatarDelete(token, input.id);
    return { clientMutationId: input.clientMutationId };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Create a secondary email for the signed in account.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async createSecondaryEmail(
    @GqlSessionToken() token: string,
    @Args('input', { type: () => EmailInput }) input: EmailInput
  ): Promise<BasicPayload> {
    await this.authAPI.recoveryEmailCreate(token, input.email, {
      verificationMethod: 'email-otp',
    });
    return { clientMutationId: input.clientMutationId };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Reset the verification code to a secondary email.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async resendSecondaryEmailCode(
    @GqlSessionToken() token: string,
    @Args('input', { type: () => EmailInput }) input: EmailInput
  ): Promise<BasicPayload> {
    await this.authAPI.recoveryEmailSecondaryResendCode(token, input.email);
    return { clientMutationId: input.clientMutationId };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Verify the email address with a code.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async verifySecondaryEmail(
    @GqlSessionToken() token: string,
    @Args('input', { type: () => VerifyEmailInput }) input: VerifyEmailInput
  ) {
    await this.authAPI.recoveryEmailSecondaryVerifyCode(
      token,
      input.email,
      input.code
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
    @Args('input', { type: () => EmailInput }) input: EmailInput
  ): Promise<BasicPayload> {
    await this.authAPI.recoveryEmailDestroy(token, input.email);
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
    @Args('input', { type: () => EmailInput }) input: EmailInput
  ): Promise<BasicPayload> {
    await this.authAPI.recoveryEmailSetPrimaryEmail(token, input.email);
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
    @Args('input', { type: () => AttachedClientDisconnectInput })
    input: AttachedClientDisconnectInput
  ) {
    await this.authAPI.attachedClientDestroy(token, input);
    return { clientMutationId: input.clientMutationId };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Send a session verification email.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async sendSessionVerificationCode(
    @GqlSessionToken() token: string,
    @Args('input', { type: () => SendSessionVerificationInput })
    input: SendSessionVerificationInput
  ) {
    await this.authAPI.sessionResendVerifyCode(token);
    return { clientMutationId: input.clientMutationId };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Verify the session via an email code.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async verifySession(
    @GqlSessionToken() token: string,
    @Args('input', { type: () => VerifySessionInput }) input: VerifySessionInput
  ) {
    await this.authAPI.sessionVerifyCode(token, input.code);
    return { clientMutationId: input.clientMutationId };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Set the metrics opt in or out state',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async metricsOpt(
    @GqlUserId() uid: string,
    @Args('input', { type: () => MetricsOptInput })
    input: MetricsOptInput
  ): Promise<BasicPayload> {
    await Account.setMetricsOpt(uid, input.state);
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
    return this.authAPI.passwordForgotVerifyCode(input.code, input.token, {});
  }

  @Mutation((returns) => PasswordForgotCodeStatusPayload, {
    description: 'Verify password forgot token, returns account reset token',
  })
  @CatchGatewayError
  public async passwordForgotCodeStatus(
    @Args('input', { type: () => PasswordForgotCodeStatusInput })
    input: PasswordForgotCodeStatusInput
  ) {
    return this.authAPI.passwordForgotStatus(input.token);
  }

  @Mutation((returns) => AccountResetPayload, {
    description: 'Resets an account',
  })
  @CatchGatewayError
  public async accountReset(
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => AccountResetInput })
    input: AccountResetInput
  ) {
    return this.authAPI.accountReset(
      input.email,
      input.newPassword,
      input.accountResetToken,
      input.options,
      headers
    );
  }

  @Mutation((returns) => SignedUpAccountPayload, {
    description: 'Call auth-server to sign up an account',
  })
  @CatchGatewayError
  public async SignUp(
    @GqlXHeaders() headers: Headers,
    @Args('input', { type: () => SignUpInput })
    input: SignUpInput
  ): Promise<SignedUpAccountPayload> {
    const result = await this.authAPI.signUpWithAuthPW(
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
    @Args('input', { type: () => RecoveryKeyBundleInput })
    input: RecoveryKeyBundleInput
  ): Promise<RecoveryKeyBundlePayload> {
    const { recoveryData } = await this.authAPI.getRecoveryKey(
      input.accountResetToken,
      input.recoveryKeyId
    );

    return { recoveryData };
  }

  @Mutation((returns) => PasswordChangePayload, {
    description:
      "Change a user's password. The client is required to compute authPW since we don't send the clear password to our server.",
  })
  @CatchGatewayError
  public async passwordChange(
    @Args('input', { type: () => PasswordChangeInput })
    input: PasswordChangeInput
  ): Promise<PasswordChangePayload> {
    const result = await this.authAPI.passwordChangeWithAuthPW(
      input.email,
      input.oldPasswordAuthPW,
      input.newPasswordAuthPW,
      input.oldUnwrapBKey,
      input.newUnwrapBKey,
      input.options
    );

    return {
      clientMutationId: input.clientMutationId,
      ...result,
    };
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
    @Parent() account: Account
  ) {
    try {
      const avatar = await selectedAvatar(account.uid);
      if (avatar) {
        return avatar;
      }

      const profile = await this.profileAPI.getProfile(token);
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
  public async subscriptions(@GqlSessionToken() token: string) {
    const account = await this.authAPI.account(token);
    return account.subscriptions.map(snakeToCamelObject);
  }

  @ResolveField()
  public async recoveryKey(@GqlSessionToken() token: string) {
    const result = await this.authAPI.recoveryKeyExists(token);
    return result.exists;
  }

  @ResolveField()
  public totp(@GqlSessionToken() token: string) {
    return this.authAPI.checkTotpTokenExists(token);
  }

  @ResolveField()
  public attachedClients(@GqlSessionToken() token: string) {
    return this.authAPI.attachedClients(token);
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
        };
      });
    }
    return [];
  }
}
