/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*/

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const $ = require('jquery');
  const AttachedClients = require('models/attached-clients');
  const Cocktail = require('cocktail');
  const Constants = require('lib/constants');
  const FormView = require('views/form');
  const preventDefaultThen = require('views/base').preventDefaultThen;
  const SettingsPanelMixin = require('views/mixins/settings-panel-mixin');
  const SignedOutNotificationMixin = require('views/mixins/signed-out-notification-mixin');
  const Strings = require('lib/strings');
  const { t } = require('views/base');
  const Template = require('stache!templates/settings/clients');
  const UserAgentMixin = require('lib/user-agent-mixin');

  const DEVICE_REMOVED_ANIMATION_MS = 150;

  const UTM_PARAMS = '?utm_source=accounts.firefox.com&utm_medium=referral&utm_campaign=fxa-devices';
  const DEVICES_SUPPORT_URL = 'https://support.mozilla.org/kb/fxa-managing-devices' + UTM_PARAMS;
  const FIREFOX_ANDROID_DOWNLOAD_LINK = Strings.interpolate(Constants.DOWNLOAD_LINK_TEMPLATE_ANDROID, {
    campaign: 'fxa-devices-page',
    creative: 'button'
  });
  const FIREFOX_IOS_DOWNLOAD_LINK = Strings.interpolate(Constants.DOWNLOAD_LINK_TEMPLATE_IOS, {
    campaign: 'fxa-devices-page',
    creative: 'button'
  });

  const proto = FormView.prototype;
  const View = FormView.extend({
    template: Template,
    className: 'clients',
    viewName: 'settings.clients',

    initialize (options) {
      this._attachedClients = options.attachedClients;

      if (! this._attachedClients) {
        this._attachedClients = new AttachedClients([], {
          notifier: options.notifier
        });
      }

      this.listenTo(this._attachedClients, 'remove', this._onItemRemoved);
    },

    _formatAccessTimeAndScope (items) {
      return _.map(items, (item) => {
        item.title = item.name;
        if (item.scope) {
          item.title += ' - ' + item.scope;
        }
        if (item.lastAccessTimeFormatted) {

          if (item.isWebSession) {
            item.title = this.translate(
              t('Web Session, %(userAgent)s'), {userAgent: item.userAgent});
            item.lastAccessTimeFormatted = this.translate(
              t('%(translatedTimeAgo)s'), {translatedTimeAgo: item.lastAccessTimeFormatted});
          }

          if (item.isDevice) {
            item.lastAccessTimeFormatted = this.translate(
              t('started syncing %(translatedTimeAgo)s'), {translatedTimeAgo: item.lastAccessTimeFormatted});
          }

          if (item.clientType === Constants.CLIENT_TYPE_OAUTH_APP) {
            item.lastAccessTimeFormatted = this.translate(
              t('last active %(translatedTimeAgo)s'), {translatedTimeAgo: item.lastAccessTimeFormatted});
          }
        } else {
          // unknown lastAccessTimeFormatted or not possible to format.
          item.lastAccessTimeFormatted = '';
        }
        return item;
      });
    },

    setInitialContext (context) {
      const clients = this._attachedClients.toJSON();

      context.set({
        areWebSessionsVisible: this._areWebSessionsVisible(),
        clients: this._formatAccessTimeAndScope(clients),
        devicesSupportUrl: DEVICES_SUPPORT_URL,
        isPanelOpen: this.isPanelOpen(),
        linkAndroid: FIREFOX_ANDROID_DOWNLOAD_LINK,
        linkIOS: FIREFOX_IOS_DOWNLOAD_LINK,
        showMobileApps: this._showMobileApps(clients)
      });
    },

    events: {
      'click .client-disconnect': preventDefaultThen('_onDisconnectClient'),
      'click .clients-refresh': 'startRefresh',
      'click [data-get-app]': '_onGetApp'
    },

    /**
     * Determine if the clients list should show Web Sessions
     * @returns {Boolean}
     * @private
     */
    _areWebSessionsVisible () {
      if (this.getSearchParam('sessionsListVisible')) {
        // if forced via query param
        return true;
      }
      // currently disabled by default for all users, pending some fixes.
      return false;
    },

    /**
     * Returns true if we should show mobile app placeholders
     *
     * @param {Client[]} clients - array of attached clients
     * @returns {Boolean}
     * @private
     */
    _showMobileApps (clients) {
      if (this.broker.hasCapability('convertExternalLinksToText')) {
        // if we cannot show links exit out early
        return false;
      }

      // we would show mobile apps if there are no mobile or tablet clients
      return ! _.some(clients, function (client) {
        return client.type === 'mobile' || client.type === 'tablet';
      });
    },

    _onItemRemoved (item) {
      var id = item.get('id');
      $('#' + id).slideUp(DEVICE_REMOVED_ANIMATION_MS, () => {
        // re-render in case the last device is removed and the
        // "no registered devices" message needs to be shown.
        this.render();
      });
    },

    _onDisconnectClient (event) {
      var client = this._attachedClients.get($(event.currentTarget).data('id'));
      var clientType = client.get('clientType');
      this.logViewEvent(clientType + '.disconnect');
      // if a device then ask for confirmation
      if (clientType === Constants.CLIENT_TYPE_DEVICE) {
        this.navigate('settings/clients/disconnect', {
          clientId: client.get('id'),
          clients: this._attachedClients
        });
      } else {
        this.user.destroyAccountClient(this.user.getSignedInAccount(), client)
          .then(() => {
            if (clientType === Constants.CLIENT_TYPE_WEB_SESSION) {
              return this.user.sessionStatus().then(null, () => {
                // if err then it disconnected the current session, the user is signed out
                this.clearSessionAndNavigateToSignIn();
              });
            }
          });
      }
    },

    _onGetApp (event) {
      var appType = this.$el.find(event.currentTarget).data('get-app');
      this.logViewEvent(`get.${appType}`);
    },

    openPanel () {
      this.logViewEvent('open');
      // manually submit using an element to trigger the progress indicator mixin
      return this.validateAndSubmit();
    },

    _fetchAttachedClients () {
      return this._attachedClients.fetchClients({
        oAuthApps: true,
        sessions: true
      }, this.user).then(() => {
        // log the number of items
        const numOfClients = this._attachedClients.length;
        const itemsLog = 'settings.clients.items';

        if (numOfClients === 0) {
          this.logEventOnce(itemsLog + '.zero');
        } else if (numOfClients === 1) {
          this.logEventOnce(itemsLog + '.one');
        } else if (numOfClients === 2) {
          this.logEventOnce(itemsLog + '.two');
        } else {
          this.logEventOnce(itemsLog + '.many');
        }
      });
    },

    startRefresh () {
      // only add the artificial delay once the user clicks refresh. This
      // allows the initial load/render to occur as fast as the server
      // can respond.
      this.$('.clients-refresh').data('minProgressIndicatorMs', View.MIN_REFRESH_INDICATOR_MS);
      this.logViewEvent('refresh');
      // the actual refresh is done by `submit`.
    },

    submit () {
      if (this.isPanelOpen()) {
        // only refresh devices if panel is visible
        // if panel is hidden there is no point of fetching devices.
        // The re-render is done in afterSubmit to ensure
        // the minimum artifical delay time is honored before
        // re-rendering.
        return this._fetchAttachedClients();
      }
    },

    afterSubmit () {
      // afterSubmit is called after the artificial delay has
      // expired in the progress indicator decorator. re-render
      // once the progress indicator has gone away.
      return proto.afterSubmit.call(this)
        .then(() => this.render());
    }
  }, {
    MIN_REFRESH_INDICATOR_MS: 1600
  });

  Cocktail.mixin(
    View,
    SettingsPanelMixin,
    SignedOutNotificationMixin,
    UserAgentMixin
  );

  module.exports = View;
});
