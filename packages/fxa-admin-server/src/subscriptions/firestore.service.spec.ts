/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Firestore } from '@google-cloud/firestore';
import { Test, TestingModule } from '@nestjs/testing';
import { MockConfig, MockFirestoreFactory } from '../mocks';

describe.skip('Firestore Service', () => {
  let service: Firestore;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockConfig, MockFirestoreFactory],
    }).compile();

    service = module.get<Firestore>('FIRESTORE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
