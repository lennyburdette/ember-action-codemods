import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extends({
  bar: computed(function() {
    return 42;
  }),
  actions: {
    foo() {
      console.log('something');
    },
    baz: function(e) {
      console.log(e);
    }
  }
});
