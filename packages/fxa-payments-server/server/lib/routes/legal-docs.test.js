/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mockFetch = jest.fn().mockResolvedValue({ status: 200 });
jest.mock('node-fetch', () => async (url, opts) => mockFetch(url, opts));

let scope;
const mockSentry = {
  withScope: jest.fn().mockImplementation((cb) => {
    scope = { setContext: jest.fn() };
    cb(scope);
  }),
  captureMessage: jest.fn(),
};
jest.mock('@sentry/node', () => ({
  ...jest.requireActual('@sentry/node'),
  ...mockSentry,
}));

const legalDocsRoute = require('./legal-docs');
const validUrl = 'https://accounts-static.cdn.mozilla.net/vpn';
const noop = () => {};
const mockRes = {
  sendStatus: jest.fn().mockReturnValue({ end: noop }),
  redirect: jest.fn().mockReturnValue({ end: noop }),
};

describe('lib/routes/legal-docs', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockRes.sendStatus.mockClear();
    mockRes.redirect.mockClear();
  });

  it('responds with a HTTP 400 when the domain is not allowed', async () => {
    const req = { query: { url: 'https://nope.example.com/vpn' } };
    await legalDocsRoute.process(req, mockRes);
    expect(mockRes.redirect).toHaveBeenCalledTimes(0);
    expect(mockRes.sendStatus).toHaveBeenCalledTimes(1);
    expect(mockRes.sendStatus).toHaveBeenLastCalledWith(400);
  });

  it('redirects if the url is to a .pdf', async () => {
    const fullUrl = `${validUrl}/en.pdf`;
    const req = { query: { url: fullUrl } };
    await legalDocsRoute.process(req, mockRes);
    expect(mockRes.sendStatus).toHaveBeenCalledTimes(0);
    expect(mockRes.redirect).toHaveBeenCalledTimes(1);
    expect(mockRes.redirect).toHaveBeenLastCalledWith(fullUrl);
  });

  it('responds with a HTTP 400 if accept-language is not parseable', async () => {
    const req = { query: { url: validUrl }, get: () => '.....' };
    await legalDocsRoute.process(req, mockRes);
    expect(mockRes.redirect).toHaveBeenCalledTimes(0);
    expect(mockRes.sendStatus).toHaveBeenCalledTimes(1);
    expect(mockRes.sendStatus).toHaveBeenLastCalledWith(400);
  });

  it('fetches only once when the same url is requested multiple times', async () => {
    const fullUrl = `${validUrl}.en.pdf`;
    const req = { query: { url: validUrl }, get: () => 'en' };
    await legalDocsRoute.process(req, mockRes);
    await legalDocsRoute.process(req, mockRes);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenLastCalledWith(fullUrl, {
      method: 'HEAD',
    });
  });

  it('uses the default locale if accept-language is empty', async () => {
    const fullUrl = `${validUrl}.en.pdf`;
    const req = { query: { url: validUrl }, get: () => '' };
    await legalDocsRoute.process(req, mockRes);
    expect(mockRes.sendStatus).toHaveBeenCalledTimes(0);
    expect(mockRes.redirect).toHaveBeenCalledTimes(1);
    expect(mockRes.redirect).toHaveBeenLastCalledWith(fullUrl);
  });

  it('checks up to the limit number of languages', async () => {
    const req = { query: { url: validUrl }, get: () => 'id,it,ja,ka' };
    mockFetch
      .mockResolvedValueOnce({ status: 404 })
      .mockResolvedValueOnce({ status: 404 })
      .mockResolvedValueOnce({ status: 404 });
    await legalDocsRoute.process(req, mockRes);
    expect(mockFetch).not.toHaveBeenCalledWith(`${validUrl}.ka.pdf`, {
      method: 'HEAD',
    });
  });

  it('redirects when there is a match', async () => {
    // also test the handling of an extra '/' in the url from the metadata
    const fullUrl = `${validUrl}.es-MX.pdf`;
    const req = { query: { url: `${validUrl}/` }, get: () => 'es-MX' };
    await legalDocsRoute.process(req, mockRes);
    expect(mockRes.sendStatus).toHaveBeenCalledTimes(0);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenLastCalledWith(fullUrl, { method: 'HEAD' });
    expect(mockRes.redirect).toHaveBeenCalledTimes(1);
    expect(mockRes.redirect).toHaveBeenLastCalledWith(fullUrl);
  });

  it('fetches again when the cache has expired', async () => {
    const fullUrl = `${validUrl}.fr.pdf`;
    const req = { query: { url: validUrl }, get: () => 'fr' };
    const aMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 100;
    jest.spyOn(global.Date, 'now').mockReturnValueOnce(aMonthAgo);
    await legalDocsRoute.process(req, mockRes);
    await legalDocsRoute.process(req, mockRes);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(1, fullUrl, {
      method: 'HEAD',
    });
    expect(mockFetch).toHaveBeenNthCalledWith(2, fullUrl, {
      method: 'HEAD',
    });
  });

  it('falls back to the language without the region', async () => {
    const fullUrl = `${validUrl}.es.pdf`;
    const req = { query: { url: validUrl }, get: () => 'es-AR' };
    mockFetch
      .mockResolvedValueOnce({ status: 404 })
      .mockResolvedValueOnce({ status: 200 });
    await legalDocsRoute.process(req, mockRes);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(1, `${validUrl}.es-AR.pdf`, {
      method: 'HEAD',
    });
    expect(mockFetch).toHaveBeenLastCalledWith(fullUrl, {
      method: 'HEAD',
    });
    expect(mockRes.redirect).toHaveBeenCalledTimes(1);
    expect(mockRes.redirect).toHaveBeenLastCalledWith(fullUrl);
  });

  it('falls back to the default locale after all languages failed', async () => {
    const req = { query: { url: validUrl }, get: () => 'sk,sq' };
    mockFetch
      .mockResolvedValueOnce({ status: 404 })
      .mockResolvedValueOnce({ status: 404 });
    await legalDocsRoute.process(req, mockRes);
    expect(mockFetch).toHaveBeenNthCalledWith(1, `${validUrl}.sk.pdf`, {
      method: 'HEAD',
    });
    expect(mockFetch).toHaveBeenNthCalledWith(2, `${validUrl}.sq.pdf`, {
      method: 'HEAD',
    });
    expect(mockRes.redirect).toHaveBeenCalledTimes(1);
    expect(mockRes.redirect).toHaveBeenLastCalledWith(`${validUrl}.en.pdf`);
  });

  it('responds with HTTP 404 and log error when everything fails', async () => {
    const oops = `${validUrl}.oops`;
    const req = { query: { url: oops }, get: () => 'th,tr' };
    mockFetch
      .mockResolvedValueOnce({ status: 404 })
      .mockResolvedValueOnce({ status: 404 })
      .mockResolvedValueOnce({ status: 404 });
    await legalDocsRoute.process(req, mockRes);
    expect(mockRes.sendStatus).toHaveBeenCalledTimes(1);
    expect(mockRes.sendStatus).toHaveBeenLastCalledWith(404);

    expect(mockSentry.withScope).toHaveBeenCalledTimes(1);
    expect(scope.setContext).toHaveBeenCalledTimes(1);
    expect(scope.setContext).toHaveBeenCalledWith('subscription.legalDocs', {
      url: oops,
      acceptLanguage: 'th,tr',
    });
    expect(mockSentry.captureMessage).toHaveBeenCalledTimes(1);
    expect(mockSentry.captureMessage).toHaveBeenCalledWith(
      'Legal doc redirect failed.',
      'warning'
    );
  });

  it('limits the cache size', () => {
    const cache = new Map();
    [...Array(10).keys()].forEach((x) => cache.set(x, x));
    legalDocsRoute._checkAndShrinkCache(cache, 11);
    expect(cache.size).toBe(10);
    legalDocsRoute._checkAndShrinkCache(cache, 0);
    expect(cache.size).toBe(10);
    legalDocsRoute._checkAndShrinkCache(cache, 10);
    expect(cache.size).toBe(5);
    cache.clear();
    [...Array(10).keys()].forEach((x) => cache.set(x, x));
    legalDocsRoute._checkAndShrinkCache(cache, 9);
    expect(cache.size).toBe(5);
  });
});
