/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'tests/intern',
  'intern/node_modules/dojo/has!host-node?intern/node_modules/dojo/node!xhr2',
  'tests/addons/sinon',
  'client/FxAccountClient',
  'tests/addons/restmail',
  'tests/addons/accountHelper',
  'tests/mocks/request',
  'tests/mocks/errors',
], function(
  config,
  XHR,
  Sinon,
  FxAccountClient,
  Restmail,
  AccountHelper,
  RequestMocks,
  ErrorMocks
) {
  function Environment() {
    var self = this;
    this.authServerUrl = config.AUTH_SERVER_URL || 'http://127.0.0.1:9000';
    // if 'auth_server' is part of the Intern arguments then using a remote server
    this.useRemoteServer = !!config.AUTH_SERVER_URL;
    this.mailServerUrl = this.authServerUrl.match(/^http:\/\/127/)
      ? 'http://127.0.0.1:9001'
      : 'http://restmail.net';

    if (this.useRemoteServer) {
      this.xhr = XHR.XMLHttpRequest;
      // respond is a noop because we are using real XHR in this case
      this.respond = noop;
    } else {
      this.requests = [];
      this.responses = [];
      // switch to the fake XHR
      this.xhr = Sinon.useFakeXMLHttpRequest();
      this.xhr.onCreate = function(xhr) {
        if (self.requests.length < self.responses.length) {
          var mock = self.responses[self.requests.length];
          setTimeout(function() {
            xhr.respond(mock.status, mock.headers, mock.body);
          }, 0);
        }
        self.requests.push(xhr);
      };
      // respond calls a fake XHR response using SinonJS
      this.respond = function(returnValue, mock) {
        if (arguments.length < 2) {
          mock = returnValue;
          returnValue = null;
        }
        if (typeof mock === 'undefined') {
          console.log('Mock does not exist!');
        }
        // this has to be here to work in IE
        setTimeout(function() {
          if (self.responses.length < self.requests.length) {
            self.requests[self.responses.length].respond(
              mock.status,
              mock.headers,
              mock.body
            );
          }
          self.responses.push(mock);
        }, 0);
        return returnValue;
      };
    }
    // initialize a new FxA Client
    this.client = new FxAccountClient(this.authServerUrl, { xhr: this.xhr });
    // setup Restmail,
    this.mail = new Restmail(this.mailServerUrl, this.xhr);
    // account helper takes care of new verified and unverified accounts
    this.accountHelper = new AccountHelper(
      this.client,
      this.mail,
      this.respond
    );
    this.ErrorMocks = ErrorMocks;
    this.RequestMocks = RequestMocks;
  }

  function noop(val) {
    return val;
  }

  return Environment;
});
