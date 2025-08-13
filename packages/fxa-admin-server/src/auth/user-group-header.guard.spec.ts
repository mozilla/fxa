/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozLoggerService } from '@fxa/shared/mozlog';
import { ExecutionContext, Provider } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

import {
  AdminPanelFeature,
  AdminPanelGroup,
  USER_GROUP_HEADER,
} from 'fxa-shared/guards';
import { UserGroupGuard } from './user-group-header.guard';

describe('UserGroupGuard for graphql', () => {
  let module: TestingModule;
  let guard: UserGroupGuard;
  let reflector: Reflector;
  let logger: any;

  function buildRequest(group?: AdminPanelGroup) {
    const headers: Record<string, AdminPanelGroup | undefined> = {
      [USER_GROUP_HEADER]: group,
    };
    return {
      get: (key: string) => headers[key],
    };
  }

  function mockContext(features: AdminPanelFeature[], group?: AdminPanelGroup) {
    // This fakes the set of features that would be provided by a UserGroupGuard.
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(features);

    // GqlExecutionContext, expects the context to be arg 2 of the passed in context's
    // getArgs() return value.
    const context = createMock<ExecutionContext>();
    context.getArgs.mockImplementation(() => [
      undefined,
      undefined,
      { req: buildRequest(group) },
      undefined,
    ]);
    context.getType.mockImplementation(() => 'graphql');
    return context;
  }

  beforeEach(async () => {
    logger = { debug: jest.fn(), error: jest.fn(), info: jest.fn() };
    const MockMozLogger: Provider = {
      provide: MozLoggerService,
      useValue: logger,
    };

    module = await Test.createTestingModule({
      providers: [
        Reflector,
        MockMozLogger,
        {
          provide: UserGroupGuard,
          useClass: UserGroupGuard,
        },
      ],
    }).compile();

    reflector = module.get<Reflector>(Reflector);
    guard = module.get<UserGroupGuard>(UserGroupGuard);
  });

  it(`should prevent access if user group header is not provided`, async () => {
    const context = mockContext([AdminPanelFeature.AccountSearch]);
    const result = await guard.canActivate(context);
    expect(result).toBeFalsy();
  });

  it(`should prevent access if invalid user group header is provided`, async () => {
    const context = mockContext(
      [AdminPanelFeature.AccountSearch],
      AdminPanelGroup.None
    );
    const result = await guard.canActivate(context);
    expect(result).toBeFalsy();
  });

  it(`should prevent access if user group doesn't have enough permissions`, async () => {
    const context = mockContext(
      [AdminPanelFeature.DisableAccount],
      AdminPanelGroup.SupportAgentProd
    );
    const result = await guard.canActivate(context);
    expect(result).toBeFalsy();
  });

  it(`should allow access if user group has partial permissions`, async () => {
    const context = mockContext(
      [AdminPanelFeature.AccountSearch, AdminPanelFeature.DisableAccount],
      AdminPanelGroup.SupportAgentProd
    );
    const result = await guard.canActivate(context);
    expect(result).toBeTruthy();
  });

  it(`should allow access if user group has permissions`, async () => {
    const context = mockContext(
      [AdminPanelFeature.DisableAccount],
      AdminPanelGroup.AdminProd
    );
    const result = await guard.canActivate(context);
    expect(result).toBeTruthy();
  });
});
