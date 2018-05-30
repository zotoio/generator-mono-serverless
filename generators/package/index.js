'use strict';
const fs = require('fs');
const path = require('path');
const Generator = require('yeoman-generator');
const _ = require('lodash');

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
                message: 'Package name:',
                validate: function(input) {
                    return Boolean(input);
                }
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
            },
            {
                when: function(response) {
                    return response.provider === 'aws';
                },
                type: 'input',
                name: 'executionAwsRole',
                message: 'Lambda execution role ARN (eg. arn:aws:iam::XXXXXX:role/role):',
                default: '',
                store: true
            },
            {
                when: function(response) {
                    return response.provider === 'aws';
                },
                type: 'input',
                name: 'kmsEncryptionKeyId',
                message: 'KMS key id (ie. uuid from end of ARN):',
                default: '',
                store: true
            }
        ];

        return this.prompt(prompts).then(props => {
            // To access props later use this.props.someAnswer;
            this.props = props;
            this.props.packagePath = path.resolve(`packages/${props.name}`);
            this.props.packageName = props.packageScope ? `${props.packageScope}/${props.name}` : props.name;
            this.props.ddbTableName = props.ddbTableName;
            this.props.useDomainManager = props.useDomainManager || false;
            this.props.useAliases = props.useAliases || false;
            this.props.provider = props.provider || 'aws';

            _.merge(this.options.__store, this.props);
        });
    }

    writing() {
        this.fs.copy(
            this.templatePath('src/index.spec.ts'),
            this.destinationPath(`${this.props.packagePath}/src/index.spec.ts`)
        );

        this.fs.copy(this.templatePath('encrypt.sh'), this.destinationPath(`${this.props.packagePath}/encrypt.sh`));

        ['tsconfig.json', 'tslint.json'].forEach(fileName => {
            this.fs.copy(this.templatePath(fileName), this.destinationPath(`${this.props.packagePath}/${fileName}`));
        });

        this.fs.copyTpl(
            this.templatePath(`.envExample-${this.props.provider}`),
            this.destinationPath(`${this.props.packagePath}/.envExample`),
            {
                kmsEncryptionKeyId: 'f7xxx9-20xf-4x98-bxx5-5xxxxccf8556',
                executionAwsRole: 'arn:aws:iam::34xxxxxxxx73:role/lambda-execution'
            }
        );
        this.fs.copyTpl(
            this.templatePath(`.envExample-${this.props.provider}`),
            this.destinationPath(`${this.props.packagePath}/.env`),
            {
                kmsEncryptionKeyId: this.props.kmsEncryptionKeyId,
                executionAwsRole: this.props.executionAwsRole
            }
        );

        if (this.props.provider === 'google') {
            this.fs.copy(
                this.templatePath(`webpack.config-${this.props.provider}.js`),
                this.destinationPath(`${this.props.packagePath}/webpack.config.js`)
            );
        }

        if (this.props.provider === 'aws' && this.props.ddbTableName) {
            this.fs.copy(
                this.templatePath(`dynamoTable.seed.json`),
                this.destinationPath(`${this.props.packagePath}/${this.props.ddbTableName}.seed.json`)
            );
        }

        this.fs.copyTpl(
            this.templatePath(`_package-${this.props.provider}.json`),
            this.destinationPath(`${this.props.packagePath}/package.json`),
            {
                version: this.props.version,
                name: this.props.packageName,
                ddbTableName: this.props.ddbTableName,
                kmsEncryptionKeyId: this.props.kmsEncryptionKeyId
            }
        );

        this.fs.copyTpl(this.templatePath('_README.md'), this.destinationPath(`${this.props.packagePath}/README.md`), {
            name: this.props.packageName,
            provider: this.props.provider
        });

        if (this.props.ddbTableName) {
            this.fs.copyTpl(
                this.templatePath(`src/_index-aws-dynamo.ts`),
                this.destinationPath(`${this.props.packagePath}/src/index.ts`),
                {
                    name: this.props.packageName,
                    ddbTableName: this.props.ddbTableName
                }
            );
        } else {
            this.fs.copyTpl(
                this.templatePath(`src/_index-${this.props.provider}.ts`),
                this.destinationPath(`${this.props.packagePath}/src/index.ts`),
                {
                    name: this.props.packageName
                }
            );
        }

        this.fs.copyTpl(
            this.templatePath(`_serverless-${this.props.provider}.yml`),
            this.destinationPath(`${this.props.packagePath}/serverless.yml`),
            {
                version: this.props.version,
                name: this.props.packageName,
                ddbTableName: this.props.ddbTableName,
                useDomainManager: this.props.useDomainManager,
                useAliases: this.props.useAliases,
                executionAwsRole: this.props.executionAwsRole,
                kmsEncryptionKeyId: this.props.kmsEncryptionKeyId
            }
        );

        if (this.props.provider === 'aws') {
            ['functions', 'iam', 'resources', 'tags', 'environment'].forEach(item => {
                this.fs.copyTpl(
                    this.templatePath(`_serverless-aws-${item}.yml`),
                    this.destinationPath(`${this.props.packagePath}/serverless-aws-${item}.yml`),
                    {
                        version: this.props.version,
                        name: this.props.packageName,
                        ddbTableName: this.props.ddbTableName,
                        useDomainManager: this.props.useDomainManager,
                        useAliases: this.props.useAliases,
                        kmsEncryptionKeyId: this.props.kmsEncryptionKeyId
                    }
                );
            });
        }
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
