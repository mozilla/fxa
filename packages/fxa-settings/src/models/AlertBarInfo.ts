import { makeVar } from '@apollo/client';
import { consumeAlertTextExternal } from '../lib/cache';

export type AlertBarType = 'success' | 'info' | 'error';

export const alertContent = makeVar(consumeAlertTextExternal() || '');
export const alertType = makeVar<AlertBarType>('success');
export const alertVisible = makeVar(!!alertContent);

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

  setType(type: AlertBarType) {
    alertType(type);
  }

  setContent(text: string) {
    alertContent(text);
  }

  success(message: string) {
    this.setType('success');
    this.setContent(message);
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
