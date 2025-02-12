import { makeVar } from '@apollo/client';
import { consumeAlertTextExternal } from '../lib/cache';

export type NotificationType = 'success' | 'info' | 'error' | 'warning';

export const alertContent = makeVar(consumeAlertTextExternal() || '');
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

  setContent(text: string) {
    alertContent(text);
  }

  success(message: string, gleanEvent?: () => void) {
    this.setType('success');
    this.setContent(message);
    gleanEvent && gleanEvent();
    this.show();
  }

  error(message: string, error?: Error) {
    this.setType('error');
    this.setContent(message);
    this.show();
  }

  info(message: string) {
    this.setType('success');
    this.setContent(message);
    this.show();
  }
}
