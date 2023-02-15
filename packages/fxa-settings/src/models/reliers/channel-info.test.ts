/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelContext, GenericContext } from '../../lib/context';
import { ChannelInfo } from './channel-info';

describe('models/reliers/channel-info', function () {
  let context: ModelContext;
  let model: ChannelInfo;

  beforeEach(function () {
    context = new GenericContext({});
    model = new ChannelInfo(context);
  });

  it('exists', () => {
    expect(model).toBeDefined();
  });

  it('binds to default context', () => {
    context.set('channel_id', 'foo');
    context.set('channel_key', 'bar');

    expect(model.channelId).toEqual('foo');
    expect(model.channelKey).toEqual('bar');
  });

  it('validates', () => {
    context.set('channel_id', {});
    expect(() => {
      model.validate();
    }).toThrow();
  });
});
