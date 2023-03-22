/*
Borrowed from https://github.com/lo1tuma/eslint-plugin-mocha/tree/master/lib
We cannot directly depend on that package due to lack of support for that in ESLint: https://github.com/eslint/rfcs/pull/5
*/
'use strict';

const { getAdditionalTestFunctions } = require('../util/settings');
const astUtils = require('../util/ast');

module.exports = function (context) {
  let mochaTestFunctions = [
    'it',
    'describe',
    'suite',
    'test',
    'context',
    'specify'
  ];
  const settings = context.settings;
  const additionalTestFunctions = getAdditionalTestFunctions(settings);

  mochaTestFunctions = mochaTestFunctions.concat(additionalTestFunctions);

  function matchesMochaTestFunction(object) {
    const name = astUtils.getNodeName(object);

    return mochaTestFunctions.indexOf(name) !== -1;
  }

  function isPropertyNamedOnly(property) {
    return property && astUtils.getPropertyName(property) === 'only';
  }

  function isCallToMochasOnlyFunction(callee) {
    return callee.type === 'MemberExpression' &&
      matchesMochaTestFunction(callee.object) &&
      isPropertyNamedOnly(callee.property);
  }

  return {
    CallExpression(node) {
      const callee = node.callee;

      if (callee && isCallToMochasOnlyFunction(callee)) {
        context.report({
          node: callee.property,
          message: 'Unexpected exclusive mocha test.'
        });
      }
    }
  };
};

module.exports.schema = [
  {
    type: 'object',
    properties: {
      additionalTestFunctions: {
        type: 'array',
        items: {
          type: 'string'
        },
        minItems: 1,
        uniqueItems: true
      }
    }
  }
];
