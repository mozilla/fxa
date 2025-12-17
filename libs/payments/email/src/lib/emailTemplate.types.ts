/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface MJMLComponent {
  mjml: string;
  text: string;
}

export interface FtlIdMsg {
  id: string;
  message: string;
  vars?: Record<string, string>;
}

export interface RendererContext {
  template: string;
  layout: string;
  acceptLanguage?: string;
  selectedLocale?: string;
  cssPath: string;
  subject: string;
  action?: string;
  preview?: string;
  [key: string]: any; // flattened template values
}

export interface RenderEmailOptions {
  template: string;
  layout: string;
  acceptLanguage: string;
  selectedLocale?: string;
  args: Record<string, any>;
  subject: string;
}

export interface EmailRenderResult {
  html: string;
  text: string;
  subject: string;
  action: string;
  preview: string;
}

export interface GlobalTemplateValues {
  subject: FtlIdMsg;
  action?: FtlIdMsg;
  preview?: FtlIdMsg;
}

export interface LocalizedEmailMetadata {
  subject: string;
  action?: string;
  preview?: string;
}
