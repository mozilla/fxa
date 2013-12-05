'use strict';

define([
  'views/base',
  'hgn!templates/settings'
],
function(BaseView, SettingsTemplate) {
  var SettingsView = BaseView.extend({
    template: SettingsTemplate,
    className: 'settings'
  });

  return SettingsView;
});
