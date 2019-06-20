const { defineTest } = require('jscodeshift/dist/testUtils');

defineTest(__dirname, 'action-decorators', null, 'action-decorators/simple');
defineTest(__dirname, 'action-decorators', null, 'action-decorators/add-import');
defineTest(__dirname, 'action-decorators', null, 'action-decorators/conflicts');
defineTest(__dirname, 'action-decorators', null, 'action-decorators/conflicts-ember');
