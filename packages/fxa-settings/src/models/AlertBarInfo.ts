import { makeVar } from '@apollo/client';
import { ReactNode } from 'react';
import { accountCache } from '../lib/cache';

export type NotificationType = 'success' | 'info' | 'error' | 'warning';

export function consumeAlertTextExternal() {
  const account = accountCache.getCurrentAccount();
  const text = account?.alertText || null;
  if (account && text) {
    account.alertText = undefined;
    accountCache.setCurrentAccount(account);
  }
  return text;
}

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
