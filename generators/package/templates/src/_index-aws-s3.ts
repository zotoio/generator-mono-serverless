'use strict';

import { Handler, Context, Callback } from 'aws-lambda';
import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import * as bunyan from 'bunyan';
let log = bunyan.createLogger({name: '<%= name %>'});

const handler: Handler = (event: any, context: Context, callback: Callback) => {
    AWS.config.update({ region: process.env.SLS_AWS_REGION });

    log.info(`processing ${process.env.SLS_AWS_S3_EVENT_TRIGGER} event for bucket: ${process.env.SLS_AWS_S3_EVENT_BUCKET}`);

    log.info(event);

    log.info('use log.info/warn/error/debug, and view cloudwatch logs.');

    // add dynamodb functionality if required

    callback(undefined, 'completed');
};

export { handler };
