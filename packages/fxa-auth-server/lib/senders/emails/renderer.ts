import ejs = require('ejs');
import mjml2html = require('mjml');
import * as templates from './templates';

export const context = {
  buttonText: 'Sync device',
  onDesktopOrTabletDevice: true,
  anotherDeviceURL:
    'http://localhost:3030/connect_another_device?utm_medium=email&utm_campaign=fx-cad-reminder-first&utm_content=fx-connect-device',
  iosURL: '',
  androidURL: '',
};

export function render(
  templateName: keyof typeof templates,
  context: Record<any, any>
) {
  const template = ejs.compile(templates[templateName].render());
  const mjmlTemplate = template(context);
  return mjml2html(mjmlTemplate).html;
}
