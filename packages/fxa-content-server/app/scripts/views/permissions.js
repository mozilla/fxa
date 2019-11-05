/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import Account from '../models/account';
import BackMixin from './mixins/back-mixin';
import Cocktail from 'cocktail';
import FormView from './form';
import OAuthErrors from '../lib/oauth-errors';
import PermissionTemplate from 'templates/partial/permission.mustache';
import ServiceMixin from './mixins/service-mixin';
import Strings from '../lib/strings';
import Template from 'templates/permissions.mustache';
import VerificationReasonMixin from './mixins/verification-reason-mixin';

const t = msg => msg;

// Reduce the number of strings to translate by interpolating
// to create the required variant of a label.
var requiredPermissionLabel = t('%(permissionName)s (required)');

// Permissions are in the array in the order they should
// appear on the screen.
var PERMISSIONS = [
  {
    label: t('Email address'),
    name: 'profile:email',
    required: true,
  },
  {
    label: t('Display name'),
    name: 'profile:display_name',
  },
  {
    label: t('Account picture'),
    name: 'profile:avatar',
    valueVisible: false,
  },
  {
    label: 'uid',
    name: 'profile:uid',
    required: true,
    visible: false,
  },
];

var View = FormView.extend(
  {
    template: Template,
    className: 'permissions',

    initialize(options) {
      // Account data is passed in from sign up and sign in flows.
      this._account = this.user.initAccount(this.model.get('account'));

      this.type = options.type;

      // to keep the view from knowing too much about the state machine,
      // a continuation function is passed in that should be called
      // when submit has completed.
      this.onSubmitComplete = this.model.get('onSubmitComplete');
      this._validatePermissions(this.relier.get('permissions') || []);
    },

    getAccount() {
      return this._account;
    },

    setInitialContext(context) {
      var account = this.getAccount();
      var requestedPermissions = this.relier.get('permissions');
      var applicablePermissions = this._getApplicablePermissions(
        account,
        requestedPermissions
      );

      context.set({
        unsafePermissionsHTML: this._getPermissionsHTML(
          account,
          applicablePermissions
        ),
      });
    },

    /**
     * Validate the requested permissions. Logs an INVALID_SCOPES error
     * if any invalid permissions found. Does not throw.
     *
     * @private
     * @param {String} requestedPermissionNames
     */
    _validatePermissions(requestedPermissionNames) {
      requestedPermissionNames.forEach(function(permissionName) {
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
     * @param {String} permissionName
     * @returns {Object} permission, if found.
     * @throws if permission is invalid
     */
    _getPermissionConfig(permissionName) {
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
     * @param {Object} account
     * @param {String[]} requestedPermissionNames
     * @returns {Object[]} applicable permissions
     */
    _getApplicablePermissions(account, requestedPermissionNames) {
      // only show permissions that have corresponding values.
      var permissionsWithValues = account.getPermissionsWithValues(
        requestedPermissionNames
      );

      return permissionsWithValues
        .map(permissionName => {
          var permission = this._getPermissionConfig(permissionName);

          // filter out permissions we do not know about
          if (! permission) {
            return null;
          }

          return permissionName;
        })
        .filter(function(permissionName) {
          return permissionName !== null;
        });
    },

    /**
     * Get the index of a permission
     *
     * @private
     * @param {String} permissionName
     * @returns {Number} permission index if found, -1 otw.
     */
    _getPermissionIndex(permissionName) {
      return _.findIndex(PERMISSIONS, function(permission) {
        return permission.name === permissionName;
      });
    },

    /**
     * Sort permissions to match the sort order in the PERMISSIONS array
     *
     * @private
     * @param {String[]} permissionNames
     * @returns {String[]} sorted permissionNames
     */
    _sortPermissions(permissionNames) {
      return [].concat(permissionNames).sort((a, b) => {
        var aIndex = this._getPermissionIndex(a);
        var bIndex = this._getPermissionIndex(b);
        return aIndex - bIndex;
      });
    },

    /**
     * Get HTML for the set of permissions
     *
     * @private
     * @param {Account} account
     * @param {String[]} permissionNames
     * @returns {String} HTML
     */
    _getPermissionsHTML(account, permissionNames) {
      var sortedPermissionNames = this._sortPermissions(permissionNames);

      // convert the permission names to HTML
      return sortedPermissionNames
        .map(permissionName => {
          var permission = this._getPermissionConfig(permissionName);

          permission.label = this.translate(permission.label);

          if (permission.required !== true) {
            permission.required = false;
          }

          // convert label to the required label
          if (permission.required) {
            permission.label = Strings.interpolate(
              this.translate(requiredPermissionLabel),
              {
                permissionName: permission.label,
              }
            );
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
        })
        .map(PermissionTemplate)
        .join('\n');
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
     * @returns {Object}
     */
    _getFormPermissions() {
      var $permissionEls = this.$('.permission');
      var clientPermissions = {};

      $permissionEls.each(function(index, el) {
        clientPermissions[el.name] = !! el.checked;
      });

      return clientPermissions;
    },

    beforeRender() {
      // user cannot proceed if they have not initiated a sign up/in.
      if (! this.getAccount().get('sessionToken')) {
        this.navigate(this._previousView());
        return;
      }

      var account = this.getAccount();
      if (account.get('verified')) {
        return account.fetchProfile();
      }
    },

    submit() {
      return Promise.resolve().then(() => {
        var account = this.getAccount();

        this.logViewEvent('accept');

        account.setClientPermissions(
          this.relier.get('clientId'),
          this._getFormPermissions()
        );

        return this.onSubmitComplete(account);
      });
    },

    _previousView() {
      return this.isSignUp() ? '/signup' : '/signin';
    },
  },
  {
    PERMISSIONS: PERMISSIONS,
  }
);

Cocktail.mixin(View, BackMixin, ServiceMixin, VerificationReasonMixin);

export default View;
