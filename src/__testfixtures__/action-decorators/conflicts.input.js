import Component from '@ember/component';

export default Component.extends({
  foo: 42,
  actions: {
    foo() {
      console.log('something');
    },
    bar() {
      console.log('bar');
    }
  }
});
