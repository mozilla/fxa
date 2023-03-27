/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore, GenericData } from '../../lib/model-data';
import { ChannelInfo } from './channel-info';

describe('models/reliers/channel-info', function () {
  let data: ModelDataStore;
  let model: ChannelInfo;

  beforeEach(function () {
    data = new GenericData({});
    model = new ChannelInfo(data);
  });

  it('exists', () => {
    expect(model).toBeDefined();
  });

  it('binds model to data store', () => {
    data.set('channel_id', 'foo');
    data.set('channel_key', 'bar');

    expect(model.channelId).toEqual('foo');
    expect(model.channelKey).toEqual('bar');
  });

  it('validates', () => {
    data.set('channel_id', {});
    expect(() => {
      model.validate();
    }).toThrow();
  });
});
