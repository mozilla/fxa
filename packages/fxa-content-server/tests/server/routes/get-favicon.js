/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const route = require('../../../server/lib/routes/get-favicon');
const uaStrings = require('../../functional/lib/ua-strings');
let instance, request, response;

/*eslint-disable sorting/sort-object-props*/
registerSuite('routes/get-favicon', {
  'route interface is correct': function () {
    assert.isFunction(route);
    assert.lengthOf(route, 0);
  },

  'initialise route': {
    before: function () {
      instance = route();
    },
    tests: {
      'instance interface is correct': function () {
        assert.isObject(instance);
        assert.lengthOf(Object.keys(instance), 3);
        assert.equal(instance.method, 'get');
        assert.equal(instance.path, '/favicon.ico');
        assert.isFunction(instance.process);
        assert.lengthOf(instance.process, 3);
      },

      'route.process': {
        'no user-agent header': {
          before: function () {
            request = {
              headers: {},
              url: 'favicon.ico'
            };
            return new Promise((resolve) => {
              instance.process(request, response, resolve);
            });
          },
          tests: {
            'should see old icon': function () {
              assert.equal(request.url, 'favicon-pre57.ico');
            }
          }
        },

        'Firefox desktop 56': {
          before: function () {
            request = {
              headers: {
                'user-agent': uaStrings.desktop_firefox_56
              },
              url: 'favicon.ico'
            };
            return new Promise((resolve) => {
              instance.process(request, response, resolve);
            });
          },
          tests: {
            'should see old icon': function () {
              assert.equal(request.url, 'favicon-pre57.ico');
            }
          }
        },

        'Firefox desktop 57': {
          before: function () {
            request = {
              headers: {
                'user-agent': uaStrings.desktop_firefox_57
              },
              url: 'favicon.ico'
            };
            return new Promise((resolve) => {
              instance.process(request, response, resolve);
            });
          },
          tests: {
            'should see new icon': function () {
              assert.equal(request.url, 'favicon.ico');
            }
          }
        },

        'Firefox android 56': {
          before: function () {
            request = {
              headers: {
                'user-agent': uaStrings.android_firefox_56
              },
              url: 'favicon.ico'
            };
            return new Promise((resolve) => {
              instance.process(request, response, resolve);
            });
          },
          tests: {
            'should see old icon': function () {
              assert.equal(request.url, 'favicon-pre57.ico');
            }
          }
        },

        'Firefox android 57': {
          before: function () {
            request = {
              headers: {
                'user-agent': uaStrings.android_firefox_57
              },
              url: 'favicon.ico'
            };
            return new Promise((resolve) => {
              instance.process(request, response, resolve);
            });
          },
          tests: {
            'should see new icon': function () {
              assert.equal(request.url, 'favicon.ico');
            }
          }
        },

        'Firefox iOS 9': {
          before: function () {
            request = {
              headers: {
                'user-agent': uaStrings.ios_firefox_9
              },
              url: 'favicon.ico'
            };
            return new Promise((resolve) => {
              instance.process(request, response, resolve);
            });
          },
          tests: {
            'should see old icon': function () {
              assert.equal(request.url, 'favicon-pre57.ico');
            }
          }
        },

        'Firefox iOS 10': {
          before: function () {
            request = {
              headers: {
                'user-agent': uaStrings.ios_firefox_10
              },
              url: 'favicon.ico'
            };
            return new Promise((resolve) => {
              instance.process(request, response, resolve);
            });
          },
          tests: {
            'should see new icon': function () {
              assert.equal(request.url, 'favicon.ico');
            }
          }
        },
      }
    }
  }
});
/*eslint-enable sorting/sort-object-props*/
