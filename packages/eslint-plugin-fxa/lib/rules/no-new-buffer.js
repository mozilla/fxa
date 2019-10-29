/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

function inferMethod(args) {
  return (args.length > 0 && typeof args[0].value === 'number') ? 'alloc' : 'from';
};

module.exports = {
  create(context) {
    return {
      NewExpression(node) {
        const callee = node.callee
        const method = inferMethod(node.arguments)
        if (callee && callee.name === 'Buffer') {
          context.report({
            node: node,
            message: `\`new Buffer()\` is deprecated, use \`Buffer.${method}()\` instead.`,
          })
        }
      }
    }
  }
}
