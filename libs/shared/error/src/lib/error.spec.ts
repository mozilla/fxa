/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { faker } from '@faker-js/faker';

describe('Error', () => {
  const message = faker.word.words();

  describe('TypeError', () => {
    const error = new TypeError(message);
    it('should have the expected properties', () => {
      expect(error.name).toEqual('TypeError');
      expect(error.message).toEqual(message);
      expect(error).toBeInstanceOf(TypeError);
    });
  });
});
