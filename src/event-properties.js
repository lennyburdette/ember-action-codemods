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

          let expr;
          // if it starts with "action", clean it up
          // if it starts with anything else, recursively clean up closure actions
          if (isActionStatement(attr.value)) {
            expr = convertExpression(attr.value, b);
          } else {
            expr = convertArgument(attr.value, b);
          }

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

function convertArgument(statement, b) {
  if (!statement.params.length && !statement.hash.pairs.length) {
    return statement.path;
  }

  const params = statement.params.map(param => convertExpression(param, b));

  return b.sexpr(statement.path.original, params, statement.hash);
}

// COPY PASTE FROM action-modifiers.js TO MAKE THE FILE SELF-CONTAINED

function convertExpression(expr, b) {
  let action = expr;
  let params = [];
  let wrappedInAction = false;

  if (!expr.path) {
    return expr;
  }

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

  // {{action foo allowedKeys="alt"}} -> (action foo allowedKeys="alt")
  const allowedKeys = getAllowedKeys(expr.hash);
  if (allowedKeys) {
    if (!wrappedInAction) {
      action = b.sexpr('action', [action]);
    }
    action.hash.pairs.push(allowedKeys);
  }

  // {{action foo bar}} -> (fn foo bar)
  if (params.length) {
    action = b.sexpr('fn', [action, ...params]);
  }

  return action;
}

function getTarget(hash) {
  return hash.pairs.find(p => p.key === 'target');
}

function getValue(hash) {
  return hash.pairs.find(p => p.key === 'value');
}

function getAllowedKeys(hash) {
  return hash.pairs.find(p => p.key === 'allowedKeys');
}

function isActionStatement(statement) {
  return statement.type === 'MustacheStatement' && statement.path.original === 'action';
}

function isClosureAction(expression) {
  return expression.type === 'SubExpression' && expression.path.original === 'action';
}
