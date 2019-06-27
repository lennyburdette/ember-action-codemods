const eventProperties = require('../event-properties');
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
    'onclick={{action "foo"}}',
    `<button onclick={{action "foo"}}>button</button>`,
    `<button {{on "click" (action "foo")}}>button</button>`
  ],
  [
    'onmousedown={{foo}}',
    `<button onmousedown={{foo}}>button</button>`,
    `<button {{on "mousedown" foo}}>button</button>`
  ],
  [
    'onclick={{action foo bar}}',
    `<button onclick={{action foo bar}}>button</button>`,
    `<button {{on "click" (fn foo bar)}}>button</button>`
  ],
  [
    'value="target.value"',
    `<button onclick={{action foo value="target.value"}}>button</button>`,
    `<button {{on "click" (action foo value="target.value")}}>button</button>`
  ],
  [
    'target=something',
    `<button onclick={{action foo target=something}}>button</button>`,
    `<button {{on "click" (action foo target=something)}}>button</button>`
  ],
  [
    'not an action',
    `<button onclick={{or foo bar}}>button</button>`,
    `<button {{on "click" (or foo bar)}}>button</button>`
  ],
  [
    'nested actions',
    `<button onclick={{or (action "foo") (action this.bar baz)}}>button</button>`,
    `<button {{on "click" (or (action "foo") (fn this.bar baz))}}>button</button>`
  ]
];

TESTS.forEach(([name, input, expectedOutput]) => {
  it(name, () => {
    const output = codeshift(input, eventProperties);
    expect((output || '').trim()).toEqual(expectedOutput.trim());
  });
});
