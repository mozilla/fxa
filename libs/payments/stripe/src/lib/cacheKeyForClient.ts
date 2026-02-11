import { createHash } from 'crypto';

export const cacheKeyForClient = function (
  methodName: string,
  resourceId = '',
  params: object = {}
): string {
  // Sort variables prior to stringifying to not be caller order dependent
  const variablesString = JSON.stringify(params, Object.keys(params).sort());
  const variableHash = createHash('sha256')
    .update(variablesString)
    .digest('hex');
  return `${methodName}:${resourceId}:${variableHash}`;
};
