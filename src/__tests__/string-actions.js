const stringActions = require('../string-actions');
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
    'action "foo"',
    `<button {{on "click" (prevent-default (action "foo"))}}>button</button>`,
    `<button {{on "click" (prevent-default this.foo)}}>button</button>`
  ],
  [
    'value=',
    `<button {{on "click" (prevent-default (action "bar" value="target.value"))}}>button</button>`,
    `<button {{on "click" (prevent-default (action this.bar value="target.value"))}}>button</button>`
  ],
  [
    'target=',
    `<button {{on "click" (prevent-default (action "foo" target=something))}}>button</button>`,
    `<button {{on "click" (prevent-default (action this.foo target=something))}}>button</button>`
  ],
  [
    'allowedKeys=',
    `<button {{on "click" (prevent-default (action "foo" allowedKeys="alt"))}}>button</button>`,
    `<button {{on "click" (prevent-default (action this.foo allowedKeys="alt"))}}>button</button>`
  ],
  [
    'no-op on actions with multiple params',
    `<button {{on "click" (action "foo" bar)}}>button</button>`,
    `<button {{on "click" (action "foo" bar)}}>button</button>`
  ]
];

TESTS.forEach(([name, input, expectedOutput]) => {
  it(name, () => {
    const output = codeshift(input, stringActions);
    expect((output || '').trim()).toEqual(expectedOutput.trim());
  });
});
