'use strict';
const fs = require('fs');
const path = require('path');
const Generator = require('yeoman-generator');

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        this.option('skip-bootstrap');
        this.bootstrap = !this.options['skip-bootstrap'];
    }

    configuring() {
        this.log('');
        this.log(`Creating a new TypeScript serverless package..`);
        this.log('');
    }

    prompting() {
        let defaultVersion = '';

        if (fs.existsSync('package.json')) {
            const packageJson = require(path.join(process.cwd(), 'package.json'));
            defaultVersion = packageJson.version;
        }

        const prompts = [
            {
                type: 'input',
                name: 'name',
                message: 'Package name:'
            },
            {
                type: 'input',
                name: 'version',
                message: `Package version:`,
                default: defaultVersion
            },
            {
                type: 'input',
                name: 'packageScope',
                message: `Package scope:`,
                default: ''
            },
            {
                type: 'list',
                name: 'provider',
                message: 'Serverless platform:',
                choices: ['aws', 'google'],
                default: 'aws'
            },
            {
                when: function(response) {
                    return response.provider === 'aws';
                },
                type: 'input',
                name: 'ddbTableName',
                message: `DynamoDB table name:`,
                default: ''
            },
            {
                when: function(response) {
                    return response.provider === 'aws';
                },
                type: 'confirm',
                name: 'useAliases',
                message: `Use API Gateway aliases?`,
                default: false
            },
            {
                when: function(response) {
                    return response.provider === 'aws';
                },
                type: 'confirm',
                name: 'useDomainManager',
                message: `Use custom domain manager?`,
                default: false
            }
        ];

        return this.prompt(prompts).then(props => {
            // To access props later use this.props.someAnswer;
            this.props = props;
            this.props.packagePath = path.resolve(`packages/${props.name}`);
            this.props.packageName = props.packageScope ? `${props.packageScope}/${props.name}` : props.name;
            this.props.useDomainManager = props.useDomainManager || false;
            this.props.useAliases = props.useAliases || false;
            this.props.provider = props.provider || 'aws';
        });
    }

    writing() {
        this.fs.copy(
            this.templatePath('__tests__/index.test.ts'),
            this.destinationPath(`${this.props.packagePath}/__tests__/index.test.ts`)
        );

        this.fs.copy(
            this.templatePath('src/index.spec.ts'),
            this.destinationPath(`${this.props.packagePath}/src/index.spec.ts`)
        );

        ['tsconfig.json', 'tslint.json', `.envExample-${this.props.provider}`].forEach(fileName => {
            this.fs.copy(this.templatePath(fileName), this.destinationPath(`${this.props.packagePath}/${fileName}`));
        });

        this.fs.copy(
            this.templatePath(`.envExample-${this.props.provider}`),
            this.destinationPath(`${this.props.packagePath}/.envExample`)
        );
        this.fs.copy(
            this.templatePath(`.envExample-${this.props.provider}`),
            this.destinationPath(`${this.props.packagePath}/.env`)
        );

        if (this.props.provider === 'google') {
            this.fs.copy(
                this.templatePath(`webpack.config-${this.props.provider}.js`),
                this.destinationPath(`${this.props.packagePath}/webpack.config.js`)
            );
        }

        this.fs.copyTpl(
            this.templatePath('_package.json'),
            this.destinationPath(`${this.props.packagePath}/package.json`),
            {
                version: this.props.version,
                name: this.props.packageName
            }
        );

        this.fs.copyTpl(this.templatePath('_README.md'), this.destinationPath(`${this.props.packagePath}/README.md`), {
            name: this.props.packageName,
            provider: this.props.provider
        });

        this.fs.copyTpl(
            this.templatePath(`src/_index-${this.props.provider}.ts`),
            this.destinationPath(`${this.props.packagePath}/src/index.ts`),
            {
                name: this.props.packageName
            }
        );

        this.fs.copyTpl(
            this.templatePath(`_serverless-${this.props.provider}.yml`),
            this.destinationPath(`${this.props.packagePath}/serverless.yml`),
            {
                version: this.props.version,
                name: this.props.packageName,
                ddbTableName: this.props.ddbTableName,
                useDomainManager: this.props.useDomainManager,
                useAliases: this.props.useAliases
            }
        );
    }

    install() {
        const cwd = process.cwd();
        process.chdir(this.props.packagePath);

        this.installDependencies({
            bower: false,
            npm: false,
            yarn: true
        }).then(() => {
            process.chdir(cwd);
            if (this.bootstrap) {
                this.spawnCommandSync('yarn', ['run', 'bootstrap']);
            }
        });
    }

    end() {
        this.log('');
        this.log(`Success! Created package ${this.props.packageName} in ./packages`);
        this.log('');
    }
};
