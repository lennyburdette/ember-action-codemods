const actionModifiers = require('../action-modifiers');
const { parse, transform } = require('ember-template-recast');

function codeshift(input, plugin) {
  return plugin(
    {
      path: 'filename.hbs',
      source: input,
    },
    {
      parse,
      visit(ast, callback) {
        const results = transform(ast, callback);
        return results && results.code;
      },
    }
  );
}

const TESTS = [
  [
    'string action name',
    `<button {{action "foo" bar}}>button</button>`,
    `<button {{on "click" (prevent-default (fn (action "foo") bar))}}>button</button>`
  ],
  [
    'on= option',
    `<button {{action "foo" bar on="hover"}}>button</button>`,
    `<button {{on "hover" (prevent-default (fn (action "foo") bar))}}>button</button>`
  ],
  [
    '@arg',
    `<button {{action @bar baz}}>button</button>`,
    `<button {{on "click" (prevent-default (fn @bar baz))}}>button</button>`
  ],
  [
    'this.',
    `<button {{action this.quux}}>button</button>`,
    `<button {{on "click" (prevent-default this.quux)}}>button</button>`
  ],
  [
    'two modifiers',
    `<button {{action bar}} {{action baz on="hover"}}>button</button>`,
    `<button {{on "click" (prevent-default bar)}} {{on "hover" (prevent-default baz)}}>button</button>`
  ],
  [
    'preventDefault=false',
    `<button {{action foo preventDefault=false}}>button</button>`,
    `<button {{on "click" foo}}>button</button>`,
  ],
  [
    'bubbles=false',
    `<button {{action foo bubbles=false}}>button</button>`,
    `<button {{on "click" (stop-propagation (prevent-default foo))}}>button</button>`,
  ],
  [
    'bubbles=true',
    `<button {{action foo bubbles=true}}>button</button>`,
    `<button {{on "click" (prevent-default foo)}}>button</button>`,
  ],
  [
    'preventDefault and bubbles',
    `<button {{action foo preventDefault=false bubbles=false}}>button</button>`,
    `<button {{on "click" (stop-propagation foo)}}>button</button>`,
  ],
  [
    'value=',
    `<button {{action foo value="target.value"}}>button</button>`,
    `<button {{on "click" (prevent-default (action foo value="target.value"))}}>button</button>`,
  ],
  [
    'target=',
    `<button {{action foo target=someService}}>button</button>`,
    `<button {{on "click" (prevent-default (action foo target=someService))}}>button</button>`,
  ],
  [
    'allowedKeys=',
    `<button {{action foo allowedKeys="alt"}}>button</button>`,
    `<button {{on "click" (prevent-default (action foo allowedKeys="alt"))}}>button</button>`,
  ],
  [
    'value && target',
    `<button {{action "foo" value="target.value" target=someService}}>button</button>`,
    `<button {{on "click" (prevent-default (action "foo" value="target.value" target=someService))}}>button</button>`,
  ],
  [
    'preventDefault=this.dynamicValue',
    `<button {{action foo preventDefault=this.dynamicValue}}>button</button>`,
    `<button {{action foo preventDefault=this.dynamicValue}}>button</button>`
  ],
  [
    'bubbles=this.dynamicValue',
    `<button {{action foo bubbles=this.dynamicValue}}>button</button>`,
    `<button {{action foo bubbles=this.dynamicValue}}>button</button>`
  ]
];

TESTS.forEach(([name, input, expectedOutput]) => {
  it(name, () => {
    const output = codeshift(input, actionModifiers);
    expect((output || '').trim()).toEqual(expectedOutput.trim());
  });
});
