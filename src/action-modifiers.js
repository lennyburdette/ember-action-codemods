module.exports = function({ source, path }, { parse, visit }) {
  const ast = parse(source);

  return visit(ast, env => {
    let { builders: b } = env.syntax;

    return {
      ElementModifierStatement(node) {
        const unsupportedOptions = hasUnsupportedOptions(node);
        if (unsupportedOptions.length) {
          unsupportedOptions.forEach(msg => {
            console.log(`[${path}] ${msg}`);
          });
          return node;
        }

        const newNode = b.mustache('on');

        let [action, ...curriedArgs] = node.params;
        let wrappedInAction = false;

        // {{action "foo"}} -> {{on "click" (action "foo")}}
        if (action.type === 'StringLiteral') {
          action = b.sexpr('action', [action]);
          wrappedInAction = true;
        }

        // {{action foo value="target.value"}} -> {{on "click" (action foo value="target.value")}}
        const value = getValue(node.hash);
        if (value) {
          if (!wrappedInAction) {
            action = b.sexpr('action', [action]);
          }
          action.hash.pairs.push(value);
        }

        // {{action foo target=service}} -> {{on "click" (action foo target=service)}}
        const target = getTarget(node.hash);
        if (target) {
          if (!wrappedInAction) {
            action = b.sexpr('action', [action]);
          }
          action.hash.pairs.push(target);
        }

        // {{action foo allowedKeys="alt"}} -> {{on "click" (action foo allowedKeys="alt")}}
        const allowedKeys = getAllowedKeys(node.hash);
        if (allowedKeys) {
          if (!wrappedInAction) {
            action = b.sexpr('action', [action]);
          }
          action.hash.pairs.push(allowedKeys);
        }

        // {{action foo bar}} -> {{on "click"  (fn foo bar)}}
        if (curriedArgs.length) {
          action = b.sexpr('fn', [action, ...curriedArgs])
        }

        // {{action foo}} -> {{on "click" (prevent-default foo)}}
        // {{action foo preventDefault=false}} -> {{on "click" foo}}
        if (preventDefaultTrue(node.hash)) {
          action = b.sexpr('prevent-default', [action]);
        }

        // {{action foo bubbles=false}} -> {{on "click" (stop-propagation foo)}}
        if (bubblesFalse(node.hash)) {
          action = b.sexpr('stop-propagation', [action]);
        }

        newNode.params = [
          // ... on="keyup" -> {{on "keyup" ...}}
          b.string(eventName(node.hash)),
          action
        ];

        return newNode;
      }
    };
  });
};

function hasUnsupportedOptions(node) {
  const preventDefault = node.hash.pairs.find(p => p.key === 'preventDefault');
  const unsupportedPreventDefaultValue = preventDefault && preventDefault.value.type !== 'BooleanLiteral';

  const stopPropagation = node.hash.pairs.find(p => p.key === 'bubbles');
  const unsupportedStopPropagationValue = stopPropagation && stopPropagation.value.type !== 'BooleanLiteral';

  return [
    unsupportedPreventDefaultValue && `preventDefault=someDynamicValue (line ${node.loc.start.line}) is not supported`,
    unsupportedStopPropagationValue && `bubbles=someDynamicValue (line ${node.loc.start.line}) is not supported`
  ].filter(Boolean);
}

function eventName(hash) {
  const on = hash.pairs.find(p => p.key === 'on');
  if (on) {
    return on.value.value;
  }
  return 'click';
}

function preventDefaultTrue(hash) {
  const preventDefault = hash.pairs.find(p => p.key === 'preventDefault');
  return !preventDefault || preventDefault.value.value === true;
}

function bubblesFalse(hash) {
  return hash.pairs.some(p =>
    p.key === 'bubbles' &&
    p.value.value === false
  );
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
