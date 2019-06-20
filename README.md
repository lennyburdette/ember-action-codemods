# Ember Action Codemods

## Usage

### Step 1: Install dependencies

```sh
yarn add --dev ember-template-recast
yarn add ember-on-modifier ember-fn-helper-polyfill ember-event-helpers
```

### Step 2: Convert `{{action}}` modifiers to `{{on}}` modifiers

This is the safest of the codemods.

```sh
yarn ember-template-recast app/ -t \
  https://raw.githubusercontent.com/lennyburdette/ember-action-codemods/master/src/action-modifiers.js
```

### Step 3: Convert `onclick={{action foo}}` to `{{on "click" foo}}`

Switching from event properties to Ember modifiers can have subtle behavior
changes regarding event ordering!

See https://developer.squareup.com/blog/deep-dive-on-ember-events/
for a comprehensive rundown.

```sh
yarn ember-template-recast app/ -t \
  https://raw.githubusercontent.com/lennyburdette/ember-action-codemods/master/src/event-properties.js
```

### Step 4: Convert `action` hashes in JavaScript to decorated properties:

Requires Ember.js 3.10 and above. This will no-op if your action names
conflict with existing ember component functions.

If you're converting to native classes, this is unnecessary (you're already
using the `@action` decorator).

```sh
npx jscodeshift app/ -t \
  https://raw.githubusercontent.com/lennyburdette/ember-action-codemods/master/src/action-decorators.js
```

### Step 5: Convert string actions to properties

If you're not using the `actions` hash in components and controllers, this is
safe to do.

```sh
yarn ember-template-recast app/ -t \
  https://raw.githubusercontent.com/lennyburdette/ember-action-codemods/master/src/string-actions.js
```

## What does it do?

Check out the tests!

* [action-modifiers.js](src/__tests__/action-modifiers.js)

  `<button {{action foo}}>` → `<button {{on "click" (prevent-default foo)}}>`

* [event-properties.js](src/__tests__/event-properties.js)

  `<button onclick={{action foo}}>` → `<button {{on "click" (prevent-default foo)}}>`

* [action-decorators.js](src/__testfixtures__/action-decorators/)

  ```js
  actions: {
    foo() {}
  }
  ```
  →
  ```js
  foo: action(function() {})
  ```

* [string-actions.js](src/__tests__/string-actions.js)

  `<button {{on "click" (action "foo")}}>` → `<button {{on "click" this.foo}}>`

## TODO:

* Remove uses of the `(action)` helper once there's a canonical way to handle `value=`, `target=`, and `allowedKeys=`.
