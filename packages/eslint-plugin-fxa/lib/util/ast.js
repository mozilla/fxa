'use strict';

const R = require('ramda');

const isDefined = R.complement(R.isNil);
const isCallExpression = R.both(isDefined, R.propEq('type', 'CallExpression'));

const describeAliases = [
  'describe', 'xdescribe', 'describe.only', 'describe.skip',
  'context', 'xcontext', 'context.only', 'context.skip',
  'suite', 'xsuite', 'suite.only', 'suite.skip'
];
const hooks = [ 'before', 'after', 'beforeEach', 'afterEach', 'beforeAll', 'afterAll' ];
const testCaseNames = [
  'it', 'it.only', 'it.skip', 'xit',
  'test', 'test.only', 'test.skip',
  'specify', 'specify.only', 'specify.skip', 'xspecify'
];

function getPropertyName(property) {
  return property.name || property.value;
}

function getNodeName(node) {
  if (node.type === 'MemberExpression') {
    return `${getNodeName(node.object) }.${ getPropertyName(node.property)}`;
  }
  return node.name;
}

function isDescribe(node, additionalSuiteNames) {
  return isCallExpression(node) &&
    describeAliases.concat(additionalSuiteNames).indexOf(getNodeName(node.callee)) > -1;
}

function isHookIdentifier(node) {
  return node &&
    node.type === 'Identifier' &&
    hooks.indexOf(node.name) !== -1;
}

function isHookCall(node) {
  return isCallExpression(node) && isHookIdentifier(node.callee);
}

function isTestCase(node) {
  return isCallExpression(node) && testCaseNames.indexOf(getNodeName(node.callee)) > -1;
}

function findReference(scope, node) {
  const hasSameRangeAsNode = R.pathEq([ 'identifier', 'range' ], node.range);

  return R.find(hasSameRangeAsNode, scope.references);
}

function isShadowed(scope, identifier) {
  const reference = findReference(scope, identifier);

  return reference && reference.resolved && reference.resolved.defs.length > 0;
}

function isCallToShadowedReference(node, scope) {
  const identifier = node.callee.type === 'MemberExpression' ? node.callee.object : node.callee;

  return isShadowed(scope, identifier);
}

function isMochaFunctionCall(node, scope) {
  if (isCallToShadowedReference(node, scope)) {
    return false;
  }

  return isTestCase(node) || isDescribe(node) || isHookCall(node);
}

function isStringLiteral(node) {
  return node && node.type === 'Literal' && typeof node.value === 'string';
}

module.exports = {
  isDescribe,
  isHookIdentifier,
  isTestCase,
  getPropertyName,
  getNodeName,
  isMochaFunctionCall,
  isHookCall,
  isStringLiteral
};
