/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test, TestingModule } from '@nestjs/testing';

import { LegalService } from '../backend/legal.service';
import { LegalResolver } from './legal.resolver';

describe('#unit - LegalResolver', () => {
  let resolver: LegalResolver;
  let mockLegalService: Partial<LegalService>;

  beforeEach(async () => {
    mockLegalService = {
      getDoc: jest.fn().mockReturnValue('[]'),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegalResolver,
        { provide: LegalService, useValue: mockLegalService },
      ],
    }).compile();

    resolver = module.get<LegalResolver>(LegalResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('calls legal service', async () => {
    await resolver.getLegalDoc({ locale: 'en', file: 'foo' });
    expect(mockLegalService.getDoc).toBeCalledWith('en', 'foo');
  });
});
