/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'jsdom-global/register';
import Logger from '../../lib/logger';
const sinon = require('sinon');

let consoleFn: sinon.SinonSpy;

describe('lib/logger', () => {
  let logger: Logger;

  describe('constructor', () => {
    it('should create logger', () => {
      consoleFn = sinon.spy(window.console, 'info');

      const information = 'Hello Firefox!';

      logger = new Logger();
      logger.info(information);

      sinon.assert.calledWith(consoleFn, information);
      consoleFn.restore();
    });
  });

  describe('info', () => {
    beforeEach(() => {
      logger = new Logger(window);
      consoleFn = sinon.spy(window.console, 'info');
    });

    afterEach(() => {
      consoleFn.restore();
    });

    it('should log from string', () => {
      const information = 'Information about stuff!';
      logger.info(information);

      sinon.assert.calledWith(consoleFn, information);
    });
  });

  describe('trace', () => {
    beforeEach(() => {
      logger = new Logger(window);
      consoleFn = sinon.spy(window.console, 'trace');
    });

    afterEach(() => {
      consoleFn.restore();
    });

    it('should print trace', () => {
      logger.trace();

      sinon.assert.calledOnce(consoleFn);
    });
  });

  describe('warn', () => {
    beforeEach(() => {
      logger = new Logger(window);
      consoleFn = sinon.spy(window.console, 'warn');
    });

    afterEach(() => {
      consoleFn.restore();
    });

    it('should log from string', () => {
      const warning = 'Warning about something!';
      logger.warn(warning);

      sinon.assert.calledWith(consoleFn, warning);
    });
  });

  describe('error', () => {
    beforeEach(() => {
      logger = new Logger(window);
      consoleFn = sinon.spy(window.console, 'error');
    });

    afterEach(() => {
      consoleFn.restore();
    });

    it('should log from string', () => {
      const error = 'Something went really wrong!';
      logger.error(error);

      sinon.assert.calledWith(consoleFn, error);
    });

    it('should log from object', () => {
      const error = new Error('Something went super wrong!');
      logger.error('Error %s', String(error));

      sinon.assert.calledWith(consoleFn, 'Error %s', String(error));
    });
  });
});
