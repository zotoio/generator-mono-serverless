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
                type: 'list',
                name: 'eventTriggerType',
                message: 'Event trigger type:',
                choices: ['http', 's3'],
                default: 'http'
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
                    return response.provider === 'aws' && response.eventTriggerType === 's3';
                },
                type: 'input',
                name: 's3EventBucket',
                message: `S3 event bucket name`,
                default: '',
                validate: function(input) {
                    return Boolean(input);
                }
            },
            {
                when: function(response) {
                    return response.provider === 'aws' && response.eventTriggerType === 's3';
                },
                type: 'list',
                name: 's3EventTrigger',
                message: `S3 event trigger type`,
                choices: ['s3:ObjectCreated:*', 's3:ObjectRemoved:*'],
                default: 's3:ObjectCreated:*'
            },
            {
                when: function(response) {
                    return response.provider === 'aws' && response.eventTriggerType === 'http';
                },
                type: 'confirm',
                name: 'useAliases',
                message: `Use API Gateway aliases?`,
                default: false
            },
            {
                when: function(response) {
                    return response.provider === 'aws' && response.eventTriggerType === 'http';
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
                name: 'deploymentBucketPrefix',
                message: `Deployment bucket prefix. Each stage bucket must exist if supplied, eg [prefix].serverless.[dev|test|prod]`,
                store: true
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
                    return response.provider === 'aws' && response.eventTriggerType === 'http';
                },
                type: 'input',
                name: 'apiGatewayAuthorizer',
                message: 'API Gateway Authorizer Lambda ARN (eg. arn:aws:lambda:XXXX:function:my-authorizer):',
                default: '',
                store: true
            },
            {
                when: function(response) {
                    return response.provider === 'aws';
                },
                type: 'input',
                name: 'kmsEncryptionKeyId',
                message: 'KMS key id for env vars (ie. uuid from end of ARN):',
                default: '',
                store: true
            },
            {
                when: function(response) {
                    return response.provider === 'aws';
                },
                type: 'input',
                name: 'kmsEncryptionKeyIdBucket',
                message: 'KMS key id for deployment bucket (ie. uuid from end of ARN):',
                default: '',
                store: true
            },
            {
                when: function(response) {
                    return response.provider === 'aws';
                },
                type: 'input',
                name: 'snsErrorTopicArn',
                message: 'Arn of SNS topic to notify on function failure:',
                default: '',
                store: true
            },
            {
                when: function(response) {
                    return response.provider === 'aws';
                },
                type: 'confirm',
                name: 'useVpc',
                message: 'Use VPC deployment mode?',
                default: true,
                store: true
            },
            {
                when: function(response) {
                    return response.useVpc;
                },
                type: 'input',
                name: 'vpcId',
                message: 'VPC id (eg. vpc-291872309780)',
                default: '',
                store: true,
                validate: function(input) {
                    return Boolean(input);
                }
            },
            {
                when: function(response) {
                    return response.useVpc;
                },
                type: 'input',
                name: 'securityGroupId',
                message: 'VPC security group id (eg. sg-123141223122)',
                default: '',
                store: true,
                validate: function(input) {
                    return Boolean(input);
                }
            },
            {
                when: function(response) {
                    return response.useVpc;
                },
                type: 'input',
                name: 'vpcSubnetA',
                message: 'Subnet A (eg. subnet-11398827340)',
                default: '',
                store: true,
                validate: function(input) {
                    return Boolean(input);
                }
            },
            {
                when: function(response) {
                    return response.useVpc;
                },
                type: 'input',
                name: 'vpcSubnetB',
                message: 'Subnet B (eg. subnet-12398827340)',
                default: '',
                store: true
            },
            {
                when: function(response) {
                    return response.useVpc;
                },
                type: 'input',
                name: 'vpcSubnetC',
                message: 'Subnet C (eg. subnet-13398827340)',
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
                kmsEncryptionKeyIdBucket: 'f7xxx9-20xf-4x98-bxx5-5xxxxccf8556',
                executionAwsRole: 'arn:aws:iam::34xxxxxxxx73:role/lambda-execution',
                apiGatewayAuthorizer: 'arn:aws:lambda:XXXX:function:my-authorizer',
                s3EventBucket: 'myBucket',
                s3EventTrigger: 's3:ObjectCreated:*',
                ddbTableName: 'mytablename',
                deploymentBucketPrefix: 'au.com.somedomain',
                snsErrorTopicArn: 'arn:aws:sns:ap-southeast-2:XXXXXX:sns-topic',
                useVpc: true,
                vpcId: 'vpc-194823094820389',
                apiGatewayEndpointType: 'PRIVATE',
                securityGroupId: 'sg-089787d9f99',
                vpcSubnetA: 'subnet-aaaaa',
                vpcSubnetB: 'subnet-bbbbb',
                vpcSubnetC: 'subnet-ccccc'
            }
        );
        this.fs.copyTpl(
            this.templatePath(`.envExample-${this.props.provider}`),
            this.destinationPath(`${this.props.packagePath}/.env`),
            {
                kmsEncryptionKeyId: this.props.kmsEncryptionKeyId,
                kmsEncryptionKeyIdBucket: this.props.kmsEncryptionKeyIdBucket,
                executionAwsRole: this.props.executionAwsRole,
                apiGatewayAuthorizer: this.props.apiGatewayAuthorizer,
                s3EventBucket: this.props.s3EventBucket,
                s3EventTrigger: this.props.s3EventTrigger,
                ddbTableName: this.props.ddbTableName,
                deploymentBucketPrefix: this.props.deploymentBucketPrefix,
                snsErrorTopicArn: this.props.snsErrorTopicArn,
                useVpc: this.props.useVpc,
                vpcId: this.props.vpcId,
                securityGroupId: this.props.securityGroupId,
                vpcSubnetA: this.props.vpcSubnetA,
                vpcSubnetB: this.props.vpcSubnetB,
                vpcSubnetC: this.props.vpcSubnetC,
                apiGatewayEndpointType: this.props.useVpc ? 'PRIVATE' : 'EDGE'
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
                eventTriggerType: this.props.eventTriggerType,
                kmsEncryptionKeyId: this.props.kmsEncryptionKeyId
            }
        );

        this.fs.copyTpl(this.templatePath('_README.md'), this.destinationPath(`${this.props.packagePath}/README.md`), {
            name: this.props.packageName,
            provider: this.props.provider
        });

        if (this.props.eventTriggerType === 'http') {
            this.fs.copyTpl(
                this.templatePath('_artillery.yml'),
                this.destinationPath(`${this.props.packagePath}/_artillery.yml`),
                {
                    name: this.props.packageName,
                    provider: this.props.provider
                }
            );
        }

        if (this.props.ddbTableName && !this.props.s3EventBucket) {
            this.fs.copyTpl(
                this.templatePath(`src/_index-aws-dynamo.ts`),
                this.destinationPath(`${this.props.packagePath}/src/index.ts`),
                {
                    name: this.props.packageName,
                    ddbTableName: this.props.ddbTableName
                }
            );
        } else if (this.props.s3EventBucket) {
            this.fs.copyTpl(
                this.templatePath(`src/_index-aws-s3.ts`),
                this.destinationPath(`${this.props.packagePath}/src/index.ts`),
                {
                    name: this.props.packageName,
                    s3EventBucket: this.props.s3EventBucket,
                    s3EventTrigger: this.props.s3EventTrigger
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
                kmsEncryptionKeyId: this.props.kmsEncryptionKeyId,
                kmsEncryptionKeyIdBucket: this.props.kmsEncryptionKeyIdBucket,
                apiGatewayAuthorizer: this.props.apiGatewayAuthorizer,
                deploymentBucketPrefix: this.props.deploymentBucketPrefix,
                snsErrorTopicArn: this.props.snsErrorTopicArn,
                useVpc: this.props.useVpc
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
                        kmsEncryptionKeyId: this.props.kmsEncryptionKeyId,
                        kmsEncryptionKeyIdBucket: this.props.kmsEncryptionKeyIdBucket,
                        eventTriggerType: this.props.eventTriggerType,
                        s3EventBucket: this.props.s3EventBucket,
                        s3EventTrigger: this.props.s3EventTrigger,
                        apiGatewayAuthorizer: this.props.apiGatewayAuthorizer,
                        executionAwsRole: this.props.executionAwsRole,
                        deploymentBucketPrefix: this.props.deploymentBucketPrefix,
                        snsErrorTopicArn: this.props.snsErrorTopicArn,
                        useVpc: this.props.useVpc,
                        vpcId: this.props.vpcId
                    }
                );
            });
        }

        if (this.props.provider === 'aws' && this.props.useVpc) {
            this.fs.copyTpl(
                this.templatePath(`_serverless-aws-vpc.yml`),
                this.destinationPath(`${this.props.packagePath}/serverless-aws-vpc.yml`),
                {
                    useVpc: this.props.useVpc,
                    securityGroupId: this.props.securityGroupId,
                    vpcSubnetA: this.props.vpcSubnetA,
                    vpcSubnetB: this.props.vpcSubnetB,
                    vpcSubnetC: this.props.vpcSubnetC
                }
            );
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
