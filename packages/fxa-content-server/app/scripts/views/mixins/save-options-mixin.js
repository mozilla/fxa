/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Mixin that adds ability to download, print and copy content.
 *
 * @mixin SaveOptionsMixin
 */
import $ from 'jquery';
import UserAgentMixin from '../../lib/user-agent-mixin';

const t = msg => msg;

const Mixin = {
  dependsOn: [UserAgentMixin],

  setInitialContext() {
    this.$('.modal-success').addClass('hidden');
  },

  copy(text, appendToElement) {
    // This copies the text to clipboard by creating a tiny transparent
    // textArea with the content. Then it executes the browser `copy` command and removes textArea.
    $(
      '<textArea id="temporary-copy-area" class="temporary-copy-text-area"></textArea>'
    ).appendTo(appendToElement);
    this.$('textArea.temporary-copy-text-area').text(text);

    if (this.getUserAgent().isIos()) {
      // iOS does not allow you to directly use the `document.execCommand('copy')` function.
      // The text area must have contentEditable=true and have a range selected before you can copy.
      // https://stackoverflow.com/questions/34045777/copy-to-clipboard-using-javascript-in-ios
      const el = this.window.document.getElementById('temporary-copy-area');
      el.contentEditable = true;
      // convert to readonly to stop iOS keyboard opening
      el.readOnly = true;
      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = this.window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      el.setSelectionRange(0, 999999);
    } else {
      this.$('textArea.temporary-copy-text-area')
        .select()
        .focus();
    }

    try {
      this.window.document.execCommand('copy');
      this._displaySuccess(t('Copied'));
    } catch (err) {
      this._displayError(t('Failed to copy. Please manually copy.'));
    }
    this.$('textArea.temporary-copy-text-area').remove();
  },

  download(text, filename, appendToElement) {
    // This dynamically creates a link with a blob data of the text data,
    // then clicks it to initiate a download and then removes element.
    const codeBlob = new Blob([text], { type: 'text/plain' });
    const href = URL.createObjectURL(codeBlob);
    const template = `
      <a id="download-link" href="${href}" download="${filename}"></a>
    `;
    $(template).appendTo(appendToElement);
    this.window.document.getElementById('download-link').click();
    this.$('download-link').remove();
    this._displaySuccess(t('Downloaded'));
  },

  print(template) {
    // We dynamically create a new window with recovery key and attempt to
    // print it.
    const printWindow = this.window.open('', 'Print', 'height=600,width=800');
    printWindow.document.write(template);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    this._displaySuccess(t('Printed'));
  },

  _displaySuccess(msg) {
    this.$('.error').addClass('hidden');

    const modalSuccess = this.$('.modal-success');
    const regularSuccess = this.$('.success');
    let successBanner;

    if (modalSuccess.length) {
      successBanner = modalSuccess;
      successBanner.addClass('success');
    } else if (regularSuccess.length) {
      successBanner = regularSuccess;
      successBanner.addClass('visible');
    }

    successBanner.removeClass('hidden').text(this.translate(msg));
  },

  _displayError(msg) {
    const modalSuccess = this.$('.modal-success');
    const regularSuccess = this.$('.success');
    let successBanner;

    if (modalSuccess.length) {
      successBanner = modalSuccess;
      successBanner.removeClass('success');
    } else if (regularSuccess.length) {
      successBanner = regularSuccess;
      successBanner.removeClass('visible');
    }

    successBanner.addClass('hidden');

    this.$('.error')
      .removeClass('hidden')
      .text(this.translate(msg));
  },
};

export default Mixin;
