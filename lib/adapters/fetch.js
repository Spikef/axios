var stream = weex.requireModule('stream');
var fetch = stream.fetch;

var settle = require('./../core/settle');
var buildURL = require('./../helpers/buildURL');
var createError = require('../core/createError');

module.exports = function fetchAdapter(config) {
    return new Promise(function dispatchFetchRequest(resolve, reject) {
        fetch({
            method: config.method.toUpperCase(),
            url: buildURL(config.url, config.params, config.paramsSerializer),
            headers: config.headers,
            type: config.responseType,
            body: typeof config.data !== 'undefined' ? config.data : ''
        }, function callback(res) {
            if (res.ok) {
                var response = {
                    data: res.data,
                    status: res.status,
                    statusText: res.statusText,
                    headers: res.headers,
                    config: config
                };

                settle(resolve, reject, response);
            } else {
                reject(createError('Network Error', config));
            }
        });
    });
};