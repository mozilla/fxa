#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This script generates API documentation. By default it writes output
// to `docs/api.md`, but you can override that by specifying a different
// path as an argument. Requires node 6 or greater.

'use strict';

const acorn = require('acorn');
const P = require('../lib/promise');
const fs = P.promisifyAll(require('fs'), { suffix: 'P' });
const path = require('path');
const handlebars = require('handlebars');
const render = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, 'api-docs.handlebars'), {
    encoding: 'utf8',
  })
);

// In the API docs, any text inside <!--begin-xxx--> / <!--end-xxx-> delimiters
// will be propagated to the same place each time the docs are regenerated.
const DOCS_DATA = /<!--begin-([a-z_]+(?:-[a-z_]+)*)-->((?:.*?\n?.*?)*?)<!--end-([a-z_]+(?:-[a-z_]+)*)-->/gi;
const ACORN_OPTIONS = {
  ecmaVersion: 10,
  locations: true,
  sourceType: 'script',
};
const EMPTY_MAP = new Map();
const IGNORE = new Set(['defaults.js', 'idp.js', 'index.js', 'validators.js']);
// HACK: Assumes the location of lib/routes/*.js
const ROUTES_DIR = path.resolve(__dirname, '../lib/routes');
const FUNCTION_EXPRESSION_TYPES = new Set([
  'FunctionExpression',
  'ArrowFunctionExpression',
]);
const ARRAY_TYPES = new Set(['ArrayExpression']);
const RETURN_TYPES = new Set(['ReturnStatement']);
const OBJECT_TYPES = new Set(['ObjectExpression']);
const LITERAL_TYPES = new Set(['Literal']);
const CALL_TYPES = new Set(['CallExpression']);
const MEMBER_TYPES = new Set(['MemberExpression']);
const ERROR_PROPERTY_TYPES = new Set([
  'Literal',
  'TemplateLiteral',
  'Identifier',
  'MemberExpression',
  'BinaryExpression',
  'LogicalExpression',
]);
const SESSION_TOKEN_STRATEGY = /^sessionToken/;
const KEY_FETCH_TOKEN_STRATEGY = /^keyFetchToken/;
const NOT_ERRORS = new Set(['toString', 'header', 'backtrace', 'translate']);

function main() {
  const args = parseArgs();
  doc(args).catch(err => {
    process.exit(1);
  });
}

if (require.main === module) {
  main();
} else {
  module.exports = doc;
}

function doc(args) {
  return P.all([parseDocs(args.path), parseErrors()])
    .spread((docs, errors) =>
      P.all([
        parseRoutes().then(routes =>
          marshallRouteData(docs, errors.definitionsMap, routes)
        ),
        parseValidators(),
        parseMetricsContext(),
        parseFeatures(),
        parseDevices(),
        docs,
        errors,
      ])
    )
    .spread(
      (modules, validators, metricsContext, features, devices, docs, errors) =>
        writeOutput(
          Object.assign(
            {
              modules,
              validators,
              metricsContext,
              features,
              devices,
              errors: errors.definitions,
              additionalErrorParams: errors.additionalErrorParams,
            },
            docs
          ),
          args.path
        )
    )
    .then(() => {
      console.log(`API docs updated at ${args.path}`);
    })
    .catch(error => {
      console.error(error.stack);
    });
}

function parseArgs() {
  let outputPath;

  switch (process.argv.length) {
    /* eslint-disable indent, no-fallthrough */
    case 3:
      outputPath = path.resolve(process.argv[2]);
    case 2:
      break;
    default:
      fail(`Usage: ${process.argv[1]} [outputPath]`);
    /* eslint-enable indent, no-fallthrough */
  }

  return {
    path: outputPath || path.resolve(__dirname, '../docs/api.md'),
  };
}

function parseDocs(docsPath) {
  return fs
    .readFileP(docsPath, { encoding: 'utf8' })
    .then(docs => parseDocSections(docs, docsPath, {}));
}

function parseDocSections(docs, docsPath, data) {
  const match = DOCS_DATA.exec(docs);
  if (!match) {
    return data;
  }

  if (match.length !== 4) {
    fail(`Match insanity, length ${match.length} !== 4`, docsPath);
  }

  const beginTag = match[1],
    endTag = match[3];
  if (beginTag !== endTag) {
    fail(`Unmatched delimiters, ${beginTag} !== ${endTag}`, docsPath);
  }

  data[camel(beginTag)] = match[2].trim();

  return parseDocSections(docs, docsPath, data);
}

function camel(string) {
  return string.replace(/-[a-z]/g, lowercase =>
    lowercase.substr(1).toUpperCase()
  );
}

function fail(message, filePath, lineNumber) {
  let debugFriendlyMessage;
  if (filePath) {
    debugFriendlyMessage = `Error parsing "${filePath}"`;
    if (lineNumber) {
      debugFriendlyMessage += ` at line ${lineNumber}`;
    }
    debugFriendlyMessage += `:\n${message}`;
  } else {
    debugFriendlyMessage = message;
  }

  throw new TypeError(debugFriendlyMessage);
}

function parseRoutes() {
  return fs.readdirP(ROUTES_DIR).then(fileNames => {
    return P.all(
      fileNames
        .filter(fileName => fileName.endsWith('.js') && !IGNORE.has(fileName))
        .map(fileName => path.join(ROUTES_DIR, fileName))
        .filter(filePath => fs.statSync(filePath).isFile())
        .map(filePath => {
          return fs.readFileP(filePath, { encoding: 'utf8' }).then(js => ({
            path: filePath,
            node: acorn.parse(js, ACORN_OPTIONS).body,
          }));
        })
    );
  });
}

function marshallRouteData(docs, errors, files) {
  return files.map(file => {
    const filePath = file.path;
    const node = file.node;
    const moduleName = getModuleName(filePath);
    const variables = parseVariables(node);
    const exportedFunction = findExportedFunction(node, filePath);
    const routes = findReturnedData(exportedFunction, filePath);

    return {
      moduleName,
      slug: getSlug(moduleName),
      routes: routes.map(route => {
        assertType(route, OBJECT_TYPES, filePath);

        const method = findRouteMethod(route, filePath);
        const routePath = findRoutePath(route, filePath);
        const slug = getSlug(`${method} ${routePath}`);
        const tag = `route-${slug}`;
        const config = findRouteConfig(route, filePath);
        let authentication, validation, response;
        if (config) {
          authentication = findRouteAuthentication(config, filePath);
          validation = findRouteValidation(config, filePath);
          response = findRouteResponse(config, filePath);
        }
        const queryParameters = marshallQueryParameters(
          docs,
          slug,
          validation,
          variables,
          filePath
        );
        const requestBodyParameters = marshallRequestBodyParameters(
          docs,
          slug,
          validation,
          variables,
          filePath
        );
        const responseBodyParameters = marshallResponseBodyParameters(
          docs,
          slug,
          response,
          variables,
          filePath
        );
        const errorResponses = marshallErrorResponses(errors, route, filePath);
        return {
          method,
          path: routePath,
          slug,
          routeDescription: docs[camel(tag)],
          authentication: marshallAuthentication(authentication),
          hasQueryParameters: queryParameters.length > 0,
          queryParameters: queryParameters,
          hasRequestBody: requestBodyParameters.length > 0,
          requestBody: requestBodyParameters,
          hasResponseBody: responseBodyParameters.length > 0,
          responseBody: responseBodyParameters,
          hasErrorResponses: errorResponses.length > 0,
          errorResponses: errorResponses,
        };
      }),
    };
  });
}

function getModuleName(filePath) {
  return path
    .basename(filePath, '.js')
    .replace(/^[a-z]/, character => character.toUpperCase())
    .replace(/-/g, ' ');
}

function parseVariables(node) {
  return findVariables(node).reduce((map, variable) => {
    variable.declarations.forEach(declaration => {
      if (declaration.init) {
        const value = marshallValue(declaration.init, EMPTY_MAP);
        if (value) {
          map.set(declaration.id.name, value);
        }
      }
    });
    return map;
  }, new Map());
}

function findVariables(node) {
  return find(
    node,
    {
      type: 'VariableDeclaration',
    },
    { array: true }
  );
}

function find(node, criteria, options = {}) {
  if (match(node, criteria)) {
    return [node];
  }

  if (Array.isArray(node) && options.array) {
    return node.reduce((results, property) => {
      return results.concat(find(property, criteria, options));
    }, []);
  }

  if (isObject(node) && options.recursive) {
    return Object.keys(node).reduce((results, key) => {
      return results.concat(find(node[key], criteria, options));
    }, []);
  }

  return [];
}

function match(node, criteria) {
  if (!isObject(node)) {
    if (node === criteria) {
      return true;
    }

    return false;
  }

  if (!isObject(criteria)) {
    return false;
  }

  return Object.keys(criteria).every(criteriaKey => {
    return Object.keys(node).some(nodeKey => {
      return match(node[nodeKey], criteria[criteriaKey]);
    });
  });
}

function isObject(node) {
  return node && typeof node === 'object';
}

function marshallValue(node, variables) {
  switch (node.type) {
    /* eslint-disable indent */
    case 'Literal':
      return node.raw;

    case 'Identifier':
      return variables.get(node.name) || node.name;

    case 'CallExpression': {
      let result = marshallValue(node.callee, EMPTY_MAP);
      if (node.arguments.length > 0) {
        result += `(${node.arguments
          .map(argument => marshallValue(argument, variables))
          .join(', ')})`;
      }
      return result;
    }

    case 'MemberExpression': {
      const unmapped = marshallValue(node.property, EMPTY_MAP);
      const mapped = marshallValue(node.property, variables);
      if (mapped !== unmapped) {
        // HACK: Assumes there are no variable name conflicts between different scopes
        return mapped;
      }
      return `${marshallValue(node.object, EMPTY_MAP)}.${unmapped}`;
    }

    case 'ObjectExpression': {
      const properties = node.properties
        .map(
          property =>
            `${property.key.name}: ${marshallValue(property.value, variables)}`
        )
        .join(', ');
      return `{ ${properties} }`;
    }
    /* eslint-enable indent */
  }
}

function findExportedFunction(node, filePath) {
  const exported = findModuleExports(node);

  if (exported.length !== 1) {
    fail(`Expected 1 export, found ${exported.length}`, filePath);
  }

  const exportedFunction = exported[0].right;
  assertType(exportedFunction, FUNCTION_EXPRESSION_TYPES, filePath);

  return exportedFunction.body;
}

function findModuleExports(node) {
  // HACK: Assumes we always export with `module.exports =` or `exports.foo =`
  return findAssignmentsTo(node, {
    type: 'MemberExpression',
    object: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'module',
      },
      property: {
        type: 'Identifier',
        name: 'exports',
      },
    },
  }).concat(
    findAssignmentsTo(node, {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'exports',
      },
    })
  );
}

function findAssignmentsTo(node, lhs) {
  return find(
    node,
    {
      type: 'AssignmentExpression',
      operator: '=',
      left: lhs,
    },
    { recursive: true }
  );
}

function assertType(node, types, filePath) {
  if (!node) {
    fail(
      `Expected type [${Array.from(types).join(',')}], found nothing`,
      filePath
    );
  }

  const nodeType = node.type;

  if (!types.has(nodeType)) {
    const line = node.loc.start.line;
    const column = node.loc.start.column;
    fail(
      `Expected type [${Array.from(types).join(
        ','
      )}], found "${nodeType}" at column "${column}"`,
      filePath,
      line
    );
  }
}

function assertName(node, name, filePath) {
  if (!node) {
    fail(`Expected something named ${name}, found nothing`, filePath);
  }

  if (node.name !== name) {
    const line = node.loc.start.line;
    const column = node.loc.start.column;
    fail(
      `Expected name "${name}", found "${node.name}" at column "${column}"`,
      filePath,
      line
    );
  }
}

function findReturnedData(functionNode, filePath) {
  let returnedData;
  if (functionNode.type === 'BlockStatement') {
    const returned = find(
      functionNode.body,
      {
        type: 'ReturnStatement',
      },
      {
        array: true,
      }
    );

    if (returned.length !== 1) {
      fail(`Expected 1 return statement, found ${returned.length}`, filePath);
    }

    returnedData = returned[0].argument;
  } else {
    assertType(returnedData, RETURN_TYPES, filePath);
    returnedData = functionNode.argument;
  }

  if (returnedData.type === 'Identifier') {
    // HACK: Assumes there are no variable name conflicts in nested scopes
    const routeDefinitions = find(
      functionNode,
      {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: returnedData.name,
        },
      },
      {
        recursive: true,
      }
    );

    if (routeDefinitions.length !== 1) {
      fail(
        `Expected 1 set of route definitions, found ${routeDefinitions.length}`,
        filePath
      );
    }

    returnedData = routeDefinitions[0].init;
  }

  assertType(returnedData, ARRAY_TYPES, filePath);

  return returnedData.elements;
}

function findRoutePath(route, filePath) {
  return findProperty(route, 'path', LITERAL_TYPES, filePath).value;
}

function findProperty(node, key, types, filePath) {
  const found = find(
    node.properties,
    {
      type: 'Property',
      kind: 'init',
      key: {
        type: 'Identifier',
        name: key,
      },
    },
    {
      array: true,
    }
  )[0];

  if (found) {
    assertType(found.value, types, filePath);

    return found.value;
  }
}

function findRouteMethod(route, filePath) {
  return findProperty(route, 'method', LITERAL_TYPES, filePath).value;
}

function findRouteConfig(route, filePath) {
  return findProperty(route, 'options', OBJECT_TYPES, filePath);
}

function findRouteAuthentication(config, filePath) {
  const authentication = findProperty(config, 'auth', OBJECT_TYPES, filePath);
  if (authentication) {
    let optional = false,
      tokens;

    const mode = findProperty(authentication, 'mode', LITERAL_TYPES, filePath);
    if (mode && (mode.value === 'try' || mode.value === 'optional')) {
      optional = true;
    }

    const strategies = findProperty(
      authentication,
      'strategies',
      ARRAY_TYPES,
      filePath
    );
    if (strategies) {
      tokens = strategies.elements.map(strategy => {
        assertType(strategy, LITERAL_TYPES, filePath);
        return strategy.value;
      });
    } else {
      const strategy = findProperty(
        authentication,
        'strategy',
        LITERAL_TYPES,
        filePath
      );
      if (strategy) {
        tokens = [strategy.value];
      }
    }

    if (!tokens) {
      fail(
        'Missing authentication strategy',
        filePath,
        authentication.loc.start.line
      );
    }

    return { optional, tokens };
  }
}

function findRouteValidation(config, filePath) {
  return findProperty(config, 'validate', OBJECT_TYPES, filePath);
}

function findRouteResponse(config, filePath) {
  return findProperty(config, 'response', OBJECT_TYPES, filePath);
}

function marshallQueryParameters(
  docs,
  routeSlug,
  validation,
  variables,
  filePath
) {
  return marshallParameters(
    docs,
    'query-param',
    routeSlug,
    validation,
    'query',
    variables,
    filePath
  );
}

function marshallParameters(
  docs,
  paramTag,
  routeSlug,
  node,
  type,
  variables,
  filePath
) {
  let parameters;

  try {
    parameters = findProperty(node, type, OBJECT_TYPES, filePath);
  } catch (error) {
    return marshallParameterCall(
      docs,
      paramTag,
      routeSlug,
      node,
      type,
      variables,
      filePath
    );
  }

  if (!parameters) {
    return [];
  }

  return marshallParameterProperties(
    docs,
    paramTag,
    routeSlug,
    parameters,
    variables
  );
}

function marshallParameterCall(
  docs,
  paramTag,
  routeSlug,
  node,
  type,
  variables,
  filePath
) {
  try {
    const parameters = findProperty(node, type, CALL_TYPES, filePath);
    assertType(parameters.callee, MEMBER_TYPES, filePath);
    assertType(parameters.callee.object, CALL_TYPES, filePath);
    assertType(parameters.callee.object.callee, MEMBER_TYPES, filePath);

    if (
      parameters.callee.object.callee.property.name === 'alternatives' &&
      parameters.callee.property.name === 'try'
    ) {
      return marshallParameterArguments(
        docs,
        paramTag,
        routeSlug,
        parameters,
        variables,
        filePath
      );
    }

    if (
      parameters.callee.object.callee.property.name === 'array' &&
      parameters.callee.property.name === 'items'
    ) {
      return marshallParameterArguments(
        docs,
        paramTag,
        routeSlug,
        parameters,
        variables,
        filePath
      );
    }

    if (
      parameters.callee.object.callee.object.name === 'isA' &&
      parameters.callee.object.callee.property.name === 'object'
    ) {
      return marshallParameterProperties(
        docs,
        paramTag,
        routeSlug,
        parameters.callee.object.arguments[0],
        variables
      );
    }
  } catch (error) {}

  return [];
}

function marshallParameterArguments(
  docs,
  paramTag,
  routeSlug,
  parameters,
  variables,
  filePath
) {
  const invertedIndex = new Map();

  return parameters.arguments.reduce((result, arg) => {
    switch (arg.type) {
      /* eslint-disable indent */
      case 'ObjectExpression':
        merge(
          result,
          marshallParameterProperties(
            docs,
            paramTag,
            routeSlug,
            parameters,
            variables
          )
        );
        break;
      case 'CallExpression': {
        // HACK: Assumes we only have isA.object inside isA.alternatives and array.items
        const call = find(
          arg,
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'Identifier',
                name: 'isA',
              },
              property: {
                type: 'Identifier',
                name: 'object',
              },
            },
          },
          { recursive: true }
        );
        if (!call || call.length === 0) {
          throw null;
        }
        call[0].arguments.forEach(arg => {
          assertType(arg, OBJECT_TYPES, filePath);
          merge(
            result,
            marshallParameterProperties(
              docs,
              paramTag,
              routeSlug,
              arg,
              variables
            )
          );
        });
        break;
      }
      default:
        throw null;
      /* eslint-enable indent */
    }

    return result;
  }, []);

  function merge(target, source) {
    source.forEach(item => {
      const paramName = item.paramName;
      if (invertedIndex.has(paramName)) {
        const resultIndex = invertedIndex.get(paramName);
        if (target[resultIndex].validation !== item.validation) {
          target[resultIndex].validation += `;<br />or ${item.validation}`;
        }
      } else {
        invertedIndex.set(paramName, target.length);
        target.push(item);
      }
    });

    return target;
  }
}

function marshallParameterProperties(
  docs,
  paramTag,
  routeSlug,
  parameters,
  variables
) {
  return parameters.properties.map(parameter => ({
    paramName: parameter.key.name,
    paramDescription:
      docs[camel(`${paramTag}-${routeSlug}-${parameter.key.name}`)],
    validation: `*${marshallValidation(
      marshallValue(parameter.value, variables)
    )}*`,
  }));
}

function marshallRequestBodyParameters(
  docs,
  routeSlug,
  validation,
  variables,
  filePath
) {
  return marshallParameters(
    docs,
    'request-body',
    routeSlug,
    validation,
    'payload',
    variables,
    filePath
  );
}

function marshallResponseBodyParameters(
  docs,
  routeSlug,
  response,
  variables,
  filePath
) {
  return marshallParameters(
    docs,
    'response-body',
    routeSlug,
    response,
    'schema',
    variables,
    filePath
  );
}

function findRouteHandler(route, filePath) {
  try {
    // HACK: Assumes route handlers are defined inline in the object literal
    return findProperty(route, 'handler', FUNCTION_EXPRESSION_TYPES, filePath);
  } catch (error) {}
}

function marshallErrorResponses(errors, route, filePath) {
  const handler = findRouteHandler(route, filePath);
  let extras = findProperty(route, 'apidoc', OBJECT_TYPES, filePath);
  if (extras) {
    extras = findProperty(extras, 'errors', ARRAY_TYPES, filePath).elements;
  } else {
    extras = [];
  }
  const dupes = new Set();
  // HACK: Assumes we always import error module as `error`
  return find(
    handler,
    {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'error',
        },
      },
    },
    { recursive: true }
  )
    .map(errorCall => {
      return errorCall.callee.property.name;
    })
    .concat(
      extras.map(expr => {
        assertName(expr.object, 'error', filePath);
        return expr.property.name;
      })
    )
    .filter(errorName => {
      if (dupes.has(errorName)) {
        return false;
      }
      dupes.add(errorName);
      return !!errors[errorName];
    })
    .map(errorName => errors[errorName])
    .sort((err1, err2) => {
      return err1.code - err2.code || err1.errno - err2.errno;
    });
}

function marshallAuthentication(authentication) {
  if (!authentication) {
    return;
  }

  const tokens = authentication.tokens
    .map(token => {
      return marshallToken(token);
    })
    .reduce((deduped, token) => {
      if (deduped.indexOf(token) === -1) {
        deduped.push(token);
      }
      return deduped;
    }, []);

  return {
    emojis: `:lock:${authentication.optional ? ':unlock:' : ''}`,
    token: tokens.join(', '),
    summary: tokens
      .sort((lhs, rhs) => {
        // Move OAuth tokens to the front of the list as a concession to readability
        if (lhs === 'oauthToken') {
          return -1;
        }
        if (rhs === 'oauthToken') {
          return 1;
        }
        return 0;
      })
      .reduce(
        (summary, token, index) => {
          return `${summary}${index === 0 ? '' : ' or '}${authenticatedWith(
            token
          )}`;
        },
        authentication.optional ? 'Optionally ' : ''
      ),
  };
}

function marshallToken(token) {
  if (SESSION_TOKEN_STRATEGY.test(token)) {
    return 'sessionToken';
  }

  if (KEY_FETCH_TOKEN_STRATEGY.test(token)) {
    return 'keyFetchToken';
  }

  // HACK: Assumes other tokens don't have extra authentication strategies
  return token;
}

function authenticatedWith(token) {
  switch (token) {
    case 'oauthToken':
      return 'authenticated with OAuth bearer token';
    case 'refreshToken':
      return 'authenticated with OAuth refresh token';
    default:
      return `HAWK-authenticated with ${uncamel(token)}`;
  }
}

function uncamel(string) {
  return string.replace(/[A-Z]/g, uppercase => ` ${uppercase.toLowerCase()}`);
}

function getSlug(string) {
  return string
    .toLowerCase()
    .replace(/\s/g, '-')
    .replace(/[^a-z0-9_-]/g, '');
}

function parseValidators() {
  // HACK: Assumes the location of lib/routes/validators.js
  return parseModuleExports('../lib/routes/validators').then(validators =>
    validators.map(item => {
      item.value = marshallValidation(item.value);
      return item;
    })
  );
}

function parseModuleExports(relativePath) {
  return parseModule(relativePath).then(node => {
    const variables = parseVariables(node);
    return findModuleExports(node)
      .map(moduleExports => ({
        key: moduleExports.left.property.name,
        value: marshallValue(moduleExports.right, variables),
      }))
      .filter(moduleExports => !!moduleExports.value);
  });
}

function parseModule(relativePath) {
  return fs
    .readFileP(`${path.resolve(__dirname, relativePath)}.js`, {
      encoding: 'utf8',
    })
    .then(js => acorn.parse(js, ACORN_OPTIONS).body);
}

function marshallValidation(validation) {
  if (typeof validation !== 'string') {
    return validation;
  }

  // HACK: Assumes single quotes, specific paths
  validation = validation.replace(
    /require\('\.\.\/metrics\/context'\)/g,
    'metricsContext'
  );
  validation = validation.replace(/require\('\.\.\/features'\)/g, 'features');
  validation = validation.replace(/require\('\.\.\/devices'\)/g, 'devices');

  // HACK: Assumes we always import joi as `isA`
  if (!/^isA\./.test(validation)) {
    return validation;
  }

  // HACK: Assumes joi methods always begin and end with a lower-case letter
  return validation
    .replace(/isA\./g, '')
    .replace(/([a-z)])\.([a-z])/g, '$1, $2');
}

function parseMetricsContext() {
  // HACK: Assumes the location of lib/metrics/context.js
  return parseModuleExports('../lib/metrics/context').then(metricsContext =>
    metricsContext.map(item => {
      item.value = marshallValidation(
        item.value
          .replace('{ ', '{\n    - ')
          .replace(/ }/, '\n\n  }')
          .replace(/, ([a-zA-Z]+):/g, '\n    - $1:')
          .replace(/([a-zA-Z]+):/g, '`$1`:')
      );
      return item;
    })
  );
}

function parseFeatures() {
  // HACK: Assumes the location of lib/features.js
  return parseModuleExports('../lib/features').then(features =>
    features.map(item => {
      item.value = marshallValidation(item.value);
      return item;
    })
  );
}

function parseDevices() {
  // HACK: Assumes the location of lib/devices.js
  return parseModuleExports('../lib/devices').then(devices =>
    devices.map(item => {
      let nesting = 0;
      item.value = marshallValidation(
        item.value
          .replace('{ ', '{\n    - `')
          .replace(/ }$/, '\n\n  }')
          .replace(/isA\.object\({ ([a-zA-Z]+):/g, 'isA.object({\n    - `$1`:')
          .replace(/, /g, '\n    - `')
          .replace(/`([a-zA-Z]+):/g, '`$1`:')
          .split('\n')
          .map(line => {
            line = line.replace(/ +-/, `    ${'  '.repeat(nesting)}-`);
            if (line.indexOf('isA.object({') >= 0) {
              nesting += 1;
            } else if (line.endsWith(' })')) {
              line = line.replace(/ }\)$/, `\n    ${'  '.repeat(nesting)}- })`);
              nesting -= 1;
            }
            return line;
          })
          .join('\n')
      );
      return item;
    })
  );
}

function parseErrors() {
  // HACK: Assumes the location of lib/error.js
  return parseModule('../lib/error').then(node => {
    const declarations = findVariables(node).reduce(
      (variables, variable) => variables.concat(variable.declarations),
      []
    );
    const errno = filterDeclarations(declarations, 'ERRNO');
    const defaults = filterDeclarations(declarations, 'DEFAULTS');

    assertType(errno, OBJECT_TYPES, 'lib/error.js');
    assertType(defaults, OBJECT_TYPES, 'lib/error.js');

    const errnoMap = parseObject(errno, EMPTY_MAP);
    const defaultsMap = parseObject(defaults, errnoMap);

    const result = findAppErrors(node).reduce(
      marshallErrors.bind(null, errnoMap, defaultsMap),
      { errors: [], definitionsMap: {}, additionalErrorParams: [] }
    );

    return {
      definitions: result.errors.sort((lhs, rhs) => lhs.errno - rhs.errno),
      definitionsMap: result.definitionsMap,
      additionalErrorParams: result.additionalErrorParams.sort(
        (lhs, rhs) => lhs.errno - rhs.errno
      ),
    };
  });
}

function filterDeclarations(declarations, name) {
  return declarations.filter(
    declaration => declaration.init && declaration.id.name === name
  )[0].init;
}

function parseObject(object, variables) {
  return new Map(
    object.properties.map(property => [
      property.key.name,
      marshallValue(property.value, variables),
    ])
  );
}

function findAppErrors(node) {
  // HACK: Assumes the error object is called AppError and that we always
  //       assign error functions to its properties, rather than define it
  //       as e.g. an object literal.
  return findAssignmentsTo(node, {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: 'AppError',
    },
  }).filter(assignment => !NOT_ERRORS.has(assignment.left.property.name));
}

function marshallErrors(errnoMap, defaultsMap, result, errorFunction) {
  // HACK: Assumes the error object is called AppError
  const returns = find(
    errorFunction,
    {
      type: 'ReturnStatement',
      argument: {
        type: 'NewExpression',
        callee: {
          type: 'Identifier',
          name: 'AppError',
        },
      },
    },
    { recursive: true }
  );

  returns.forEach(r => {
    let code, errno, message;
    const args = r.argument.arguments;
    if (args) {
      const error = args[0];
      assertType(error, OBJECT_TYPES, 'lib/error.js');
      code = marshallErrorProperty(error, 'code');
      errno = marshallErrorProperty(error, 'errno', errnoMap);
      message = marshallErrorProperty(error, 'message');

      if (args.length > 1) {
        const extraData = args[1];
        let params;
        switch (extraData.type) {
          /* eslint-disable indent */
          case 'Identifier': {
            let assignment;
            const variables = find(
              errorFunction,
              {
                type: 'VariableDeclaration',
              },
              { recursive: true }
            );
            variables.some(variable => {
              return variable.declarations.some(declaration => {
                if (declaration.id.name === extraData.name) {
                  assignment = declaration.init;
                  return true;
                }
                return false;
              });
            });
            if (!assignment) {
              const assignments = findAssignmentsTo(errorFunction, {
                type: 'Identifier',
                name: extraData.name,
              });
              if (assignments.length > 0) {
                assignment = assignments[0].right;
              }
            }
            if (assignment) {
              assertType(assignment, OBJECT_TYPES, 'lib/error.js');
              params = assignment.properties.concat(
                findAssignmentsTo(errorFunction, {
                  type: 'MemberExpression',
                  object: {
                    type: 'Identifier',
                    name: extraData.name,
                  },
                }).map(assignmentTo => ({ key: assignmentTo.left.property }))
              );
            }
            break;
          }
          case 'ObjectExpression':
            params = extraData.properties;
          /* eslint-enable indent */
        }
        result.additionalErrorParams.push({
          errno: errno || defaultsMap.get('errno'),
          hasParams: params && params.length > 0,
          params: params && params.map(arg => arg.key.name).join(', '),
        });
      }
    }

    // HACK: Assumes the names of code, errno and message
    result.errors.push({
      code: code || defaultsMap.get('code'),
      errno: errno || defaultsMap.get('errno'),
      definition: message || defaultsMap.get('message').replace(/'/g, ''),
    });
    result.definitionsMap[errorFunction.left.property.name] =
      result.errors[result.errors.length - 1];
  });

  return result;
}

function marshallErrorProperty(node, name, errnoMap) {
  const property = findProperty(
    node,
    name,
    ERROR_PROPERTY_TYPES,
    'lib/error.js'
  );

  if (property) {
    switch (property.type) {
      /* eslint-disable indent */
      case 'Literal':
      case 'TemplateLiteral':
        return property.value;

      case 'Identifier':
        return property.name;

      case 'BinaryExpression':
        // HACK: Assumes we're always interested in the lhs
        return property.left.value;

      case 'LogicalExpression':
        // HACK: Assumes we're always interested in the rhs
        return property.right.value;

      case 'MemberExpression':
        if (errnoMap && property.object.name === 'ERRNO') {
          return errnoMap.get(property.property.name);
        }
      /* eslint-enable indent */
    }
  }
}

function writeOutput(data, outputPath) {
  fs.writeFileSync(outputPath, render(data), { mode: 0o644 });
}
