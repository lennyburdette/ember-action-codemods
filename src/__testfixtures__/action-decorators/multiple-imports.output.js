import Component from '@ember/component';
import { action } from '@ember/object';
import { A } from '@ember/array';

export default Component.extends({
  foo: A([]),
  bar: action(function() {
    console.log('something');
  })
});
