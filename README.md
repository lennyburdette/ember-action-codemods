# Ember Action Codemods

## Usage

```sh
yarn add --dev ember-template-recast
yarn add ember-on-modifier ember-fn-helper-polyfill ember-event-helpers

yarn ember-template-recast app/ -t https://raw.githubusercontent.com/lennyburdette/ember-action-codemods/master/src/action-modifiers.js
```

## What does it do?

[Check out the tests!](src/__tests__/action-modifiers.js)

## TODO:

* Codemod for converting event properties (`onclick={{action ...}}`) to `{{on}}` modifiers.
* Codemod for converting string actions to `@action`-decorated functions.
* Remove uses of the `(action)` helper once there's a canonical way to handle `value=`, `target=`, and `allowedKeys=`.
