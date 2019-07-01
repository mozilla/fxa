/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A model to manage displayed Sync engines
 * in the Choose What to Sync screen.
 */

import _ from 'underscore';
import Backbone from 'backbone';
import Cocktail from 'cocktail';
import UrlMixin from '../lib/url-mixin';
import UserAgentMixin from '../lib/user-agent-mixin';

const t = msg => msg;

/**
 * Fields available in each engine:
 * - `checked` whether the item should be checked when CWTS opens.
 * - `id` of the engine, must be the name the browser uses.
 * - `test` if defined, function used to test whether CWTS is available
 *    for the given `userAgent`. Should return `true` or `false`.
 * - `text` to display when CWTS opens
 */
const AVAILABLE_ENGINES = [
  {
    checked: true,
    id: 'bookmarks',
    text: t('Bookmarks'),
  },
  {
    checked: true,
    id: 'history',
    text: t('History'),
  },
  {
    checked: true,
    id: 'passwords',
    text: t('Logins'),
  },
  {
    checked: true,
    id: 'addons',
    text: t('Add-ons'),
  },
  {
    checked: true,
    id: 'tabs',
    text: t('Open tabs'),
  },
  {
    checked: true,
    id: 'prefs',
    text: t('Preferences'),
  },
  {
    checked: true,
    id: 'addresses',
    // addresses will only be available via capabilities.
    test: () => false,
    text: t('Addresses'),
  },
  {
    checked: true,
    id: 'creditcards',
    // credit cards will only be available via capabilities.
    test: () => false,
    text: t('Credit cards'),
  },
];

class SyncEngines extends Backbone.Collection {
  initialize(models, options = {}) {
    this.window = options.window;

    const engines = options.engines || this.getSupportedEngineIds();
    engines.forEach(engineId => this.addById(engineId));
  }

  /**
   * Get a list of engineIds supported by the user agent.
   *
   * @returns {String[]}
   */
  getSupportedEngineIds() {
    const userAgent = this.getUserAgent();
    const availableEngineIds = AVAILABLE_ENGINES.map(
      syncEngine => syncEngine.id
    );
    return _.filter(availableEngineIds, engineId =>
      this.isEngineSupportedByUA(engineId, userAgent)
    );
  }

  /**
   * Is engine with `engineId` is supported by `userAgent`
   *
   * @param {String} engineId
   * @param {Object} userAgent
   * @returns {Boolean}
   */
  isEngineSupportedByUA(engineId, userAgent) {
    const syncEngine = SyncEngines.getEngineConfig(engineId);
    return !syncEngine.test || syncEngine.test(userAgent);
  }

  /**
   * Add a sync engine by `engineId`, if not already
   * in the collection.
   *
   * @param {String} engineId
   */
  addById(engineId) {
    const syncEngine = SyncEngines.getEngineConfig(engineId);
    if (syncEngine && !this.get(engineId)) {
      this.add(syncEngine);
    }
  }

  /**
   * Use `engineId` to get the configuration for a Sync engine.
   *
   * @static
   * @param {String} engineId
   * @returns {Object}
   */
  static getEngineConfig(engineId) {
    return _.find(AVAILABLE_ENGINES, syncEngine => syncEngine.id === engineId);
  }
}

Cocktail.mixin(SyncEngines, UrlMixin, UserAgentMixin);

export default SyncEngines;
