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
      message: UNEXPECTED_ERROR_MESSAGE,
    },
    INVALID_CONFIGURATION: {
      errno: 1000,
      // error not expected to be displayed to the user
      message: 'Invalid channel server configuration',
    },
    ALREADY_CONNECTED: {
      errno: 1001,
      // error not expected to be displayed to the user
      message: 'Already connected to channel server',
    },
    NOT_CONNECTED: {
      errno: 1002,
      // error not expected to be displayed to the user
      message: 'Not connected to channel server',
    },
    INVALID_MESSAGE: {
      errno: 1003,
      message: t('Invalid message from the remote device'),
    },
    INVALID_OUTBOUND_MESSAGE: {
      errno: 1004,
      message: 'Sending a malformed message',
    },
    CHANNEL_ID_MISMATCH: {
      errno: 1005,
      message: t('Error pairing to remote device'),
    },
    CONNECTION_CLOSED: {
      errno: 1006,
      message: t('Connection to remote device closed, please try again'),
    },
  },
});
/* eslint-enable sorting/sort-object-props */
