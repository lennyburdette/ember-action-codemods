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
          const expr = addPreventDefault(convertExpression(attr.value, b), b);

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

// COPY PASTE FROM action-modifiers.js TO MAKE THE FILE SELF-CONTAINED

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

function addPreventDefault(action, b) {
  // * -> (prevent-default *)
  return b.sexpr('prevent-default', [action]);
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
