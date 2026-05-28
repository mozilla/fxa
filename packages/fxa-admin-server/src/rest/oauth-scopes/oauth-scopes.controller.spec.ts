/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  Provider,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { EventLoggingService } from '../../event-logging/event-logging.service';
import { AuditLogInterceptor } from '../../auth/audit-log.interceptor';
import { DatabaseService } from '../../database/database.service';
import {
  OAuthScopesController,
  toOAuthScopeDto,
} from './oauth-scopes.controller';

describe('OAuthScopesController', () => {
  let controller: OAuthScopesController;
  let scopeQuery: {
    select: jest.Mock;
    orderBy: jest.Mock;
    insertAndFetch: jest.Mock;
    deleteById: jest.Mock;
  };
  let db: { scope: { query: jest.Mock } };

  beforeEach(async () => {
    scopeQuery = {
      select: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockResolvedValue([]),
      insertAndFetch: jest.fn(),
      deleteById: jest.fn(),
    };
    db = { scope: { query: jest.fn(() => scopeQuery) } };

    const MockDatabaseService: Provider = {
      provide: DatabaseService,
      useValue: db,
    };

    const MockMozLoggerService: Provider = {
      provide: MozLoggerService,
      useValue: { debug: jest.fn(), error: jest.fn(), info: jest.fn() },
    };

    const MockConfig: Provider = {
      provide: ConfigService,
      useValue: { get: jest.fn().mockReturnValue({ authHeader: 'test' }) },
    };

    const MockMetricsFactory: Provider = {
      provide: 'METRICS',
      useFactory: () => undefined,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthScopesController,
        EventLoggingService,
        AuditLogInterceptor,
        MockDatabaseService,
        MockMozLoggerService,
        MockConfig,
        MockMetricsFactory,
      ],
    }).compile();

    controller = module.get<OAuthScopesController>(OAuthScopesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toOAuthScopeDto', () => {
    it.each([
      ['tinyint 1', 1, true],
      ['tinyint 0', 0, false],
      ['boolean true', true, true],
      ['boolean false', false, false],
    ])('coerces a %s hasScopedKeys to a boolean', (_label, input, expected) => {
      expect(
        toOAuthScopeDto({
          id: 5,
          scope: 'https://identity.mozilla.com/apps/x',
          hasScopedKeys: input,
        })
      ).toEqual({
        id: 5,
        scope: 'https://identity.mozilla.com/apps/x',
        hasScopedKeys: expected,
      });
    });
  });

  describe('listOAuthScopes', () => {
    // Sorting is delegated to SQL (ORDER BY), so we assert the query is built
    // with it rather than testing the ordering itself. The tinyint→boolean
    // coercion is covered directly by the toOAuthScopeDto tests below; here we
    // only verify the columns selected, the delegated sort, and that each row
    // is mapped through toOAuthScopeDto.
    it('selects id/scope/hasScopedKeys, delegates sorting to SQL, and maps each row to a DTO', async () => {
      scopeQuery.orderBy.mockResolvedValue([
        {
          id: 1,
          scope: 'https://identity.mozilla.com/apps/oldsync',
          hasScopedKeys: true,
        },
        {
          id: 2,
          scope: 'https://identity.mozilla.com/apps/notes',
          hasScopedKeys: false,
        },
      ]);

      const result = await controller.listOAuthScopes();

      expect(scopeQuery.select).toHaveBeenCalledWith(
        'id',
        'scope',
        'hasScopedKeys'
      );
      expect(scopeQuery.orderBy).toHaveBeenCalledWith('scope', 'asc');
      expect(result).toEqual([
        {
          id: 1,
          scope: 'https://identity.mozilla.com/apps/oldsync',
          hasScopedKeys: true,
        },
        {
          id: 2,
          scope: 'https://identity.mozilla.com/apps/notes',
          hasScopedKeys: false,
        },
      ]);
    });
  });

  describe('createOAuthScope', () => {
    const stubInsert = (
      id: number,
      scope: string,
      hasScopedKeys: boolean | number
    ) =>
      scopeQuery.insertAndFetch.mockResolvedValue({
        id,
        scope,
        hasScopedKeys,
      });

    // Forwards the validated fields to insertAndFetch and returns the row it
    // produced — note the asserted id (99) comes from the DB, not the request,
    // so this would catch returning the request body instead of the inserted
    // row. The tinyint→boolean coercion on the response is covered by the
    // toOAuthScopeDto tests, so a boolean is used here.
    it.each([
      ['hasScopedKeys=true', true],
      ['hasScopedKeys=false', false],
    ])(
      'forwards a valid %s scope to insert and returns the inserted row',
      async (_label, hasScopedKeys) => {
        stubInsert(
          99,
          'https://identity.mozilla.com/apps/newsync',
          hasScopedKeys
        );

        const result = await controller.createOAuthScope({
          scope: 'https://identity.mozilla.com/apps/newsync',
          hasScopedKeys,
        });

        expect(scopeQuery.insertAndFetch).toHaveBeenCalledWith({
          scope: 'https://identity.mozilla.com/apps/newsync',
          hasScopedKeys,
        });
        expect(result).toEqual({
          id: 99,
          scope: 'https://identity.mozilla.com/apps/newsync',
          hasScopedKeys,
        });
      }
    );

    it.each([
      ['empty string', ''],
      ['short-name', 'profile:email'],
      ['arbitrary value', 'something-arbitrary'],
      ['whitespace-only', '   '],
      ['leading/trailing whitespace', '  https://x.com  '],
      ['contains tab', 'https://x.com/\tfoo'],
      ['contains newline', 'foo\nbar'],
    ])('accepts %s as a valid scope value', async (_label, scope) => {
      stubInsert(1, scope, false);

      await controller.createOAuthScope({ scope, hasScopedKeys: false });

      expect(scopeQuery.insertAndFetch).toHaveBeenCalledWith({
        scope,
        hasScopedKeys: false,
      });
    });

    it.each([
      ['number', 42],
      ['boolean', true],
      ['null', null],
      ['undefined', undefined],
      ['object', { not: 'a string' }],
      ['array', ['https://x']],
    ])(
      'rejects with BadRequestException when scope is a %s',
      async (_label, badScope) => {
        await expect(
          controller.createOAuthScope({
            scope: badScope as unknown as string,
            hasScopedKeys: false,
          })
        ).rejects.toThrow(BadRequestException);
        expect(scopeQuery.insertAndFetch).not.toHaveBeenCalled();
      }
    );

    it.each([
      ['number', 1],
      ['string', 'true'],
      ['null', null],
      ['undefined', undefined],
    ])(
      'rejects with BadRequestException when hasScopedKeys is a %s',
      async (_label, badValue) => {
        await expect(
          controller.createOAuthScope({
            scope: 'https://identity.mozilla.com/apps/x',
            hasScopedKeys: badValue as unknown as boolean,
          })
        ).rejects.toThrow(BadRequestException);
        expect(scopeQuery.insertAndFetch).not.toHaveBeenCalled();
      }
    );

    it.each([
      ['null', null],
      ['array', []],
      ['string', 'hello'],
      ['number', 42],
    ])(
      'rejects with BadRequestException when body is a %s',
      async (_label, badBody) => {
        await expect(
          controller.createOAuthScope(badBody as unknown as never)
        ).rejects.toThrow(BadRequestException);
        expect(scopeQuery.insertAndFetch).not.toHaveBeenCalled();
      }
    );

    it('throws BadRequestException when scope exceeds 128 characters', async () => {
      const long = 'a'.repeat(129);
      await expect(
        controller.createOAuthScope({
          scope: long,
          hasScopedKeys: false,
        })
      ).rejects.toThrow(BadRequestException);
      expect(scopeQuery.insertAndFetch).not.toHaveBeenCalled();
    });

    it('accepts a scope at exactly the 128-character limit', async () => {
      const scope = 'a'.repeat(128);
      stubInsert(1, scope, false);

      await controller.createOAuthScope({ scope, hasScopedKeys: false });

      expect(scopeQuery.insertAndFetch).toHaveBeenCalledWith({
        scope,
        hasScopedKeys: false,
      });
    });

    it('throws ConflictException on duplicate scope', async () => {
      scopeQuery.insertAndFetch.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      await expect(
        controller.createOAuthScope({
          scope: 'https://identity.mozilla.com/apps/oldsync',
          hasScopedKeys: true,
        })
      ).rejects.toThrow(ConflictException);
    });

    it('re-throws unexpected DB errors', async () => {
      const dbErr = Object.assign(new Error('connection lost'), {
        code: 'ECONNRESET',
      });
      scopeQuery.insertAndFetch.mockRejectedValue(dbErr);

      await expect(
        controller.createOAuthScope({
          scope: 'https://identity.mozilla.com/apps/x',
          hasScopedKeys: false,
        })
      ).rejects.toThrow('connection lost');
    });
  });

  describe('deleteOAuthScope', () => {
    it('deletes the row by id and returns true', async () => {
      scopeQuery.deleteById.mockResolvedValue(1);

      const result = await controller.deleteOAuthScope(42);

      expect(db.scope.query).toHaveBeenCalledTimes(1);
      expect(scopeQuery.deleteById).toHaveBeenCalledWith(42);
      expect(result).toBe(true);
    });

    it('throws NotFoundException when no row matches the id', async () => {
      scopeQuery.deleteById.mockResolvedValue(0);

      await expect(controller.deleteOAuthScope(999)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
