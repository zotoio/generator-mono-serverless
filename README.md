# generator-mono-serverless 

[![Greenkeeper badge](https://badges.greenkeeper.io/zotoio/generator-mono-serverless.svg)](https://greenkeeper.io/)
[![npm version](https://badge.fury.io/js/generator-mono-serverless.svg)](https://badge.fury.io/js/generator-mono-serverless)
[![Build Status](https://travis-ci.org/zotoio/generator-mono-serverless.svg?branch=master)](https://travis-ci.org/zotoio/generator-mono-serverless)

Yeoman generator to create Lerna (https://lernajs.io/) Typescript monorepos, for multiple Serverless/Lambda functions.

- Yeoman web scaffolding https://yeoman.io
- Serverless framework https://serverless.com

## Installation

Make sure you have Nodejs 8.10 LTS or above, along with Yarn. See 'Installation detail' section below for more info.

First, install [Yeoman](http://yeoman.io) and generator-mono-serverless using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-mono-serverless
```

Then generate your new project:

```bash
yo mono-serverless
```

## Adding serverless functions
Inside your generated repo, use:

```bash
yarn generate-package
```
..and follow the prompts. This will give you the scaffolding for a new serverless function.  

You will be prompted for:

- lambda package name, version and npm namespace
- dynamodb tablename (optional creation and binding)
- whether to enable API gateway aliases
- whether to enable custom domain names

Custom domain names can be used to surface api endpoints on a domain name managed in a Route53 zone you can control, and should have a predeployed AWS managed TLS certificate.  Base path will be the package name.  View serverless.yml for details.

> Note that you can generate swagger documentation for your functions using annotations in your serverless.yml files.
https://github.com/deliveryhero/serverless-aws-documentation

## Execution
The following scripts are used to manage functions.

### test offline
Inside new package run this, then browse to url shown.
```
yarn sls-offline
```

### test end to end
Inside new package run this, then browse to url shown.
```
yarn sls-deploy
```

### remove lambda
Inside new package run this.
```
yarn sls-remove
```
if API gateway aliases are enabled, use this first:
```
yarn sls-remove-alias --alias=<stage|alias>
```

### tail lambda logs
Inside new package run this.
```
yarn sls-logs --function=[functionName]
```

## Installation detail
More detailed steps.

### install nvm and node
https://github.com/creationix/nvm

```	
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.9/install.sh | bash
nvm install 8
nvm use 8
```

### install yarn
https://yarnpkg.com/lang/en/docs/install

### install yeoman
```
npm install -g yo
```

### install serverless
https://serverless.com/framework/docs/getting-started/
```
npm install -g serverless
```

### aws sdk setup
https://serverless.com/framework/docs/providers/aws/guide/credentials/

Best to setup the aws cli.  https://docs.aws.amazon.com/cli/latest/userguide/installing.html

..or just configure serverless..
	
```
serverless config credentials --provider aws --key AKIAIOSFODNN7EXAMPLE --secret wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```
add `AWS_REGION=ap-southeast-2` to ~/.aws/credentials	

### install mono serverless generator
```
npm install -g generator-mono-serverless
```

### run generator to create repo
```
yo mono-serverless
```

### inside new repo run
```
yarn generate-package
```
At this point you should be ready generate more serverless packages and start coding your functions.

## Examples
See https://github.com/zotoio/serverless-central for some example functions seeded by this generator.
