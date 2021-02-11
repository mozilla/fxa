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
import AuthClient from 'fxa-auth-client';
import {
  Account,
  accountByUid,
  AccountOptions,
} from 'fxa-shared/db/models/auth';
import { profileByUid, selectedAvatar } from 'fxa-shared/db/models/profile';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import getStream from 'get-stream';
import { GraphQLResolveInfo } from 'graphql';
import {
  parseResolveInfo,
  simplifyParsedResolveInfoFragmentWithType,
} from 'graphql-parse-resolve-info';

import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { GqlCustomsGuard } from '../auth/gql-customs.guard';
import { AuthClientService } from '../backend/auth-client.service';
import { ProfileClientService } from '../backend/profile-client.service';
import { GqlSessionToken, GqlUserId } from '../decorators';
import {
  AttachedClientDisconnectInput,
  ChangeRecoveryCodesInput,
  CreateTotpInput,
  DeleteRecoveryKeyInput,
  DeleteTotpInput,
  EmailInput,
  SendSessionVerificationInput,
  UpdateAvatarInput,
  UpdateDisplayNameInput,
  VerifyEmailInput,
  VerifySessionInput,
  VerifyTotpInput,
} from './dto/input';
import { DeleteAvatarInput } from './dto/input/delete-avatar';
import {
  BasicPayload,
  ChangeRecoveryCodesPayload,
  CreateTotpPayload,
  UpdateAvatarPayload,
  UpdateDisplayNamePayload,
  VerifyTotpPayload,
} from './dto/payload';
import { CatchGatewayError } from './lib/error';
import { Account as AccountType } from './model/account';

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
    private profileAPI: ProfileClientService,
    private log: MozLoggerService
  ) {}

  private shouldIncludeEmails(info: GraphQLResolveInfo): boolean {
    // Introspect the query to determine if we should load the emails
    const parsed: any = parseResolveInfo(info);
    const simplified = simplifyParsedResolveInfoFragmentWithType(
      parsed,
      info.returnType
    );
    return simplified.fields.hasOwnProperty('emails');
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
    description: 'Return new recovery codes while removing old ones.',
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

  @Mutation((returns) => UpdateAvatarPayload, {
    description: 'Update the avatar in use.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async updateAvatar(
    @GqlSessionToken() token: string,
    @Args('input', { type: () => UpdateAvatarInput }) input: UpdateAvatarInput
  ): Promise<UpdateAvatarPayload> {
    const file = await input.file;
    const fileData = await getStream.buffer(file.createReadStream());
    const avatarUrl = await this.profileAPI.avatarUpload(
      token,
      file.mimetype,
      fileData
    );
    return { clientMutationId: input.clientMutationId, avatarUrl };
  }

  @Mutation((returns) => UpdateAvatarPayload, {
    description: 'Delete the avatar.',
  })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  @CatchGatewayError
  public async deleteAvatar(
    @GqlSessionToken() token: string,
    @Args('input', { type: () => DeleteAvatarInput }) input: DeleteAvatarInput
  ): Promise<UpdateAvatarPayload> {
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

  @Query((returns) => AccountType, { nullable: true })
  @UseGuards(GqlAuthGuard, GqlCustomsGuard)
  public account(@GqlUserId() uid: string, @Info() info: GraphQLResolveInfo) {
    this.log.info('account', { uid });

    const options: AccountOptions = this.shouldIncludeEmails(info)
      ? { include: ['emails'] }
      : {};
    return accountByUid(uid, options);
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
  public async avatarId(@Parent() account: Account) {
    const avatar = await selectedAvatar(account.uid);
    return avatar ? avatar.id : null;
  }

  @ResolveField()
  public async avatarUrl(@Parent() account: Account) {
    const avatar = await selectedAvatar(account.uid);
    return avatar ? avatar.url : null;
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
}
