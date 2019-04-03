/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Some help text explaining to the user why they
 * should connect another device.
 */
'use strict';

const BackMixin = require('./mixins/back-mixin');
const BaseView = require('./base');
const Cocktail = require('cocktail');
const ModalPanelMixin = require('./mixins/modal-panel-mixin');
const Template = require('templates/why_connect_another_device.mustache');

const View = BaseView.extend({
  template: Template,

  initialize () {
    this.once('modal-cancel', () => this.back());
  },

  afterRender () {
    this.openPanel();
  }
});

Cocktail.mixin(
  View,
  BackMixin,
  ModalPanelMixin
);

module.exports = View;
