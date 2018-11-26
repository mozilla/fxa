import { assign } from 'underscore';
import Errors from './errors';
const t = msg => msg;

const UNEXPECTED_ERROR_MESSAGE = t('Unexpected error');

/* eslint-disable sorting/sort-object-props */
export default assign({}, Errors, {
  NAMESPACE: 'channel-server',

  ERRORS: {
    UNEXPECTED_ERROR: {
      errno: 999,
      message: UNEXPECTED_ERROR_MESSAGE
    },
    INVALID_CONFIGURATION: {
      errno: 1000,
      // error not expected to be displayed to the user
      message: 'Invalid channel server configuration'
    },
    ALREADY_CONNECTED: {
      errno: 1001,
      // error not expected to be displayed to the user
      message: 'Already connected to channel server'
    },
    NOT_CONNECTED: {
      errno: 1002,
      // error not expected to be displayed to the user
      message: 'Not connected to channel server'
    },
    COULD_NOT_CONNECT: {
      errno: 1003,
      message: t('Error connecting to remote device')
    },
    INVALID_MESSAGE: {
      errno: 1004,
      message: t('Invalid message from the remote device')
    },
    CHANNEL_ID_MISMATCH: {
      errno: 1005,
      message: t('Error connecting to remote device')
    },
    COULD_NOT_DECRYPT: {
      errno: 1006,
      message: t('Could not decrypt message from the remote device')
    }

  }
});
/* eslint-enable sorting/sort-object-props */
