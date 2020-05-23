/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import getStream from 'get-stream';
import { GraphQLResolveInfo } from 'graphql';
import {
  parseResolveInfo,
  simplifyParsedResolveInfoFragmentWithType,
} from 'graphql-parse-resolve-info';
import {
  Arg,
  Ctx,
  FieldResolver,
  Info,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';

import { Account, accountByUid, AccountOptions } from '../db/models/auth';
import { profileByUid, selectedAvatar } from '../db/models/profile';
import { CatchGatewayError } from '../error';
import { Context } from '../server';
import { Account as AccountType } from './types/account';
import {
  EmailInput,
  UpdateAvatarInput,
  UpdateDisplayNameInput,
} from './types/input';
import {
  BasicPayload,
  UpdateAvatarPayload,
  UpdateDisplayNamePayload,
} from './types/payload';

@Resolver((of) => AccountType)
export class AccountResolver {
  @Mutation((returns) => UpdateDisplayNamePayload, {
    description: 'Update the display name.',
  })
  @CatchGatewayError
  public async updateDisplayName(
    @Ctx() context: Context,
    @Arg('input', (type) => UpdateDisplayNameInput)
    input: UpdateDisplayNameInput
  ): Promise<UpdateDisplayNamePayload> {
    const result = await context.dataSources.profileAPI.updateDisplayName(
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
  @CatchGatewayError
  public async updateAvatar(
    @Ctx() context: Context,
    @Arg('input', (type) => UpdateAvatarInput) input: UpdateAvatarInput
  ): Promise<UpdateAvatarPayload> {
    const file = await input.file;
    const fileData = await getStream.buffer(file.createReadStream());
    const avatarUrl = await context.dataSources.profileAPI.avatarUpload(
      file.mimetype,
      fileData
    );
    return { clientMutationId: input.clientMutationId, avatarUrl };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Create a secondary email for the signed in account.',
  })
  @CatchGatewayError
  public async createSecondaryEmail(
    @Ctx() context: Context,
    @Arg('input', (type) => EmailInput) input: EmailInput
  ): Promise<BasicPayload> {
    await context.dataSources.authAPI.recoveryEmailCreate(input.email);
    return { clientMutationId: input.clientMutationId };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Remove the secondary email for the signed in account.',
  })
  @CatchGatewayError
  public async deleteSecondaryEmail(
    @Ctx() context: Context,
    @Arg('input', (type) => EmailInput) input: EmailInput
  ): Promise<BasicPayload> {
    await context.dataSources.authAPI.recoveryEmailDestroy(input.email);
    return { clientMutationId: input.clientMutationId };
  }

  @Mutation((returns) => BasicPayload, {
    description:
      'Change users primary email address, this email address must belong to the user and be verified.',
  })
  @CatchGatewayError
  public async updatePrimaryEmail(
    @Ctx() context: Context,
    @Arg('input', (type) => EmailInput) input: EmailInput
  ): Promise<BasicPayload> {
    await context.dataSources.authAPI.recoveryEmailSetPrimaryEmail(input.email);
    return { clientMutationId: input.clientMutationId };
  }

  @Mutation((returns) => BasicPayload, {
    description: 'Reset the verification code to a secondary email.',
  })
  @CatchGatewayError
  public async resendSecondaryEmailCode(
    @Ctx() context: Context,
    @Arg('input', (type) => EmailInput) input: EmailInput
  ): Promise<BasicPayload> {
    await context.dataSources.authAPI.recoveryEmailSecondaryResendCode(
      input.email
    );
    return { clientMutationId: input.clientMutationId };
  }

  @Query((returns) => AccountType, { nullable: true })
  public account(@Ctx() context: Context, @Info() info: GraphQLResolveInfo) {
    context.logger.info('account', { uid: context.authUser });

    // Introspect the query to determine if we should load the emails
    const parsed: any = parseResolveInfo(info);
    const simplified = simplifyParsedResolveInfoFragmentWithType(
      parsed,
      info.returnType
    );
    const includeEmails = simplified.fields.hasOwnProperty('emails');

    const options: AccountOptions = includeEmails
      ? { include: ['emails'] }
      : {};
    return accountByUid(context.authUser, options);
  }

  @FieldResolver()
  public accountCreated(@Root() account: Account) {
    return account.createdAt;
  }

  @FieldResolver()
  public passwordCreated(@Root() account: Account) {
    return account.verifierSetAt;
  }

  @FieldResolver()
  public async displayName(@Root() account: Account) {
    const profile = await profileByUid(account.uid);
    return profile ? profile.displayName : null;
  }

  @FieldResolver()
  public async avatarUrl(@Root() account: Account) {
    const avatar = await selectedAvatar(account.uid);
    return avatar ? avatar.url : null;
  }

  @FieldResolver()
  public emails(@Root() account: Account) {
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

  @FieldResolver()
  @CatchGatewayError
  public subscriptions(@Ctx() context: Context) {
    return context.dataSources.authAPI.subscriptions();
  }

  @FieldResolver()
  @CatchGatewayError
  public recoveryKey(@Ctx() context: Context) {
    return context.dataSources.authAPI.hasRecoveryKey();
  }

  @FieldResolver()
  @CatchGatewayError
  public totp(@Ctx() context: Context) {
    return context.dataSources.authAPI.totp();
  }

  @FieldResolver()
  @CatchGatewayError
  public attachedClients(@Ctx() context: Context) {
    return context.dataSources.authAPI.attachedClients();
  }
}
