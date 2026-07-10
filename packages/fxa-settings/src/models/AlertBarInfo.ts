/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { makeVar } from '../lib/reactive-var';
import { ReactNode } from 'react';
import { consumeAlertTextExternal } from '../lib/cache';

export type NotificationType = 'success' | 'info' | 'error' | 'warning';

export const alertContent = makeVar<string | ReactNode>(
  consumeAlertTextExternal() || ''
);
export const alertType = makeVar<NotificationType>('success');
export const alertVisible = makeVar(!!alertContent());

export class AlertBarInfo {
  get visible() {
    return alertVisible();
  }

  show() {
    alertVisible(true);
  }

  hide() {
    alertVisible(false);
  }

  setType(type: NotificationType) {
    alertType(type);
  }

  setContent(text: string | ReactNode) {
    alertContent(text);
  }

  success(message: string | ReactNode, gleanEvent?: () => void) {
    this.setType('success');
    this.setContent(message);
    gleanEvent && gleanEvent();
    this.show();
  }

  error(message: string | ReactNode, error?: Error) {
    this.setType('error');
    this.setContent(message);
    this.show();
  }

  info(message: string | ReactNode) {
    this.setType('success');
    this.setContent(message);
    this.show();
  }
}
