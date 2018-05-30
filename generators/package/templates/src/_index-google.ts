'use strict';

import * as bunyan from 'bunyan';
let log = bunyan.createLogger({name: '<%= name %>'});

exports['<%= name %>'] = (request: any, response: any) => {
    log.info('here');
    response.status(200).send(request.headers);
};

exports.event = (event: any, callback: any) => {
    callback();
};
