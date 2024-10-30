type logFn = (logType: string, data: any) => void;
type ILogger = {
  info: logFn;
  warn: logFn;
  debug: logFn;
  error: logFn;
};
