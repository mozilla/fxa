/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*/

import _ from 'underscore';
import $ from 'jquery';
import AttachedClients from '../../models/attached-clients';
import Cocktail from 'cocktail';
import Constants from '../../lib/constants';
import FormView from '../form';
import preventDefaultThen from '../decorators/prevent_default_then';
import SettingsPanelMixin from '../mixins/settings-panel-mixin';
import SignedOutNotificationMixin from '../mixins/signed-out-notification-mixin';
import Strings from '../../lib/strings';
import Template from 'templates/settings/clients.mustache';
import UserAgentMixin from '../../lib/user-agent-mixin';

const t = (msg) => msg;

const DEVICE_REMOVED_ANIMATION_MS = 150;
const LOADING_INDICATOR_BUTTON = '.settings-button.settings-unit-loading';
const CLIENT_LIST_FORM = '.client-list-form';

const UTM_PARAMS =
  '?utm_source=accounts.firefox.com&utm_medium=referral&utm_campaign=fxa-devices';
const DEVICES_SUPPORT_URL =
  'https://support.mozilla.org/kb/fxa-managing-devices' + UTM_PARAMS;
const FIREFOX_ANDROID_DOWNLOAD_LINK = Strings.interpolate(
  Constants.DOWNLOAD_LINK_TEMPLATE_ANDROID,
  {
    campaign: 'fxa-devices-page',
    creative: 'button',
  }
);
const FIREFOX_IOS_DOWNLOAD_LINK = Strings.interpolate(
  Constants.DOWNLOAD_LINK_TEMPLATE_IOS,
  {
    campaign: 'fxa-devices-page',
    creative: 'button',
  }
);

const LAST_ACTIVITY_FORMATS = {
  device: {
    withoutLocation: {
      precise: t('Last seen %(translatedTimeAgo)s'),
      approximate: t('Last seen over %(translatedTimeAgo)s'),
    },
    withCountry: {
      precise: t('Last seen %(translatedTimeAgo)s in %(translatedCountry)s'),
      approximate: t(
        'Last seen over %(translatedTimeAgo)s in %(translatedCountry)s'
      ),
    },
    withCityStateCountry: {
      precise: t(
        'Last seen %(translatedTimeAgo)s near %(translatedCity)s, %(translatedState)s, %(translatedCountry)s'
      ),
      approximate: t(
        'Last seen over %(translatedTimeAgo)s near %(translatedCity)s, %(translatedState)s, %(translatedCountry)s'
      ),
    },
  },
  oauth: {
    withoutLocation: {
      precise: t('Last active %(translatedTimeAgo)s'),
      approximate: t('Last active over %(translatedTimeAgo)s'),
    },
    withCountry: {
      precise: t('Last active %(translatedTimeAgo)s in %(translatedCountry)s'),
      approximate: t(
        'Last active over %(translatedTimeAgo)s in %(translatedCountry)s'
      ),
    },
    withCityStateCountry: {
      precise: t(
        'Last active %(translatedTimeAgo)s near %(translatedCity)s, %(translatedState)s, %(translatedCountry)s'
      ),
      approximate: t(
        'Last active over %(translatedTimeAgo)s near %(translatedCity)s, %(translatedState)s, %(translatedCountry)s'
      ),
    },
  },
  web: {
    withoutLocation: {
      precise: t('%(translatedTimeAgo)s'),
      approximate: t('Over %(translatedTimeAgo)s'),
    },
    withCountry: {
      precise: t('%(translatedTimeAgo)s in %(translatedCountry)s'),
      approximate: t('Over %(translatedTimeAgo)s in %(translatedCountry)s'),
    },
    withCityStateCountry: {
      precise: t(
        '%(translatedTimeAgo)s near %(translatedCity)s, %(translatedState)s, %(translatedCountry)s'
      ),
      approximate: t(
        'Over %(translatedTimeAgo)s near %(translatedCity)s, %(translatedState)s, %(translatedCountry)s'
      ),
    },
  },
};

const proto = FormView.prototype;
const View = FormView.extend(
  {
    template: Template,
    className: 'clients',
    viewName: 'settings.clients',

    initialize(options) {
      this._attachedClients = options.attachedClients;

      if (!this._attachedClients) {
        this._attachedClients = new AttachedClients([], {
          notifier: options.notifier,
        });
      }

      this.listenTo(this._attachedClients, 'remove', this._onItemRemoved);
    },

    _formatAccessTimeAndScope(items) {
      return _.map(items, (item) => {
        item.title = item.name;

        if (item.scope) {
          item.title += ' - ' + item.scope;
        }

        if (item.lastAccessTimeFormatted) {
          if (item.clientType === Constants.CLIENT_TYPE_WEB_SESSION) {
            if (item.userAgent) {
              item.title = this.translate(t('Web Session, %(userAgent)s'), {
                userAgent: item.userAgent,
              });
            } else {
              item.title = t('Web Session');
            }
            this._setLastAccessTimeFormatted(item, LAST_ACTIVITY_FORMATS.web);
          } else if (item.clientType === Constants.CLIENT_TYPE_DEVICE) {
            this._setLastAccessTimeFormatted(
              item,
              LAST_ACTIVITY_FORMATS.device
            );
          } else if (item.clientType === Constants.CLIENT_TYPE_OAUTH_APP) {
            this._setLastAccessTimeFormatted(item, LAST_ACTIVITY_FORMATS.oauth);
          }
        } else {
          if (item.clientType === Constants.CLIENT_TYPE_DEVICE) {
            item.lastAccessTimeFormatted = t('Last seen time unknown');
          } else {
            // unknown lastAccessTimeFormatted or not possible to format.
            item.lastAccessTimeFormatted = '';
          }
        }

        return item;
      });
    },

    _setLastAccessTimeFormatted(item, format) {
      let translatedCity;
      let translatedCountry;
      let translatedState;
      let translatedTimeAgo = item.lastAccessTimeFormatted;

      if (item.location && item.location.country) {
        translatedCountry = item.location.country;
        if (item.location.city && item.location.stateCode) {
          translatedCity = item.location.city;
          translatedState = item.location.stateCode;
          format = format.withCityStateCountry;
        } else {
          format = format.withCountry;
        }
      } else {
        format = format.withoutLocation;
      }

      if (item.approximateLastAccessTime > item.lastAccessTime) {
        translatedTimeAgo = item.approximateLastAccessTimeFormatted;
        format = format.approximate;
      } else {
        format = format.precise;
      }

      item.lastAccessTimeFormatted = this.translate(format, {
        translatedCity,
        translatedCountry,
        translatedState,
        translatedTimeAgo,
      });
    },

    setInitialContext(context) {
      const clients = this._attachedClients.toJSON();
      context.set({
        clients: this._formatAccessTimeAndScope(clients),
        devicesSupportUrl: DEVICES_SUPPORT_URL,
        isPanelOpen: this.isPanelOpen(),
        linkAndroid: FIREFOX_ANDROID_DOWNLOAD_LINK,
        linkIOS: FIREFOX_IOS_DOWNLOAD_LINK,
        showMobileApps: this._showMobileApps(clients),
      });
    },

    events: {
      'click .client-disconnect': preventDefaultThen('_onDisconnectClient'),
      'click .clients-refresh': 'startRefresh',
      'click [data-get-app]': '_onGetApp',
    },

    /**
     * Returns true if we should show mobile app placeholders
     *
     * @param {Client[]} clients - array of attached clients
     * @returns {Boolean}
     * @private
     */
    _showMobileApps(clients) {
      // we would show mobile apps if there are no mobile or tablet clients
      return !_.some(clients, function (client) {
        return client.deviceType === 'mobile' || client.deviceType === 'tablet';
      });
    },

    _onItemRemoved(item) {
      var id = item.get('id');
      $('#' + id).slideUp(DEVICE_REMOVED_ANIMATION_MS, () => {
        // re-render in case the last device is removed and the
        // "no registered devices" message needs to be shown.
        this.render();
      });
    },

    _onDisconnectClient(event) {
      var client = this._attachedClients.get($(event.currentTarget).data('id'));
      var clientType = client.get('clientType');
      this.logViewEvent(clientType + '.disconnect');
      // if a device then ask for confirmation
      if (clientType === Constants.CLIENT_TYPE_DEVICE) {
        this.navigate('settings/clients/disconnect', {
          clientId: client.get('id'),
          clients: this._attachedClients,
        });
      } else {
        this.user
          .destroyAccountAttachedClient(this.user.getSignedInAccount(), client)
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

    _onGetApp(event) {
      var appType = this.$el.find(event.currentTarget).data('get-app');
      this.logViewEvent(`get.${appType}`);
    },

    openPanel() {
      this.logViewEvent('open');
      this.$el.find(CLIENT_LIST_FORM).hide();
      this.$el.find(LOADING_INDICATOR_BUTTON).show();
      return this.validateAndSubmit(null, {
        artificialDelay: View.MIN_REFRESH_INDICATOR_MS,
      });
    },

    _fetchAttachedClients() {
      const start = Date.now();
      return this._attachedClients.fetchClients(this.user).then(() => {
        this.logFlowEvent(`timing.clients.fetch.${Date.now() - start}`);
      });
    },

    startRefresh() {
      // only add the artificial delay once the user clicks refresh. This
      // allows the initial load/render to occur as fast as the server
      // can respond.
      this.$('.clients-refresh').data(
        'minProgressIndicatorMs',
        View.MIN_REFRESH_INDICATOR_MS
      );
      this.logViewEvent('refresh');
      // the actual refresh is done by `submit`.
    },

    submit() {
      if (this.isPanelOpen()) {
        // only refresh devices if panel is visible
        // if panel is hidden there is no point of fetching devices.
        // The re-render is done in afterSubmit to ensure
        // the minimum artificial delay time is honored before
        // re-rendering.
        return this._fetchAttachedClients();
      }
    },

    afterSubmit() {
      // afterSubmit is called after the artificial delay has
      // expired in the progress indicator decorator. re-render
      // once the progress indicator has gone away.
      return proto.afterSubmit.call(this).then(() => this.render());
    },
  },
  {
    MIN_REFRESH_INDICATOR_MS: 1600,
  }
);

Cocktail.mixin(
  View,
  SettingsPanelMixin,
  SignedOutNotificationMixin,
  UserAgentMixin
);

export default View;
