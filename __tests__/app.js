'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const faker = require('faker');

describe('generator-elderfo-typescript-workspace:app', () => {
  const appName = faker.random.word();
  const appVersion = faker.random.number();

  beforeAll(() => {
    return helpers
      .run(path.join(__dirname, '../generators/app'))
      .withOptions({ 'skip-bootstrap': true })
      .withPrompts({ name: appName, version: appVersion });
  }, 10000);

  it('should assign version to lerna.json', () => {
    assert.jsonFileContent(`${appName}/lerna.json`, {
      version: appVersion,
    });
  });

  it('should assign name and version to package.json', () => {
    assert.jsonFileContent(`${appName}/package.json`, {
      name: appName,
      version: appVersion,
    });
  });

  it('should copy non-template files', () => {
    assert.file([`${appName}/jest.json`, `${appName}/tsconfig.json`]);
  });
});
