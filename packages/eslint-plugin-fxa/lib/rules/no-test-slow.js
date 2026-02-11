module.exports = {
  create: function (context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'test' &&
          node.callee.property.name === 'slow'
        ) {
          context.report({
            node,
            message:
              'Avoid using test.slow() in your test, change the default timeout.',
          });
        }
      },
    };
  },
};
