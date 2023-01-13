/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {
  getRoutesExcludingAllReact,
  FRONTEND_ROUTES,
} = require('../../../server/lib/routes/get-frontend');
const {
  getRoutesExcludingPairingReact,
  PAIRING_ROUTES,
} = require('../../../server/lib/routes/get-frontend-pairing');
const {
  getRoutesExcludingOAuthSuccessReact,
  OAUTH_SUCCESS_ROUTES,
} = require('../../../server/lib/routes/get-oauth-success');
const { getReactRouteGroups } = require('../../../server/lib/routes/react-app');
const {
  ReactRoute,
} = require('../../../server/lib/routes/react-app/react-route');

const sinon = require('sinon');
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;

const showReactAppAll = {
  simpleRoutes: true,
  resetPasswordRoutes: true,
  oauthRoutes: true,
  signInRoutes: true,
  signUpRoutes: true,
  pairRoutes: true,
  postVerifyAddRecoveryKeyRoutes: true,
  postVerifyCADViaQRRoutes: true,
  signInVerificationViaPushRoutes: true,
};

function getEmptyReactRouteGroups(showReactApp = showReactAppAll) {
  const reactRouteGroups = getReactRouteGroups(showReactApp);
  for (const routeGroup in reactRouteGroups) {
    reactRouteGroups[routeGroup].routes = []; // start fresh
  }
  return reactRouteGroups;
}

const reactRoute = new ReactRoute();
let routeName = '';
let routeNames = [''];
let mockReactRoute;

registerSuite('routes/react-app', {
  tests: {
    ReactRoute: {
      'route definitions are omitted if option is passed': function () {
        const reactRouteWithoutDefinitions = new ReactRoute(false);
        const route = reactRouteWithoutDefinitions.getRoute(
          'cannot_create_account'
        );
        assert.isUndefined(route.definition);
      },
      getRoute: {
        beforeEach: function () {
          mockReactRoute = new ReactRoute();
          mockReactRoute.getFrontEnd = sinon.spy();
          mockReactRoute.getFrontEndPairing = sinon.spy();
          mockReactRoute.getOAuthSuccess = sinon.spy();
        },
        'calls getFrontEnd correctly based on route name': function () {
          mockReactRoute.getRoutes(FRONTEND_ROUTES);
          assert.equal(
            mockReactRoute.getFrontEnd.callCount,
            FRONTEND_ROUTES.length
          );
        },
        'calls getFrontEndPairing correctly based on route name': function () {
          mockReactRoute.getRoutes(PAIRING_ROUTES);
          assert.equal(
            mockReactRoute.getFrontEndPairing.callCount,
            PAIRING_ROUTES.length
          );
        },
        'calls getOAuthSuccess correctly based on route name': function () {
          mockReactRoute.getRoutes(OAUTH_SUCCESS_ROUTES);
          assert.equal(
            mockReactRoute.getOAuthSuccess.callCount,
            OAUTH_SUCCESS_ROUTES.length
          );
        },
        'throws when an unknown route is provided': function () {
          assert.throws(() => mockReactRoute.getRoute('whatever'));
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
          const reactRouteGroups = getEmptyReactRouteGroups();
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
          const reactRouteGroups = getEmptyReactRouteGroups();
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
          const reactRouteGroups = getEmptyReactRouteGroups({
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
          const reactRouteGroups = getEmptyReactRouteGroups();

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
          const reactRouteGroups = getEmptyReactRouteGroups();
          reactRouteGroups.pairRoutes.routes = [reactRoute.getRoute(routeName)];
          const routesWithExclusion = getRoutesExcludingPairingReact(
            reactRouteGroups,
            routeNames
          );
          assert.notIncludeMembers(routesWithExclusion, routeNames);
        },
      'does not exclude route present in React route group with feature flag off':
        function () {
          const reactRouteGroups = getEmptyReactRouteGroups({
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
          const reactRouteGroups = getEmptyReactRouteGroups();

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
          const reactRouteGroups = getEmptyReactRouteGroups();
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
          const reactRouteGroups = getEmptyReactRouteGroups({
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
          const reactRouteGroups = getEmptyReactRouteGroups();

          const routesWithExclusion = getRoutesExcludingOAuthSuccessReact(
            reactRouteGroups,
            routeNames
          );
          assert.includeMembers(routesWithExclusion, routeNames);
        },
    },
  },
});
