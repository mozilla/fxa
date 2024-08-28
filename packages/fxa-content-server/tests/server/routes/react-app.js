/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const sinon = require('sinon');
const {
  getRoutesExcludingAllReact,
} = require('../../../server/lib/routes/get-frontend');
const {
  FRONTEND_ROUTES,
  PAIRING_ROUTES,
  OAUTH_SUCCESS_ROUTES,
  TERMS_PRIVACY_REGEX,
} = require('../../../server/lib/routes/react-app/content-server-routes');
const {
  getRoutesExcludingPairingReact,
} = require('../../../server/lib/routes/get-frontend-pairing');
const {
  getRoutesExcludingOAuthSuccessReact,
} = require('../../../server/lib/routes/get-oauth-success');
const {
  getClientReactRouteGroups,
} = require('../../../server/lib/routes/react-app/route-groups-client');
const {
  reactRouteClient,
} = require('../../../server/lib/routes/react-app/react-route-client');
const {
  ReactRouteServer,
} = require('../../../server/lib/routes/react-app/react-route-server');
const { getReactRouteGroups } = require('../../../server/lib/routes/react-app');
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;

const showReactAppAll = {
  emailFirstRoutes: true,
  simpleRoutes: true,
  resetPasswordRoutes: true,
  oauthRoutes: true,
  signInRoutes: true,
  signUpRoutes: true,
  pairRoutes: true,
  postVerifyOtherRoutes: true,
  postVerifyCADViaQRRoutes: true,
};

function getEmptyClientReactRouteGroups(showReactApp = showReactAppAll) {
  const reactRouteGroups = getClientReactRouteGroups(showReactApp);
  for (const routeGroup in reactRouteGroups) {
    reactRouteGroups[routeGroup].routes = []; // start fresh
  }
  return reactRouteGroups;
}

const mockI18n = {
  supportedLanguages: ['en', 'fr'],
  defaultLanguage: 'en',
};

function getEmptyServerReactRouteGroups(showReactApp = showReactAppAll) {
  const reactRoute = new ReactRouteServer(mockI18n);
  const reactRouteGroups = getReactRouteGroups(showReactApp, reactRoute);
  for (const routeGroup in reactRouteGroups) {
    reactRouteGroups[routeGroup].routes = []; // start fresh
  }
  return { reactRouteGroups, reactRoute };
}

let routeName = '';
let routeNames = [''];
let mockServerReactRoute;

registerSuite('routes/react-app', {
  tests: {
    ReactRouteClient: {
      'provides name, but route definitions are omitted': function () {
        const clientReactRouteGroups =
          getEmptyClientReactRouteGroups(showReactAppAll);
        clientReactRouteGroups.simpleRoutes.routes = [
          reactRouteClient.getRoute('cannot_create_account'),
        ];
        const route = clientReactRouteGroups.simpleRoutes.routes[0];
        assert.isUndefined(route.definition);
        assert.equal(route, 'cannot_create_account');
      },
      'react-route handles route names set under different route lists':
        function () {
          const routeList = [
            'cannot_create_account',
            'reset_password',
            'pair/auth/allow',
          ];
          const routes = reactRouteClient.getRoutes(routeList);
          assert(routes.length, 3);
          assert.deepEqual(routes, routeList);
        },
      'handles legal regex': function () {
        const routes = reactRouteClient.getRoute(TERMS_PRIVACY_REGEX);
        assert.deepEqual(routes, ['legal/privacy', 'legal/terms']);
      },
      'throws when unknown route is provided': function () {
        assert.throws(() => reactRouteClient.getRoute('bloopity_bleep'));
      },
    },
    ReactRouteServer: {
      getRoute: {
        beforeEach: function () {
          mockServerReactRoute = new ReactRouteServer(mockI18n);
          mockServerReactRoute.getFrontEnd = sinon.spy();
          mockServerReactRoute.getFrontEndPairing = sinon.spy();
          mockServerReactRoute.getOAuthSuccess = sinon.spy();
          mockServerReactRoute.getTermsPrivacy = sinon.spy();
        },
        'calls getFrontEnd correctly based on route name': function () {
          mockServerReactRoute.getRoutes(FRONTEND_ROUTES);
          assert.equal(
            mockServerReactRoute.getFrontEnd.callCount,
            FRONTEND_ROUTES.length
          );
        },
        'calls getFrontEndPairing correctly based on route name': function () {
          mockServerReactRoute.getRoutes(PAIRING_ROUTES);
          assert.equal(
            mockServerReactRoute.getFrontEndPairing.callCount,
            PAIRING_ROUTES.length
          );
        },
        'calls getOAuthSuccess correctly based on route name': function () {
          mockServerReactRoute.getRoutes(OAUTH_SUCCESS_ROUTES);
          assert.equal(
            mockServerReactRoute.getOAuthSuccess.callCount,
            OAUTH_SUCCESS_ROUTES.length
          );
        },
        'calls getTermsPrivacy correctly based on route name': function () {
          mockServerReactRoute.getRoute(TERMS_PRIVACY_REGEX);
          assert.equal(mockServerReactRoute.getTermsPrivacy.callCount, 1);
        },
        'throws when an unknown route is provided': function () {
          assert.throws(() => mockServerReactRoute.getRoute('whatever'));
        },
      },
    },
    'get-frontend': {
      before: function () {
        routeName = 'cannot_create_account';
        routeNames = [routeName];
      },
      'excludes route present in React route group with feature flag on': {
        'single route': function () {
          const { reactRouteGroups, reactRoute } =
            getEmptyServerReactRouteGroups();

          reactRouteGroups.simpleRoutes.routes = [
            reactRoute.getRoute(routeName),
          ];
          const routesWithExclusion = getRoutesExcludingAllReact(
            reactRouteGroups,
            routeNames
          );
          assert.notIncludeMembers(routesWithExclusion, routeNames);
        },
        'multiple routes': function () {
          const { reactRouteGroups, reactRoute } =
            getEmptyServerReactRouteGroups();
          routeNames = [
            'reset_password',
            'complete_reset_password',
            'confirm_reset_password',
          ];
          reactRouteGroups.resetPasswordRoutes.routes =
            reactRoute.getRoutes(routeNames);
          const routesWithExclusion = getRoutesExcludingAllReact(
            reactRouteGroups,
            routeNames
          );
          assert.notIncludeMembers(routesWithExclusion, routeNames);
        },
      },
      'does not exclude route present in React route group with feature flag off':
        function () {
          const { reactRouteGroups, reactRoute } =
            getEmptyServerReactRouteGroups({
              ...showReactAppAll,
              simpleRoutes: false,
            });
          reactRouteGroups.simpleRoutes.routes = [
            reactRoute.getRoute(routeName),
          ];

          const routesWithExclusion = getRoutesExcludingAllReact(
            reactRouteGroups,
            routeNames
          );
          assert.includeMembers(routesWithExclusion, routeNames);
        },
      'does not exclude route if not present in React route group with feature flag on':
        function () {
          const { reactRouteGroups } = getEmptyServerReactRouteGroups();

          const routesWithExclusion = getRoutesExcludingAllReact(
            reactRouteGroups,
            routeNames
          );
          assert.includeMembers(routesWithExclusion, routeNames);
        },
    },
    'get-frontend-pairing': {
      before: function () {
        routeName = 'pair/auth/complete';
        routeNames = [routeName];
      },
      'excludes route present in React route group with feature flag on':
        function () {
          const { reactRouteGroups, reactRoute } =
            getEmptyServerReactRouteGroups();
          reactRouteGroups.pairRoutes.routes = [reactRoute.getRoute(routeName)];
          const routesWithExclusion = getRoutesExcludingPairingReact(
            reactRouteGroups,
            routeNames
          );
          assert.notIncludeMembers(routesWithExclusion, routeNames);
        },
      'does not exclude route present in React route group with feature flag off':
        function () {
          const { reactRouteGroups, reactRoute } =
            getEmptyServerReactRouteGroups({
              ...showReactAppAll,
              pairRoutes: false,
            });
          reactRouteGroups.pairRoutes.routes = [reactRoute.getRoute(routeName)];

          const routesWithExclusion = getRoutesExcludingPairingReact(
            reactRouteGroups,
            routeNames
          );
          assert.includeMembers(routesWithExclusion, routeNames);
        },
      'does not exclude route if not present in React route group with feature flag on':
        function () {
          const { reactRouteGroups } = getEmptyServerReactRouteGroups();

          const routesWithExclusion = getRoutesExcludingPairingReact(
            reactRouteGroups,
            routeNames
          );
          assert.includeMembers(routesWithExclusion, routeNames);
        },
    },
    'get-oauth-success': {
      before: function () {
        routeName = '/oauth/success/:clientId';
        routeNames = [routeName];
      },
      'excludes route present in React route group with feature flag on':
        function () {
          const { reactRouteGroups, reactRoute } =
            getEmptyServerReactRouteGroups();
          reactRouteGroups.oauthRoutes.routes = [
            reactRoute.getRoute(routeName),
          ];
          const routesWithExclusion = getRoutesExcludingOAuthSuccessReact(
            reactRouteGroups,
            routeNames
          );
          assert.notIncludeMembers(routesWithExclusion, routeNames);
        },
      'does not exclude route present in React route group with feature flag off':
        function () {
          const { reactRouteGroups, reactRoute } =
            getEmptyServerReactRouteGroups({
              ...showReactAppAll,
              oauthRoutes: false,
            });
          reactRouteGroups.oauthRoutes.routes = [
            reactRoute.getRoute(routeName),
          ];

          const routesWithExclusion = getRoutesExcludingOAuthSuccessReact(
            reactRouteGroups,
            routeNames
          );
          assert.includeMembers(routesWithExclusion, routeNames);
        },
      'does not exclude route if not present in React route group with feature flag on':
        function () {
          const { reactRouteGroups } = getEmptyServerReactRouteGroups();

          const routesWithExclusion = getRoutesExcludingOAuthSuccessReact(
            reactRouteGroups,
            routeNames
          );
          assert.includeMembers(routesWithExclusion, routeNames);
        },
    },
  },
});
