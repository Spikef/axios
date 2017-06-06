var fetch = weex.requireModule('stream').fetch;
var bundleUrl = weex.config.bundleUrl;

var settle = require('./../core/settle');
var buildURL = require('./../helpers/buildURL');
var createError = require('../core/createError');

module.exports = function fetchAdapter(config) {
    config.headers = config.headers || {};
    Object.keys(config.headers).forEach(function(key) {
        if (config.headers[key] === null) {
            config.headers[key] = '';
        } else if (typeof config.headers[key] !== 'string') {
            config.headers[key] = String(config.headers[key]);
        }
    });

    config.url = buildURL(config.url, config.params, config.paramsSerializer);
    config.url = resolve(config.url);

    return new Promise(function dispatchFetchRequest(resolve, reject) {
        fetch({
            method: config.method.toUpperCase(),
            url: config.url,
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

function resolve(url) {
    if (isAbsolute(url)) return url;

    var base = splitUrl(bundleUrl);
    var parts = base.pathname.split('/');

    if (/^\//.test(url)) {
        return base.origin + url;
    } else {
        parts.pop();

        if (/^\.\//.test(url)) {
            url = url.replace(/^\.\//, '');
        } else {
            var exp = /\.\.\//;
            while (exp.test(url)) {
                parts.pop();
                url = url.replace(exp, '');
            }
        }

        return base.origin + '/' + parts.join('/') + '/' + url;
    }
}

function splitUrl(url) {
    var protocol, domain, pathname;
    var parts = url.split('//');
    if (isAbsolute(parts[0])) {
        protocol = parts[0];
    } else {
        protocol = 'http:';
    }

    parts = parts[1].split('/');
    domain = parts.shift();

    parts = parts.join('/');
    parts = parts.split(/[?#]/);
    pathname = parts.shift();

    return {
        protocol: protocol,
        origin: protocol + '//' + domain,
        domain: domain,
        pathname: pathname
    };
}

function isAbsolute(url) {
    return /^(http|https|ftp|file):/.test(url);
}