import Component from '@ember/component';

import { action } from '@ember/object';

export default Component.extends({
  foo: 42,

  bar: action(function() {
    console.log('bar');
  }),

  actions: {
    foo() {
      console.log('something');
    }
  }
});
