# generator-mono-serverless 
[![npm version](https://badge.fury.io/js/generator-mono-serverless.svg)](https://badge.fury.io/js/generator-mono-serverless)
[![Build Status](https://travis-ci.org/zotoio/generator-mono-serverless.svg?branch=master)](https://travis-ci.org/zotoio/generator-mono-serverless)

Yeoman generator to create Lerna (https://lernajs.io/) Typescript monorepos, for multiple Serverless/Lambda functions.

- Yeoman web scaffolding https://yeoman.io
- Serverless framework https://serverless.com

## Installation

Make sure you have Nodejs 8.10 LTS or above.

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
yo mono-serverless:package
```
...and follow the prompts.
