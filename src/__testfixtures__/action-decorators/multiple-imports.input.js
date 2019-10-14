import Component from '@ember/component';
import { A } from '@ember/array';

export default Component.extends({
  foo: A([]),
  actions: {
    bar() {
      console.log('something');
    },
  }
});
