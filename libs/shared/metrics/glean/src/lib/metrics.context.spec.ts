/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { MetricsContext } from './metrics.context';

describe('metrics context', () => {
  it('creates', () => {
    // Note! The auth-server expects quite a few query params to be propagated during
    // graphql calls. These are commonly referred to as the metrics context.
    const queryParams = {
      flowId: 'test1',
      utmCampaign: 'test2',
      utmContent: 'test3',
      utmMedium: 'test4',
      utmSource: 'test5',
      utmTerm: 'test6',
      flowBeginTime: '100',
      foo: 'test7',
    };
    const result = new MetricsContext(queryParams);
    expect(result.flowId).toEqual(queryParams.flowId);
    expect(result.utmCampaign).toEqual(queryParams.utmCampaign);
    expect(result.utmContent).toEqual(queryParams.utmContent);
    expect(result.utmMedium).toEqual(queryParams.utmMedium);
    expect(result.utmSource).toEqual(queryParams.utmSource);
    expect(result.utmTerm).toEqual(queryParams.utmTerm);
    expect(result.flowBeginTime).toEqual(Number(queryParams.flowBeginTime));

    // Make sure type is legit
    expect((result as any).foo).toBeUndefined();
  });

  it('prunes empty fields', () => {
    const result = new MetricsContext({});
    const pruned = MetricsContext.prune(result);
    expect(pruned).toEqual({});
  });
});
