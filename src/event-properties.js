module.exports = function({ source, path }, { parse, visit }) {
  const ast = parse(source);

  return visit(ast, env => {
    let { builders: b } = env.syntax;

    return {
      ElementNode(node) {
        const eventAttributes = node.attributes.filter(attr => {
          const isEvent = attr.name.startsWith('on');
          const valueIsAction = attr.value.type === 'MustacheStatement';
          return isEvent && valueIsAction;
        });

        if (!eventAttributes.length) {
          return node;
        }

        const attrs = node.attributes.filter(attr => !eventAttributes.includes(attr));
        const modifiers = [...node.modifiers];

        for (const attr of eventAttributes) {
          const eventName = attr.name.replace(/^on/, '');
          const expr = convertExpression(attr.value, b);

          modifiers.push(
            b.elementModifier('on', [
              b.string(eventName),
              expr
            ])
          );
        }

        return b.element(
          node.tag,
          {
            attrs,
            modifiers,
            children: node.children,
            comments: node.comments,
            blockParams: node.blockParams
          }
        );
      }
    };
  });
};

function convertExpression(expr, b) {
  let action = expr;
  let params = [];
  let wrappedInAction = false;

  if (expr.path.original === 'action') {
    [action, ...params] = expr.params;
  } else {
    action = expr.path;
  }

  // {{action "foo"}} -> (action "foo")
  if (action.type === 'StringLiteral') {
    action = b.sexpr('action', [action]);
    wrappedInAction = true;
  }

  // {{action foo value="target.value"}} -> (action foo value="target.value")
  const value = getValue(expr.hash);
  if (value) {
    if (!wrappedInAction) {
      action = b.sexpr('action', [action]);
    }
    action.hash.pairs.push(value);
  }

  // {{action foo target=service}} -> (action foo target=service)
  const target = getTarget(expr.hash);
  if (target) {
    if (!wrappedInAction) {
      action = b.sexpr('action', [action]);
    }
    action.hash.pairs.push(target);
  }

  // {{action foo bar}} -> (fn foo bar)
  if (params.length) {
    action = b.sexpr('fn', [action, ...params]);
  }

  // * -> (prevent-default *)
  action = b.sexpr('prevent-default', [action]);

  return action;
}

function getTarget(hash) {
  return hash.pairs.find(p => p.key === 'target');
}

function getValue(hash) {
  return hash.pairs.find(p => p.key === 'value');
}
