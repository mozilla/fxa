import { winstonLogger } from './logging';

type ConsoleFn = typeof console.log;

// Wrap console logs to convert multiple arguments to something winston supports.
const consoleLogWrapper = (logFn: ConsoleFn) =>
  function (message: unknown, extra: unknown) {
    // hot paths.
    const hasMessage = typeof message === 'string';
    if (arguments.length === 1 && hasMessage) {
      return logFn(message);
    } else if (
      arguments.length === 2 &&
      hasMessage &&
      typeof extra === 'object'
    ) {
      return logFn(message, extra);
    }

    // eslint-disable-next-line prefer-rest-params
    const args = Array.from(arguments);
    const strings = args.filter((arg) => typeof arg === 'string');
    const objects = args.filter((arg) => typeof arg === 'object');
    message = strings.join(' ');
    extra = objects[0];
    if (objects.length > 1) {
      extra = Object.assign({}, ...objects);
    }
    logFn(message, extra);
  };

export const monkeyPatchServerLogging = () => {
  // NextJS internally uses console functions directly, eg on error. It's also
  // rare to load a logging library in react code.
  const logger = winstonLogger('PaymentsNext');
  console.log = consoleLogWrapper(logger.log.bind(logger));
  console.warn = consoleLogWrapper(logger.warn.bind(logger));
  console.error = consoleLogWrapper(logger.error.bind(logger));
};
