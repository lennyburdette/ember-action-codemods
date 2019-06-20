import Component from '@ember/component';

export default Component.extends({
  actions: {
    didInsertElement() {
      console.log('something');
    }
  }
});
