import Component from '@ember/component';
import { action, computed } from '@ember/object';

export default Component.extends({
  bar: computed(function() {
    return 42;
  }),

  foo: action(function() {
    console.log('something');
  }),

  baz: action(function(e) {
    console.log(e);
  })
});
