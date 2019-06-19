# Ember Action Codemods

## Usage

```sh
yarn add --dev ember-template-recast
yarn add ember-on-modifier ember-fn-helper-polyfill ember-event-helpers

yarn ember-template-recast app/ -t https://raw.githubusercontent.com/lennyburdette/ember-action-codemods/master/src/action-modifiers.js

# This can have subtle behavior changes!
# See https://developer.squareup.com/blog/deep-dive-on-ember-events/ for a comprehensive rundown.
yarn ember-template-recast app/ -t https://raw.githubusercontent.com/lennyburdette/ember-action-codemods/master/src/event-properties.js
```

## What does it do?

Check out the tests!

* [action-modifiers.js](src/__tests__/action-modifiers.js)

  `<button {{action foo}}>` → `<button {{on "click" (prevent-default foo)}}>`
* [event-properties.js](src/__tests__/event-properties.js)

  `<button onclick={{action foo}}>` → `<button {{on "click" (prevent-default foo)}}>`

## TODO:

* Codemod for converting string actions to `@action`-decorated functions.
* Remove uses of the `(action)` helper once there's a canonical way to handle `value=`, `target=`, and `allowedKeys=`.
