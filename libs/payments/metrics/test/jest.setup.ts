import { jest } from '@jest/globals';

jest.mock('@mozilla/glean/web', () => {
  const mockGlean = {
    initialize: jest.fn(),
    setUploadEnabled: jest.fn(),
    shutdown: jest.fn(),
  };
  return { __esModule: true, default: mockGlean, Glean: mockGlean };
});

jest.mock('../src/lib/glean/__generated__/subscriptions', () => ({
  __esModule: true,
  interstitialOffer: { record: jest.fn() },
  retentionFlow: { record: jest.fn() },
  pageView: { record: jest.fn() },
}));
