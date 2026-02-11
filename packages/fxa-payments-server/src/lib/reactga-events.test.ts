/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReactGALog } from './reactga-event';
import { MOCK_EVENTS, PLAN } from './mock-data';
import { cleanup } from '@testing-library/react';

jest.mock('./reactga-event.ts');

beforeEach(() => {
  jest.clearAllMocks();
  return cleanup();
});

describe('ReactGALog', () => {
  it('logs sign_up event', async () => {
    const gaSpy = jest.spyOn(ReactGALog, 'logEvent');
    ReactGALog.logEvent(MOCK_EVENTS.SignUp);
    expect(gaSpy).toBeCalledWith(MOCK_EVENTS.SignUp);
  });

  it('logs add_payment_info event - Stripe', async () => {
    const gaSpy = jest.spyOn(ReactGALog, 'logEvent');
    ReactGALog.logEvent(MOCK_EVENTS.AddPaymentInfo(PLAN));
    expect(gaSpy).toBeCalledWith(MOCK_EVENTS.AddPaymentInfo(PLAN));
  });

  it('logs add_payment_info event - PayPal', async () => {
    const gaSpy = jest.spyOn(ReactGALog, 'logEvent');
    ReactGALog.logEvent(MOCK_EVENTS.AddPayPalPaymentInfo(PLAN));
    expect(gaSpy).toBeCalledWith(MOCK_EVENTS.AddPayPalPaymentInfo(PLAN));
  });

  it('logs purchase_submit event - new', async () => {
    const gaSpy = jest.spyOn(ReactGALog, 'logEvent');
    ReactGALog.logEvent(MOCK_EVENTS.PurchaseSubmitNew(PLAN));
    expect(gaSpy).toBeCalledWith(MOCK_EVENTS.PurchaseSubmitNew(PLAN));
  });

  it('logs purchase_submit event - upgrade', async () => {
    const gaSpy = jest.spyOn(ReactGALog, 'logEvent');
    ReactGALog.logEvent(MOCK_EVENTS.PurchaseSubmitUpgrade(PLAN));
    expect(gaSpy).toBeCalledWith(MOCK_EVENTS.PurchaseSubmitUpgrade(PLAN));
  });

  it('logs purchase event - new', async () => {
    const gaSpy = jest.spyOn(ReactGALog, 'logEvent');
    ReactGALog.logEvent(MOCK_EVENTS.PurchaseNew(PLAN));
    expect(gaSpy).toBeCalledWith(MOCK_EVENTS.PurchaseNew(PLAN));
  });

  it('logs purchase event - upgrade', async () => {
    const gaSpy = jest.spyOn(ReactGALog, 'logEvent');
    ReactGALog.logEvent(MOCK_EVENTS.PurchaseUpgrade(PLAN));
    expect(gaSpy).toBeCalledWith(MOCK_EVENTS.PurchaseUpgrade(PLAN));
  });
});
