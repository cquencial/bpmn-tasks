Package.describe({
  name: 'cquencial:bpmn-tasklist',
  version: '0.1.0',
  // Brief, one-line summary of the package.
  summary: 'Provides a task list for cquencial:bpmn-engine',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
});

Package.onUse(function (api) {
  api.versionsFrom('1.6.1');
  api.use([
    'check',
    'ecmascript',
    'mongo',
    'promise',
    'cquencial:bpmn-engine',
  ]);
  api.addFiles('bpmn-tasklist.js');
});

Package.onTest(function (api) {
  api.use('ecmascript');
  api.use('meteor');
  api.use('check');
  api.use('mongo');
  api.use('random');
  api.use('sha');
  api.use('cquencial:bpmn-tasklist');
  api.use('meteortesting:mocha');
  api.use('practicalmeteor:chai');
  api.mainModule('bpmn-tasklist-tests.js');
});

Npm.depends({
  'camunda-bpmn-moddle': '2.0.0',
});

