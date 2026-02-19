module.exports = function (plop) {
  plop.setGenerator('asset', {
    description: 'Create a new Asset type',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Asset name (e.g. Reputation)',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/core/models/{{pascalCase name}}Asset.ts',
        templateFile: 'templates/Asset.ts.hbs',
      },
      {
        type: 'add',
        path: 'tests/{{pascalCase name}}Asset.test.ts',
        templateFile: 'templates/Asset.test.ts.hbs',
      },
    ],
  });
};
