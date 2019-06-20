module.exports = function({ source, path }, { parse, visit }) {
  const ast = parse(source);

  return visit(ast, env => {
    let { builders: b } = env.syntax;

    return {
      SubExpression(node) {
        if (node.path.original !== 'action') {
          return node;
        }

        if (node.params.length > 1) {
          console.log(`[${path}] ignoring (action ${node.params.map(p => p.original).join(' ')})`);
          return node;
        }

        if (node.params[0].type !== 'StringLiteral') {
          return node;
        }

        const actionName = b.path(`this.${node.params[0].original}`);

        if (needsActionWrapper(node)) {
          return b.sexpr('action', [actionName], node.hash);
        }

        return actionName;
      }
    };
  });
};

const ALLOWED_OPTIONS = ['value', 'target', 'allowedKeys'];

function needsActionWrapper(node) {
  const options = node.hash.pairs.map(p => p.key);
  for (const option of ALLOWED_OPTIONS) {
    if (options.includes(option)) {
      return true;
    }
  }
  return false;
}
