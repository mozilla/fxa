/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderHook } from '@testing-library/react';
import React from 'react';

const mockRecordPageView = jest.fn();
const mockRecordRetentionFlowView = jest.fn();
const mockRecordRetentionFlowEngage = jest.fn();
const mockRecordRetentionFlowSubmit = jest.fn();
const mockRecordRetentionFlowResult = jest.fn();
const mockRecordInterstitialOfferView = jest.fn();
const mockRecordInterstitialOfferEngage = jest.fn();
const mockRecordInterstitialOfferSubmit = jest.fn();
const mockRecordInterstitialOfferResult = jest.fn();

jest.mock('@fxa/payments/metrics/client', () => ({
  __esModule: true,
  PaymentsGleanClientManager: jest.fn().mockImplementation(() => ({
    recordPageView: mockRecordPageView,
    recordRetentionFlowView: mockRecordRetentionFlowView,
    recordRetentionFlowEngage: mockRecordRetentionFlowEngage,
    recordRetentionFlowSubmit: mockRecordRetentionFlowSubmit,
    recordRetentionFlowResult: mockRecordRetentionFlowResult,
    recordInterstitialOfferView: mockRecordInterstitialOfferView,
    recordInterstitialOfferEngage: mockRecordInterstitialOfferEngage,
    recordInterstitialOfferSubmit: mockRecordInterstitialOfferSubmit,
    recordInterstitialOfferResult: mockRecordInterstitialOfferResult,
  })),
}));

jest.mock('../providers/ConfigProvider', () => ({
  __esModule: true,
  ConfigContext: React.createContext({
    glean: { applicationId: 'test-app', channel: 'test' },
  }),
}));

// Import after mocks are set up
import { useGleanMetrics } from './useGleanMetrics';
import { PaymentsGleanClientManager } from '@fxa/payments/metrics/client';

const mockGleanConfig = { applicationId: 'test-app', channel: 'test' };

describe('useGleanMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a PaymentsGleanClientManager when metrics are enabled', () => {
    renderHook(() => useGleanMetrics(true));
    expect(PaymentsGleanClientManager).toHaveBeenCalledWith(mockGleanConfig);
  });

  it('does not create a manager when metrics are disabled', () => {
    renderHook(() => useGleanMetrics(false));
    expect(PaymentsGleanClientManager).not.toHaveBeenCalled();
  });

  it('delegates recordPageView to the manager when enabled', () => {
    const { result } = renderHook(() => useGleanMetrics(true));
    const data = { page: 'checkout' };
    result.current.recordPageView(data as any);
    expect(mockRecordPageView).toHaveBeenCalledWith(data);
  });

  it('does not throw when calling record methods with metrics disabled', () => {
    const { result } = renderHook(() => useGleanMetrics(false));
    expect(() =>
      result.current.recordPageView({ page: 'checkout' } as any)
    ).not.toThrow();
    expect(mockRecordPageView).not.toHaveBeenCalled();
  });

  it('delegates retention flow methods to the manager', () => {
    const { result } = renderHook(() => useGleanMetrics(true));
    const viewData = { flowType: 'cancel' };
    const engageData = { flowType: 'cancel', action: 'redeem' };
    const submitData = { flowType: 'cancel', action: 'redeem' };
    const resultData = { flowType: 'cancel', action: 'redeem', outcome: 'ok' };

    result.current.recordRetentionFlowView(viewData as any);
    result.current.recordRetentionFlowEngage(engageData as any);
    result.current.recordRetentionFlowSubmit(submitData as any);
    result.current.recordRetentionFlowResult(resultData as any);

    expect(mockRecordRetentionFlowView).toHaveBeenCalledWith(viewData);
    expect(mockRecordRetentionFlowEngage).toHaveBeenCalledWith(engageData);
    expect(mockRecordRetentionFlowSubmit).toHaveBeenCalledWith(submitData);
    expect(mockRecordRetentionFlowResult).toHaveBeenCalledWith(resultData);
  });

  it('delegates interstitial offer methods to the manager', () => {
    const { result } = renderHook(() => useGleanMetrics(true));
    const viewData = { offeringId: 'vpn' };
    const engageData = { offeringId: 'vpn', action: 'upgrade' };
    const submitData = { offeringId: 'vpn', action: 'upgrade' };
    const resultData = { offeringId: 'vpn', outcome: 'accepted' };

    result.current.recordInterstitialOfferView(viewData as any);
    result.current.recordInterstitialOfferEngage(engageData as any);
    result.current.recordInterstitialOfferSubmit(submitData as any);
    result.current.recordInterstitialOfferResult(resultData as any);

    expect(mockRecordInterstitialOfferView).toHaveBeenCalledWith(viewData);
    expect(mockRecordInterstitialOfferEngage).toHaveBeenCalledWith(engageData);
    expect(mockRecordInterstitialOfferSubmit).toHaveBeenCalledWith(submitData);
    expect(mockRecordInterstitialOfferResult).toHaveBeenCalledWith(resultData);
  });
});
