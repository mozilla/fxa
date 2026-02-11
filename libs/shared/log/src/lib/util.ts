/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { TransformableInfo } from 'logform';
import { format, addColors } from 'winston';
import { stringify } from 'safe-stable-stringify';
import { MESSAGE } from 'triple-beam';
import { HekaJson } from './types';

export const winstonNestLike = format((info, app) => {
  info[MESSAGE] = fprintNestlike({ ...info, app });
  return info;
});
const fprintNestlike = ({
  timestamp,
  level,
  message,
  context,
  app,
  error,
  stack,
}: TransformableInfo) => {
  const colorizer = format.colorize();
  addColors({ ok: 'green', warn: 'yellow', error: 'red' });
  level = level.toUpperCase();
  let coloredLevel: string;
  let coloredMessage: string;

  if (error instanceof Error) {
    message = error.name
  }

  switch (level) {
    case 'INFO':
      coloredLevel = colorizer.colorize('ok', 'LOG');
      coloredMessage = colorizer.colorize('ok', message as string);
      break;
    case 'ERROR':
      coloredLevel = colorizer.colorize('error', level);
      coloredMessage = colorizer.colorize('error', message as string);
      break;
    case 'WARN':
      coloredLevel = colorizer.colorize('warn', level);
      coloredMessage = colorizer.colorize('warn', message as string);
      break;
    default:
      coloredLevel = colorizer.colorize('ok', level);
      coloredMessage = colorizer.colorize('ok', message as string);
  }
  const coloredNestapp = colorizer.colorize('warn', `[${app}]`);
  const contextString = context
    ? ` - ${JSON.stringify(context, null, '\t')}`
    : ``;
  let log = `${timestamp}\t${coloredLevel} ${coloredNestapp} ${coloredMessage}${contextString}`;

  if (stack) {
    log = `${log}\n${stack}`;
  }
  if (error && Object.keys(error as any).length > 0) {
    log = `${log}\n${JSON.stringify(error, null, 2)}`;
  }
  return log;
};

export const formatToHeka = format((info, app) => {
  info[MESSAGE] = stringify(toHekaJson({ ...info, app }));
  return info;
});
const toHekaJson = ({
  timestamp,
  level,
  message,
  context,
  app,
  error,
  stack,
}: TransformableInfo): HekaJson => {
  level = level.toUpperCase();
  let severity = 6;
  switch (level) {
    case 'TRACE':
    case 'VERBOSE':
    case 'DEBUG':
      severity = 7;
      break;
    case 'LOG':
      severity = 6;
      break;
    case 'WARN':
      severity = 4;
      break;
    case 'ERROR':
      severity = 2;
      break;
    case 'CRITICAL':
      severity = 0;
  }
  const fields = {
    ...(context as any),
    ...(error && Object.keys(error as any).length > 1
      ? { error: stringify(error) }
      : undefined),
    ...(stack ? { stack: stringify(stack) } : undefined),
  };

  if (error instanceof Error) {
    message = error.name;
  }

  return {
    Type: message as string,
    Logger: app as string,
    Timestamp: new Date(timestamp as string).valueOf() * 1000000,
    Severity: severity,
    Fields: fields as any,
  };
};
