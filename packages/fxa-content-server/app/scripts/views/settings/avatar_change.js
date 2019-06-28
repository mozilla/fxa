/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import AuthErrors from '../../lib/auth-errors';
import AvatarMixin from '../mixins/avatar-mixin';
import Cocktail from 'cocktail';
import CropperImage from '../../models/cropper-image';
import FormView from '../form';
import ImageLoader from '../../lib/image-loader';
import ModalSettingsPanelMixin from '../mixins/modal-settings-panel-mixin';
import Template from 'templates/settings/avatar_change.mustache';

const proto = FormView.prototype;
const View = FormView.extend({
  template: Template,
  className: 'avatar-change',
  viewName: 'settings.avatar.change',

  events: {
    'change #imageLoader': 'fileSet',
    'click #file': 'filePicker',
    'click .remove': 'removeAvatar',
  },

  initialize() {
    // override in tests
    this.FileReader = FileReader;
  },

  getAccount() {
    if (!this._account) {
      this._account = this.getSignedInAccount();
    }
    return this._account;
  },

  beforeRender() {
    if (this.relier.get('setting') === 'avatar') {
      this.relier.unset('setting');
    }
  },

  setInitialContext(context) {
    var account = this.getSignedInAccount();
    context.set({
      avatarDefault: account.get('profileImageUrlDefault'),
      hasProfileImage: account.has('profileImageUrl'),
    });
  },

  afterVisible() {
    return proto.afterVisible
      .call(this)
      .then(() => this.displayAccountProfileImage(this.getAccount()));
  },

  afterRender() {
    // Wrapper hides the browser's file picker widget so we can use
    // our own. Set the height/width to 1px by 1px so that Selenium
    // can interact with the element. The element is not visible
    // to the user.
    var wrapper = $('<div/>').css({
      height: 1,
      opacity: 0,
      overflow: 'hidden',
      width: 1,
    });
    this.$(':file').wrap(wrapper);
    return proto.afterRender.call(this);
  },

  removeAvatar() {
    var account = this.getAccount();
    return this.deleteDisplayedAccountProfileImage(account).then(
      () => {
        this.navigate('settings');
      },
      err => {
        this.displayError(err);
        throw err;
      }
    );
  },

  filePicker() {
    this.$('#imageLoader').click();
  },

  fileSet(e) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
      const file = e.target.files[0];
      const account = this.getAccount();
      this.logAccountImageChange(account);

      const imgOnError = e => {
        const error = e && e.errno ? e : 'UNUSABLE_IMAGE';
        const msg = AuthErrors.toMessage(error);
        this.displayError(msg);
        reject(msg);
      };

      if (file.type.match('image.*')) {
        const reader = new this.FileReader();

        reader.onload = event => {
          const src = event.target.result;

          ImageLoader.load(src)
            .then(img => {
              this.logFlowEvent(`timing.avatar.load.${Date.now() - start}`);
              const cropImg = new CropperImage({
                height: img.height,
                src,
                type: file.type,
                width: img.width,
              });

              return Promise.all([
                import(/* webpackChunkName: "draggable" */ 'draggable'),
                import(/* webpackChunkName: "touch-punch" */ 'touch-punch'),
              ]).then(() => {
                this.navigate('settings/avatar/crop', {
                  cropImg,
                });
                resolve();
              });
            })
            .catch(imgOnError);
        };
        reader.readAsDataURL(file);
      } else {
        imgOnError();
      }
    });
  },
});

Cocktail.mixin(View, AvatarMixin, ModalSettingsPanelMixin);

export default View;
