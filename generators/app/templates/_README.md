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
yo mono-serverless:package
```

and following the prompts. This will give you the scaffolding for a new serverless function.

## Deploy
To deploy a given function, go to the `packages/[function]` dir and run:

```
yarn run sls-deploy
```

This script will assemble inherited env vars, lint, test and compile the Lambda function, and deploy it to AWS.

On the first run, you must run `yarn run sls-deploy` without arguments to create the baseline CF stack. On subsequent runs, you can append an alias argument to create seperate instances of a function on the same API gateway:

```
yarn run sls-deploy -- --alias=task-1234
```

Which can then be accessed by requesting the corresponding path in place of the stage name on the original API gateway URL, such as:

```
Original URL: https://12345678.execute-api.us-east-1.amazonaws.com/dev/demo
Alias URL: https://12345678.execute-api.us-east-1.amazonaws.com/task-1234/demo
```

The original baseline code will remain unchanged when creating new aliases using the above command.