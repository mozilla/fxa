/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelContext, GenericContext } from '../../lib/context';
import { ClientInfo } from './client-info';

describe('models/reliers/client-info', function () {
  let context: ModelContext;
  let model: ClientInfo;

  beforeEach(function () {
    context = new GenericContext({});
    model = new ClientInfo(context);
  });

  it('exists', () => {
    expect(model).toBeDefined();
  });

  it('binds to default context', () => {
    context.set('id', '123ABC');
    context.set('image_uri', 'https://redirect.to/foo/profile/bar.png');
    context.set('name', 'foo');
    context.set('redirect_uri', 'https://redirect.to');
    context.set('trusted', true);

    expect(model.clientId).toEqual('123ABC');
    expect(model.imageUri).toEqual('https://redirect.to/foo/profile/bar.png');
    expect(model.serviceName).toEqual('foo');
    expect(model.redirectUri).toEqual('https://redirect.to');
    expect(model.trusted).toEqual(true);
    expect(model.clientId).toEqual('123ABC');
  });

  it('validates', () => {
    context.set('id', 'xyz');
    expect(() => {
      model.validate();
    }).toThrow();
  });
});
