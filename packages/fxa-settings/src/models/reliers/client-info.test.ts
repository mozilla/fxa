/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore, GenericData } from '../../lib/model-data';
import { ClientInfo } from './client-info';

describe('models/reliers/client-info', function () {
  let data: ModelDataStore;
  let model: ClientInfo;

  beforeEach(function () {
    data = new GenericData({});
    model = new ClientInfo(data);
  });

  it('exists', () => {
    expect(model).toBeDefined();
  });

  it('binds to default data store', () => {
    data.set('id', '123ABC');
    data.set('image_uri', 'https://redirect.to/foo/profile/bar.png');
    data.set('name', 'foo');
    data.set('redirect_uri', 'https://redirect.to');
    data.set('trusted', true);

    expect(model.clientId).toEqual('123ABC');
    expect(model.imageUri).toEqual('https://redirect.to/foo/profile/bar.png');
    expect(model.serviceName).toEqual('foo');
    expect(model.redirectUri).toEqual('https://redirect.to');
    expect(model.trusted).toEqual(true);
    expect(model.clientId).toEqual('123ABC');
  });

  it('validates', () => {
    data.set('id', 'xyz');
    expect(() => {
      model.validate();
    }).toThrow();
  });
});
