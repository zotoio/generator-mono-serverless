# <%= name %>

This is a monorepo of serverless functions built using yeoman.io generator https://github.com/zotoio/generator-mono-serverless

## Installation
Clone this repo.  And perform setup listed at https://github.com/zotoio/generator-mono-serverless

## Structure
All functions are in directories under /packages

Each function has a standalone serverless.yml for independent deployment, while also sharing global libraries and build/test/linting frameworks.

## Extending
You can add new function packages by running the yeoman generator:

```
yarn generate-package
```

..and follow the prompts. This will give you the scaffolding for a new serverless function.  

You will be prompted for:

- lambda package name, version and npm namespace
- dynamodb tablename (optional creation and binding)
- whether to enable API gateway aliases
- whether to enable custom domain names

Custom domain names can be used to surface api endpoints on a domain name managed in a Route53 zone you can control, and should have a predeployed AWS managed TLS certificate.  Base path will be the package name.  View serverless.yml for details.

## Execution

### Test offline
Inside new package run this, then browse to url shown.
```
yarn sls-offline
```

### Deploy
To deploy a given function, go to the `packages/[function]` dir and run:

```
yarn sls-deploy
```

This script will assemble inherited env vars, lint, test and compile the Lambda function, and deploy it to AWS.

On the first run, you must run `yarn run sls-deploy` without arguments to create the baseline CF stack. On subsequent runs, you can append an alias argument to create seperate instances of a function on the same API gateway:

```
yarn sls-deploy -- --alias=task-1234
```

Which can then be accessed by requesting the corresponding path in place of the stage name on the original API gateway URL, such as:

```
Original URL: https://12345678.execute-api.us-east-1.amazonaws.com/dev/demo
Alias URL: https://12345678.execute-api.us-east-1.amazonaws.com/task-1234/demo
```

The original baseline code will remain unchanged when creating new aliases using the above command.

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
