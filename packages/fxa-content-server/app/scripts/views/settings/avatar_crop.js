/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from '../../lib/auth-errors';
import AvatarMixin from '../mixins/avatar-mixin';
import Cocktail from 'cocktail';
import Constants from '../../lib/constants';
import Cropper from '../../lib/cropper';
import CropperImage from '../../models/cropper-image';
import FormView from '../form';
import ModalSettingsPanelMixin from '../mixins/modal-settings-panel-mixin';
import ProfileImage from '../../models/profile-image';
import Template from 'templates/settings/avatar_crop.mustache';

var HORIZONTAL_GUTTER = 90;
var VERTICAL_GUTTER = 0;

const proto = FormView.prototype;
const View = FormView.extend({
  template: Template,
  className: 'avatar-crop',
  viewName: 'settings.avatar.crop',

  initialize() {
    this._cropImg = this.model.get('cropImg');

    if (!this._cropImg && this.broker.isAutomatedBrowser()) {
      this._cropImg = new CropperImage();
    }
  },

  beforeRender() {
    if (!this._cropImg) {
      this.navigate('settings/avatar/change', {
        error: AuthErrors.toMessage('UNUSABLE_IMAGE'),
      });
    }
  },

  afterRender() {
    this.canvas = this.$('canvas')[0];
    return proto.afterRender.call(this);
  },

  afterVisible() {
    // Use pre-set dimensions if available
    var width = this._cropImg.get('width');
    var height = this._cropImg.get('height');
    var src = this._cropImg.get('src');

    try {
      this.cropper = new Cropper({
        container: this.$('.cropper'),
        displayLength: Constants.PROFILE_IMAGE_DISPLAY_SIZE,
        exportLength: Constants.PROFILE_IMAGE_EXPORT_SIZE,
        height: height,
        horizontalGutter: HORIZONTAL_GUTTER,
        onRotate: this._onRotate.bind(this),
        onTranslate: this._onTranslate.bind(this),
        onZoomIn: this._onZoomIn.bind(this),
        onZoomOut: this._onZoomOut.bind(this),
        onZoomRangeChange: this._onZoomRangeChange.bind(this),
        src: src,
        verticalGutter: VERTICAL_GUTTER,
        width: width,
      });
    } catch (e) {
      // settings_common functional tests visit this page directly so draggable
      // won't be preloaded. Ignore errors about that– they don't matter.
      if (
        this.broker.isAutomatedBrowser() &&
        e.message.indexOf('draggable') !== -1
      ) {
        return;
      }

      this.navigate('settings/avatar/change', {
        error: AuthErrors.toMessage('UNUSABLE_IMAGE'),
      });
    }

    return proto.afterVisible.call(this);
  },

  toBlob() {
    return new Promise(resolve => {
      this.cropper.toBlob(
        resolve,
        this._cropImg.get('type'),
        Constants.PROFILE_IMAGE_JPEG_QUALITY
      );
    });
  },

  submit() {
    let start;
    const account = this.getSignedInAccount();

    this.logAccountImageChange(account);

    return this.toBlob()
      .then(data => {
        start = Date.now();
        return account.uploadAvatar(data);
      })
      .then(result => {
        this.logFlowEvent(`timing.avatar.upload.${Date.now() - start}`);
        this.updateProfileImage(new ProfileImage(result), account);
        this.navigate('settings');
        return result;
      });
  },

  _onRotate() {
    this.logViewEvent('rotate.cw');
  },

  _onTranslate() {
    this.logViewEvent('translate');
  },

  _onZoomIn() {
    this.logViewEvent('zoom.in');
  },

  _onZoomOut() {
    this.logViewEvent('zoom.out');
  },

  _onZoomRangeChange() {
    this.logViewEvent('zoom.range');
  },
});

Cocktail.mixin(View, AvatarMixin, ModalSettingsPanelMixin);

export default View;
