import Component from '@ember/component';

import { action } from '@ember/object';

export default Component.extends({
  foo: action(function() {
    console.log('something');
  })
});
