/**
 * Borrowed from https://github.com/lo1tuma/eslint-plugin-mocha/tree/master/lib
 *
 * We cannot directly depend on that package due to lack of support for that in
  ESLint: https://github.com/eslint/rfcs/pull/5
 */

'use strict';

function getPropertyName(property) {
  return property.name || property.value;
}

function getNodeName(node) {
  if (node.type === 'MemberExpression') {
    return `${getNodeName(node.object)}.${getPropertyName(node.property)}`;
  }
  return node.name;
}

module.exports = {
  getPropertyName,
  getNodeName,
};
