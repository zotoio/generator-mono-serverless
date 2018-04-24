'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const faker = require('faker');

describe('generator-mono-serverless:package', () => {
    const appName = faker.random.word();
    const appVersion = faker.random.number();

    it('should assign name and version to package.json', () => {
        return helpers
            .run(path.join(__dirname, '../generators/package'))
            .withOptions({ 'skip-bootstrap': true })
            .withPrompts({ name: appName, version: appVersion })
            .then(() => {
                assert.jsonFileContent(`packages/${appName}/package.json`, {
                    name: appName,
                    version: appVersion
                });
            });
    });

    it('should assign scope to package.json', () => {
        return helpers
            .run(path.join(__dirname, '../generators/package'))
            .withOptions({ 'skip-bootstrap': true })
            .withPrompts({
                name: appName,
                version: appVersion,
                packageScope: 'abc123'
            })
            .then(() => {
                assert.jsonFileContent(`packages/${appName}/package.json`, {
                    name: `abc123/${appName}`,
                    version: appVersion
                });
            });
    });

    it('should copy non-template files', () => {
        return helpers
            .run(path.join(__dirname, '../generators/package'))
            .withOptions({ 'skip-bootstrap': true })
            .withPrompts({ name: appName, version: appVersion })
            .then(() => {
                assert.file([
                    `packages/${appName}/tsconfig.json`,
                    `packages/${appName}/__tests__/index.test.ts`,
                    `packages/${appName}/src/index.ts`
                ]);
            });
    });
});
