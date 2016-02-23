/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Account = require('models/account');
  var BackMixin = require('views/mixins/back-mixin');
  var BaseView = require('views/base');
  var CheckboxMixin = require('views/mixins/checkbox-mixin');
  var Cocktail = require('cocktail');
  var FormView = require('views/form');
  var OAuthErrors = require('lib/oauth-errors');
  var PermissionTemplate = require('stache!templates/partial/permission');
  var ServiceMixin = require('views/mixins/service-mixin');
  var Strings = require('lib/strings');
  var Template = require('stache!templates/permissions');

  var t = BaseView.t;

  // Reduce the number of strings to translate by interpolating
  // to create the required variant of a label.
  var requiredPermissionLabel = t('%(permissionName)s (required)');

  // Permissions are in the array in the order they should
  // appear on the screen.
  var PERMISSIONS = [
    {
      label: t('Email address'),
      name: 'profile:email',
      required: true
    },
    {
      label: t('Display name'),
      name: 'profile:display_name'
    },
    {
      label: t('Account picture'),
      name: 'profile:avatar',
      valueVisible: false
    },
    {
      label: 'uid',
      name: 'profile:uid',
      required: true,
      visible: false
    }
  ];

  var View = FormView.extend({
    template: Template,
    className: 'permissions',

    initialize: function (options) {
      // Account data is passed in from sign up and sign in flows.
      this._account = this.user.initAccount(this.model.get('account'));

      this.type = options.type;

      // to keep the view from knowing too much about the state machine,
      // a continuation function is passed in that should be called
      // when submit has completed.
      this.onSubmitComplete = this.model.get('onSubmitComplete');
      this._validatePermissions(this.relier.get('permissions') || []);
    },

    getAccount: function () {
      return this._account;
    },

    context: function () {
      var account = this.getAccount();
      var requestedPermissions = this.relier.get('permissions');
      var applicablePermissions =
        this._getApplicablePermissions(account, requestedPermissions);
      var permissionsHTML = this._getPermissionsHTML(account, applicablePermissions);

      return {
        privacyUri: this.relier.get('privacyUri'),
        serviceName: this.relier.get('serviceName'),
        termsUri: this.relier.get('termsUri'),
        unsafePermissionsHTML: permissionsHTML,
      };
    },

    /**
     * Validate the requested permissions. Logs an INVALID_SCOPES error
     * if any invalid permissions found. Does not throw.
     *
     * @private
     * @param {string} requestedPermissionNames
     */
    _validatePermissions: function (requestedPermissionNames) {
      requestedPermissionNames.forEach(function (permissionName) {
        var permission = this._getPermissionConfig(permissionName);
        // log the invalid scope instead of throwing an error
        // to see if any reliers are specifying invalid scopes. We
        // will be more strict in the future. Ref #2508
        if (! permission) {
          this.logError(OAuthErrors.toError('INVALID_SCOPES', permissionName));
        }
      }, this);
    },

    /**
     * Get configuration for a permission
     *
     * @private
     * @param {string} permissionName
     * @returns {object} permission, if found.
     * @throws if permission is invalid
     */
    _getPermissionConfig: function (permissionName) {
      var permission = _.findWhere(PERMISSIONS, { name: permissionName });

      if (! permission) {
        return null;
      }

      return _.clone(permission);
    },

    /**
     * Get the applicable permissions. A permission is applicable
     * if both requested and the account has a corresponding value
     *
     * @private
     * @param {object} account
     * @param {array of strings} requestedPermissionNames
     * @returns {array of objects} applicable permissions
     */
    _getApplicablePermissions: function (account, requestedPermissionNames) {
      var self = this;

      // only show permissions that have corresponding values.
      var permissionsWithValues =
        account.getPermissionsWithValues(requestedPermissionNames);

      return permissionsWithValues.map(function (permissionName) {
        var permission = self._getPermissionConfig(permissionName);

        // filter out permissions we do not know about
        if (! permission) {
          return null;
        }

        return permissionName;
      }).filter(function (permissionName) {
        return permissionName !== null;
      });
    },

    /**
     * Get the index of a permission
     *
     * @private
     * @param {string} permissionName
     * @returns {number} permission index if found, -1 otw.
     */
    _getPermissionIndex: function (permissionName) {
      return _.findIndex(PERMISSIONS, function (permission) {
        return permission.name === permissionName;
      });
    },

    /**
     * Sort permissions to match the sort order in the PERMISSIONS array
     *
     * @private
     * @param {array of strings} permissionNames
     * @returns {array of strings} sorted permissionNames
     */
    _sortPermissions: function (permissionNames) {
      var self = this;
      return [].concat(permissionNames).sort(function (a, b) {
        var aIndex = self._getPermissionIndex(a);
        var bIndex = self._getPermissionIndex(b);
        return aIndex - bIndex;
      });
    },

    /**
     * Get HTML for the set of permissions
     *
     * @private
     * @param {array of strings} permissionNames
     * @returns {string} HTML
     */
    _getPermissionsHTML: function (account, permissionNames) {
      var self = this;

      var sortedPermissionNames = self._sortPermissions(permissionNames);

      // convert the permission names to HTML
      return sortedPermissionNames.map(function (permissionName) {
        var permission = self._getPermissionConfig(permissionName);
        if (permission.required !== true) {
          permission.required = false;
        }

        // convert label to the required label
        if (permission.required) {
          permission.label = Strings.interpolate(requiredPermissionLabel, {
            permissionName: permission.label
          });
        }

        // value is visible unless overridden
        if (permission.valueVisible !== false) {
          permission.valueVisible = true;
        }

        // permission as a whole is visible unless overridden
        if (permission.visible !== false) {
          permission.visible = true;
        }

        var accountKey = Account.PERMISSIONS_TO_KEYS[permissionName];
        permission.value = account.get(accountKey);

        return permission;
      }).map(PermissionTemplate).join('\n');
    },

    /**
     * Get the permission values from the form
     *
     * Returned object has the following format:
     * {
     *   'profile:display_name': false,
     *   'profile:email': true
     * }
     *
     * @private
     * @returns {object}
     */
    _getFormPermissions: function () {
      var $permissionEls = this.$('.permission');
      var clientPermissions = {};

      $permissionEls.each(function (index, el) {
        clientPermissions[el.name] = !! el.checked;
      });

      return clientPermissions;
    },

    beforeRender: function () {
      // user cannot proceed if they have not initiated a sign up/in.
      if (! this.getAccount().get('sessionToken')) {
        this.navigate(this._previousView());
        return false;
      }

      var account = this.getAccount();
      if (account.get('verified')) {
        return account.fetchProfile();
      }
    },

    submit: function () {
      var self = this;
      var account = self.getAccount();

      self.logViewEvent('accept');

      account.setClientPermissions(
          self.relier.get('clientId'), self._getFormPermissions());

      return self.user.setAccount(account)
        .then(self.onSubmitComplete);
    },

    _previousView: function () {
      var page = this.is('sign_up') ? '/signup' : '/signin';
      return this.broker.transformLink(page);
    },

    is: function (type) {
      return this.type === type;
    }
  }, {
    PERMISSIONS: PERMISSIONS
  });

  Cocktail.mixin(
    View,
    BackMixin,
    CheckboxMixin,
    ServiceMixin
  );

  module.exports = View;
});
